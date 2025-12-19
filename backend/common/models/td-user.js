'use strict';

const app = require('../../server/server');
const loopback = require('loopback');
const path = require('path');
const fs = require('fs');

module.exports = function (TdUser) {
    const smsService = app.dataSources.smsService;

    // Phone validation
    TdUser.validatesFormatOf('phone', {
        with: /^\d{10,15}$/,
        message: 'Invalid phone number. Must be 10-15 digits.',
        allowNull: true
    });

    // Helper function to ensure roles exist and assign role based on userType
    async function ensureAndAssignRole(userId, userType) {
        try {
            const Role = app.models.Role;
            const RoleMapping = app.models.RoleMapping;
            const roleName = userType === 'admin' ? 'admin' : 'user';

            let role = await Role.findOne({ where: { name: roleName } });
            if (!role) {
                role = await Role.create({ name: roleName });
                console.log(`Created ${roleName} role: ${role.id}`);
            }

            // Check if role mapping already exists
            const existingMapping = await RoleMapping.findOne({
                where: { principalId: userId, principalType: 'USER' }
            });
            if (!existingMapping) {
                await RoleMapping.create({
                    principalType: 'USER',
                    principalId: userId,
                    roleId: role.id
                });
                console.log(`Assigned ${roleName} role to user ${userId} based on userType: ${userType}`);
            } else {
                console.log(`Role mapping already exists for user ${userId}: ${roleName}, roleId: ${existingMapping.roleId}`);
            }
            return role;
        } catch (error) {
            console.error(`Error assigning ${userType} role to user ${userId}:`, error);
            throw error;
        }
    }

    // Ensure role assignment during user creation
    TdUser.observe('after save', async function (ctx) {
        console.log('after save - Triggered for instance:', ctx.instance?.id, 'isNewInstance:', ctx.isNewInstance);
        if (ctx.instance && ctx.isNewInstance) {
            const userId = ctx.instance.id;
            const userType = ctx.instance.userType || 'user';
            console.log(`after save - Assigning role for new user ${userId}, userType: ${userType}`);
            await ensureAndAssignRole(userId, userType);
        }
    });

    // File upload handling
    function handleFileUpload(ctx, next) {
        try {
            console.log('handleFileUpload ctx.args.data:', ctx.args.data);
            console.log('handleFileUpload ctx.req.files:', ctx.req.files);
            ctx.args.data.files = ctx.args.data.files || [];
            if (ctx.req.files && ctx.req.files.profileImage && ctx.req.files.profileImage[0]) {
                const file = ctx.req.files.profileImage[0];
                let subDir = ctx.args.data.fileType || 'profiles';
                subDir = subDir.replace(/[^a-zA-Z0-9_-]/g, '');
                const uploadDir = path.join(__dirname, '../../Uploads', subDir);
                if (!fs.existsSync(uploadDir)) {
                    console.log(`Creating directory: ${uploadDir}`);
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const fileName = `${Date.now()}_${file.originalname}`;
                const filePath = path.join(uploadDir, fileName);
                fs.writeFileSync(filePath, file.buffer);
                ctx.args.data.profileImage = `/Uploads/${subDir}/${fileName}`;
                ctx.args.data.files.push({
                    path: `/Uploads/${subDir}/${fileName}`,
                    type: subDir,
                    uploadedAt: new Date()
                });
            }
            next();
        } catch (error) {
            console.error('Error in handleFileUpload:', error);
            next(error);
        }
    }

    TdUser.beforeRemote('create', function (ctx, unused, next) {
        handleFileUpload(ctx, next);
    });

    TdUser.beforeRemote('prototype.updateAttributes', async function (ctx, modelInstance, next) {
        try {
            if (!ctx.req.accessToken || !ctx.req.accessToken.userId) {
                console.log('PATCH - Invalid accessToken:', ctx.req.accessToken);
                const error = new Error('No valid access token provided');
                error.statusCode = 401;
                throw error;
            }
            const userId = ctx.req.accessToken.userId;
            const targetUserId = ctx.args.id;
            console.log(`PATCH - Authenticated userId: ${userId}, Target userId: ${targetUserId}`);

            const roleMapping = await app.models.RoleMapping.findOne({
                where: { principalId: userId, principalType: 'USER' }
            });
            if (!roleMapping) {
                console.log(`PATCH - No role assigned to user ${userId}, assigning default 'user' role`);
                await ensureAndAssignRole(userId, 'user');
            }

            const role = await app.models.Role.findById(roleMapping?.roleId);
            console.log(`PATCH - User ${userId} role: ${role?.name || 'user'}`);
            if (role?.name !== 'admin' && userId.toString() !== targetUserId) {
                console.log(`PATCH - User ${userId} (role: ${role?.name || 'user'}) attempted to update user ${targetUserId}`);
                const error = new Error('Only admins can update other users');
                error.statusCode = 403;
                throw error;
            }

            // Restrict phone and password updates
            const restrictedFields = ['phone', 'password'];
            const requestedChanges = ctx.args.data;
            for (const field of restrictedFields) {
                if (requestedChanges[field]) {
                    console.log(`PATCH - Attempt to update restricted field: ${field}`);
                    const error = new Error(`Updating ${field} is not allowed in this request`);
                    error.statusCode = 403;
                    throw error;
                }
            }

            // Handle userType change
            if (requestedChanges.userType) {
                console.log(`PATCH - Updating userType to: ${requestedChanges.userType}`);
                await ensureAndAssignRole(targetUserId, requestedChanges.userType);
            }

            next();
        } catch (error) {
            console.error('PATCH - Error in beforeRemote:', error);
            next(error);
        }
    });

    const normalizePhoneNumber = (phone) => phone.replace(/[^0-9]/g, '');

    /*** Generate OTP ***/
    TdUser.generateOtp = async function (data) {
        const { email, phone, name, referralCode } = data;

        if (!phone || !name || !email) {
            const error = new Error('Phone, name, and email are required');
            error.statusCode = 400;
            throw error;
        }

        const phoneRegex = /^\d{10,15}$/;
        if (!phoneRegex.test(phone)) {
            const error = new Error('Invalid phone number. Must be 10-15 digits.');
            error.statusCode = 400;
            throw error;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const error = new Error('Invalid email address.');
            error.statusCode = 400;
            throw error;
        }

        try {
            let existingUser = await TdUser.findOne({
                where: { or: [{ email }, { phone }] }
            });

            let otp, expiry;

            if (existingUser) {
                if (existingUser.isTemporary) {
                    otp = Math.floor(100000 + Math.random() * 900000).toString();
                    expiry = new Date(Date.now() + 5 * 60 * 1000);
                    existingUser.otp = otp;
                    existingUser.otpExpiry = expiry;
                    existingUser.tenantCode = existingUser.tenantCode || 'ADB';
                    await existingUser.save({ validate: false });
                    console.log(`Generated new OTP for ${phone}: ${otp}, expires at ${expiry}`);
                } else {
                    const error = new Error('Email or phone already registered');
                    error.statusCode = 400;
                    throw error;
                }
            } else {
                otp = Math.floor(100000 + Math.random() * 900000).toString();
                expiry = new Date(Date.now() + 5 * 60 * 1000);
                existingUser = await TdUser.create({
                    contactName: name,
                    email,
                    phone,
                    username: phone,
                    otp,
                    password: Math.random().toString(36).slice(-8),
                    otpExpiry: expiry,
                    isTemporary: true,
                    referrald: referralCode || null,
                    status: 'pending',
                    phoneVerified: false,
                    userType: 'user',
                    tenantCode: 'ADB'
                });
                console.log(`Created temp user with OTP for ${phone}: ${otp}, expires at ${expiry}`);
                await ensureAndAssignRole(existingUser.id, existingUser.userType);
            }

            return { success: true, message: 'OTP sent successfully', otp, expiry };
        } catch (error) {
            console.error('Error in generateOtp:', error.message);
            throw error;
        }
    };

    TdUser.remoteMethod('generateOtp', {
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/generateOtp', verb: 'post' }
    });

    /*** Verify OTP ***/
    TdUser.verifyOTP = async function (data) {
        const { phone, otp, name, email, referralCode } = data;

        if (!phone || !otp || !name || !email) {
            const error = new Error('Phone, OTP, name, and email are required');
            error.statusCode = 400;
            throw error;
        }

        const user = await TdUser.findOne({ where: { phone } });
        if (!user || user.otp !== otp) {
            const error = new Error('Invalid OTP or phone number');
            error.statusCode = 400;
            throw error;
        }

        if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
            throw new Error('OTP expired. Please request a new one.');
        }

        if (!user.isTemporary) {
            const error = new Error('User already verified');
            error.statusCode = 400;
            throw error;
        }

        user.contactName = name;
        user.email = email;
        user.referrald = referralCode || null;
        user.phoneVerified = true;
        user.isTemporary = false;
        user.status = 'active';
        user.password = Math.random().toString(36).slice(-8);
        user.otp = null;
        user.otpExpiry = null;
        user.tenantCode = user.tenantCode || 'ADB';
        await user.save({ validate: false });

        await ensureAndAssignRole(user.id, user.userType || 'user');
        return user;
    };

    TdUser.remoteMethod('verifyOTP', {
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: { arg: 'user', type: 'object', root: true },
        http: { path: '/verifyOTP', verb: 'post' }
    });

    /*** Login Generate OTP ***/
    TdUser.loginGenerateOtp = async function (data) {
        const { phone: rawPhone } = data;
        const phone = normalizePhoneNumber(rawPhone);

        if (!phone) {
            const error = new Error('Phone is required');
            error.statusCode = 400;
            throw error;
        }

        const phoneRegex = /^\d{10,15}$/;
        if (!phoneRegex.test(phone)) {
            const error = new Error('Invalid phone number. Must be 10-15 digits.');
            error.statusCode = 400;
            throw error;
        }

        try {
            const user = await TdUser.findOne({
                where: { phone, isTemporary: false }
            });

            if (!user) {
                const error = new Error('User not found');
                error.statusCode = 404;
                throw error;
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiry = new Date(Date.now() + 5 * 60 * 1000);
            user.otp = otp;
            user.otpExpiry = expiry;
            user.tenantCode = user.tenantCode || 'ADB';
            await user.save({ validate: false });

            // Send SMS using mobile_no parameter
            await new Promise((resolve, reject) => {
                smsService.sendSMS(phone, `Your OTP is ${otp}`, '1207161762420476512', (err, response) => {
                    if (err || response?.error) {
                        return reject(err || new Error(response.error));
                    }
                    resolve();
                });
            });

            const updatedUser = await TdUser.findOne({ where: { phone } });
            console.log(`Post-update check: OTP=${updatedUser.otp}, Expiry=${updatedUser.otpExpiry}`);
            return {
                success: true,
                message: 'OTP generated successfully. Use the provided OTP for verification.',
                otp,
                expiry
            };
        } catch (error) {
            console.error('Error in loginGenerateOtp:', error.message, error.stack);
            throw error;
        }
    };

    TdUser.remoteMethod('loginGenerateOtp', {
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/loginGenerateOtp', verb: 'post' }
    });

    /*** Login Verify OTP ***/
    TdUser.loginVerifyOtp = async function (data) {
        const { phone: rawPhone, otp } = data;
        const phone = normalizePhoneNumber(rawPhone);

        console.log(`loginVerifyOtp called with: phone=${phone}, otp=${otp}`);

        if (!phone || !otp) {
            const error = new Error('Phone and OTP are required');
            error.statusCode = 400;
            throw error;
        }

        const user = await TdUser.findOne({ where: { phone, isTemporary: false } });
        if (!user) {
            console.log(`No user found for phone: ${phone}`);
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        if (user.otp !== otp) {
            console.log(`OTP mismatch for phone ${phone}: expected ${user.otp}, received ${otp}`);
            const error = new Error('Invalid OTP');
            error.statusCode = 400;
            throw error;
        }

        if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
            console.log(`OTP expired for phone ${phone}: expiry ${user.otpExpiry}`);
            const error = new Error('OTP expired. Please request a new one.');
            error.statusCode = 400;
            throw error;
        }

        user.otp = null;
        user.otpExpiry = null;
        user.tenantCode = user.tenantCode || 'ADB';
        await user.save({ validate: false });
        const token = await user.createAccessToken({ ttl: 1209600 });
        console.log(`User logged in successfully for phone ${phone}, userId: ${user.id}`);
        await ensureAndAssignRole(user.id, user.userType || 'user');
        return { user, token };
    };

    TdUser.remoteMethod('loginVerifyOtp', {
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/loginVerifyOtp', verb: 'post' }
    });

    /*** Validate Token ***/
    TdUser.validateToken = async function (req) {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        if (!tokenId) {
            const error = new Error('No token provided');
            error.statusCode = 401;
            throw error;
        }
        const AccessToken = loopback.getModel('AccessToken');
        const token = await AccessToken.findOne({ where: { id: tokenId } });
        if (!token) {
            const error = new Error('Invalid token');
            error.statusCode = 401;
            throw error;
        }
        const now = new Date();
        const created = new Date(token.created);
        const ttl = token.ttl * 1000;
        if (now > new Date(created.getTime() + ttl)) {
            const error = new Error('Token expired');
            error.statusCode = 401;
            throw error;
        }
        const user = await TdUser.findOne({ where: { id: token.userId } });
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        return { valid: true, user };
    };

    TdUser.remoteMethod('validateToken', {
        accepts: [{ arg: 'req', type: 'object', http: { source: 'req' } }],
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/validateToken', verb: 'get' }
    });

    /*** Logout ***/
    TdUser.logout = async function (req) {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { success: true, message: 'No session to log out' };
        }

        const tokenId = authHeader.substring(7); // "Bearer ".length = 7
        const AccessToken = loopback.getModel('AccessToken');

        const token = await AccessToken.findById(tokenId);
        if (token) {
            await token.destroy();
            return { success: true, message: 'Logged out successfully' };
        } else {
            // Token already gone → treat as success
            return { success: true, message: 'Session already cleared or expired' };
        }
    };

    TdUser.remoteMethod('logout', {
        accepts: [{ arg: 'req', type: 'object', http: { source: 'req' } }],
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/logout', verb: 'post' }
    });

    /*** Test SMS ***/
    TdUser.testSMS = async function (mobile_no, message) {
        const dltTemplateId = '1207161762420476512';
        await new Promise((resolve, reject) => {
            smsService.sendSMS(mobile_no, message, dltTemplateId, (err, response) => {
                if (err || response?.error) {
                    return reject(err || new Error(response.error));
                }
                resolve();
            });
        });
        return true;
    };

    TdUser.remoteMethod('testSMS', {
        accepts: [
            { arg: 'mobile_no', type: 'string', required: true },
            { arg: 'message', type: 'string', required: true }
        ],
        returns: { arg: 'success', type: 'boolean', root: true },
        http: { path: '/testSMS', verb: 'post' }
    });

    /*** Reset Password from Admin Panel ***/
    TdUser.resetUserPassFromPanel = async function (userId, debug = false) {
        const userObj = await TdUser.findOne({ where: { id: userId } });
        if (!userObj) throw new Error('User is not found');

        const newPassword = Math.random().toString(36).substring(2, 8);
        userObj.password = newPassword;
        userObj.tenantCode = userObj.tenantCode || 'ADB';
        await userObj.save();

        const dltTemplateId = '1207166157900066388';
        const message = `Password has been reset. New password: ${newPassword}`;

        await new Promise((resolve, reject) => {
            smsService.sendSMS(userObj.phone, message, dltTemplateId, (err, response) => {
                if (err || response?.error) return reject(err || new Error(response.error));
                resolve();
            });
        });

        return `Password reset successfully.${debug ? ' New password: ' + newPassword : ''}`;
    };

    TdUser.remoteMethod('resetUserPassFromPanel', {
        accepts: [
            { arg: 'userId', type: 'string', required: true },
            { arg: 'debug', type: 'boolean', required: false }
        ],
        returns: { arg: 'result', type: 'string', root: true },
        http: { path: '/resetUserPassFromPanel', verb: 'post' }
    });

    /*** Change User Status ***/
    TdUser.changeUserStatus = async function (userId, newStatus) {
        const userObj = await TdUser.findOne({ where: { id: userId } });
        if (!userObj) throw new Error('User is not found');
        if (userObj.status === newStatus) throw new Error('The old status is the same');

        const dltTemplateId = '1207162375011147858';
        const message = `Your account is ${newStatus === 'inactive' ? 'de-activated' : 'activated'}`;

        await new Promise((resolve, reject) => {
            smsService.sendSMS(userObj.phone, message, dltTemplateId, (err, response) => {
                if (err || response?.error) return reject(err || new Error(response.error));
                resolve();
            });
        });

        userObj.status = newStatus;
        userObj.tenantCode = userObj.tenantCode || 'ADB';
        await userObj.save();

        return 'Status changed successfully.';
    };

    TdUser.remoteMethod('changeUserStatus', {
        accepts: [
            { arg: 'userId', type: 'string', required: true },
            { arg: 'newStatus', type: 'string', required: true }
        ],
        returns: { arg: 'result', type: 'string', root: true },
        http: { path: '/changeUserStatus', verb: 'post' }
    });

    /*** Reset Password with OTP ***/
    TdUser.resetUserPassword = async function (handle, otp, newPassword) {
        const userObj = await TdUser.findOne({
            where: { or: [{ username: handle }, { email: handle }] }
        });
        if (!userObj) throw new Error('User is not found');
        if (userObj.otp !== otp) throw new Error('Provided OTP is not valid');

        userObj.password = newPassword;
        userObj.otp = null;
        userObj.tenantCode = userObj.tenantCode || 'ADB';
        await userObj.save();

        return 'Password reset successfully.';
    };

    TdUser.remoteMethod('resetUserPassword', {
        accepts: [
            { arg: 'handle', type: 'string', required: true },
            { arg: 'otp', type: 'string', required: true },
            { arg: 'newPassword', type: 'string', required: true }
        ],
        returns: { arg: 'result', type: 'string', root: true },
        http: { path: '/resetUserPassword', verb: 'post' }
    });

    /*** Generate Access Token ***/
    TdUser.generateAccessToken = async function (username) {
        const user = await TdUser.findOne({ where: { username } });
        if (!user) throw new Error('User not found');

        const AccessToken = loopback.getModel('AccessToken');
        const tokenId = await new Promise((resolve, reject) => {
            AccessToken.createAccessTokenId((err, token) => {
                if (err) return reject(err);
                resolve(token);
            });
        });

        const token = await AccessToken.create({
            id: tokenId,
            userId: user.id,
            ttl: 1209600,
            created: new Date()
        });

        return token;
    };

    TdUser.remoteMethod('generateAccessToken', {
        accepts: [{ arg: 'username', type: 'string', required: true }],
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/generateAccessToken', verb: 'post' }
    });

    /*** Register with Password (for Website) ***/
    TdUser.registerWithPassword = async function (data) {
        const { email, phone, password, contactName, city, state, country, referrald, isTermsAgreed, userType = 'user' } = data;

        if (!email || !phone || !password || !contactName || !isTermsAgreed) {
            const error = new Error('Email, phone, password, name, and terms agreement are required');
            error.statusCode = 400;
            throw error;
        }

        const existingUser = await TdUser.findOne({
            where: { or: [{ email }, { phone }] }
        });

        if (existingUser) {
            const error = new Error('Email or phone already registered');
            error.statusCode = 400;
            throw error;
        }

        const user = await TdUser.create({
            email,
            phone,
            username: email,
            password,
            contactName,
            userType,
            city,
            state,
            country: country || 'IN',
            referrald: referrald || null,
            isTermsAgreed: true,
            phoneVerified: false,
            status: 'active',
            isTemporary: false,
            tenantCode: 'ADB'
        });

        await ensureAndAssignRole(user.id, userType);
        return user;
    };

    TdUser.remoteMethod('registerWithPassword', {
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: { arg: 'user', type: 'object', root: true },
        http: { path: '/registerWithPassword', verb: 'post' }
    });

    /*** Login with Password (for Website) ***/
    TdUser.loginWithPassword = async function (credentials) {
        const { email, password } = credentials;
        if (!email || !password) {
            const error = new Error('Email and password are required');
            error.statusCode = 400;
            throw error;
        }
        const user = await TdUser.findOne({
            where: { or: [{ email }, { username: email }] }
        });
        if (!user) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }
        const isPasswordValid = await user.hasPassword(password);
        if (!isPasswordValid) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }
        if (user.status !== 'active') {
            const error = new Error('Account is not active');
            error.statusCode = 403;
            throw error;
        }
        await TdUser.updateAll(
            { id: user.id },
            { lastLogin: new Date(), tenantCode: user.tenantCode || 'ADB' }
        );
        const token = await user.createAccessToken({ ttl: 1209600 });
        return { user, token };
    };

    TdUser.remoteMethod('loginWithPassword', {
        accepts: { arg: 'credentials', type: 'object', http: { source: 'body' } },
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/loginWithPassword', verb: 'post' }
    });

    /*** Upload File ***/
    TdUser.upload = async function (ctx) {
        try {
            console.log('TdUser.upload - Request files:', ctx.req.files);
            console.log('TdUser.upload - Request body:', ctx.req.body);
            if (!ctx.req.files || !ctx.req.files.profileImage || !ctx.req.files.profileImage[0]) {
                const error = new Error('No file provided or invalid file field');
                error.statusCode = 400;
                throw error;
            }
            const file = ctx.req.files.profileImage[0];
            const subDir = ctx.req.body.fileType || 'profiles';
            const sanitizedSubDir = subDir.replace(/[^a-zA-Z0-9_-]/g, '');
            const uploadDir = path.join(__dirname, '../../Uploads', sanitizedSubDir);
            console.log('TdUser.upload - Creating directory:', uploadDir);
            await fs.promises.mkdir(uploadDir, { recursive: true });
            const fileName = `${Date.now()}_${file.originalname}`;
            const filePath = path.join(uploadDir, fileName);
            console.log('TdUser.upload - Writing file to:', filePath);
            await fs.promises.writeFile(filePath, file.buffer);
            const url = `/Uploads/${sanitizedSubDir}/${fileName}`;
            console.log('TdUser.upload - File uploaded successfully, URL:', url);
            return { url };
        } catch (error) {
            console.error('TdUser.upload - Error:', error);
            error.statusCode = error.statusCode || 500;
            throw error;
        }
    };

    TdUser.remoteMethod('upload', {
        accepts: [{ arg: 'ctx', type: 'object', http: { source: 'context' } }],
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/upload', verb: 'post' }
    });

    /*** Debug Token ***/
    TdUser.debugToken = async function (tokenId) {
        const AccessToken = loopback.getModel('AccessToken');
        const token = await AccessToken.findOne({ where: { id: tokenId } });
        if (!token) {
            const error = new Error('Token not found');
            error.statusCode = 404;
            throw error;
        }
        const user = await TdUser.findById(token.userId);
        if (!user) {
            const error = new Error('User not found for token');
            error.statusCode = 404;
            throw error;
        }
        const now = new Date();
        const created = new Date(token.created);
        const ttl = token.ttl * 1000;
        const isExpired = now > new Date(created.getTime() + ttl);
        return {
            token: { id: token.id, userId: token.userId, created: token.created, ttl: token.ttl, expired: isExpired },
            user: { id: user.id, email: user.email, userType: user.userType }
        };
    };

    TdUser.remoteMethod('debugToken', {
        accepts: [{ arg: 'tokenId', type: 'string', required: true }],
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/debugToken', verb: 'get' }
    });
};