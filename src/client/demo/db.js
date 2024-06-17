import { Db } from './ls-db.js'

const db = {}
const tables = [
  'bookmarks',
  'history',
  'bookmarkGroups',
  'addressBookmarks',
  'terminalThemes',
  'lastStates',
  'data',
  'quickCommands',
  'log',
  'dbUpgradeLog',
  'profiles'
]

tables.forEach(table => {
  const conf = {
    tableName: table
  }
  db[table] = new Db(conf)
})

export function dbAction (dbName, op, ...args) {
  return db[dbName][op](...args)
}
