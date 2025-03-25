import { destroyDOM } from './destroy-dom.js'
import { Dispatcher } from './dispatcher.js'
import { mountDOM } from './mount-dom.js'
import { patchDOM } from './patch-dom.js'
import { NoopRouter } from './router.js'
export function createApp({ state, view, reducers = {} }) {
    let parentEl = null
    let vdom = null
    let isMounted = false
    const dispatcher = new Dispatcher()
    const subscriptions = [dispatcher.afterEveryCommand(renderApp)]
    function emit(eventName, payload) {
        dispatcher.dispatch(eventName, payload)
    }
    for (const actionName in reducers) {
        const reducer = reducers[actionName]
        const subs = dispatcher.subscribe(actionName, (payload) => {
            state = reducer(state, payload)
        })
        subscriptions.push(subs)
    }
    function renderApp() {
        const newVdom = view(state, emit)
        vdom = patchDOM(vdom, newVdom, parentEl)
    }
    return {
        mount(_parentEl) {
            if (isMounted) {
                throw new Error("the Application is already mounted")
            }
            parentEl = _parentEl
            vdom = view(state, emit)
            mountDOM(vdom, parentEl)
            isMounted = true
        },
        unmount() {
            destroyDOM(vdom)
            vdom = null
            subscriptions.forEach((unsubscribe) => unsubscribe())
            isMounted = false
        },
    }
}