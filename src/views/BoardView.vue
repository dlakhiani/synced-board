<script lang="ts">
// import syncing
import { syncedStore, getYjsDoc, filterArray } from '@syncedstore/core'
import { WebrtcProvider } from 'y-webrtc'

// import components
import { defineComponent } from 'vue'
import {
    Button,
    Card,
    Fieldset,
    Textarea,
} from 'primevue'

// types
export type Todo = { id: string; completed: boolean; title: string }
export type User = { id: string; name: string, color: string }
export type Visibility = 'all' | 'active' | 'completed'

// sync clients
const store = syncedStore({
    todos: [] as Todo[],
    users: [] as User[],
})
const provider = new WebrtcProvider('room-todos', getYjsDoc(store), {
    signaling: [`wss://${import.meta.env.VITE_SIGNALING_SERVER_URL}`],
})

const awareness = provider.awareness
awareness.setLocalStateField('user', {
    name: awareness.clientID,
    id: awareness.clientID,
})

export default defineComponent({
    name: 'BoardView',
    components: {
        Button,
        Card,
        Fieldset,
        Textarea,
    },
    data() {
        return {
            shared: store as { todos: Todo[], users: User[] },
            userCount: 0,
            currUser: null as User | null,
            visibility: 'all' as Visibility,
            newTodo: '',
            editingTodo: false as boolean,
            beforeEditCache: '',
            columns: [
                {
                    status: 'Backlog',
                    tasks: [],
                },
                {
                    status: 'Todo',
                    tasks: [{ id: 1, content: 'List all reported bugs' }],
                },
                {
                    status: 'In Progress',
                    tasks: [{ id: 8, content: 'Mobile browsing' }],
                },
                {
                    status: 'Done',
                    tasks: [],
                },
            ],
        }
    },
    mounted() {
        // init syncing
        awareness.on('change', () => this.syncUserCount())
        // new client => update
        this.syncUserCount()

        const currState = awareness.getLocalState() as any
        this.currUser = currState['user'] as User
        console.log("currUser: ", this.currUser.name)
    },
    computed: {
        totalUsers() {
            return this.userCount.toString()
        },
    },
    methods: {
        syncUserCount() {
            console.log("current state: ", awareness.getLocalState())
            this.userCount = awareness.getStates().size
            // this.shared.users
        },

        addTodo() {
            const value = this.newTodo && this.newTodo.trim()
            if (!value) return

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
            this.editingTodo = true
        },

        doneEdit(todo: Todo) {
            if (!this.editingTodo) {
                return
            }
            this.editingTodo = false
            todo.title = todo.title.trim()
            console.log('edit:|' + todo.title + '|')
            if (!todo.title) {
                console.log('remove')
                this.removeTodo(todo)
            }
        },

        cancelEdit(todo: Todo) {
            this.editingTodo = false
            todo.title = this.beforeEditCache
        },

        removeCompleted() {
            filterArray(this.shared.todos, (t) => !t.completed)
        },
    },
})
</script>

<template>
    <div class="container">
        <div class="header">
            <div class="items-row">
                <Button icon="pi pi-filter" variant="text" raised rounded />
                <Button icon="pi pi-users" variant="text" raised rounded :badge="totalUsers" badge-severity="info" />
            </div>
            <div class="items-row">
                <Button icon="pi pi-list" variant="text" raised rounded />
                <Button icon="pi pi-table" variant="text" raised rounded />
                <Button icon="pi pi-cog" variant="text" raised rounded />
            </div>
        </div>

        <div class="board">
            <Fieldset
                v-for="column in columns"
                :key="column.status"
                :legend="column.status"
                class="board__column"
            >
                <div class="board__column-items">
                    <Card v-for="task in column.tasks" :key="task.id" class="board__column-item">
                        <template #content>
                            <p v-if="task.content">{{ task.content }}</p>
                        </template>
                        <template #footer>
                            <div class="board__column-item__actions">
                                <div class="items-row">
                                    <Button
                                        icon="pi pi-check"
                                        severity="secondary"
                                        size="small"
                                    />
                                </div>
                                <div class="items-row">
                                    <Button icon="pi pi-pencil" severity="info" size="small" />
                                    <Button icon="pi pi-times" severity="danger" size="small" />
                                </div>
                            </div>
                        </template>
                    </Card>

                    <div>
                        <Textarea v-model="newTodo" rows="5" cols="30" auto-resize />

                    </div>
                </div>
            </Fieldset>
        </div>
    </div>
</template>

<style>
.container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.header {
    display: flex;
    place-items: center;
    justify-content: space-between;
    padding: 1rem;
}

.items-row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.header__right {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.board {
    display: flex;
    gap: 1rem;
    overflow: auto;
    padding: 1rem;
}

.board__column {
    display: flex;
    flex-direction: column;
    flex: 0 0 300px;
    border-radius: 8px;
}

.board__column-items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-height: 100px;
}

.board__column-item {
    border: 2px solid var(--p-emerald-300);
}

.board__column-item__actions {
    display: flex;
    justify-content: space-between;
    place-items: center;
}
</style>
