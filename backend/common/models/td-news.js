"use strict";
const NewsAPI = require('newsapi');
const _ = require("lodash");

module.exports = function (TdNews) {

    const PAGE_SIZE = 20;
    const MAX_FREE_RESULTS = 100;
    const MAX_PAGE = Math.ceil(MAX_FREE_RESULTS / PAGE_SIZE); // 5

    TdNews.getNewsData = async function (category, keywords, page = 1) {

        // 🚫 STOP looping beyond free plan limit
        if (page > MAX_PAGE) {
            return {
                dataList: {
                    status: "1",
                    message: "No more results available (free plan limit)",
                    Item: [],
                    totalResults: MAX_FREE_RESULTS,
                    hasMore: false
                }
            };
        }

        const newsapi = new NewsAPI(process.env.NEWS_API_KEY);

        const validCategories = ['business', 'technology'];

        // 🔹 Last 7 days
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 7);
        const fromISO = fromDate.toISOString();

        // 🔹 Simple, free-plan-safe query
        const baseQuery = keywords
            ? `${keywords.replace(/\+/g, ' ')} india`
            : 'stock market india';

        try {
            let response;

            // ==========================
            // 1️⃣ TOP HEADLINES (INDIA)
            // ==========================
            response = await newsapi.v2.topHeadlines({
                country: 'in',
                category: validCategories.includes(category) ? category : undefined,
                language: 'en',
                page,
                pageSize: PAGE_SIZE
            });

            // ==========================
            // 2️⃣ FALLBACK → EVERYTHING
            // ==========================
            if (response.status !== 'ok' || _.isEmpty(response.articles)) {
                response = await newsapi.v2.everything({
                    q: baseQuery,
                    language: 'en',
                    from: fromISO,
                    sortBy: 'publishedAt',
                    page,
                    pageSize: PAGE_SIZE
                });
            }

            // ==========================
            // 3️⃣ EMPTY RESPONSE
            // ==========================
            if (response.status !== 'ok' || _.isEmpty(response.articles)) {
                return {
                    dataList: {
                        status: "0",
                        message: "No news found",
                        Item: [],
                        totalResults: response.totalResults || 0,
                        hasMore: false
                    }
                };
            }

            // ==========================
            // 4️⃣ FORMAT DATA
            // ==========================
            const formattedArticles = response.articles
                .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
                .map((article, index) => ({
                    id: `${page}-${index}`,
                    title: article.title || 'No title',
                    source: article.source?.name || 'Unknown',
                    timestamp: article.publishedAt,
                    image: article.urlToImage?.startsWith('http') ? article.urlToImage : null,
                    description: article.description || 'No description',
                    content: article.content
                        ? article.content.replace(/\[\+\d+ chars\]/, '').trim()
                        : 'No content available',
                    url: article.url?.startsWith('http') ? article.url : '#'
                }));

            return {
                dataList: {
                    status: "1",
                    message: "success",
                    Item: formattedArticles,
                    totalResults: Math.min(response.totalResults || 0, MAX_FREE_RESULTS),
                    hasMore: page < MAX_PAGE
                }
            };

        } catch (error) {
            console.error('NewsAPI error:', error.message);

            // 🚫 Explicitly stop pagination on limit error
            if (error.message.includes('requested too many results')) {
                return {
                    dataList: {
                        status: "1",
                        message: "Reached free plan limit",
                        Item: [],
                        totalResults: MAX_FREE_RESULTS,
                        hasMore: false
                    }
                };
            }

            return {
                dataList: {
                    status: "0",
                    message: error.message,
                    Item: [],
                    totalResults: 0,
                    hasMore: false
                }
            };
        }
    };

    TdNews.remoteMethod('getNewsData', {
        accepts: [
            { arg: 'category', type: 'string' },
            { arg: 'keywords', type: 'string' },
            { arg: 'page', type: 'number' }
        ],
        returns: { arg: 'dataList', type: 'object', root: true },
        http: { path: '/getNewsData', verb: 'get' }
    });
};
