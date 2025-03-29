import { createApp, o, HashRouter, oFragment, oString } from 'https://unpkg.com/obsydian@latest'

let todosId = 0
const state = {
  id: todosId,
  currentTodo: "",
  edit: {
    idx: null,
    original: null,
    edited: null,
  },
  todos: [],
  filter: "all"
};
const router = new HashRouter([
  { path: "/", action: () => emit("set-filter", "all") },
  { path: "/active", action: () => emit("set-filter", "active") },
  { path: "/completed", action: () => emit("set-filter", "completed") }
]);

router.init()

const reducers = {
  "set-filter": (state, filter) => ({
    ...state,
    filter,
  }),
  "update-current-todo": (state, currentTodo) => ({
    ...state,
    currentTodo,
  }),
  "add-todo": (state) => ({
    ...state,
    currentTodo: "",
    todos: [...state.todos, {
      id: todosId++,
      text: state.currentTodo.trim(),
      completed: false
    }],
  }),
  "start-editing-todo": (state, id) => ({
    ...state,
    edit: {
      idx: id,
      original: state.todos.find(todo => todo.id === id).text,
      edited: state.todos.find(todo => todo.id === id).text,
    },
  }),
  "edit-todo": (state, edited) => ({
    ...state,
    edit: { ...state.edit, edited },
  }),
  "save-edited-todo": (state) => ({
    ...state,
    todos: state.todos.map(todo =>
      todo.id === state.edit.idx
        ? { ...todo, text: state.edit.edited }
        : todo
    ),
    edit: { idx: null, original: null, edited: null },
  }),
  "cancel-editing-todo": (state) => ({
    ...state,
    edit: { idx: null, original: null, edited: null },
  }),
  "remove-todo": (state, id) => ({
    ...state,
    todos: state.todos.filter(todo => todo.id !== id),
  }),
  "toggle-todo": (state, id) => ({
    ...state,
    todos: state.todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ),
  }),
  "clear-completed": (state) => ({
    ...state,
    todos: state.todos.filter(todo => !todo.completed)
  }),
  "toggle-all": (state) => {
    const areAllCompleted = state.todos.every(todo => todo.completed);
    return {
      ...state,
      todos: state.todos.map(todo => ({
        ...todo,
        completed: !areAllCompleted
      }))
    };
  },
};

function App(state, emit) {
  const activeTodos = state.todos.filter(todo => !todo.completed);
  const completedTodos = state.todos.filter(todo => todo.completed);
  const areAllCompleted = state.todos.length > 0 && state.todos.every(todo => todo.completed);

  return oFragment([
    o("section", { class: "todoapp" }, [
      o("header", { class: "header" }, [
        o("h1", {}, ["todos"]),
        CreateTodo(state, emit)
      ]),
      state.todos.length > 0 ? o("section", { class: "main" }, [
        o("div", { class: "toggle-container" }, [
            o("input", {
                id: "toggle-all",
                class: "toggle-all",
                type: "checkbox",
                checked: areAllCompleted,
                on: { change: () => emit("toggle-all") }
            }),
            o("label", {
                for: "toggle-all",
            }, ["Mark all as complete"])
        ]),
        TodoList(state, emit)
    ]) : oFragment([]),
      state.todos.length > 0 ? Footer(
        state,
        emit,
        activeTodos.length,
        completedTodos.length
      ) : oFragment([])
    ]),
    o('footer', { class: 'info' }, [
      o('p', {}, ['Double-click to edit a todo']),
      o('p', {}, [
        'Created by ',
        o('a', { href: 'http://github.com/hamza-el-azzouzi' }, ['Hamza El Azzouzi'])
      ]),
      o('p', {}, [
        'Part of ',
        o('a', { href: 'http://todomvc.com' }, ['TodoMVC'])
      ])
    ])
  ]);
}

function CreateTodo({ currentTodo }, emit) {
  return o("input", {
    class: "new-todo",
    placeholder: "What needs to be done?",
    value: currentTodo,
    autofocus: true,
    on: {
      input: (e) => emit("update-current-todo", e.target.value),
      keydown: (e) => {
        if (e.key === "Enter" && currentTodo.length >= 3) {
          e.preventDefault();
          emit("add-todo");
        }
      }
    }
  });
}

function TodoList({ todos, edit, filter }, emit) {
  const filteredTodos = todos.filter(todo => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });
  return o(
    "ul",
    { class: "todo-list" },
    filteredTodos.map(todo => TodoItem({ todo, edit }, emit))
  );
}

function TodoItem({ todo, edit }, emit) {
  const isEditing = edit.idx === todo.id;
  let isProcessing = false;

  return isEditing
    ? o("li", { class: "editing", key: todo.id }, [
      o("input", {
        class: "edit",
        value: edit.edited,
        autofocus: true,
        on: {
          input: ({ target }) => emit("edit-todo", target.value),
          blur: () => {
            setTimeout(() => {
              if (!isProcessing) {
                isProcessing = true;
                emit("save-edited-todo");
              }
            }, 0);
          },
          keydown: (e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              isProcessing = true;
              if (e.key === "Enter") {
                emit("save-edited-todo");
              } else {
                emit("cancel-editing-todo");
              }
            }
          }
        }
      })
    ])
    : o("li", { class: todo.completed ? "completed" : "", key: todo.id }, [
      o("div", { class: "view" }, [
        o("input", {
          class: "toggle",
          type: "checkbox",
          checked: todo.completed,
          on: { change: () => emit("toggle-todo", todo.id) }
        }),
        o("label", {
          on: { dblclick: () => emit("start-editing-todo", todo.id) }
        }, [todo.text]),
        o("button", {
          class: "destroy",
          on: { click: () => emit("remove-todo", todo.id) }
        })
      ])
    ]);
}
function Footer({ filter }, emit, activeCount, completedCount) {
  console.log("active todos", activeCount)
  const itemWord = activeCount === 1 ? 'item' : 'items';

  return o("footer", { class: "footer" }, [
    o("span", { class: "todo-count" }, [
      o("strong", {}, [oString(activeCount)]),
      ` ${itemWord} left`
    ]),
    o("ul", { class: "filters" }, [
      o("li", { key: "all" }, [
        o("a", {
          class: filter === "all" ? "selected" : "",
          href: "#/",
          on: { click: () => emit("set-filter", "all") }
        }, ["All"])
      ]),
      o("li", { key: "active" }, [
        o("a", {
          class: filter === "active" ? "selected" : "",
          href: "#/active",
          on: { click: () => emit("set-filter", "active") }
        }, ["Active"])
      ]),
      o("li", { key: "completed" }, [
        o("a", {
          class: filter === "completed" ? "selected" : "",
          href: "#/completed",
          on: { click: () => emit("set-filter", "completed") }
        }, ["Completed"])
      ])
    ]),
    completedCount > 0 ? o("button", {
      class: "clear-completed",
      on: { click: () => emit("clear-completed") }
    }, ["Clear completed"]) : oFragment([])
  ]);
}

createApp({ state, reducers, view: App }).mount(document.body);