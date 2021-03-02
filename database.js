const mongoose = require('mongoose');

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;

class Database {
  constructor() {
    this.connect();
  }

  connect() {
    mongoose.connect('mongodb+srv://admin:Aa123456@cluster0.luwtg.mongodb.net/blog?retryWrites=true&w=majority')
    .then(() => {
      console.log('MongoDB connected');
    }).catch((err) => {
      console.log('MongoDB Error', err);
    })
  } 
}



module.exports = new Database();