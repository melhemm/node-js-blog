const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://jamal_93:m1m2m3m4m5@cluster0-73k21.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});