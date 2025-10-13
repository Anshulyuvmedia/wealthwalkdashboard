'use strict';
var loopback = require('loopback');
var mongoObj = require('mongodb');
var _ = require('lodash');
//var lbContext = require('loopback-context');
exports['default'] = function (Model, options) {
    Model.beforeRemote('**', function (ctx, unused, next) {
        if (!ctx.req.headers) return next();
        if (ctx.args.options) {
            ctx.args.options.currentTenantCode = ctx.req.headers["x-tenant-code"];
        }
        next();
    })
    Model.observe('access', function (ctx, next) {
        var tenantId = (ctx.options.currentTenantCode) ? ctx.options.currentTenantCode : "ADB";
        if (!ctx.query.where) ctx.query.where = {};
        ctx.query.where.tenantCode = tenantId;
        next();
    });
    Model.observe('before save', function (ctx, next) {
        console.log('limitToTenant - before save:', {
            model: Model.modelName,
            isNewInstance: ctx.isNewInstance,
            instance: !!ctx.instance,
            data: ctx.data
        });
        if (ctx.instance && _.get(ctx.instance, "tenantCode")) {
            console.log('limitToTenant - tenantCode already set for instance:', ctx.instance.tenantCode);
            return next();
        }
        if (ctx.isNewInstance && ctx.instance) {
            ctx.instance.tenantCode = ctx.options.currentTenantCode || "ADB";
            console.log('limitToTenant - Set tenantCode for new instance:', ctx.instance.tenantCode);
        } else if (ctx.data) {
            ctx.data.tenantCode = ctx.options.currentTenantCode || "ADB";
            console.log('limitToTenant - Set tenantCode for update:', ctx.data.tenantCode);
        }
        next();
    });
};

module.exports = exports['default'];