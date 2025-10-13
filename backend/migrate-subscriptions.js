const loopback = require('loopback');
const path = require('path');

const app = loopback();

// Configure the data source (your existing config)
const config = {
    name: 'mongoDB',
    connector: 'mongodb',
    host: '127.0.0.1',
    port: 27017,
    database: 'apitrading',
    url: 'mongodb://127.0.0.1:27017/apitrading',
    useNewUrlParser: true,
    useUnifiedTopology: true,
    debug: true
};

console.log('Configuring data source:', config);

// Attach the data source
app.dataSource('mongoDB', config);

// Boot the app to load models (this is the key missing step)
app.boot(path.resolve(__dirname), function (err) {
    if (err) {
        console.error('Error booting app:', err);
        process.exit(1);
    }

    console.log('Models loaded:', Object.keys(app.models()));

    // Now check for required models
    const TdUser = app.models.TdUser;
    const TdSubscription = app.models.TdSubscription;

    if (!TdUser || !TdSubscription) {
        console.error('Required models not found:', {
            TdUser: !!TdUser,
            TdSubscription: !!TdSubscription
        });
        process.exit(1);
    }

    console.log('Models found successfully. Proceeding with migration...');

    // Connect to the data source (if not auto-connected during boot)
    app.dataSources.mongoDB.connect(function (err) {
        if (err) {
            console.error('Error connecting to MongoDB:', err);
            process.exit(1);
        }
        console.log('MongoDB connected successfully');

        // Your migration logic here, e.g.:
        // - Query TdUser and TdSubscription
        // - Perform updates, inserts, etc.
        // Example: Migrate subscriptions for active users
        TdSubscription.find({ where: { status: 'active' } }, function (err, subs) {
            if (err) {
                console.error('Error finding subscriptions:', err);
                return;
            }
            console.log(`Found ${subs.length} active subscriptions to migrate.`);
            // Add your specific migration code...

            process.exit(0); // Exit after completion
        });
    });
});