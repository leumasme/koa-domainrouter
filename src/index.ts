import { Middleware } from "koa";
import matcher from "matcher"

export default class DomainRouter {
    constructor() { };
    private routeList = new Map<string, Middleware>()
    routes(): Middleware<DomainRouterState> {
        return (ctx, next) => {
            let [pattern, fun] = this.match(ctx.host)
            if (fun) {
                ctx.state.pattern = pattern!;
                fun(ctx, next)
            } else {
                next()
            }
        }
    }
    use(host: string | string[], fun: Middleware) {
        if (Array.isArray(host)) {
            for (const h of host) {
                this.routeList.set(h.toLowerCase(), fun)
            }
        } else {
            this.routeList.set(host.toLowerCase(), fun)
        }
    }
    match(host: string): [string, Middleware] | [null, null] {
        for (const [pattern, fun] of this.routeList.entries()) {
            let found = matcher(host, pattern)
            if (found) return [pattern, fun]
        }
        return [null, null]
    }
}

export type DomainRouterState = { pattern: string}