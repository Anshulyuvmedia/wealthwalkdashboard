'use strict';
const cron = require('node-cron');

module.exports = function (app) {
    cron.schedule('*/5 * * * *', async () => {
        const ForexRate = app.models.ForexRate;
        try {
            console.log('Starting Delta India cron at', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
            await ForexRate.fetchData();
            console.log('Delta India cron completed');
        } catch (error) {
            console.error('Delta India cron error:', error.message);
        }
    });
};