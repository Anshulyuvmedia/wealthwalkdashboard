module.exports = function (DhanInstrument) {

    DhanInstrument.search = async function (q, segment, type, limit = 30) {

        const filter = {
            where: {
                and: []
            },
            limit
        };

        if (q) {
            filter.where.and.push({
                or: [
                    { symbol: { like: q, options: 'i' } },
                    { displayName: { like: q, options: 'i' } }
                ]
            });
        }

        if (segment) {
            filter.where.and.push({ exchangeSegment: segment });
        }

        if (type) {
            filter.where.and.push({ instrumentType: type });
        }

        return DhanInstrument.find(filter);
    };

    DhanInstrument.remoteMethod('search', {
        accepts: [
            { arg: 'q', type: 'string' },
            { arg: 'segment', type: 'string' },
            { arg: 'type', type: 'string' },
            { arg: 'limit', type: 'number', default: 30 }
        ],
        returns: { arg: 'data', type: ['DhanInstrument'], root: true },
        http: { path: '/search', verb: 'get' }
    });
};
