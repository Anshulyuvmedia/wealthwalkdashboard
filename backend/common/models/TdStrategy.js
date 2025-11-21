// common/models/td-strategy.js
'use strict';

module.exports = function (Tdstrategy) {
    console.log('TdStrategy execute method LOADED!');

    // Promise-based async function (LoopBack 3 fully supports this)
    // common/models/td-strategy.js

    Tdstrategy.execute = async function (id, data, options) {
        const broker = data?.broker;
        const quantity = data?.quantity ? parseInt(data.quantity, 10) : null;
        const token = options?.accessToken;
        const userId = token && token.userId ? token.userId.toString() : null;

        // === REQUIRE LOGIN ===
        if (!userId) {
            throw Object.assign(new Error('You must be logged in to execute a strategy'), { statusCode: 401 });
        }

        // === Validation ===
        if (!id) throw Object.assign(new Error('Strategy ID is required'), { statusCode: 400 });
        if (!broker || typeof broker !== 'string') throw Object.assign(new Error('Broker is required'), { statusCode: 400 });
        if (quantity !== null && (isNaN(quantity) || quantity <= 0)) {
            throw Object.assign(new Error('Quantity must be a positive number'), { statusCode: 400 });
        }

        const strategy = await Tdstrategy.findById(id);
        if (!strategy) throw Object.assign(new Error('Strategy not found'), { statusCode: 404 });

        const allowedBrokers = ['Stratzy', '5Paisa', 'AngelOne', 'IFL', 'Kotak', 'Master'];
        if (!allowedBrokers.includes(broker)) {
            throw Object.assign(new Error(`Broker "${broker}" is not supported`), { statusCode: 400 });
        }

        // Create execution record under the USER who clicked execute
        const execution = await Tdstrategy.app.models.StrategyExecution.create({
            strategyId: id,
            strategyName: strategy.strategyName || strategy.name,
            broker,
            quantity: quantity || null,
            status: 'queued',
            userId: userId,                    // ← Important: current user
            executedAt: new Date(),
        });

        console.log(`EXECUTION #${execution.id} by User:${userId} → ${strategy.strategyName} × ${quantity || 'default'} via ${broker}`);

        return {
            success: true,
            executionId: execution.id,
            message: `Strategy queued successfully (Execution #${execution.id})`,
            data: { strategyId: id, broker, quantity: quantity || null, executionId: execution.id, status: 'queued' },
        };
    };

    // Remote method definition (unchanged)
    Tdstrategy.remoteMethod('execute', {
        description: 'Execute a trading strategy with selected broker',
        accepts: [
            { arg: 'id', type: 'string', required: true, http: { source: 'path' } },
            { arg: 'data', type: 'object', required: true, http: { source: 'body' } },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' },
        ],
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/:id/execute', verb: 'post' },
    });
};