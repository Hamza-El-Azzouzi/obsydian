import { createApp, o, oString, oFragment } from '../dist/obsydian.js'
createApp({
    state: 0,
    reducers: {
        add: (state, amount) => state + amount,
        sub: (state, amount) => state - amount,
    },
    view: (state, emit) =>
        oFragment([
            o(
                'button',
                { on: { click: () => emit('add', 1) } },
                [oString("+")]
            ),
            o("p",{},[oString(state)]),
            o(
                'button',
                { on: { click: () => emit('sub', 1) } },
                [oString("=")]
            ),
            o("input")
        ])

}).mount(document.body)

// return 
//     o("h1", {}, ["My TODOs"]),
//     CreateTodo(state, emit),
//     TodoList(state, emit),
// ]);