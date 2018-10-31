"use strict";
/**
 * @class CreateSession
 * @author ranyunlong<549510622@qq.com>
 * @license MIT
 * @copyright Ranyunlong 2018-10-14 10:04
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const SessionStorage_1 = require("./lib/SessionStorage");
class Session {
    constructor(opts = {}) {
        this.opts = opts;
        this.sessions = {};
        opts.signed = true;
        opts.key = opts.key || 'ssid';
        opts.store = opts.store || new SessionStorage_1.SessionStorage();
    }
    async handlerRequest(ctx) {
        const { opts } = this;
        const { key, store } = opts;
        // Get Sid from cookies
        let sid = ctx.cookies.get(key, opts);
        // Check sid
        if (!sid) {
            // Not sid
            ctx.session = { sid };
        }
        else {
            // Get Sid from store
            ctx.session = await store.get(sid);
        }
        // Check session state
        if (typeof ctx.session !== 'object' || ctx.session === null) {
            ctx.session = { sid };
        }
        ctx._session = JSON.stringify(ctx.session);
    }
    async handlerResponse(ctx) {
        const { opts } = this;
        const { key, store } = opts;
        // Get Sid from cookies
        const sid = ctx.session.sid;
        // Get old session
        const old = ctx._session;
        // Add refresh function
        let need_refresh = false;
        ctx.session.refresh = () => { need_refresh = true; };
        // Remove refresh function
        if (ctx.session && 'refresh' in ctx.session) {
            delete ctx.session.refresh;
        }
        // Get session from context
        const sess = JSON.stringify(ctx.session);
        // If not changed
        if (!need_refresh && old === sess)
            return;
        // If is an empty object
        if (sess === '{}') {
            ctx.session = null;
        }
        // Need clear old session
        if (sid && !ctx.session) {
            await store.destroy(sid);
            ctx.cookies.set(key, null);
            return;
        }
        // set/update session
        const ssid = await store.set(ctx.session, {
            ...opts,
            sid
        });
        ctx.cookies.set(key, ssid, opts);
    }
}
exports.Session = Session;
__export(require("./lib/SessionStorage"));
__export(require("./lib/SessionRedisStorage"));
