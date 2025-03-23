# Obsydian Framework

Obsydian is a lightweight JavaScript framework for building reactive user interfaces with a simple state management system.

## Features

- Virtual DOM implementation
- State management with reducers
- Component-based architecture
- Event handling system
- No dependencies
- Small footprint (~5KB minified)

## Installation

You can use Obsydian directly via CDN:

```html
<script type="module">
  import { createApp, o, oString, oFragment } from 'https://unpkg.com/obsydian@2.0.1'
</script>
```

Or install via npm:

```bash
npm install obsydian
```

## Basic Usage

Here's a simple counter example:

```javascript
import { createApp, o, oFragment } from 'obsydian'

// Define initial state
const state = { count: 0 }

// Define reducers
const reducers = {
  "increment": (state) => ({ ...state, count: state.count + 1 }),
  "decrement": (state) => ({ ...state, count: state.count - 1 })
}

// Create view component
function Counter(state, emit) {
  return oFragment([
    o('button', { on: { click: () => emit('decrement') }}, ['-']),
    o('span', {}, [state.count]),
    o('button', { on: { click: () => emit('increment') }}, ['+'])
  ])
}

// Mount the app
createApp({ state, reducers, view: Counter }).mount(document.body)
```

## Core Concepts

### Virtual DOM Elements

The framework provides three main functions for creating virtual DOM elements:

- `o(tag, props, children)`: Creates an element node
- `oString(text)`: Creates a text node
- `oFragment(nodes)`: Creates a fragment containing multiple nodes

```javascript
// Element example
o('div', { class: 'container' }, [
  o('h1', {}, ['Hello World'])
])

// Fragment example
oFragment([
  o('h1', {}, ['Title']),
  o('p', {}, ['Content'])
])
```

### State Management

State is managed through reducers that are pure functions taking the current state and returning a new state:

```javascript
const reducers = {
  "update-value": (state, newValue) => ({
    ...state,
    value: newValue
  })
}
```

### Event Handling

Events are handled through the `on` prop and emit actions to reducers:

```javascript
o('input', {
  value: state.value,
  on: {
    input: (e) => emit('update-value', e.target.value)
  }
})
```

### Component Creation

Components are functions that receive state and emit function:

```javascript
function MyComponent(state, emit) {
  return o('div', {}, [
    o('h1', {}, ['Title']),
    o('button', {
      on: { click: () => emit('some-action') }
    }, ['Click me'])
  ])
}
```

## Advanced Features

### Attributes and Styling

```javascript
o('div', {
  class: ['container', 'active'],
  style: {
    backgroundColor: 'red',
    fontSize: '16px'
  }
}, [
  // children
])
```

### Conditional Rendering

```javascript
function ConditionalComponent(state, emit) {
  return o('div', {}, [
    state.isVisible 
      ? o('p', {}, ['Visible'])
      : null
  ])
}
```

### List Rendering

```javascript
function ListView({ items }, emit) {
  return o('ul', {}, 
    items.map((item, index) => 
      o('li', { key: index }, [item])
    )
  )
}
```

## API Reference

### Core Functions

- `createApp({ state, reducers, view })`
- `o(tag, props, children)`
- `oString(text)`
- `oFragment(nodes)`

### Lifecycle Methods

The app instance provides two main methods:

- `mount(element)`: Mounts the app to a DOM element
- `unmount()`: Removes the app from the DOM

## Best Practices

1. Keep state immutable
2. Use pure functions for reducers
3. Split complex components into smaller ones
4. Use fragments for multiple root elements
5. Avoid direct DOM manipulation

## Examples

Check the `/examples` directory for more complex examples including:
- Todo List Application
- Counter
- Form Handling

## License

MIT License - See LICENSE file for details