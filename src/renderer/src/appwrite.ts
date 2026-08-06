import { Account, Client, TablesDB } from 'appwrite'

export const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)

export const account = new Account(client)
export const tablesDB = new TablesDB(client)

export const DATABASE_ID = 'flowstate'
export const SESSIONS_TABLE_ID = 'sessions'
export const TASKS_TABLE_ID = 'tasks'
