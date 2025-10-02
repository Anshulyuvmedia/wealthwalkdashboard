'use strict';

module.exports = function (TdSignals) {
    // Combined hook: timestamps + business rules
    TdSignals.observe('before save', function (ctx, next) {
        const now = new Date();
        // Set timestamps
        if (ctx.isNewInstance) {
            if (ctx.instance) {
                ctx.instance.createdAt = now;
            } else if (ctx.data) {
                ctx.data.createdAt = now;
            }
        }
        if (ctx.instance) {
            ctx.instance.updatedAt = now;
        } else if (ctx.data) {
            ctx.data.updatedAt = now;
        }

        // Business rule validation (for both instance and bulk data)
        const validateBusinessRule = (data) => {
            if (data.marketSentiments === 'Bullish' && data.target <= data.entry) {
                return new Error('For Bullish sentiment, target must be greater than entry');
            } else if (data.marketSentiments === 'Bearish' && data.target >= data.entry) {
                return new Error('For Bearish sentiment, target must be less than entry');
            }
            return null;
        };

        if (ctx.instance) {
            const err = validateBusinessRule(ctx.instance);
            if (err) return next(err);
        } else if (ctx.data && Array.isArray(ctx.data)) {
            // Bulk: check each item
            for (const item of ctx.data) {
                const err = validateBusinessRule(item);
                if (err) return next(err);
            }
        } else if (ctx.data) {
            const err = validateBusinessRule(ctx.data);
            if (err) return next(err);
        }

        next();
    });

    // Custom remote method: Get signals by type (e.g., for frontend filtering)
    TdSignals.getByType = function (signalType, cb) {
        TdSignals.find({ where: { signalType: signalType } }, cb);
    };

    TdSignals.remoteMethod('getByType', {
        accepts: [
            { arg: 'signalType', type: 'string', required: true }
        ],
        returns: { arg: 'signals', type: ['TdSignals'], root: true },
        http: { verb: 'get', path: '/by-type' }
    });

    // Full validations for all required fields (sync only)
    TdSignals.validate('signalType', function (err) {
        if (!this.signalType || this.signalType.trim() === '') {
            this.errors.signalType = 'Signal type is required';
        } else if (!['Paid', 'Free'].includes(this.signalType)) {
            this.errors.signalType = 'Signal type must be Paid or Free';
        }
    });

    TdSignals.validate('category', function (err) {
        if (!this.category || this.category.trim() === '') {
            this.errors.category = 'Category is required';
        } else if (!['Index', 'Stocks', 'Futures'].includes(this.category)) {
            this.errors.category = 'Category must be Index, Stocks, or Futures';
        }
    });

    TdSignals.validate('stockName', function (err) {
        if (!this.stockName || this.stockName.trim() === '') {
            this.errors.stockName = 'Stock name is required';
        }
    });

    TdSignals.validate('marketSentiments', function (err) {
        if (!this.marketSentiments || this.marketSentiments.trim() === '') {
            this.errors.marketSentiments = 'Market sentiment is required';
        } else if (!['Bullish', 'Bearish', 'Neutral'].includes(this.marketSentiments)) {
            this.errors.marketSentiments = 'Market sentiment must be Bullish, Bearish, or Neutral';
        }
    });

    TdSignals.validate('entry', function (err) {
        if (this.entry === undefined || this.entry <= 0) {
            this.errors.entry = 'Entry must be a positive number';
        }
    });

    TdSignals.validate('target', function (err) {
        if (this.target === undefined || this.target <= 0) {
            this.errors.target = 'Target must be a positive number';
        }
    });

    TdSignals.validate('stopLoss', function (err) {
        if (this.stopLoss === undefined || this.stopLoss <= 0) {
            this.errors.stopLoss = 'Stop loss must be a positive number';
        }
    });

    TdSignals.validate('exit', function (err) {
        if (this.exit === undefined || this.exit <= 0) {
            this.errors.exit = 'Exit must be a positive number';
        }
    });

    TdSignals.validate('tradeType', function (err) {
        if (!this.tradeType || this.tradeType.trim() === '') {
            this.errors.tradeType = 'Trade type is required';
        } else if (!['Options', 'Equity', 'Futures'].includes(this.tradeType)) {
            this.errors.tradeType = 'Trade type must be Options, Equity, or Futures';
        }
    });

    TdSignals.validate('Strategy', function (err) {
        if (!this.Strategy || this.Strategy.trim() === '') {
            this.errors.Strategy = 'Strategy is required';
        }
    });
};