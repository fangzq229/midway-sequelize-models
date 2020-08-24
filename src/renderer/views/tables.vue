<template>
  <div class="content">
    <div class="top-box">
      <div class="left-title">Generate sequelize models</div>
      <div class="btn-box">
        <div class="exit-box" @click="exit">退出</div>
      </div>
    </div>

    <div class="left-box">
      <div class="left-top">{{ obj.database }}</div>
      <div
        v-for="(item, index) of tables"
        :class="actionIdx == index ? 'item-box action' : 'item-box'"
        @click="actionItem(index)"
      >
        <div class="name">{{ item.TABLE_NAME }}</div>
        <div class="describe">{{ item.TABLE_COMMENT }}</div>
      </div>
    </div>

    <div class="right-box">
      <div class="right-top">
        <div @click="createInterface" class="btn create-interface">TsInterface</div>
        <div @click="createSchemas" class="btn create-schemas">JoiSchemas</div>
        <div @click="createModel" class="btn create-models">TsModels</div>
      </div>
      <div class="right-table">
        <div class="table-name">SELECT TABLE：{{ this.actionTable.TABLE_NAME }}</div>
        <table border="1" cellpadding="0" cellspacing="0">
          <tr>
            <th>字段名</th>
            <th>说明</th>
            <th>必填</th>
            <th>数据类型</th>
            <th>长度</th>
          </tr>
          <tr v-for="item in columnData" :key="item.id">
            <td>{{item.COLUMN_NAME}}</td>
            <td>{{item.COLUMN_COMMENT}}</td>
            <td>{{item.IS_NULLABLE}}</td>
            <td>{{item.DATA_TYPE}}</td>
            <td>{{item.CHARACTER_MAXIMUM_LENGTH}}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>
<script>
import SqlHelper from '@/utils/sql-helper.js'
import SequelizeTypeScriptModel from '@/utils/sequelize-typescript-model.js';
import showModels from '@/components/show-models.vue';
import JoiSchema from '@/utils/joi.js';
export default {
  data: () => {
    return {
      tables: [],
      actionTable: {},
      obj: {},
      sqlHelper: {},
      actionIdx: -1,
      columnData: []
    }
  },
  async created() {
    const index = localStorage.getItem('actionIdx');
    this.obj = JSON.parse(localStorage.getItem('items'))[index];
    this.sqlHelper = new SqlHelper(this.obj);
    const result = await this.sqlHelper.query(this.sqlHelper.findTablesSql()).catch((err) => { alert(err) });
    this.tables = result;
  },
  methods: {
    async actionItem(index) {
      this.actionIdx = index;
      this.actionTable = this.tables[index];
      const res = await this.sqlHelper.query(this.sqlHelper.findColumnSql(this.actionTable.TABLE_NAME)).catch(err => { alert(err) });
      this.columnData = res;
    },
    createModel() {
      console.log(this.columnData);
      if (this.columnData.length < 1) {
        return alert('select the table');
      }
      // 生成models
      const table = this.tables[this.actionIdx];
      const htmlTxt = new SequelizeTypeScriptModel(table, this.columnData, this.obj).findModelTxt();
      this.dlg(table.TABLE_NAME, 'Models', htmlTxt);
    },
    createInterface() {
      if (this.columnData.length < 1) {
        return alert('select the table');
      }
      // 生成Interface
      const table = this.tables[this.actionIdx];
      const InterTxt = new SequelizeTypeScriptModel(table, this.columnData, this.obj).findInterface();
      this.dlg(table.TABLE_NAME, 'Interface', InterTxt);
    },
    createSchemas(outis) {
      if (this.columnData.length < 1) {
        return alert('select the table');
      }
      // 生成Schemas
      const table = this.tables[this.actionIdx];
      const schemasTxt = new JoiSchema(table, this.columnData, this.obj).findSchema(outis); // false 入参 true 出参
      this.dlg(table.TABLE_NAME, 'Schemas', schemasTxt);
    },
    exit() {
      this.$router.push({ path: '/' })
    },
    dlg(tableName, mark, htmlTxt) {
      this.$dlg.modal(showModels, {
        // send params to inner component
        params: {
          htmlTxt: htmlTxt
        },
        title: `${tableName} - ${mark}`,
        maxButton: false,
        singletonKey: '1092',
        // modal dialog close callback
        // data: inner component call 'this.$emit.('close', data)'
        // to close modal and return data
        callback: data => { }
      })
    }
  }
}
</script>
<style scoped>
.content {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
/* top-box */
.top-box {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 10px;
  border-bottom: 1px solid #f1f1f1;
  height: 40px;
  align-items: center;
  background: #f5f5f5;
}
.top-box .left-title {
  font-size: 18px;
  color: #595959;
}
/* left */
.left-box {
  position: absolute;
  top: 40px;
  left: 0;
  bottom: 0;
  width: 260px;
  border-right: 1px solid #f1f1f1;
  box-sizing: border-box;
  overflow: auto;
  padding-bottom: 10px;
}
.left-box .left-top {
  margin-top: 5px;
  display: flex;
  height: 40px;
  align-items: center;
  padding-left: 10px;
  background: #f5f5f5;

  cursor: default;
}
.left-box .left-top span {
  padding-left: 5px;
}
.item-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 35px;
  margin-top: 5px;
  padding-left: 10px;
  width: 260px;
  color: #333;
}
.action {
  background: #00b109;
  color: #ffffff;
}
.item-box .name {
  font-size: 14px;
  cursor: default;
}
.item-box .describe {
  font-size: 12px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
  cursor: default;
}

/* right */
.right-box {
  position: absolute;
  top: 40px;
  right: 0;
  left: 260px;
  bottom: 0;
  border-right: 1px solid #f1f1f1;
  box-sizing: border-box;
  overflow: auto;
  padding-bottom: 10px;
}
.right-top {
  margin-top: 5px;
  display: flex;
  height: 40px;
  justify-content: flex-end;
  align-items: center;
  padding-left: 10px;
  background: #f5f5f5;
}

.btn {
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  color: #ffffff;
  margin-right: 20px;
  font-size: 14px;
  cursor: default;
}
.create-interface {
  background: #00b0b6;
}
.create-schemas {
  background: #00b109;
}
.create-models {
  background: #1b7ae6;
}
.right-table {
  padding: 30px;
  box-sizing: border-box;
}
.table-name {
  padding: 20px 0;
  font-size: 18px;
}
.right-table table {
  width: 100%;
  font-size: 16px;
}
</style>