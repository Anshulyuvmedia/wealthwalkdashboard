const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const app = require('../server/server');

const DhanInstrument = app.models.DhanInstrument;

// Your existing CSV path
const CSV_PATH = path.join(__dirname, '../data/api-scrip-master-detailed.csv');

const BATCH_SIZE = 1000;
let buffer = [];

async function insertBatch(batch) {
    if (!batch.length) return;
    await DhanInstrument.create(batch, { validate: false });
}

async function importCSV() {
    console.log('📥 Importing Dhan instruments...');
    await DhanInstrument.destroyAll(); // optional reset

    return new Promise((resolve, reject) => {
        fs.createReadStream(CSV_PATH)
            .pipe(csv({ separator: ',' })) // TSV file
            .on('data', async function (row) {
                // console.log(Object.keys(row));
                // process.exit();

                buffer.push({
                    securityId: row.SECURITY_ID,
                    exchangeSegment: row.SEGMENT,
                    symbol: row.SYMBOL_NAME,
                    displayName: row.DISPLAY_NAME,
                    instrumentType: row.INSTRUMENT_TYPE,
                    isin: row.ISIN,

                    exchId: row.EXCH_ID,
                    series: row.SERIES,
                    expiryFlag: row.EXPIRY_FLAG,
                    asmGsmFlag: row.ASM_GSM_FLAG,
                    asmGsmCategory: row.ASM_GSM_CATEGORY,
                    mtfLeverage: Number(row.MTF_LEVERAGE) || null,

                    lotSize: Number(row.LOT_SIZE) || 1,
                    tickSize: Number(row.TICK_SIZE) || 0.05,

                    underlyingSymbol: row.UNDERLYING_SYMBOL || null,
                    expiryDate: row.SM_EXPIRY_DATE ? new Date(row.SM_EXPIRY_DATE) : null,
                    strikePrice: Number(row.STRIKE_PRICE) || null,
                    optionType: row.OPTION_TYPE || null
                });


                if (buffer.length >= BATCH_SIZE) {
                    this.pause();
                    insertBatch(buffer.splice(0))
                        .then(() => this.resume())
                        .catch(reject);
                }
            })
            .on('end', async () => {
                try {
                    await insertBatch(buffer);
                    console.log('✅ Import completed successfully');
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
    });
}

(async () => {
    try {
        await importCSV();
        process.exit(0);
    } catch (err) {
        console.error('❌ Import failed:', err);
        process.exit(1);
    }
})();
