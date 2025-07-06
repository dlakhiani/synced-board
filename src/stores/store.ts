import { syncedStore, getYjsDoc } from '@syncedstore/core'
import { WebrtcProvider } from 'y-webrtc'

export type Todo = { completed: boolean; title: string }

export const store = syncedStore({ todos: [] as Todo[], fragment: 'xml' })

const doc = getYjsDoc(store)
export const webrtcProvider = new WebrtcProvider('syncedstore-todos', doc)

export const disconnect = () => webrtcProvider.disconnect()
export const connect = () => webrtcProvider.connect()
