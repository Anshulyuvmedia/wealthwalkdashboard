// In server/boot/role-resolver.js
'use strict';

module.exports = function (app) {
    const Role = app.models.Role;
    const TdUser = app.models.TdUser;

    Role.registerResolver('admin', async function (role, ctx) {
        console.log('Role resolver - Context accessToken:', ctx.accessToken); // Debug
        const userId = ctx.accessToken?.userId;
        console.log('Role resolver - userId:', userId);
        if (!userId) {
            console.log('Role resolver - No userId, denying access');
            return false;
        }
        const user = await TdUser.findById(userId);
        console.log('Role resolver - User:', user ? { id: user.id, userType: user.userType } : null);
        if (!user) {
            console.log('Role resolver - User not found:', userId);
            return false;
        }
        const isAdmin = user.userType === 'admin';
        console.log('Role resolver - Is admin:', isAdmin);
        return isAdmin;
    });
};