//connect mongoose db
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/webx');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Lỗi kết nối csdl:'));
db.once('open', function() {
  console.log('Kết nối dbs thành công!')
});

module.exports = mongoose;


