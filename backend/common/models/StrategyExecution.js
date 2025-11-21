// common/models/strategy-execution.js
'use strict';

module.exports = function (StrategyExecution) {

    // Helper: Extract authenticated userId safely
    const getUserId = (options) => {
        if (!options || !options.accessToken || !options.accessToken.userId) {
            throw Object.assign(new Error('Unauthorized: Login required'), { statusCode: 401 });
        }
        return options.accessToken.userId.toString();
    };

    // ====================================================================
    // 1. GET ACTIVE EXECUTIONS (queued + running)
    // ====================================================================
    StrategyExecution.active = async function (status = 'queued,running', options) {
        const userId = getUserId(options);
        const statuses = status.split(',');

        return await StrategyExecution.find({
            where: {
                userId,
                status: { inq: statuses }
            },
            order: 'executedAt DESC',
            include: 'strategy'
        });
    };

    // ====================================================================
    // 2. GET HISTORY
    // ====================================================================
    StrategyExecution.history = async function (limit = 50, skip = 0, options) {
        const userId = getUserId(options);

        return await StrategyExecution.find({
            where: { userId },
            order: 'executedAt DESC',
            limit,
            skip,
            include: 'strategy'
        });
    };

    // ====================================================================
    // 3. PAUSE EXECUTION
    // ====================================================================
    StrategyExecution.pause = async function (id, options) {
        const userId = getUserId(options);

        const execution = await StrategyExecution.findById(id);
        if (!execution) {
            throw Object.assign(new Error('Execution not found'), { statusCode: 404 });
        }
        if (execution.userId.toString() !== userId) {
            throw Object.assign(new Error('Forbidden: Not your execution'), { statusCode: 403 });
        }
        if (!['running', 'queued'].includes(execution.status)) {
            throw Object.assign(new Error(`Cannot pause: current status is ${execution.status}`), { statusCode: 400 });
        }

        await execution.updateAttribute('status', 'paused');

        console.log(`EXECUTION #${id} PAUSED by User:${userId}`);
        return { success: true, message: 'Execution paused', executionId: id };
    };

    // ====================================================================
    // 4. RESUME EXECUTION
    // ====================================================================
    StrategyExecution.resume = async function (id, options) {
        const userId = getUserId(options);

        const execution = await StrategyExecution.findById(id);
        if (!execution) {
            throw Object.assign(new Error('Execution not found'), { statusCode: 404 });
        }
        if (execution.userId.toString() !== userId) {
            throw Object.assign(new Error('Forbidden: Not your execution'), { statusCode: 403 });
        }

        // ✅ allow resume from queued or paused
        if (!['paused', 'queued'].includes(execution.status)) {
            throw Object.assign(
                new Error(`Cannot resume: current status is ${execution.status}`),
                { statusCode: 400 }
            );
        }

        // ✅ queued/paused → running
        await execution.updateAttribute('status', 'running');

        console.log(`EXECUTION #${id} RESUMED by User:${userId} from ${execution.status}`);
        return { success: true, message: 'Execution resumed', executionId: id };
    };

    // ====================================================================
    // 5. CANCEL / EXIT EXECUTION (Square Off + Terminate)
    // ====================================================================
    StrategyExecution.cancel = async function (id, options) {
        const userId = getUserId(options);

        const execution = await StrategyExecution.findById(id);
        if (!execution) {
            throw Object.assign(new Error('Execution not found'), { statusCode: 404 });
        }
        if (execution.userId.toString() !== userId) {
            throw Object.assign(new Error('Forbidden: Not your execution'), { statusCode: 403 });
        }
        if (execution.status === 'completed' || execution.status === 'cancelled') {
            throw Object.assign(new Error('Execution already completed or cancelled'), { statusCode: 400 });
        }

        // Optional: Trigger broker square-off here in future
        // await brokerApi.squareOff(execution.broker, execution.executionRef);

        await execution.updateAttributes({
            status: 'cancelled',
            cancelledAt: new Date(),
            exitReason: 'User cancelled via app'
        });

        console.log(`EXECUTION #${id} CANCELLED by User:${userId}`);
        return { success: true, message: 'Execution cancelled and squared off', executionId: id };
    };

    // ====================================================================
    // REMOTE METHODS DEFINITION
    // ====================================================================

    StrategyExecution.remoteMethod('active', {
        description: 'Get active (queued/running) executions for logged-in user',
        accepts: [
            { arg: 'status', type: 'string', default: 'queued,running' },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { arg: 'executions', type: 'array', root: true },
        http: { path: '/active', verb: 'get' }
    });

    StrategyExecution.remoteMethod('history', {
        description: 'Get execution history',
        accepts: [
            { arg: 'limit', type: 'number', default: 50 },
            { arg: 'skip', type: 'number', default: 0 },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { arg: 'history', type: 'array', root: true },
        http: { path: '/history', verb: 'get' }
    });

    StrategyExecution.remoteMethod('pause', {
        description: 'Pause a running/queued execution',
        accepts: [
            { arg: 'id', type: 'string', required: true, http: { source: 'path' } },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/:id/pause', verb: 'post' }
    });

    StrategyExecution.remoteMethod('resume', {
        description: 'Resume a paused execution',
        accepts: [
            { arg: 'id', type: 'string', required: true, http: { source: 'path' } },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/:id/resume', verb: 'post' }
    });

    StrategyExecution.remoteMethod('cancel', {
        description: 'Cancel and square off an execution',
        accepts: [
            { arg: 'id', type: 'string', required: true, http: { source: 'path' } },
            { arg: 'options', type: 'object', http: 'optionsFromRequest' }
        ],
        returns: { arg: 'result', type: 'object', root: true },
        http: { path: '/:id/cancel', verb: 'post' }
    });

    // Optional: Disable unwanted built-in methods if needed
    // StrategyExecution.disableRemoteMethodByName('deleteById');
};