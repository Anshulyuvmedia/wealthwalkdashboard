// utils/dhanConfig.js

const getDhanConfig = () => {
    const env = process.env.DHAN_ENV?.trim().toLowerCase() || 'sandbox';

    if (env !== 'sandbox' && env !== 'production') {
        throw new Error('DHAN_ENV must be either "sandbox" or "production"');
    }

    const isSandbox = env === 'sandbox';

    return {
        environment: env,
        isSandbox,
        baseUrl: isSandbox ? 'https://sandbox.dhan.co' : 'https://api.dhan.co',

        clientId: isSandbox
            ? process.env.DHAN_SANDBOX_CLIENT_ID
            : process.env.DHAN_CLIENT_ID,

        // Sandbox: static token from .env
        // Production: dynamically fetched/stored per user (from DB)
        accessToken: isSandbox
            ? process.env.DHAN_SANDBOX_ACCESSTOKEN
            : null, // or fetch from user record

        callbackUrl: process.env.DHAN_CALLBACK_URL,
        postbackUrl: process.env.DHAN_POSTBACK_URL,
    };
};

module.exports = { getDhanConfig };