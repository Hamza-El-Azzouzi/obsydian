import { DOM_TYPES } from './o.js'
import { setAttributes } from './attributes.js'
import { addEventListeners } from './events.js'
import { extractPropsAndEvents } from './utils/props.js'

export function mountDOM(vdom, parentEl, index, hostComponent = null) {

    if (typeof vdom === 'string') {
        createTextNode({ type: DOM_TYPES.TEXT, value: vdom }, parentEl)
        return
    }

    switch (vdom.type) {
        case DOM_TYPES.TEXT: {
            createTextNode(vdom, parentEl, index)
            break
        }
        case DOM_TYPES.ELEMENT: {
            createElementNode(vdom, parentEl, index, hostComponent)
            break
        }
        case DOM_TYPES.FRAGMENT: {
            createFragmentNodes(vdom, parentEl, index, hostComponent)
            break
        }
        case DOM_TYPES.COMPONENT: {
            createComponentNode(vdom, parentEl, index, hostComponent)
            break
        }
        default: {
            throw new Error(`Can't mount DOM of type: ${vdom.type}`)
        }
    }
}

function createTextNode(vdom, parentEl, index) {
    const { value } = vdom
    const textNode = document.createTextNode(value)
    vdom.el = textNode
    insert(textNode, parentEl, index)
}

function createFragmentNodes(vdom, parentEl, index, hostComponent) {
    const { children } = vdom
    vdom.el = parentEl
    children.forEach((child, i) => mountDOM(child, parentEl, index ? index + i : null, hostComponent))
}

function createElementNode(vdom, parentEl, index, hostComponent) {
    const { tag, children } = vdom
    const element = document.createElement(tag)
    addProps(element, vdom, hostComponent)
    vdom.el = element
    children.forEach((child) => mountDOM(child, element, null, hostComponent))
    // parentEl.append(element)
    insert(element, parentEl, index)
}

function addProps(el, vdom, hostComponent) {
    const { props: attrs, events } = extractPropsAndEvents(vdom)
    vdom.listeners = addEventListeners(events, el, hostComponent)
    setAttributes(el, attrs)
}

function insert(el, parentEl, index) {
    // If index is null or undefined, simply append.
    // Note the usage of == instead of ===.
    if (index == null) {
        parentEl.append(el)
        return
    }
    if (index < 0) {
        throw new Error(
            `Index must be a positive integer, got ${index}`)
    }
    const children = parentEl.childNodes
    if (index >= children.length) {
        parentEl.append(el)
    } else {
        parentEl.insertBefore(el, children[index])
    }
}
function createComponentNode(vdom, parentEl, index, hostComponent) {
    const Component = vdom.tag
    const { props, events } = extractPropsAndEvents(vdom)
    const component = new Component(props, events, hostComponent)
    component.mount(parentEl, index)
    vdom.component = component
    vdom.el = component.firstElement
}