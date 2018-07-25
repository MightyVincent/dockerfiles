const conf = require('../model/config');
const pool = require('./pool.js');
const appPool = pool.createPool(conf.dbConf.app);
const hkPool = pool.createPool(conf.dbConf.hk);
const defaultExpiration = 300;

const getSotckInfoByParams = function (options, callback) {
  appPool.getConnection(function (connection) {
    connection.execute({
      sqlString: 'select stock_name,stock_code from stock_pool where wechat_id = :wechat_id',
      bindParams: [options.wechatId],
      onResultReady(result) {
        connection.release();
        callback(result)
      },
    }).catch(err => {
      throw err
    });
  });
};


const delSotckInfoByParams = function (options, callback) {
  appPool.getConnection(function (connection) {
    connection.execute({
      sqlString: 'delete from stock_pool where wechat_id = :wechat_id and stock_code = :stock_code',
      bindParams: [options.wechatId, options.stockId],
      onResultReady(result) {
        connection.release();
        callback(result)
      },
    }).catch(err => {
      throw err
    });
  });
};

const addSotckInfoByParams = function (options, callback) {
  appPool.getConnection(function (connection) {
    connection.execute({
      sqlString: 'insert into stock_pool (wechat_id,stock_name,stock_code) values (:wechat_id, :stock_name,:stock_code)',
      bindParams: [options.wechatId, options.stockName, options.stockId],
      onResultReady(result) {
        connection.release();
        callback(result)
      },
    }).catch(err => {
      throw err
    });
  });
};

