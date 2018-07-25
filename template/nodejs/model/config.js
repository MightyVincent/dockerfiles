// config loader
const NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV.trim() : "development";
const fs = require('fs');
let config = null;

if (!config) {
  if (fs.existsSync('./shared/model-config.json')) {
    console.log(`读取数据连接配置: ./shared/model-config.json`);
    config = require(`./config-${NODE_ENV}.json`);
  } else if (fs.existsSync(`./model/config-${NODE_ENV}.json`)) {
    console.log(`读取数据连接配置: ./model/config-${NODE_ENV}.json`);
    config = require(`./config-${NODE_ENV}.json`);
  }
}

if (!config || !config.dbConf || !config.redisConf) {
  throw new Error("无法找到可用的数据连接配置！");
}

module.exports = config;
