<script lang="ts">
import { defineComponent } from 'vue'
import { syncedStore, getYjsDoc, filterArray } from '@syncedstore/core'
import { WebrtcProvider } from 'y-webrtc'

type Todo = { id: string; completed: boolean; title: string }
const store = syncedStore({ todos: [] as Todo[] })
new WebrtcProvider('room-new', getYjsDoc(store), {
    signaling: ['ws://localhost:4444'],
})

export type Visibility = 'all' | 'active' | 'completed'

const FILTERS = {
    all: (todos: Todo[]) => {
        return todos
    },
    active: (todos: Todo[]) => {
        return todos.filter((todo) => !todo.completed)
    },
    completed: (todos: Todo[]) => {
        return todos.filter((todo) => todo.completed)
    },
}

export default defineComponent({
    data() {
        return {
            shared: store as { todos: Todo[] },
            visibility: 'all' as Visibility,
            newTodo: '',
            editingTodo: null as null | Todo,
            beforeEditCache: '',
        }
    },
    computed: {
        filteredTodos() {
            return FILTERS[this.visibility](this.shared.todos)
        },
        remaining() {
            return FILTERS.active(this.shared.todos).length
        },
        allDone: {
            get() {
                return this.remaining === 0
            },
            set(value: boolean) {
                this.shared.todos.forEach(todo => {
                    todo.completed = value
                })
            },
        },
    },
    methods: {
        pluralize(n: number) {
            return n === 1 ? 'item' : 'items'
        },
        addTodo() {
            const value = this.newTodo && this.newTodo.trim()
            if (!value) {
                return
            }
            this.shared.todos.push({
                id: Math.random().toString(),
                title: value,
                completed: false,
            })
            this.newTodo = ''
        },

        removeTodo(todo: Todo) {
            this.shared.todos.splice(this.shared.todos.indexOf(todo), 1)
        },

        editTodo(todo: Todo) {
            this.beforeEditCache = todo.title
            this.editingTodo = todo
        },

        doneEdit(todo: Todo) {
            if (!this.editingTodo) {
                return
            }
            this.editingTodo = null
            todo.title = todo.title.trim()
            if (!todo.title) {
                this.removeTodo(todo)
            }
        },

        cancelEdit(todo: Todo) {
            this.editingTodo = null
            todo.title = this.beforeEditCache
        },

        removeCompleted() {
            filterArray(this.shared.todos, (t) => !t.completed)
        },
    },

    // a custom directive to wait for the DOM to be updated
    // before focusing on the input field.
    // http://vuejs.org/guide/custom-directive.html
    directives: {
        'todo-focus': {
            updated(el, binding) {
                if (binding.value) {
                    el.focus()
                }
            },
        },
    },
})
</script>

<template>
    <section class="todoapp">
        <header class="header">
            <h1>todos</h1>
            <input
                class="new-todo"
                autofocus
                autocomplete="off"
                placeholder="What needs to be done?"
                v-model="newTodo"
                @keyup.enter="addTodo"
            />
        </header>
        <section class="main" v-show="shared.todos.length" v-cloak>
            <input id="toggle-all" class="toggle-all" type="checkbox" v-model="allDone" />
            <label for="toggle-all"></label>
            <ul class="todo-list">
                <li
                    v-for="todo in filteredTodos"
                    class="todo"
                    :key="todo.id"
                    :class="{ completed: todo.completed, editing: todo == editingTodo }"
                >
                    <div class="view">
                        <input class="toggle" type="checkbox" v-model="todo.completed" />
                        <label @dblclick="editTodo(todo)">{{ todo.title }}</label>
                        <button class="destroy" @click="removeTodo(todo)"></button>
                    </div>
                    <input
                        class="edit"
                        type="text"
                        v-model="todo.title"
                        v-todo-focus="todo == editingTodo"
                        @blur="doneEdit(todo)"
                        @keyup.enter="doneEdit(todo)"
                        @keyup.esc="cancelEdit(todo)"
                    />
                </li>
            </ul>
        </section>
        <footer class="footer" v-show="shared.todos.length" v-cloak>
            <span class="todo-count">
                <strong>{{ remaining }}</strong> {{ pluralize(remaining) }} left
            </span>
            <ul class="filters">
                <li>
                    <button @click="visibility='all'">All</button>
                </li>
                <li>
                    <button @click="visibility='active'">Active</button>
                </li>
                <li>
                    <button @click="visibility='completed'">Completed</button>
                </li>
            </ul>
            <button
                class="clear-completed"
                @click="removeCompleted"
                v-show="shared.todos.length > remaining"
            >
                Clear completed
            </button>
        </footer>
    </section>
</template>

<style>
[v-cloak] {
    display: none;
}
</style>
