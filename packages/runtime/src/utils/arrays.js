export function withoutNulls(arr) {
    return arr.filter((item) => item != null)
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