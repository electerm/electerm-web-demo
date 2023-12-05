import data from './init-data.json'
// A memory db class that mimics the localStorage db class
export class Db {
  static data = data
  constructor (conf) {
    this.tableName = conf.tableName
    // Use a static property to store the data in memory
    if (!Db.data) {
      Db.data = {}
    }
    // Initialize the table data as an empty array if not exists
    if (!Db.data[this.tableName]) {
      Db.data[this.tableName] = []
    }
  }

  findOne (condition) {
    if (condition && condition._id?.includes(':order')) {
      return []
    } else if (condition && condition._id?.includes('config')) {
      return data.config
    }
    const tableData = Db.data[this.tableName] || []
    for (let i = 0; i < tableData.length; i++) {
      const record = tableData[i]
      const keys = Object.keys(condition)
      if (keys.every(key => record[key] === condition[key])) {
        return record
      }
    }
    return null
  }

  insert (data) {
    const tableData = Db.data[this.tableName] || []
    if (data.length) {
      tableData.push(...data)
    } else {
      tableData.push(data)
    }
    return data
  }

  update (condition, data) {
    const tableData = Db.data[this.tableName] || []
    for (let i = 0; i < tableData.length; i++) {
      const record = tableData[i]
      const keys = Object.keys(condition)
      if (keys.every(key => record[key] === condition[key])) {
        tableData[i] = { ...record, ...data }
        return tableData[i]
      }
    }
    return {}
  }

  remove (condition) {
    const tableData = Db.data[this.tableName] || []
    const filteredData = tableData.filter(record => {
      const keys = Object.keys(condition)
      return keys.every(key => record[key] !== condition[key])
    })
    Db.data[this.tableName] = filteredData
    return filteredData
  }

  find (condition = {}) {
    const tableData = Db.data[this.tableName] || []
    if (Object.keys(condition).length === 0) {
      return tableData
    }
    return tableData.filter(record => {
      const keys = Object.keys(condition)
      return keys.every(key => record[key] === condition[key])
    })
  }
}
