import { createApp, o, oString, oFragment } from 'https://unpkg.com/obsydian@3.0.0'


const state = {
  currentTodo: "",
  edit: {
    idx: null,
    original: null,
    edited: null,
  },
  todos: [{ text: "hi", completed: false }],
};

const reducers = {
  "update-current-todo": (state, currentTodo) => ({
    ...state,
    currentTodo,
  }),
  "add-todo": (state) => ({
    ...state,
    currentTodo: "",
    todos: [...state.todos, { text: state.currentTodo, completed: false }],
  }),
  "start-editing-todo": (state, idx) => ({
    ...state,
    edit: {
      idx,
      original: state.todos[idx].text,
      edited: state.todos[idx].text,
    },
  }),
  "edit-todo": (state, edited) => ({
    ...state,
    edit: { ...state.edit, edited },
  }),
  "save-edited-todo": (state) => {
    const todos = [...state.todos];
    todos[state.edit.idx] = {
      ...todos[state.edit.idx],
      text: state.edit.edited
    };
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
  "toggle-todo": (state, idx) => ({
    ...state,
    todos: state.todos.map((todo, i) => 
      i === idx ? { ...todo, completed: !todo.completed } : todo
    ),
  }),
};

function App(state, emit) {
  return oFragment([
    o("section", { class: "todoapp" }, [
      o("header", { class: "header" }, [
        o("h1", {}, ["todos"]),
        CreateTodo(state, emit)
      ]),
      TodoList(state, emit)
    ]),
    o("footer", { class: "info" }, [
      o("p", {}, ["Double-click to edit a todo"]),
      o("p", {}, [
        "Created by ",
        o("a", { href: "https://github.com/hamza-el-azzouzi" }, ["Hamza El Azzouzi"])
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

function TodoList({ todos, edit }, emit) {
  return o(
    "ul",
    { class: "todo-list" },
    todos.map((todo, i) => TodoItem({ todo, i, edit }, emit))
  );
}

function TodoItem({ todo, i, edit }, emit) {
  const isEditing = edit.idx === i;
  let isProcessing = false;

  return isEditing
    ? o("li", { class: "editing" }, [
        o("input", {
          class: "edit",
          value: edit.edited,
          autofocus: true,
          on: {
            input: ({ target }) => emit("edit-todo", target.value),
            blur: (e) => {
              // Add small delay to allow keydown to process first
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
    : o("li", { class: todo.completed ? "completed" : "" }, [
        o("div", { class: "view" }, [
          o("input", {
            class: "toggle",
            type: "checkbox",
            checked: todo.completed,
            on: { change: () => emit("toggle-todo", i) }
          }),
          o("label", {
            on: { dblclick: () => emit("start-editing-todo", i) }
          }, [todo.text]),
          o("button", {
            class: "destroy",
            on: { click: () => emit("remove-todo", i) }
          })
        ])
      ]);
}

createApp({ state, reducers, view: App }).mount(document.body);
