'use strict';

module.exports = function (Instrument) {

    // -----------------------------------------------------------------
    // Dummy data generators
    // -----------------------------------------------------------------
    const dummyData = {
        equity: () => [
            { id: "RELIANCE".hashCode(), name: "RELIANCE", type: "equity", price: 2987.45, exchange: "NSE", lot: 1, source: "dummy" },
            { id: "TCS".hashCode(), name: "TCS", type: "equity", price: 4192.30, exchange: "NSE", lot: 1, source: "dummy" },
            { id: "HDFCBANK".hashCode(), name: "HDFCBANK", type: "equity", price: 1624.80, exchange: "NSE", lot: 1, source: "dummy" },
            { id: "INFY".hashCode(), name: "INFY", type: "equity", price: 1876.55, exchange: "NSE", lot: 1, source: "dummy" },
            { id: "SBIN".hashCode(), name: "SBIN", type: "equity", price: 812.70, exchange: "NSE", lot: 1, source: "dummy" }
        ],

        indices: () => [
            { id: "NIFTY 50".hashCode(), name: "NIFTY 50", type: "indices", price: 24352.10, exchange: "NSE", lot: 25, source: "dummy" },
            { id: "NIFTY BANK".hashCode(), name: "NIFTY BANK", type: "indices", price: 52481.65, exchange: "NSE", lot: 15, source: "dummy" },
            { id: "NIFTY FIN SERVICE".hashCode(), name: "NIFTY FIN SERVICE", type: "indices", price: 24189.30, exchange: "NSE", lot: 25, source: "dummy" },
            { id: "SENSEX".hashCode(), name: "SENSEX", type: "indices", price: 79456.20, exchange: "BSE", lot: 10, source: "dummy" }
        ],

        cds: () => [
            { id: "USDINR".hashCode(), name: "USDINR", type: "cds", price: 84.3750, exchange: "NSE", lot: 1000, source: "dummy" },
            { id: "EURINR".hashCode(), name: "EURINR", type: "cds", price: 91.2840, exchange: "NSE", lot: 1000, source: "dummy" },
            { id: "GBPINR".hashCode(), name: "GBPINR", type: "cds", price: 109.5625, exchange: "NSE", lot: 1000, source: "dummy" },
            { id: "JPYINR".hashCode(), name: "JPYINR", type: "cds", price: 55.8900, exchange: "NSE", lot: 1000, source: "dummy" }
        ],

        mcx: () => [
            { id: "GOLD".hashCode(), name: "GOLD", type: "mcx", price: 78250, exchange: "MCX", lot: 100, source: "dummy" },
            { id: "SILVER".hashCode(), name: "SILVER", type: "mcx", price: 92450, exchange: "MCX", lot: 30, source: "dummy" },
            { id: "CRUDEOIL".hashCode(), name: "CRUDEOIL", type: "mcx", price: 6420, exchange: "MCX", lot: 100, source: "dummy" },
            { id: "NATURALGAS".hashCode(), name: "NATURALGAS", type: "mcx", price: 285.6, exchange: "MCX", lot: 1250, source: "dummy" }
        ],

        options: (search = "NIFTY") => {
            const underlying = search.toUpperCase();
            const strikes = [24000, 24100, 24200, 24300, 24400];
            const expiry = "271125"; // 27-Nov-2025
            const lot = underlying === "BANKNIFTY" ? 15 : 25;
            const items = [];

            strikes.forEach(strike => {
                // Call
                items.push({
                    id: `${underlying}-${strike}-CE-${expiry}`.hashCode(),
                    name: `C-${underlying}-${strike}-${expiry}`,
                    type: "options",
                    price: Math.round((Math.random() * 300 + 50) * 100) / 100,
                    exchange: "NSE",
                    lot,
                    source: "dummy"
                });
                // Put
                items.push({
                    id: `${underlying}-${strike}-PE-${expiry}`.hashCode(),
                    name: `P-${underlying}-${strike}-${expiry}`,
                    type: "options",
                    price: Math.round((Math.random() * 280 + 40) * 100) / 100,
                    exchange: "NSE",
                    lot,
                    source: "dummy"
                });
            });
            return items;
        },

        futures: (search = "NIFTY") => {
            const sym = search.toUpperCase();
            const expiries = ["271125", "251226", "311227"]; // near, next, far
            const lot = sym === "BANKNIFTY" ? 15 : 25;

            return expiries.map(exp => ({
                id: `${sym}-${exp}-FUT`.hashCode(),
                name: `${sym}${exp}FUT`,
                type: "futures",
                price: Math.round((24300 + Math.random() * 200) * 100) / 100,
                exchange: "NSE",
                lot,
                source: "dummy"
            }));
        }
    };

    // -----------------------------------------------------------------
    // MAIN REMOTE METHOD – DUMMY VERSION
    // -----------------------------------------------------------------
    Instrument.fetchInstruments = async function (type, search) {
        const t = (type || "").toLowerCase().trim();
        console.log(`\n=== fetchInstruments (DUMMY) type="${t}" search="${search}" ===`);

        let result = [];

        switch (t) {
            case "equity":
                result = dummyData.equity();
                if (search) {
                    result = result.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
                }
                break;

            case "indices":
                result = dummyData.indices();
                if (search) {
                    result = result.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
                }
                break;

            case "cds":
                result = dummyData.cds();
                if (search) {
                    result = result.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
                }
                break;

            case "mcx":
                result = dummyData.mcx();
                if (search) {
                    result = result.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
                }
                break;

            case "options":
                result = dummyData.options(search || "NIFTY");
                break;

            case "futures":
                result = dummyData.futures(search || "NIFTY");
                break;

            default:
                console.log("Unknown type, returning empty array");
                result = [];
        }

        console.log(`Returning ${result.length} dummy instruments`);
        console.log(`=== fetchInstruments END ===\n`);
        return result;
    };

    // -----------------------------------------------------------------
    // Register remote method (unchanged)
    // -----------------------------------------------------------------
    Instrument.remoteMethod('fetchInstruments', {
        accepts: [
            { arg: 'type', type: 'string', http: { source: 'query' } },
            { arg: 'search', type: 'string', http: { source: 'query' } }
        ],
        returns: { arg: 'data', type: 'array', root: true },
        http: { path: '/fetch', verb: 'get' },
        description: 'Fetch dummy/static instruments (no live NSE calls)'
    });

    console.log('Remote method fetchInstruments (DUMMY) registered → /api/Instruments/fetch');

    // -----------------------------------------------------------------
    // Helper: String.hashCode (kept for compatibility)
    // -----------------------------------------------------------------
    String.prototype.hashCode = function () {
        let h = 0;
        for (let i = 0; i < this.length; i++) h = ((h << 5) - h + this.charCodeAt(i)) | 0;
        return Math.abs(h);
    };
};