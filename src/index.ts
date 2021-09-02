import { Middleware } from "koa";
import matcher from "matcher"

export default class DomainRouter {
    private baseDomain = ""
    constructor(opts?: { baseDomain?: string }) {
        if (opts?.baseDomain) this.baseDomain = opts?.baseDomain;
    };
    private routeList = new Map<string, Middleware>()
    routes(): Middleware<DomainRouterState> {
        return (ctx, next) => {
            let [pattern, fun] = this.match(ctx.host)
            if (fun) {
                ctx.state.matchedDomainPattern = pattern!;
                fun(ctx, next)
            } else {
                next()
            }
        }
    }
    use(host: string | string[], fun: Middleware) {
        if (Array.isArray(host)) {
            for (const h of host) {
                this.routeList.set(h.toLowerCase() + this.baseDomain, fun)
            }
        } else {
            this.routeList.set(host.toLowerCase() + this.baseDomain, fun)
        }
    }
    match(host: string): [string, Middleware] | [null, null] {
        for (const [pattern, fun] of this.routeList.entries()) {
            let found = matcher(host, pattern)
            if (found.length != 0) return [pattern, fun]
        }
        return [null, null]
    }
}

export type DomainRouterState = { matchedDomainPattern: string }