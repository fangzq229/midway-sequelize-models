const inflect = require('i')();

class SequelizeTypeScriptModel {
  constructor(elitem, columns, conn) {
    this.elitem = elitem;
    this.columns = columns;
    this.conn = conn;
  }

  findTypeTxt(element, getLength = true) {
    switch (element.DATA_TYPE) {
      case 'nvarchar':
      case 'varchar':
        return 'string';
      case 'datetime':
        return `Date`;
      case 'timestamp':
      case 'int':
        return `number`;
      case 'decimal':
        return `number`;
      case 'boolean':
        return 'boolean';
      case 'bigint':
        return 'string';
      case 'double':
        return 'number';
      case 'json':
        return 'json';
    }
  }

  findLength(element) {
    switch (element.DATA_TYPE) {
      case 'nvarchar':
      case 'varchar':
        return `
        length:${element.CHARACTER_MAXIMUM_LENGTH}`;
      case 'datetime':
      case 'timestamp':
      case 'int':
      case 'decimal':
      case 'boolean':
      case 'bigint':
      case 'double':
      case 'json':
        return '';
    }
  }

  findEnum(element) {
    if (!element.COLUMN_COMMENT) {
      return '';
    }
    const regex2 = /\[(.+?)\]/g; // [] 中括号
    const value = element.COLUMN_COMMENT.match(regex2);
    if (!value || !value[0]) {
      return '';
    }
    const ee = value[0].replace('[', '').replace(']', '').split(',');
    const enums = [];
    for (const item of ee) {
      const rd3 = item.split(' ');
      if (!rd3[1] || !rd3[2] || !rd3[0]) {
        continue;
      }
      enums.push(`
          /**
           * ${rd3[2]}
           */
          ${rd3[0]}${rd3[1]}`);
    }
    const estr = enums.join(',').toString();
    console.log(estr);
    return estr ? `\r\nexport enum E${inflect.camelize(element.COLUMN_NAME, true)} {
${estr}
    }` : '';
  }

  findAttrType(element) {
    switch (element.DATA_TYPE) {
      case 'nvarchar':
      case 'char':
      case 'varchar':
        return 'STRING';
      case 'datetime':
        return `DATE`;
      case 'timestamp':
      case 'int':
      case 'tinyint':
        return `INTEGER`;
      case 'decimal':
        return `DECIMAL`;
      case 'boolean':
        return 'BOOLEAN';
      case 'bigint':
        return 'BIGINT';
      case 'double':
        return 'DOUBLE';
      case 'json':
        return 'SequlizeJSON';
    }
  }

  findConst() {
    const cc = this.columns.map(p => {
      return `  
      /**
       * ${inflect.camelize(p.COLUMN_NAME, false)}
       */
      static readonly ${p.COLUMN_NAME.toUpperCase()}:string = '${inflect.camelize(p.COLUMN_NAME, false)}';`;
    })
    return cc.join('');
  }

  findModelTxt() {
    let col = '';
    let tenum = '';
    const typeGroup = [];
    this.columns
      .filter(
        x =>
          x.COLUMN_NAME !== 'id' &&
          x.COLUMN_NAME !== 'created_at' &&
          x.COLUMN_NAME !== 'updated_at' &&
          x.COLUMN_NAME !== 'deleted_at'
      )
      .forEach(element => {
        const typeString = this.findTypeTxt(element);
        const colEnum = this.findEnum(element);
        const mastType = !colEnum ? typeString : `E${inflect.camelize(element.COLUMN_NAME, true)}`;
        const colType = mastType !== typeString && this.findAttrType(element);
        colType && !typeGroup.includes(colType) && typeGroup.push(colType);
        const colTypestr = colType && ` ,type: ${colType}`;
        // #region col
        col += `
  /**
   * ${element.COLUMN_COMMENT ? element.COLUMN_COMMENT : element.COLUMN_NAME}
   */
  @Column({ comment: '${element.COLUMN_COMMENT}' ${colTypestr || ''} })
  ${inflect.camelize(element.COLUMN_NAME, false)}: ${mastType};
        `;
        // #endregion
        // #region enum
        tenum += `${colEnum}`;
        // #endregion
      });
    const iType = typeGroup.length > 0 && `import {${typeGroup.join(',').toString()}} from 'sequelize';`;

    return `import { providerWrapper } from 'midway';
import { Table, Column } from 'sequelize-typescript';
import { BaseModel } from '../../base/base.model';
${iType || ''}
// #region enum${tenum ? `\r\n` + tenum : ''}
// #endregion

// 依赖注入用导出类型
export type I${inflect.camelize(this.elitem.TABLE_NAME)}Model = typeof ${inflect.camelize(this.elitem.TABLE_NAME)}Model;

@Table({
  tableName: '${this.elitem.TABLE_NAME}'
})
export class ${inflect.camelize(this.elitem.TABLE_NAME)}Model extends BaseModel {
  ${col}
}

// 常量生成
export class Const${inflect.camelize(this.elitem.TABLE_NAME)} {
  ${this.findConst()}
}

  // @provide 用 工厂模式static model
  export const factory = () => ${inflect.camelize(this.elitem.TABLE_NAME)}Model;
providerWrapper([
  {
    id: '${inflect.camelize(this.elitem.TABLE_NAME)}Model',
    provider: factory
  }
]);
`;
  }

  findInterface() {
    let col = '';
    this.columns
      .filter(
        x =>
          x.COLUMN_NAME !== 'id' &&
          x.COLUMN_NAME !== 'created_at' &&
          x.COLUMN_NAME !== 'updated_at' &&
          x.COLUMN_NAME !== 'deleted_at'
      )
      .forEach(element => {
        const typeString = this.findTypeTxt(element);
        // #region
        col += `
/**
 * ${element.COLUMN_COMMENT}
 */
${inflect.camelize(element.COLUMN_NAME, false)}: ${typeString};
`;
        // #endregion
      });

    return `
export interface I${inflect.camelize(this.elitem.TABLE_NAME)}{
  ${col}
}
`;
  }
}

export default SequelizeTypeScriptModel;
