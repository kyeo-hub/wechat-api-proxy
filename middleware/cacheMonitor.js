const logger = require('../utils/logger')

// 缓存监控中间件
const cacheMonitor = (req, res, next) => {
  // 只监控微信API相关的请求
  if (req.path.startsWith('/api/')) {
    const startTime = Date.now()
    
    // 记录原始的res.json方法
    const originalJson = res.json
    
    res.json = function(data) {
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      // 检查响应是否来自缓存
      const isFromCache = data && data.fromCache === true
      
      // 记录请求日志
      logger.info(`${req.method} ${req.path}`, {
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        fromCache: isFromCache || false,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
      })
      
      // 调用原始的json方法
      return originalJson.call(this, data)
    }
  }
  
  next()
}

module.exports = cacheMonitor