//引入redis
// import redis from 'redis'
var redis = require("redis");
var conf = require('../model/config');
//创建redis客户端
var client = redis.createClient(conf.redisConf.port, conf.redisConf.host);

//连接错误处理
client.on("error", function (error) {
  console.log(error);
});

var expire = 3600 * 48;

// client.auth("123456");
var queryStockCache = function (options, callback) {
  client.select("15", function (error) {
    if (error) {
      console.log(error);
      callback(null);
    } else {
      client.lrange("self_choose:" + options.wechatId, 0, -1, function (error, res) {
        if (error) {
          console.log(error);
          callback(null);
        } else {
          client.expire("self_choose:" + options.wechatId, expire);
          callback(res);
        }
      });
    }
  });
};
var addStockCache = function (options, callback) {
  client.select("15", function (error) {
    if (error) {
      console.log(error);
    } else {
      var element;
      if (options.load instanceof Array) {
        element = [];
        for (var i = 0; i < options.load.length; i++) {
          element[i] = (JSON.stringify(options.load[i]));
        }
      }
      else {
        element = JSON.stringify(options.load);


      }

      client.rpush("self_choose:" + options.wechatId, element, function (error, res) {
        if (error) {
          console.log(error);
        } else {
          client.expire("self_choose:" + options.wechatId, expire);
        }
      });
    }
  });
};
var removeStockCache = function (options, callback) {
  client.select("15", function (error) {
    if (error) {
      console.log(error);
    } else {
      client.lrem("self_choose:" + options.wechatId, 0, JSON.stringify(options.load), function (error, res) {
        if (error) {
          console.log(error);
        } else {
          client.expire("self_choose:" + options.wechatId, expire);
        }
      });
    }
  });
};

const getByKey = async function(key) {
  return new Promise((resolve, reject) => {
    client.select("15", function (error) {
      if (error) {
        reject(error);
      } else {
        client.get(key, function (error, reply) {
          if (error) {
            reject(error);
          } else {
            resolve(reply && JSON.parse(reply));
          }
        });
      }
    })
  });
};

const setByKey = function (key, value, expiration) {
  client.select("15", function (error) {
    if (error) {
      throw error;
    } else {
      client.set(key, JSON.stringify(value), redis.print);
      client.expire(key, expiration);
    }
  })
};

module.exports = {
  addStockCache: addStockCache,
  removeStockCache: removeStockCache,
  queryStockCache: queryStockCache,
  getByKey,
  setByKey,
};
