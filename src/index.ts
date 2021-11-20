import { Middleware } from "koa";
import matcher from "matcher"

export interface DomainRouterOptions {
    /**
     * The base domain that will be appended to all route domains.
     * @default ""
     * @example "example.com"
     */
    baseDomain?: string;
    /**
     * Should requests that did not match any routes still be handed down to the next middleware?
     * @default true
     * @example false
     */
    fallThrough?: boolean;
}

export default class DomainRouter {
    private baseDomain = ""
    private fallThrough = true;
    constructor(opts?: DomainRouterOptions) {
        if (opts?.baseDomain) this.baseDomain = opts?.baseDomain;
        this.fallThrough = opts?.fallThrough ?? true;
    };
    private routeList = new Map<string, Middleware>()
    /**
     * Create a middleware that will serve all registered domains
     * Requests that dont match any registed domain will fall through
     * @returns Router Middleware
     */
    routes(): Middleware<DomainRouterState> {
        return async (ctx, next) => {
            let [pattern, fun] = this.match(ctx.host)
            if (fun) {
                ctx.state.matchedDomainPattern = pattern!;
                await fun(ctx, next)
            } else {
                if (this.fallThrough) await next()
            }
        }
    }
    /**
     * @param host domain(s) to match. uses wildcards
     * @param fun middle to be executed
     */
    use(host: string | string[], fun: Middleware<DomainRouterState>) {
        if (Array.isArray(host)) {
            for (const h of host) {
                this.routeList.set(h.toLowerCase() + this.baseDomain, fun)
            }
        } else {
            this.routeList.set(host.toLowerCase() + this.baseDomain, fun)
        }
    }
    /**
     * Manually look up the middleware of a domain
     * @param host domain to look up
     * @returns [matchedRule, middlware] or [null, null]
     */
    match(host: string): [string, Middleware] | [null, null] {
        for (const [pattern, fun] of this.routeList.entries()) {
            let found = matcher(host, pattern)
            if (found.length != 0) return [pattern, fun]
        }
        return [null, null]
    }
}
module.exports = DomainRouter;
export type DomainRouterState = { matchedDomainPattern: string }