var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://yousif_elmos:'+encodeURIComponent("yousif9988%")+'@trial-shard-00-00-eisp0.mongodb.net:27017,trial-shard-00-01-eisp0.mongodb.net:27017,trial-shard-00-02-eisp0.mongodb.net:27017/TodoApp?ssl=true&replicaSet=Trial-shard-0&authSource=admin', { useMongoClient: true});

module.exports = {mongoose};