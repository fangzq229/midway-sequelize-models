<template>
  <div class="content">
    <div class="left-box">
      <div
        :class="actionIdx === -1 ? `left-title action` : `left-title`"
        @click="initItem"
      >
        Sequelize Models
      </div>
      <div class="left-con" :key="k">
        <div class="left-con-tle">FAVORITES</div>
        <div
          v-for="(item, index) of items"
          :key="index"
          :class="actionIdx == index ? 'left-con-item action' : 'left-con-item'"
          @click="selectItem(index)"
        >
          <img src="@/assets/home.png" alt />
          <div class="name">{{ item.name }}</div>
        </div>
      </div>
      <div class="footer">
        <div class="add" @click="addNew">+</div>
        <div class="sub" @click="sub">-</div>
      </div>
    </div>
    <div class="right-box">
      <div class="con-box">
        <div class="input">
          <label>MYSQL 数据库</label>
        </div>
        <div class="input">
          <label>name：</label>
          <input
            type="text"
            v-model="paramObj.name"
            value
            placeholder="输入name"
          />
        </div>
        <div class="input">
          <label>host：</label>
          <input
            type="text"
            v-model="paramObj.host"
            value
            placeholder="输入host"
          />
        </div>
        <div class="input">
          <label>port：</label>
          <input type="text" v-model="paramObj.port" placeholder="输入prot" />
        </div>
        <div class="input">
          <label>user：</label>
          <input type="text" v-model="paramObj.user" placeholder="输入user" />
        </div>
        <div class="input">
          <label>password：</label>
          <input
            type="password"
            v-model="paramObj.password"
            placeholder="输入password"
          />
        </div>
        <div class="input">
          <label>database：</label>
          <input
            type="text"
            v-model="paramObj.database"
            placeholder="输入database"
          />
        </div>
      </div>
      <div class="r-footer">
        <div class="favorite" @click="addItem" v-if="actionIdx < 0">
          Add to Favorite
        </div>
        <div class="changes" @click="saveItem" v-else>Save Changes</div>
        <div class="connect" @click="jsonToDto">Json To Dto</div>
        <div class="connect" @click="connect">Connect</div>
      </div>
    </div>
  </div>
</template>
<script>
import SqlHelper from '@/utils/sql-helper.js'
export default {
  data: () => ({
    k: 1,
    items: [],
    actionIdx: 0,
    paramObj: {
      name: '',
      host: '',
      port: '',
      user: '',
      password: '',
      database: ''
    },
    sqlHelper: {}
  }),
  created() {
    const items = JSON.parse(localStorage.getItem('items'));
    const actionIdx = localStorage.getItem('actionIdx');
    if (!items || items.length < 1) {
      this.actionIdx = -1;
      this.items = [];
    } else {
      this.actionIdx = actionIdx > -1 && items[actionIdx] ? actionIdx : -1;
      this.items = [...items];
      console.log(this.actionIdx);
      if (this.actionIdx > -1) { this.paramObj = { ...this.items[this.actionIdx] } };
    }
  },
  methods: {
    jsonToDto() {
      this.$router.push({
        path: 'json-to-dto'
      })
    },
    selectItem(index) {
      this.actionIdx = index;
      localStorage.setItem('actionIdx', index);
      this.paramObj = { ...this.items[index] };
    },

    addItem() {
      const obj = { ...this.paramObj };
      obj.name = obj.name ? obj.name : 'Quick Connect'
      this.items.push(obj);
      localStorage.setItem('items', JSON.stringify(this.items));
    },
    saveItem() {
      this.$set(this.items, this.actionIdx, this.paramObj);
      localStorage.setItem('items', JSON.stringify(this.items));
    },
    initItem() {
      this.actionIdx = -1;
      localStorage.setItem('actionIdx', this.actionIdx);
      this.paramObj = {
        name: '',
        host: '',
        port: '',
        user: '',
        password: '',
        database: ''
      }
    },
    addNew() {
      this.paramObj = {
        name: 'New Favorite',
        host: '',
        port: '',
        user: '',
        password: '',
        database: ''
      };
      this.items.push(this.paramObj)
      this.actionIdx = this.items.length - 1;
      localStorage.setItem('items', JSON.stringify(this.items));
      localStorage.setItem('actionIdx', this.items.length);
    },
    sub() {
      if (this.actionIdx < 0) {
        return false;
      }
      const res = confirm('Delete the bookmark?');
      if (res) {
        this.items.splice(this.actionIdx, 1);
        this.actionIdx = (this.actionIdx - 1) < 0 && this.items.length > 0 ? 0 : this.actionIdx - 1;
        localStorage.setItem('items', JSON.stringify(this.items));
        localStorage.setItem('actionIdx', this.actionIdx);
        if (this.actionIdx > -1) {
          this.paramObj = { ...this.items[this.actionIdx] };
        } else {
          this.paramObj = {
            name: '',
            host: '',
            port: '',
            user: '',
            password: '',
            database: ''
          }
        }
      }
    },
    async connect() {
      for (const k in this.paramObj) {
        if (!this.paramObj[k]) {
          alert('Incomplete parameter!');
          return;
        }
      }
      this.sqlHelper = new SqlHelper(this.paramObj)
      const res = await this.sqlHelper.createConnection().catch((err) => {
        alert(err);
      });
      if (res) {
        if (this.actionIdx > -1) {
          this.items[this.actionIdx] = { ...this.paramObj };
          localStorage.setItem('items', JSON.stringify(this.items));
        } else {
          this.items.push({ ...this.paramObj });
          localStorage.setItem('items', JSON.stringify(this.items));
          localStorage.setItem('actionIdx', this.items.length - 1);
        }
        this.$router.push({
          path: 'tables'
        })
      }
    }
  }
}
</script>

