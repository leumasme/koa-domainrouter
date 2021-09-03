# koa-domainrouter
[![CodeFactor](https://www.codefactor.io/repository/github/leumasme/koa-domainrouter/badge)](https://www.codefactor.io/repository/github/leumasme/koa-domainrouter)
![Maintainability](https://img.shields.io/codeclimate/maintainability/leumasme/koa-domainrouter)
[![Issues](https://img.shields.io/codeclimate/issues/leumasme/koa-domainrouter)](https://github.com/leumasme/koa-domainrouter/issues)

A simple project that allows you to use different middleware, depending on what Domain the request was sent to.

This can be used for various things such as an API subdomain, having multiple websites in one project, etc

## Usage

```js
const DomainRouter = require("koa-domainrouter")
const drouter = new DomainRouter({
    "baseDomain": "example.com" // Optional: will simply be added to the end of all domains passed into `use`
});

// most basic example: login.example.com
drouter.use("login.", (ctx, next)=> {
    // your logic

    // ctx.state.matchedDomainPattern is set to the pattern that matched this request
    console.assert(ctx.state.matchedDomainPattern == "login.example.com")
})

// mutliple domains in one `use` are possible
// this would match www.example.com and example.com
// you can also pass existing router routes (ex koa-router)
drouter.use(["www.", ""], yourMainRoutes)

// wildcards are supported
// prefix ! for exclude
// a domain must match any include and all exclude wildcards
// here: any api subdomain (and sub-subdomain) except internal.api.example.com
// if multiple middlewares were registered with `use`, the first one to be registered will be called
drouter.use(["*.api.", "!internal.api."], yourApiRoutes)

// register domainrouter routes into koa
yourKoaApp.use(drouter.routes())
```
Module import syntax is also supported
```js
import DomainRouter from "koa-domainrouter";
const drouter = new DomainRouter();
// ...
```
All requests that do not match any registered Domains will simply fall through to the next Middleware