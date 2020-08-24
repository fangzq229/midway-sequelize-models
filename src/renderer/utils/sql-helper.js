/* eslint-disable */
const mysql = require('mysql')

class SqlHelper {
  constructor(conn) {
    this.connString = conn
  }

  findTablesSql() {
    return `select table_name AS TABLE_NAME,table_comment AS TABLE_COMMENT from information_schema.tables where table_schema='${this.connString.database}'`;
  }

  findColumnSql(tableName) {
    return `SELECT * FROM information_schema.columns WHERE table_schema='${
      this.connString.database
      }' AND table_name='${tableName}' order by COLUMN_NAME`
  }

  // 创建链接
  async createConnection() {
    return new Promise((resovle, reject) => {
      let connection = mysql.createConnection(this.connString);
      connection.connect((err) => {
        if (err) {
          reject(err)
        } else {
          resovle(connection)
        }
      });
    })
  }
  // 关闭链接
  endConnection(connection) {
    connection.end(() => { });
  }
  // query 执行
  async query(sql) {
    return new Promise(async (resovle, reject) => {
      const connection = await this.createConnection().catch((err) => {
        reject(err);
      });
      connection.query(sql, (err, rows) => {
        if (err) {
          reject(err);
        }
        resovle(rows);
      })
    })
  }
}

export default SqlHelper
