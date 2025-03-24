import { withoutNulls } from './utils/arrays.js'
export const DOM_TYPES = {
    TEXT: 'text',
    ELEMENT: 'element',
    FRAGMENT: 'fragment',
    COMPONENT: 'component',
}

export function o(tag, props = {}, children = []) {
    const type =
        typeof tag === 'string' ? DOM_TYPES.ELEMENT : DOM_TYPES.COMPONENT
    return {
        tag,
        props,
        type,
        children: mapTextNodes(withoutNulls(children)),
    }
}

function mapTextNodes(children) {
    return children.map((child) =>
        typeof child === 'string' ? oString(child) : child
    )
}

export function oString(str) {
    return { type: DOM_TYPES.TEXT, value: str }
}
export function oFragment(vNodes) {
    return {
        type: DOM_TYPES.FRAGMENT,
        children: mapTextNodes(withoutNulls(vNodes)),
    }
}
export function extractChildren(vdom) {
    if (vdom.children == null) {
        return []
    }
    const children = []
    for (const child of vdom.children) {
        if (child.type === DOM_TYPES.FRAGMENT) {
            children.push(...extractChildren(child, children))
        } else {
            children.push(child)
        }
    }
    return children
}