import './assets/main.css'

import * as Vue from 'vue'
import App from './App.vue'
import router from './router'
import { enableVueBindings } from '@syncedstore/core'

enableVueBindings(Vue)
const app = Vue.createApp(App)
app.use(router)
app.mount('#app')
