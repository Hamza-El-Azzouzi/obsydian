import { destroyDOM } from './destroy-dom.js'
import { mountDOM } from './mount-dom.js'
import { DOM_TYPES, extractChildren } from './o.js'
import { patchDOM } from './patch-dom.js'
import { hasOwnProperty } from './utils/objects.js'
import { Dispatcher } from './dispatcher.js'
export function defineComponent(options) {
    if (typeof options === 'function') {
        options = { render: options };
    }
    
    return class Component {
        #vdom = null
        #hostEl = null
        #isMounted = false
        #eventHandlers = null
        #parentComponent = null
        #dispatcher = new Dispatcher()
        #subscriptions = []
        constructor(props = {}, eventHandlers = {},
            parentComponent = null,) {
            this.props = props
            this.state = options.state ? options.state(props) : {}
            this.#eventHandlers = eventHandlers
            this.#parentComponent = parentComponent
        }
        get elements() {
            if (this.#vdom == null) {
                return []
            }
            if (this.#vdom.type === DOM_TYPES.FRAGMENT) {
                return extractChildren(this.#vdom).flatMap((child) => {
                    if (child.type === DOM_TYPES.COMPONENT) {
                        return child.component.elements
                    }
                    return [child.el]
                })
            }
            return [this.#vdom.el]
        }
        get firstElement() {
            return this.elements[0]
        }
        get offset() {
            if (this.#vdom.type === DOM_TYPES.FRAGMENT) {
                return Array.from(this.#hostEl.children).indexOf(this.firstElement)
            }
            return 0
        }
        updateProps(props) {
            this.props = { ...this.props, ...props }
            this.#patch()
        }
        updateState(state) {
            this.state = { ...this.state, ...state }
            this.#patch()
        }
        render() {
            return options.render.call(this)
        }

        mount(hostEl, index = null) {
            if (this.#isMounted) {
                throw new Error('Component is already mounted')
            }
            this.#vdom = this.render()
            mountDOM(this.#vdom, hostEl, index, this)
            this.#wireEventHandlers()

            this.#hostEl = hostEl
            this.#isMounted = true
        }

        unmount() {
            if (!this.#isMounted) {
                throw new Error('Component is not mounted')
            }
            destroyDOM(this.#vdom)
            this.#subscriptions.forEach((unsubscribe) => unsubscribe())

            this.#vdom = null
            this.#hostEl = null
            this.#isMounted = false
            this.#subscriptions = []
        }
        #patch() {
            if (!this.#isMounted) {
                throw new Error('Component is not mounted')
            }
            const vdom = this.render()
            this.#vdom = patchDOM(this.#vdom, vdom, this.#hostEl, this)
        }
        #wireEventHandlers() {
            this.#subscriptions = Object.entries(this.#eventHandlers).map(
                ([eventName, handler]) =>
                    this.#wireEventHandler(eventName, handler)
            )
        }
        #wireEventHandler(eventName, handler) {
            return this.#dispatcher.subscribe(eventName, (payload) => {
                if (this.#parentComponent) {
                    handler.call(this.#parentComponent, payload)
                } else {
                    handler(payload)
                }
            })
        }
        emit(eventName, payload) {
            this.#dispatcher.dispatch(eventName, payload)
            }
    }
}