<style scoped>
.content {
  width: 100%;
  display: flex;
  flex-direction: row;
  background: #f1f1f1;
}
/* left 布局 */
.left-box {
  min-width: 200px;
  height: 100vh;
  background: #fff;
}
.left-title {
  width: 100%;
  height: 28px;
  text-align: center;
  line-height: 28px;
  margin-top: 10px;
  font-size: 16px;
  cursor: default;
}

.left-con {
  display: flex;
  flex-direction: column;
}
.left-con-tle {
  margin: 10px 0;
  font-size: 12px;
  font-weight: 600;
  color: #595959;
  padding-left: 15px;
  cursor: default;
}

.left-con-item {
  display: flex;
  padding: 5px 0 5px 30px;
  margin-top: 5px;
  align-items: center;
  color: #595959;
  font-size: 14px;
  cursor: default;
}
.action {
  background: #f1f1f1;
}
.left-con-item > img {
  width: 20px;
  height: 20px;
}
.left-con-item > .name {
  padding-left: 10px;
  font-size: 15px;
}

.footer {
  display: flex;
  width: 200px;
  height: 25px;
  position: absolute;
  bottom: 0;
  background: #d9d9d9;
}
.add,
.sub {
  width: 30px;
  height: 100%;
  text-align: center;
  line-height: 25px;
  font-size: 20px;
  font-weight: 500;
  border-right: 1px solid #f1f1f1;
  cursor: default;
}

/* right */
.right-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
}
.con-box {
  width: 500px;
  background: #fff;
  border-radius: 5px;
  padding: 20px 0 40px 0;
}
.con-box .input {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.input label {
  width: 140px;
  text-align: right;
  font-size: 14px;
}
.input input {
  width: 320px;
  text-align: left;
  margin-right: 30px;
  height: 25px;
  border-radius: 3px;
  border: 1px solid #ddd;
  padding-left: 5px;
}

.r-footer {
  width: 500px;
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.favorite,
.changes {
  height: 30px;
  width: 130px;
  border: 1px solid #ddd;
  border-radius: 3px;
  text-align: center;
  line-height: 30px;
  font-size: 14px;
  background: #fff;
  border-radius: 3px;
  cursor: default;
}
.connect {
  height: 30px;
  width: 90px;
  border: 1px solid #ddd;
  border-radius: 3px;
  text-align: center;
  line-height: 30px;
  font-size: 14px;
  background: rgb(2, 139, 252);
  color: #fff;
  border-radius: 3px;
  cursor: default;
}
</style>