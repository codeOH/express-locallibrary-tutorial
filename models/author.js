const mongoose = require('mongoose');
var moment = require('moment');
const Schema = mongoose.Schema;

var AuthorSchema = new Schema(
  {
    first_name: {type: String, required: true, max: 100},
    family_name: {type: String, required: true, max: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
  }
);

// 虚拟属性'name'：表示作者全名
AuthorSchema
  .virtual('name')
  .get(function () {
    return this.family_name + ' ' + this.first_name;
  });
  
  AuthorSchema
  .virtual('date_of_birth_formatted')
  .get(function() {
    return this.date_of_birth ? moment(this.date_of_birth).format('YYYY.MM.DD') : '';
  })
  
  AuthorSchema
  .virtual('date_of_death_formatted')
  .get(function() {
    return this.date_of_death ? moment(this.date_of_death).format('YYYY.MM.DD') : '';
  })
  
  // 虚拟属性'lifespan'：作者寿命
  AuthorSchema
    .virtual('lifespan')
    .get(function () {
      var lifespan_string = '';
      if(this.date_of_birth_formatted) {
        lifespan_string = this.date_of_birth;
      }
      lifespan_string += '-';
      if(this.date_of_death) {
        lifespan_string += this.date_of_death;
      }
    });

// 虚拟属性'url'：作者 URL
AuthorSchema
  .virtual('url')
  .get(function () {
    return '/catalog/author/' + this._id;
  });

// 导出 Author 模型
module.exports = mongoose.model('Author', AuthorSchema);