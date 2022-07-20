<template>
  <div class="content-box">
    <div class="content-top">
      <div @click="back()" class="back">返回</div>
      <div @click="run()" class="run">执行</div>
    </div>
    <div class="data-box">
      <div class="json-box">
        <textarea
          class="json-data"
          v-model="jsonData"
          placeholder="请输入 json 格式数据"
          cols="30"
          rows="10"
        ></textarea>
      </div>
      <div class="dto-box">
        <p class="dto-data">{{ dtoData }}</p>
      </div>
    </div>
  </div>
</template>

<script>
const inflect = require('i')();
export default {
  data: () => {
    return {
      jsonData: '',
      dtoData: ''
    }
  },
  methods: {
    run() {
      if (!this.jsonData) {
        alert('请输入json格式数据');
        return;
      }
      let data = '';
      try {
        data = JSON.parse(this.jsonData);
        if (typeof (data) !== 'object') {
          alert('数据格式错误')
          return;
        }
      } catch (error) {
        alert('数据格式错误')
        return;
      }
      this.dtoData = this.createDto(data);
    },
    back() {
      this.$router.push({
        path: 'index'
      })
    },
    createDto(data, name = 'xxxx', str = '') {
      str = `export class ${name} { `
      for (const i in data) {
        // 类型判断
        const type = this.dataType(data[i]); // array object string number boolean
        str += this.formatDto(type, i, data);
        if (type === 'array' && !['string', 'boolean', 'number'].includes(this.dataType(data[i][0]))) {
          const itemDto = this.createDto(data[i][0], `${inflect.camelize(i + 'Item')}`, str);
          str = `
          ${itemDto}
          ${str}
          `;
        }
        if (type === 'object') {
          const objDto = this.createDto(data[i], `${inflect.camelize(i + 'Obj')}`, str);
          str = `
          ${objDto}
          ${str}
          `;
        }
      }
      str += `
      }`
      return str;
    },
    formatDto(type, name, data) {
      let code = ''
      switch (type) {
        case 'string':
          code = `
            @ApiProperty({ description: '${name}' })
            @IsString()
            ${name}: string;
          `
          break;
        case 'number':
          code = `
            @ApiProperty({ description: '${name}' })
            @IsNumber()
            ${name}: number;
          `
          break;
        case 'boolean':
          code = `
            @ApiProperty({ description: '${name}' })
            @IsBoolean()
            ${name}: boolean;
          `
          break;
        case 'object':
          code = `
            @ApiProperty({ description: '${name}', type: ${inflect.camelize(name + 'Obj')} })
            @IsObject()
            ${name}: ${inflect.camelize(name + 'Obj')};
          `
          break;
        case 'array':
          code = this.arrayFormatDto(name, data)
          break;
      }
      return code;
    },
    // 数组元素类型
    arrayFormatDto(name, data) {
      console.log(data, name);
      if (this.dataType(data[name][0]) === 'string') {
        return `
            @ApiProperty({ description: '${name}', type: [string] })
            @IsArray()
            ${name}: string[];
          `
      } else if (this.dataType(data[name][0]) === 'boolean') {
        return `
            @ApiProperty({ description: '${name}', type: [boolean] })
            @IsArray()
            ${name}: boolean[];
          `
      } else if (this.dataType(data[name][0]) === 'number') {
        return `
            @ApiProperty({ description: '${name}', type: [number] })
            @IsArray()
            ${name}: number[];
          `
      } else {
        return `
            @ApiProperty({ description: '${name}', type: [${inflect.camelize(name + 'Item')}] })
            @IsArray()
            ${name}: ${inflect.camelize(name + 'Item')}[];
          `
      }
    },
    dataType(data) {
      if (Array.isArray(data)) {
        return 'array';
      }
      return typeof data;
    }
  }
}
</script>
<style>
.content-box {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.data-box {
  width: 100%;
  display: flex;
  flex-direction: row;
}
.json-box {
  width: 50%;
  height: 100vh;
  background: #f9f9f9;
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.json-data {
  width: 90%;
  height: 80%;
  padding: 5px;
  font-size: 16px;
  border: none;
  margin-top: 20px;
}
.dto-box {
  width: 50%;
  height: 100vh;
  background: #f9f9f9;
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.dto-data {
  background: #fff;
  width: 90%;
  height: 80%;
  padding: 5px;
  font-size: 16px;
  margin-top: 20px;
  white-space: pre-line;
  overflow-y: scroll;
}
.content-top {
  display: flex;
  flex-direction: row;
  height: 50px;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
}
.back {
  width: 60px;
  height: 30px;
  background: green;
  color: #fff;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.run {
  width: 60px;
  height: 30px;
  background: red;
  color: #fff;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
</style>