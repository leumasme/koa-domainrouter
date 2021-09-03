import { expect } from "chai";
import { Middleware } from "koa";
import DomainRouter, { DomainRouterState } from "../src";

describe("module", () => {
    it("should support module import syntax", () => {
        expect(DomainRouter).to.be.a("function")
    })
    it("should support commonjs require syntax", () => {
        let DomainRouter2 = require("../src")
        expect(DomainRouter2).to.be.a("function")
        expect(DomainRouter).to.equal(DomainRouter2)
    })
})

describe("DomainRouter", () => {
    describe("should support basic routing", () => {
        let drouter: DomainRouter;
        beforeEach(() => {
            drouter = new DomainRouter()
        })
        it("via the middleware", () => {
            let drouter = new DomainRouter()
            let called = false; // TODO: find a proper way of doing this
            drouter.use("example.com", (ctx, next) => {
                called = true;
                expect(ctx).to.have.property("state")
                expect(ctx.state.matchedDomainPattern).to.eq("example.com")
            })
            let middleware = drouter.routes()
            expect(called).to.eq(false)

            // fake request
            middleware({ host: "example.com", state: {} } as any, async () => {
                throw new Error("Request should not fall through")
            })

            expect(called).to.eq(true)
        })
        it("via the match function", () => {
            let fun = () => {}
            drouter.use("example.com", fun)
            let result = drouter.match("example.com")
            expect(result[0]).to.eq("example.com")
            expect(result[1]).to.eq(fun)

            result = drouter.match("testexample.com")
            expect(result[0]).to.be.null
            expect(result[1]).to.be.null
        })
    })
})