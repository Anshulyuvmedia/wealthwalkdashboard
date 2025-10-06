'use strict';

const app = require('../../server/server');
const loopback = require('loopback');
const path = require('path');
const fs = require('fs');

module.exports = function (TdUser) {
    const smsService = app.dataSources.smsService;

    // File upload handling
    TdUser.beforeRemote('create', function (ctx, unused, next) {
        handleFileUpload(ctx, next);
    });

    TdUser.beforeRemote('prototype.updateAttributes', function (ctx, modelInstance, next) {
        handleFileUpload(ctx, next);
    });

    function handleFileUpload(ctx, next) {
        try {
            console.log('handleFileUpload ctx.args.data:', ctx.args.data);
            console.log('handleFileUpload ctx.req.files:', ctx.req.files);
            // Initialize files array if not present
            ctx.args.data.files = ctx.args.data.files || [];

            if (ctx.req.files && ctx.req.files.profileImage && ctx.req.files.profileImage[0]) {
                const file = ctx.req.files.profileImage[0];
                let subDir = ctx.args.data.fileType || 'profiles'; // Default to profiles
                // Sanitize subDir to prevent path traversal
                subDir = subDir.replace(/[^a-zA-Z0-9_-]/g, '');
                const uploadDir = path.join(__dirname, '../../Uploads', subDir);
                if (!fs.existsSync(uploadDir)) {
                    console.log(`Creating directory: ${uploadDir}`);
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const fileName = `${Date.now()}_${file.originalname}`;
                const filePath = path.join(uploadDir, fileName);
                // Save file from memory to disk
                fs.writeFileSync(filePath, file.buffer);
                // Store the file path in the data
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

    /*** Generate OTP ***/
    TdUser.generateOtp = async function (data) {
        const { email, phone, name, referralCode } = data;

        // Validation
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
            // Check if user exists
            let existingUser = await TdUser.findOne({
                where: { or: [{ email }, { phone }] }
            });

            let otp, expiry;

            if (existingUser) {
                if (existingUser.isTemporary) {
                    // Always generate new OTP for temporary users
                    otp = Math.floor(100000 + Math.random() * 900000).toString();
                    expiry = new Date(Date.now() + 5 * 60 * 1000);
                    await existingUser.updateAttributes({ otp, otpExpiry: expiry });
                    console.log(`Generated new OTP for ${phone}: ${otp}, expires at ${expiry}`);
                } else {
                    const error = new Error('Email or phone already registered');
                    error.statusCode = 400;
                    throw error;
                }
            } else {
                // New temporary user
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
                    userType: 'user'
                });
                console.log(`Created temp user with OTP for ${phone}: ${otp}, expires at ${expiry}`);
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
        http: { path: '/generateOtp', verb: 'post' },
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

        // Check expiry
        if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
            throw new Error('OTP expired. Please request a new one.');
        }

        if (!user.isTemporary) {
            const error = new Error('User already verified');
            error.statusCode = 400;
            throw error;
        }

        // Update existing temporary user → verified
        await user.updateAttributes({
            contactName: name,
            email,
            referrald: referralCode || null,
            phoneVerified: true,
            isTemporary: false,
            status: 'active',
            password: Math.random().toString(36).slice(-8),
            otp: null,
            otpExpiry: null
        });

        return user;
    };

    TdUser.remoteMethod('verifyOTP', {
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: { arg: 'user', type: 'object', root: true },
        http: { path: '/verifyOTP', verb: 'post' },
    });

    const normalizePhoneNumber = (phone) => phone.replace(/[^0-9]/g, '');

    /*** Login Generate OTP ***/
    TdUser.loginGenerateOtp = async function (data) {
        const { phone: rawPhone } = data;
        const phone = normalizePhoneNumber(rawPhone);

        // Validation
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
                where: { or: [{ phone }], isTemporary: false }
            });

            if (!user) {
                const error = new Error('User not found');
                error.statusCode = 404;
                throw error;
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiry = new Date(Date.now() + 5 * 60 * 1000);
            await user.updateAttributes({ otp, otpExpiry: expiry });

            // Verify the update
            const updatedUser = await TdUser.findOne({ where: { phone } });
            console.log(`Post-update check: OTP=${updatedUser.otp}, Expiry=${updatedUser.otpExpiry}`);

            // Return OTP directly since SMS service is not used
            return {
                success: true,
                message: 'OTP generated successfully. Use the provided OTP for verification.',
                otp, // For testing purposes; remove in production
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
        http: { path: '/loginGenerateOtp', verb: 'post' },
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

        // Clear OTP
        await user.updateAttributes({ otp: null, otpExpiry: null });

        // Generate access token
        const token = await user.createAccessToken({ ttl: 1209600 }); // 14 days TTL

        console.log(`User logged in successfully for phone ${phone}, userId: ${user.id}`);
        return { user, token };
    };

    TdUser.remoteMethod('loginVerifyOtp', {
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/loginVerifyOtp', verb: 'post' },
    });

    /*** Validate Token ***/
    // In TdUser.js
    TdUser.validateToken = async function (req) {
        const tokenId = req.headers.authorization?.replace('Bearer ', '');
        console.log('validateToken - Token ID:', tokenId); // Debug
        if (!tokenId) {
            const error = new Error('No token provided');
            error.statusCode = 401;
            throw error;
        }
        const AccessToken = loopback.getModel('AccessToken');
        const token = await AccessToken.findOne({ where: { id: tokenId } });
        console.log('validateToken - Found token:', token); // Debug
        if (!token) {
            const error = new Error('Invalid token');
            error.statusCode = 401;
            throw error;
        }
        const now = new Date();
        const created = new Date(token.created);
        const ttl = token.ttl * 1000;
        console.log('validateToken - Token created:', created, 'TTL:', ttl, 'Now:', now, 'Expires:', new Date(created.getTime() + ttl)); // Debug
        if (now > new Date(created.getTime() + ttl)) {
            const error = new Error('Token expired');
            error.statusCode = 401;
            throw error;
        }
        const user = await TdUser.findOne({ where: { id: token.userId } });
        console.log('validateToken - Found user:', user); // Debug
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        return { valid: true, user };
    };

    TdUser.beforeRemote('prototype.updateAttributes', async function (ctx, modelInstance, next) {
        console.log('PATCH - Full Request:', {
            method: ctx.req.method,
            url: ctx.req.url,
            headers: ctx.req.headers,
            body: ctx.args.data,
            accessToken: ctx.req.accessToken,
            user: ctx.req.user
        });
        if (!ctx.req.accessToken) {
            console.log('PATCH - No accessToken, checking Authorization header');
            const authHeader = ctx.req.headers.authorization;
            if (authHeader) {
                const AccessToken = app.models.AccessToken;
                const tokenId = authHeader.replace('Bearer ', '');
                const token = await AccessToken.findOne({ where: { id: tokenId } });
                console.log('PATCH - Manually fetched token:', token);
            }
        }
        handleFileUpload(ctx, next);
    });

    TdUser.remoteMethod('validateToken', {
        accepts: [{ arg: 'req', type: 'object', http: { source: 'req' } }],
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/validateToken', verb: 'get' },
    });

    /*** Logout ***/
    TdUser.logout = async function (req) {
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

        // Delete the token
        await AccessToken.destroyById(tokenId);
        return { success: true, message: 'Logged out successfully' };
    };

    TdUser.remoteMethod('logout', {
        accepts: [{ arg: 'req', type: 'object', http: { source: 'req' } }],
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/logout', verb: 'post' },
    });

    /*** Test SMS ***/
    TdUser.testSMS = async function (phone, message) {
        const dltTemplateId = '1207161762420476512';
        await new Promise((resolve, reject) => {
            smsService.sendSMS(phone, message, dltTemplateId, (err, response) => {
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
            { arg: 'phone', type: 'string', required: true },
            { arg: 'message', type: 'string', required: true },
        ],
        returns: { arg: 'success', type: 'boolean', root: true },
        http: { path: '/testSMS', verb: 'post' },
    });

    /*** Reset Password from Admin Panel ***/
    TdUser.resetUserPassFromPanel = async function (userId, debug = false) {
        const userObj = await TdUser.findOne({ where: { id: userId } });
        if (!userObj) throw new Error('User is not found');

        const newPassword = Math.random().toString(36).substring(2, 8);
        userObj.password = newPassword;
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
            { arg: 'debug', type: 'boolean', required: false },
        ],
        returns: { arg: 'result', type: 'string', root: true },
        http: { path: '/resetUserPassFromPanel', verb: 'post' },
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
        await userObj.save();

        return 'Status changed successfully.';
    };

    TdUser.remoteMethod('changeUserStatus', {
        accepts: [
            { arg: 'userId', type: 'string', required: true },
            { arg: 'newStatus', type: 'string', required: true },
        ],
        returns: { arg: 'result', type: 'string', root: true },
        http: { path: '/changeUserStatus', verb: 'post' },
    });

    /*** Reset Password with OTP ***/
    TdUser.resetUserPassword = async function (handle, otp, newPassword) {
        const userObj = await TdUser.findOne({
            where: { or: [{ username: handle }, { email: handle }] },
        });
        if (!userObj) throw new Error('User is not found');
        if (userObj.otp !== otp) throw new Error('Provided OTP is not valid');

        userObj.password = newPassword;
        userObj.otp = null;
        await userObj.save();

        return 'Password reset successfully.';
    };

    TdUser.remoteMethod('resetUserPassword', {
        accepts: [
            { arg: 'handle', type: 'string', required: true },
            { arg: 'otp', type: 'string', required: true },
            { arg: 'newPassword', type: 'string', required: true },
        ],
        returns: { arg: 'result', type: 'string', root: true },
        http: { path: '/resetUserPassword', verb: 'post' },
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
            created: new Date(),
        });

        return token;
    };

    TdUser.remoteMethod('generateAccessToken', {
        accepts: [{ arg: 'username', type: 'string', required: true }],
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/generateAccessToken', verb: 'post' },
    });

    /*** Register with Password (for Website) ***/
    TdUser.registerWithPassword = async function (data) {
        const { email, phone, password, contactName, city, state, country, referrald, isTermsAgreed, userType = 'user' } = data;
        console.log('user data', data);
        // Validation
        if (!email || !phone || !password || !contactName || !isTermsAgreed) {
            const error = new Error('Email, phone, password, name, and terms agreement are required');
            error.statusCode = 400;
            throw error;
        }

        // Check if user exists
        const existingUser = await TdUser.findOne({
            where: { or: [{ email }, { phone }] }
        });

        if (existingUser) {
            const error = new Error('Email or phone already registered');
            error.statusCode = 400;
            throw error;
        }

        // Create user
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
            planId: 'I'
        });

        return user;
    };

    TdUser.remoteMethod('registerWithPassword', {
        accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
        returns: { arg: 'user', type: 'object', root: true },
        http: { path: '/registerWithPassword', verb: 'post' },
    });

    /*** Login with Password (for Website) ***/
    TdUser.loginWithPassword = async function (credentials) {
        const { email, password } = credentials;
        console.log('loginWithPassword - Credentials:', { email, password }); // Debug
        if (!email || !password) {
            const error = new Error('Email and password are required');
            error.statusCode = 400;
            throw error;
        }
        const user = await TdUser.findOne({
            where: { or: [{ email }, { username: email }] }
        });
        console.log('loginWithPassword - Found user:', user ? user.id : null); // Debug
        if (!user) {
            console.log('loginWithPassword - User not found:', email);
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }
        const isPasswordValid = await user.hasPassword(password);
        console.log('loginWithPassword - Password valid:', isPasswordValid); // Debug
        if (!isPasswordValid) {
            console.log('loginWithPassword - Invalid password for:', email);
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }
        if (user.status !== 'active') {
            console.log('loginWithPassword - Account not active:', email);
            const error = new Error('Account is not active');
            error.statusCode = 403;
            throw error;
        }
        await TdUser.updateAll(
            { id: user.id },
            { lastLogin: new Date() }
        );
        console.log('loginWithPassword - Creating token for:', email); // Debug
        const token = await user.createAccessToken({ ttl: 1209600 });
        console.log('loginWithPassword - Token created:', token.id); // Debug
        return { user, token };
    };

    TdUser.remoteMethod('loginWithPassword', {
        accepts: { arg: 'credentials', type: 'object', http: { source: 'body' } },
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/loginWithPassword', verb: 'post' },
    });

    TdUser.upload = async function (ctx) {
        try {
            if (!ctx.req.files || !ctx.req.files.profileImage) {
                const error = new Error('No file provided');
                error.statusCode = 400;
                throw error;
            }
            const file = ctx.req.files.profileImage[0];
            const subDir = ctx.args.data?.fileType || 'profiles';
            const sanitizedSubDir = subDir.replace(/[^a-zA-Z0-9_-]/g, '');
            const uploadDir = path.join(__dirname, '../../Uploads', sanitizedSubDir);
            await fs.promises.mkdir(uploadDir, { recursive: true });
            const fileName = `${Date.now()}_${file.originalname}`;
            const filePath = path.join(uploadDir, fileName);
            await fs.promises.writeFile(filePath, file.buffer);
            const url = `/Uploads/${sanitizedSubDir}/${fileName}`;
            return { url };
        } catch (error) {
            console.error('Error in upload:', error);
            throw error;
        }
    };

    TdUser.remoteMethod('upload', {
        accepts: [
            { arg: 'ctx', type: 'object', http: { source: 'context' } }
        ],
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/upload', verb: 'post' },
    });
};