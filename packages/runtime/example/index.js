import { createApp, o, oString, oFragment } from '../dist/obsydian.js'


const state = {
    currentTodo: "",
    edit: {
        idx: null,
        original: null,
        edited: null,
    },
    todos: ["hi"],
};

const reducers = {
    "update-current-todo": (state, currentTodo) => ({
        ...state,
        currentTodo,
    }),
    "add-todo": (state) => ({
        ...state,
        currentTodo: "",
        todos: [...state.todos, state.currentTodo],
    }),
    "start-editing-todo": (state, idx) => ({
        ...state,
        edit: {
            idx,
            original: state.todos[idx],
            edited: state.todos[idx],
        },
    }),
    "edit-todo": (state, edited) => ({
        ...state,
        edit: { ...state.edit, edited },
    }),
    "save-edited-todo": (state) => {
        const todos = [...state.todos];
        todos[state.edit.idx] = state.edit.edited;
        return {
            ...state,
            edit: { idx: null, original: null, edited: null },
            todos,
        };
    },
    "cancel-editing-todo": (state) => ({
        ...state,
        edit: { idx: null, original: null, edited: null },
    }),
    "remove-todo": (state, idx) => ({
        ...state,
        todos: state.todos.filter((_, i) => i !== idx),
    }),
};

function App(state, emit) {
    return oFragment([
        o("h1", {}, ["My TODOs"]),
        CreateTodo(state, emit),
        TodoList(state, emit),
    ]);
}

function CreateTodo({ currentTodo }, emit) {
    return o('div', {}, [
        o('label', { for: 'todo-input' }, ['New TODO']),
        o('input', {
            type: 'text',
            id: 'todo-input',
            value: currentTodo,
            on: {
                change: (e) => emit('update-current-todo', e.target.value),
                keydown: (e) => {
                    if (e.key === 'Enter' && currentTodo.length >= 3) {
                        e.preventDefault();
                        emit('add-todo');
                    }
                },
            },
        }),
        o(
            'button',
            {
                disabled: currentTodo.length < 3,
                on: { 
                    click: () => emit('add-todo')
                },
            },
            ['Add']
        ),
    ]);
}
function TodoList({ todos, edit }, emit) {
    return o(
        "ul",
        {},
        todos.map((todo, i) => TodoItem({ todo, i, edit }, emit))
    );
}

function TodoItem({ todo, i, edit }, emit) {
    const isEditing = edit.idx === i;
    return isEditing
        ? o("li", {}, [
            o("input", {
                value: edit.edited,
                on: {
                    change: ({ target }) => emit("edit-todo", target.value),
                },
            }),
            o(
                "button",
                {
                    on: {
                        click: () => emit("save-edited-todo"),
                    },
                },
                ["Save"]
            ),
            o(
                "button",
                {
                    on: {
                        click: () => emit("cancel-editing-todo"),
                    },
                },
                ["Cancel"]
            ),
        ])
        : o("li", {}, [
            o(
                "span",
                {
                    on: {
                        dblclick: () => emit("start-editing-todo", i),
                    },
                },
                [todo]
            ),
            o(
                "button",
                {
                    on: {
                        click: () => emit("remove-todo", i),
                    },
                },
                ["Done"]
            ),
        ]);
}

createApp({ state, reducers, view: App }).mount(document.body);
