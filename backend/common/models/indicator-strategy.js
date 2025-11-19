'use strict';

module.exports = function (Indicatorstrategy) {

    // FIXED: Make the hook async properly
    Indicatorstrategy.beforeRemote('create', async function (ctx, unused, next) {
        try {
            const token = ctx.req.accessToken;
            if (!token || !token.userId) {
                const err = new Error('Must be logged in');
                err.statusCode = 401;
                return next(err);
            }

            // Optional: verify user exists
            // const user = await Indicatorstrategy.app.models.TdUser.findById(token.userId);
            // if (!user) throw new Error('User not found');

            // Attach userId
            if (ctx.args && ctx.args.data) {
                ctx.args.data.userId = token.userId.toString();  // MongoDB ObjectId → string
                ctx.args.data.status = 'ACTIVE';
                ctx.args.data.createdAt = new Date();
            }

            next();  // Always call next()
        } catch (err) {
            next(err);
        }
    });

    // RUN METHOD — PERFECT AS-IS
    Indicatorstrategy.run = function (data, cb) {
        // data already has userId attached from beforeRemote
        Indicatorstrategy.create(data, function (err, instance) {
            if (err) return cb(err);

            if (Indicatorstrategy.app.scanner) {
                Indicatorstrategy.app.scanner.scan(instance.id, instance);
            }

            cb(null, {
                success: true,
                id: instance.id,
                strategyId: instance.id,
                strategyName: instance.strategyName,
                message: 'Strategy started successfully!'
            });
        });
    };

    Indicatorstrategy.remoteMethod('run', {
        accepts: [
            { arg: 'data', type: 'object', http: { source: 'body' }, required: true }
        ],
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/run', verb: 'post' },
        description: 'Run indicator strategy'
    });
};