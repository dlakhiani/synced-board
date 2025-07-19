import './assets/main.css'

import * as Vue from 'vue'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { enableVueBindings } from '@syncedstore/core'
import { definePreset, palette } from '@primeuix/themes'

// use vue bindings for syncing
enableVueBindings(Vue)

const preset = definePreset(Aura, {
    semantic: {
        primary: palette('{neutral}'),
        colorScheme: {
            light: {
                surface: palette('{zinc}'),
            },
            dark: {
                surface: palette('{stone}'),
            },
        },
    },
})

const app = Vue.createApp(App)
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: preset,
    },
})
app.mount('#app')
