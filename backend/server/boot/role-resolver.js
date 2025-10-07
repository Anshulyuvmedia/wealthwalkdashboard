module.exports = function (app) {
    const Role = app.models.Role;
    Role.registerResolver('$authenticated', function (role, context, cb) {
        const userId = context.accessToken?.userId;
        console.log('Role resolver - $authenticated:', { userId, accessToken: context.accessToken });
        if (!userId) {
            console.log('Role resolver - $authenticated: No userId, denying access');
            return cb(null, false);
        }
        const TdUser = app.models.TdUser;
        TdUser.findById(userId, (err, user) => {
            if (err || !user) {
                console.error('Role resolver - $authenticated: Error or no user:', err, user);
                return cb(err || new Error('User not found'));
            }
            console.log('Role resolver - $authenticated: User found:', user.id, user.userType);
            return cb(null, true);
        });
    });
    Role.registerResolver('admin', function (role, context, cb) {
        const userId = context.accessToken?.userId;
        console.log('Role resolver - admin:', { userId, accessToken: context.accessToken });
        if (!userId) {
            console.log('Role resolver - admin: No userId, denying access');
            return cb(null, false);
        }
        const TdUser = app.models.TdUser;
        TdUser.findById(userId, (err, user) => {
            if (err || !user) {
                console.error('Role resolver - admin: Error or no user:', err, user);
                return cb(err || new Error('User not found'));
            }
            console.log('Role resolver - admin: User found:', user.id, user.userType);
            return cb(null, user.userType === 'admin');
        });
    });
};