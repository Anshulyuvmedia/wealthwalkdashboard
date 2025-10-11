"use strict";
const NewsAPI = require('newsapi');
const _ = require("lodash");

module.exports = function (TdNews) {
    TdNews.getNewsData = async function (category, keywords, page = 1) {
        const newsapi = new NewsAPI(process.env.NEWS_API_KEY || '6f26414237514a82a1bf32f0ebeda3d6');

        const validCategories = ['business', 'technology'];
        const queryParams = {
            page,
            language: 'en',
            country: 'us',
            pageSize: 20,
        };

        if (category && validCategories.includes(category)) {
            queryParams.category = category;
        }

        if (keywords) {
            queryParams.q = keywords.replace(/\+/g, ' ');
        } else if (!category) {
            queryParams.q = 'business';
        }

        try {
            let response = await newsapi.v2.topHeadlines(queryParams);
            console.log('top-headlines response:', JSON.stringify(response, null, 2));

            if (response.status !== 'ok' || _.isEmpty(response.articles)) {
                console.log('No articles from top-headlines, trying everything endpoint');
                response = await newsapi.v2.everything({
                    q: queryParams.q || 'business',
                    language: 'en',
                    page,
                    sortBy: 'relevancy',
                    pageSize: 20,
                });
                console.log('everything response:', JSON.stringify(response, null, 2));
            }

            if (response.status !== 'ok' || _.isEmpty(response.articles)) {
                return {
                    dataList: {
                        status: "0",
                        message: "No articles found for the given query",
                        Item: [],
                        totalResults: response.totalResults || 0,
                    },
                };
            }

            const formattedArticles = response.articles.map((article, index) => {
                const image = typeof article.urlToImage === 'string' && article.urlToImage.startsWith('http')
                    ? article.urlToImage
                    : null;
                const url = typeof article.url === 'string' && article.url.startsWith('http')
                    ? article.url
                    : '#';
                const content = article.content
                    ? article.content.replace(/\[\+\d+ chars\]/, '').trim()
                    : 'No content available';
                return {
                    id: `${page}-${index}`,
                    category: category || 'All',
                    title: article.title || 'No title',
                    source: article.source?.name || 'Unknown',
                    timestamp: article.publishedAt || new Date().toISOString(),
                    image,
                    description: article.description || 'No description',
                    content,
                    url,
                };
            });

            return {
                dataList: {
                    status: "1",
                    message: "success",
                    Item: formattedArticles,
                    totalResults: response.totalResults || 0,
                },
            };
        } catch (error) {
            console.error('NewsAPI error:', error.message);
            return {
                dataList: {
                    status: "0",
                    message: `Failed to fetch news: ${error.message}`,
                    Item: [],
                    totalResults: 0,
                },
            };
        }
    };

    TdNews.remoteMethod('getNewsData', {
        accepts: [
            { arg: 'category', type: 'string', description: 'Category like business or technology' },
            { arg: 'keywords', type: 'string', description: 'Search terms like "stock market crypto"' },
            { arg: 'page', type: 'number', description: 'Page number for pagination' },
        ],
        returns: { arg: 'dataList', type: 'object', root: true },
        http: { path: '/getNewsData', verb: 'get' },
    });
};