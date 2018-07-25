const redisAPI = require('../model/redis.js');

/**
 * 执行结果就绪回调
 * @callback onResultReady
 * @param {Object} result
 */
/**
 * SQL执行器
 * @callback sqlExecutor
 * @param {Object} args: {sqlString, bindParams, options, onResultReady}
 * @param {string} args.sqlString - SQL语句
 * @param {string[]|number[]} args.bindParams - SQL参数
 * @param {Object} args.options - 执行参数
 * @param {function} args.onResultReady - 执行结果就绪回调
 */
/**
 * 连接就绪时的回调
 * @callback onConnectionReady
 * @param {Object} connectionWrapper
 * @param {sqlExecutor} connectionWrapper.execute
 * @param {function} connectionWrapper.release
 */

/**
 * 创建连接池
 * @param dbConf
 */
const createPool = function (dbConf) {
  if (!dbConf) {
    throw new Error('缺少必要的参数！');
  }
  /**
   * 获取连接
   * @param {onConnectionReady} onConnectionReady
   */
  let getConnection = function (onConnectionReady) {
    throw new Error("获取数据库连接的方法没有实现！")
  };

  switch (dbConf.type) {
    default:
      throw new Error(`不支持的数据库类型: ${dbConf.type}`);
    case 'mysql':
      const mysql = require('mysql');
      const mysqlPool = mysql.createPool(dbConf.poolAttrs);
      getConnection = function (onConnectionReady) {
        mysqlPool.getConnection(function (error, connection) {
          if (error) {
            throw error;
          } else {

            connection.beginTransaction(function (error) {
              if (error) {
                throw error;
              }
            });
            onConnectionReady({
              execute: async function (args) {
                if (!(args && args.sqlString && args.onResultReady)) {
                  throw new Error('缺少必要的参数！');
                }
                const {bindParams, options, onResultReady} = args;
                try {
                  let sqlString = args.sqlString;

                  // 占位符
                  sqlString = sqlString.replace(/:[a-zA-Z_]+/g, '?');

                  // 分页
                  if (options && options.pageSize && options.pageNum) {
                    const {pageSize, pageNum} = options;
                    sqlString = `select * from (${sqlString}) t00 limit ${pageSize * (pageNum - 1)}, ${pageSize}`
                  }

                  console.log("Statement: ", sqlString);
                  bindParams && console.log("Parameters: ", JSON.stringify(bindParams));
                  options && console.log("Options: ", JSON.stringify(options));

                  // 缓存
                  const needCache = !!(options && options.cache);
                  let key, expiration;
                  if (needCache) {
                    key = options.cache.key || sqlString + JSON.stringify(bindParams);
                    expiration = options.cache.expiration || 0;
                    const cachedValue = await redisAPI.getByKey(key);
                    if (cachedValue) {
                      console.log("Cache Hit: ", key);
                      // console.log('Result: ', JSON.stringify(cachedValue));
                      onResultReady(cachedValue);
                      return;
                    }
                  }

                  // query(sqlString, values, callback) / query(options, callback)
                  connection.query({
                    sql: sqlString,
                    values: bindParams,
                  }, function (error, result, fields) {
                    if (error) {
                      return connection.rollback(function () {
                        throw error;
                      });
                    } else {
                      if (needCache) {
                        console.log('Caching Key: ', key);
                        console.log('Expiration: ', expiration);
                        redisAPI.setByKey(key, result.rows, expiration);
                      }
                      // console.log('Result: ', JSON.stringify(result.rows));
                      onResultReady(result);
                    }
                  });
                } catch (e) {
                  console.log(e);
                  onResultReady(null);
                }
              },
              release: function () {
                connection.commit(function (error) {
                  if (error) {
                    return connection.rollback(function () {
                      throw error;
                    });
                  }
                });
                connection.release();
              },
            });
          }
        });
      };


      break;

    case 'oracle':
      const oracledb = require('oracledb');
      oracledb.outFormat = oracledb.OBJECT;
      oracledb.fetchAsString = [oracledb.CLOB];
      let oraclePool = null;
      oracledb.createPool(dbConf.poolAttrs, function (error, pool) {
        if (error) {
          throw error
        } else {
          oraclePool = pool
        }
      });

      getConnection = function (onConnectionReady) {
        oraclePool.getConnection(function (error, connection) {
          if (error) {
            throw error;
          } else {
            onConnectionReady({
              execute: async function (args) {
                if (!(args && args.sqlString && args.onResultReady)) {
                  throw new Error('缺少必要的参数！');
                }
                const {bindParams, options, onResultReady} = args;
                try {
                  let sqlString = args.sqlString;

                  // 分页
                  if (options && options.pageSize && options.pageNum) {
                    const {pageSize, pageNum} = options;
                    sqlString = `select t000.* from (select ROWNUM RN, t00.* from (${sqlString}) t00) t000 where t000.RN >= ${pageSize * (pageNum - 1) + 1} and t000.RN <= ${pageSize * pageNum}`;
                  }

                  console.log("Statement: ", sqlString);
                  bindParams && console.log("Parameters: ", JSON.stringify(bindParams));
                  options && console.log("Options: ", JSON.stringify(options));

                  // 缓存
                  const needCache = !!(options && options.cache);
                  let key, expiration;
                  if (needCache) {
                    key = options.cache.key || sqlString + JSON.stringify(bindParams);
                    expiration = options.cache.expiration || 0;
                    const cachedValue = await redisAPI.getByKey(key);
                    if (cachedValue) {
                      console.log("Cache Hit: ", key);
                      // console.log('Result: ', JSON.stringify(cachedValue));
                      onResultReady(cachedValue);
                      return;
                    }
                  }

                  // execute(String sql, [Object bindParams, [Object options,]] function(Error error, [Object result]){});
                  connection.execute(sqlString, bindParams, function (error, result) {
                    if (error) {
                      return connection.rollback(function () {
                        throw error;
                      });
                    } else {
                      if (needCache) {
                        console.log('Caching Key: ', key, ' Expiration: ', expiration);
                        redisAPI.setByKey(key, result.rows, expiration);
                      }
                      // console.log('Result: ', JSON.stringify(result.rows));
                      console.log('Result: ', result.rows.length);
                      onResultReady(result.rows);
                    }
                  });
                } catch (e) {
                  console.log(e);
                  onResultReady(null);
                }
              },
              release: function () {
                connection.commit();
                connection.close(function (error) {
                  if (error) {
                    return connection.rollback(function () {
                      throw error;
                    });
                  }
                });
              },
            });
          }
        });
      };
      break;
  }

  return {
    type: dbConf.type,
    getConnection,
  };
};


module.exports = {
  createPool,
};
