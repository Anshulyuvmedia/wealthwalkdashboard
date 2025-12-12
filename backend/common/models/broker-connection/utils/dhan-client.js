// services/utils/dhan-client.js
const axios = require('axios');

module.exports = (accessToken) => {
    const client = axios.create({
        baseURL: 'https://api.dhan.co/v2',
        headers: { 'access-token': accessToken }
    });
    return client;
};