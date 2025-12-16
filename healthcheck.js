const cacheService = require('./config/cache');
const logger = require('./utils/logger');

function checkCacheHealth() {
  try {
    // 检查缓存服务状态
    const status = cacheService.getStatus();
    
    if (status.redisAvailable) {
      logger.info('缓存健康检查通过：Redis可用');
      process.exit(0);
    } else {
      logger.warn('缓存健康检查警告：Redis不可用，使用内存缓存');
      process.exit(0);
    }
  } catch (error) {
    logger.error('缓存健康检查失败:', error);
    process.exit(1);
  }
}

checkCacheHealth();