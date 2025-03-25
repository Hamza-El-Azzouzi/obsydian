import { makeRouteMatcher } from './route-matchers'
import { Dispatcher } from './dispatcher'
const ROUTER_EVENT = 'router-event'
export class HashRouter {
    #matchers = []
    #onPopState = () => this.#matchCurrentRoute()
    #isInitialized = false
    #dispatcher = new Dispatcher()
    #subscriptions = new WeakMap()
    #subscriberFns = new Set()

    #matchedRoute = null
    get matchedRoute() {
        return this.#matchedRoute
    }

    #params = {}
    get params() {
        return this.#params
    }

    #query = {}
    get query() {
        return this.#query
    }

    get #currentRouteHash() {
        const hash = document.location.hash

        if (hash === '') {
            return '/'
        }

        return hash.slice(1)
    }

    constructor(routes = []) {
        this.#matchers = routes.map(makeRouteMatcher)
    }

    async init() {
        if (this.#isInitialized) {
            return
        }

        if (document.location.hash === '') {
            window.history.replaceState({}, '', '#/')
        }

        window.addEventListener('popstate', this.#onPopState)
        await this.#matchCurrentRoute()

        this.#isInitialized = true
    }

    destroy() {
        if (!this.#isInitialized) {
            return
        }

        window.removeEventListener('popstate', this.#onPopState)
        Array.from(this.#subscriberFns).forEach(this.unsubscribe, this)
        this.#isInitialized = false
    }

    #matchCurrentRoute() {
        return this.navigateTo(this.#currentRouteHash)
    }

    async navigateTo(path) {
        const matcher = this.#matchers.find((matcher) =>
            matcher.checkMatch(path)
        )

        if (matcher == null) {
            console.warn(`[Router] No route matches path "${path}"`)

            this.#matchedRoute = null
            this.#params = {}
            this.#query = {}

            return
        }

        if (matcher.isRedirect) {
            return this.navigateTo(matcher.route.redirect)
        }

        this.#matchedRoute = matcher.route
        this.#params = matcher.extractParams(path)
        this.#query = matcher.extractQuery(path)
        this.#pushState(path)
    }

    #pushState(path) {
        window.history.pushState({}, '', `#${path}`)
    }

    back() {
        window.history.back()
    }

    forward() {
        window.history.forward()
    }
    subscribe(handler) {
        const unsubscribe = this.#dispatcher.subscribe(ROUTER_EVENT, handler)
        this.#subscriptions.set(handler, unsubscribe)
        this.#subscriberFns.add(handler)
    }

    unsubscribe(handler) {
        const unsubscribe = this.#subscriptions.get(handler)
        if (unsubscribe) {
            unsubscribe()
            this.#subscriptions.delete(handler)
            this.#subscriberFns.delete(handler)
        }
    }
}
export class NoopRouter {
    init() { }
    destroy() { }
    navigateTo() { }
    back() { }
    forward() { }
    subscribe() { }
    unsubscribe() { }
}