const queryNews = function (options, callback) {
  if (!(options && options.action)) {
    throw new Error("缺少必要的参数！");
  }
  let _sqlString = '', pageSize = parseInt(options.pageSize) || 0, pageNum = parseInt(options.pageNum) || 0;

  // {1: '新闻', 2: '研报', 3: '公告', 9: '大事提醒', 10: '行业'}
  if (options.action == 'Content') {
    /*
    { action: 'Content',
    type: '',
    sectype: '',
    id: '85529229503',
    _: '1528425374146' }
     */
    switch (options.type) {
      case '1':
        // 新闻
        _sqlString = "select " +
          "    news.ReportTitle \"sTitle\", " +
          "    news.pubdate spubdate, " +
          "    (news.updatetime - TO_DATE('1970-1-1 8', 'YYYY-MM-DD HH24')) * 86400 \"iTime\", " +
          "    news.abstract \"sContent\", " +
          "    'https://ggssl.gaotime.com/'||news.recordid||'.pdf' \"sThirdUrl\" " +
          "from NWS_NEWS news " +
          "where ID = :id";
        break;
      case '2':
        // 研报
        _sqlString = "select " +
          "    rep.ReportTitle \"sTitle\", " +
          "    rep.pubdate spubdate, " +
          "    (rep.updatetime - TO_DATE('1970-1-1 8', 'YYYY-MM-DD HH24')) * 86400 \"iTime\", " +
          "    rep.abstract \"sContent\", " +
          "    'https://ggssl.gaotime.com/'||rep.recordid||'.pdf' \"sThirdUrl\" " +
          "from RPT_RESEARCHREPORT rep " +
          "where ID = :id";
        break;
      case '3':
        // 公告
        _sqlString = "select " +
          "    blt.title \"sTitle\", " +
          "    blt.pubdate spubdate, " +
          "    (blt.updatetime - TO_DATE('1970-1-1 8', 'YYYY-MM-DD HH24')) * 86400 \"iTime\", " +
          "    blt.content \"sContent\", " +
          "    'https://ggssl.gaotime.com/'||blt.recordid||'.pdf' \"sThirdUrl\" " +
          "from blt_bulletin blt " +
          "where ID = :id";
        break;
      default:
        callback(null);
        return;
    }
    hkPool.getConnection(function (connection) {
      connection.execute({
        sqlString: _sqlString,
        bindParams: [options.id],
        options: {
          cache: {
            key: `stock_news#${options.action}#${options.seccode}#${options.type}`,
            expiration: defaultExpiration,
          },
        },
        onResultReady(result) {
          connection.release();
          callback(result[0])
        },
      }).catch(err => {
        throw err
      });
    });

  } else if (options.action == 'NewsList') {
    /*
    { action: 'NewsList',
    seccode: '0001000880',
    startid: '0',
    endid: '0',
    type: '1',
    display_from: 'detail' }
     */
    switch (options.type) {
      case '1':
        // 新闻
        // 个股详情页最多10条
        if (options.display_from == 'detail') {
          pageSize = 10;
          pageNum = 1;
        }
        _sqlString = "select news.ReportTitle \"sTitle\", " +
          "       news.pubdate spubdate, " +
          "       (news.updatetime - TO_DATE('1970-1-1 8', 'YYYY-MM-DD HH24')) * 86400 \"iTime\", " +
          "       news.abstract \"sDescription\", " +
          "       news.id \"sNewsID\", " +
          `       '${options.type}' "eNewsType", ` +
          "       'https://ggssl.gaotime.com/'||news.recordid||'.pdf' \"sDtInfoUrl\" " +
          "  from NWS_News news, NWS_NewsSecu secu " +
          "where news.recordid = secu.recordid " +
          `   and secu.tradingcode = :seccode order by 3 desc`;
        break;
      case '2':
        // 研报
        // 个股详情页最多10条
        if (options.display_from == 'detail') {
          pageSize = 10;
          pageNum = 1;
        }
        _sqlString = "select rep.ReportTitle \"sTitle\", " +
          "       rep.pubdate spubdate, " +
          "       rep.Abstract \"sDescription\", " +
          "       (rep.UpdateTime - TO_DATE('1970-1-1 8', 'YYYY-MM-DD HH24')) * 86400 \"iTime\", " +
          "       rep.id \"sNewsID\", " +
          `       '${options.type}' "eNewsType", ` +
          "       'https://ggssl.gaotime.com/'||rep.recordid||'.pdf' \"sDtInfoUrl\" " +
          "  from RPT_REPORTSECU secu, RPT_RESEARCHREPORT rep " +
          "where secu.RecordID = rep.RecordID " +
          `   and secu.TradingCode = :seccode order by 4 desc`;
        break;
      case '3':
        // 公告
        // 个股详情页最多10条
        if (options.display_from == 'detail') {
          pageSize = 10;
          pageNum = 1;
        }
        // sTitle iTime sContent
        _sqlString = "select blt.title \"sTitle\", " +
          "       blt.pubdate spubdate, " +
          "       (blt.updatetime - TO_DATE('1970-1-1 8', 'YYYY-MM-DD HH24')) * 86400 \"iTime\", " +
          "       blt.content \"sDescription\", " +
          "       blt.id \"sNewsID\", " +
          `       '${options.type}' "eNewsType", ` +
          "       'https://ggssl.gaotime.com/'||blt.recordid||'.pdf' \"sDtInfoUrl\" " +
          "  from blt_bulletin blt, blt_bulletinsecu secu " +
          "where blt.recordid = secu.recordid" +
          // "   and blt.ContentFormat='1' " +
          `   and secu.tradingcode = :seccode order by 3 desc`;
        break;
      case '9':
      // 大事提醒
      // 个股详情页最多3条
      case '10':
      // 行业
      // 个股详情页最多10条
      default:
        // 不支持的资讯类型
        throw new Error('不支持的资讯类型');
    }
    hkPool.getConnection(function (connection) {
      connection.execute({
        sqlString: _sqlString,
        bindParams: [options.seccode.substring(4)],
        options: {
          pageSize: pageSize,
          pageNum: pageNum,
          cache: {
            key: `stock_news#${options.action}#${options.seccode}#${options.type}#${pageSize}#${pageNum}`,
            expiration: defaultExpiration,
          },
        },
        onResultReady(result) {
          connection.release();
          callback({vNewsDesc: result})
        },
      }).catch(err => {
        throw err
      });
    });
  }
};


module.exports = {
  addSotckInfoByParams,
  getSotckInfoByParams,
  delSotckInfoByParams,
  queryNews,
};
