'use strict';

module.exports = function (TdSubscription) {

    // Before save hook
    TdSubscription.observe('before save', async function (ctx) {
        const subscription = ctx.instance || ctx.data;
        if (!subscription) throw Object.assign(new Error('No subscription data provided'), { statusCode: 400, code: 'INVALID_DATA' });

        const accessToken = ctx.options?.accessToken;
        if (!accessToken?.userId) throw Object.assign(new Error('No valid access token provided'), { statusCode: 401, code: 'INVALID_TOKEN' });

        const authenticatedUserId = accessToken.userId.toString();
        const userId = subscription.userId;
        const planId = subscription.planId;

        const roleMapping = await TdSubscription.app.models.RoleMapping.findOne({
            where: { principalId: authenticatedUserId, principalType: 'USER' }
        });
        const role = roleMapping ? await TdSubscription.app.models.Role.findById(roleMapping.roleId) : null;

        if (role?.name !== 'admin' && authenticatedUserId !== userId)
            throw Object.assign(new Error('Only admins can subscribe for other users'), { statusCode: 403, code: 'UNAUTHORIZED' });

        const user = await TdSubscription.app.models.TdUser.findById(userId);
        if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404, code: 'USER_NOT_FOUND' });

        const plan = await TdSubscription.app.models.TdPlan.findById(planId);
        if (!plan) throw Object.assign(new Error('Plan not found'), { statusCode: 404, code: 'PLAN_NOT_FOUND' });

        const validDurations = ['days', 'months', 'years'];
        if (!validDurations.includes(plan.Duration))
            throw Object.assign(new Error(`Invalid plan duration: ${plan.Duration}`), { statusCode: 400, code: 'INVALID_DURATION' });

        const now = new Date();
        let expiryDate;
        if (plan.Duration === 'days') expiryDate = new Date(now.getTime() + plan.durationValue * 24 * 60 * 60 * 1000);
        if (plan.Duration === 'months') expiryDate = new Date(now.setMonth(now.getMonth() + plan.durationValue));
        if (plan.Duration === 'years') expiryDate = new Date(now.setFullYear(now.getFullYear() + plan.durationValue));

        subscription.expiryDate = expiryDate;
        subscription.tenantCode = ctx.options?.tenantCode || 'ADB';
        subscription.status = subscription.status || 'active';
        subscription.createdAt = subscription.createdAt || new Date();
        subscription.updatedAt = new Date();
    });

    // After save hook using direct Mongo update
    TdSubscription.observe('after save', async function (ctx) {
        if (ctx.instance && ctx.isNewInstance) {
            const subscription = ctx.instance;
            const userId = subscription.userId;

            console.log(`TdSubscription - after save: Expiring other subscriptions for user ${userId}`);

            // Direct Mongo update to skip hooks
            const collection = TdSubscription.getDataSource().connector.collection(TdSubscription.modelName);
            await collection.updateMany(
                { userId: userId.toString(), status: 'active', _id: { $ne: subscription.id } },
                { $set: { status: 'expired', updatedAt: new Date() } }
            );

            console.log(`TdSubscription - after save: Expired old subscriptions for user ${userId}`);
        }
    });

    // Access hook
    TdSubscription.observe('access', async function (ctx) {
        if (!ctx.query.where) ctx.query.where = {};
        if (!ctx.query.where.status) ctx.query.where.status = { neq: 'expired' };
    });

    // Expire subscriptions method using direct Mongo update
    TdSubscription.expireSubscriptions = async function () {
        const now = new Date();
        const collection = TdSubscription.getDataSource().connector.collection(TdSubscription.modelName);
        const result = await collection.updateMany(
            { expiryDate: { $lte: now }, status: 'active' },
            { $set: { status: 'expired', updatedAt: new Date() } }
        );
        return result;
    };
};
