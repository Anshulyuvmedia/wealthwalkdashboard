'use strict';

module.exports = function (app) {
    const Role = app.models.Role;
    const RoleMapping = app.models.RoleMapping;
    const TdUser = app.models.TdUser;

    // Resolver for $authenticated role
    Role.registerResolver('$authenticated', function (role, context, cb) {
        const userId = context.accessToken?.userId;
        // console.log('Role resolver - $authenticated:', { userId, accessToken: context.accessToken });
        if (!userId) {
            // console.log('Role resolver - $authenticated: No userId, denying access');
            return process.nextTick(() => cb(null, false));
        }
        TdUser.findById(userId, (err, user) => {
            if (err || !user) {
                console.error('Role resolver - $authenticated: Error or no user:', err, user);
                return cb(err || new Error('User not found'));
            }
            // console.log('Role resolver - $authenticated: User found:', user.id, user.userType);
            return cb(null, true);
        });
    });

    // Resolver for admin role
    Role.registerResolver('admin', function (role, context, cb) {
        const userId = context.accessToken?.userId;
        // console.log('Role resolver - admin:', { userId, accessToken: context.accessToken });
        if (!userId) {
            // console.log('Role resolver - admin: No userId, denying access');
            return process.nextTick(() => cb(null, false));
        }
        RoleMapping.findOne({
            where: { principalId: userId, principalType: 'USER' }
        }, (err, roleMapping) => {
            if (err || !roleMapping) {
                console.error('Role resolver - admin: Error or no role mapping:', err, roleMapping);
                return cb(err || new Error('No role assigned'));
            }
            Role.findById(roleMapping.roleId, (err, role) => {
                if (err || !role) {
                    console.error('Role resolver - admin: Error or no role:', err, role);
                    return cb(err || new Error('Role not found'));
                }
                // console.log('Role resolver - admin: Role found:', role.name);
                return cb(null, role.name === 'admin');
            });
        });
    });

    // Resolver for user role
    Role.registerResolver('user', function (role, context, cb) {
        const userId = context.accessToken?.userId;
        // console.log('Role resolver - user:', { userId, accessToken: context.accessToken });
        if (!userId) {
            // console.log('Role resolver - user: No userId, denying access');
            return process.nextTick(() => cb(null, false));
        }
        RoleMapping.findOne({
            where: { principalId: userId, principalType: 'USER' }
        }, (err, roleMapping) => {
            if (err || !roleMapping) {
                console.error('Role resolver - user: Error or no role mapping:', err, roleMapping);
                return cb(err || new Error('No role assigned'));
            }
            Role.findById(roleMapping.roleId, (err, role) => {
                if (err || !role) {
                    console.error('Role resolver - user: Error or no role:', err, role);
                    return cb(err || new Error('Role not found'));
                }
                // console.log('Role resolver - user: Role found:', role.name);
                return cb(null, role.name === 'user');
            });
        });
    });
};