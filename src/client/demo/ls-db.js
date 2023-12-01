export class Db {
  constructor(conf) {
    this.tableName = conf.tableName;
    if (!localStorage.getItem(this.tableName)) {
      localStorage.setItem(this.tableName, JSON.stringify([]));
    }
  }

  async findOne(condition) {
    const tableData = JSON.parse(localStorage.getItem(this.tableName));
    for (let i = 0; i < tableData.length; i++) {
      const record = tableData[i];
      const keys = Object.keys(condition);
      if (keys.every(key => record[key] === condition[key])) {
        return record;
      }
    }
    return null;
  }

  async insert(data) {
    const tableData = JSON.parse(localStorage.getItem(this.tableName));
    tableData.push(data);
    localStorage.setItem(this.tableName, JSON.stringify(tableData));
    return data;
  }

  async update(condition, data) {
    const tableData = JSON.parse(localStorage.getItem(this.tableName));
    for (let i = 0; i < tableData.length; i++) {
      const record = tableData[i];
      const keys = Object.keys(condition);
      if (keys.every(key => record[key] === condition[key])) {
        tableData[i] = {...record, ...data};
        localStorage.setItem(this.tableName, JSON.stringify(tableData));
        return tableData[i];
      }
    }
    return null;
  }

  async remove(condition) {
    const tableData = JSON.parse(localStorage.getItem(this.tableName));
    const filteredData = tableData.filter(record => {
      const keys = Object.keys(condition);
      return keys.every(key => record[key] !== condition[key]);
    });
    localStorage.setItem(this.tableName, JSON.stringify(filteredData));
    return filteredData;
  }

  async find(condition = {}) {
    const tableData = JSON.parse(localStorage.getItem(this.tableName));
    if (Object.keys(condition).length === 0) {
      return tableData;
    }
    return tableData.filter(record => {
      const keys = Object.keys(condition);
      return keys.every(key => record[key] === condition[key]);
    });
  }
}
