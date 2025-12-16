// Redis缓存配置
const redis = require('redis')
const logger = require('../utils/logger')

// Redis客户端配置
const redisOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
}

// 创建Redis客户端
const client = redis.createClient(redisOptions)

// 连接事件监听
client.on('connect', () => {
  logger.info('Redis连接已建立')
})

client.on('ready', () => {
  logger.info('Redis连接就绪')
})

client.on('error', (err) => {
  logger.error('Redis连接错误:', err)
})

client.on('close', () => {
  logger.warn('Redis连接已关闭')
})

client.on('reconnecting', () => {
  logger.info('Redis正在重新连接...')
})

// 内存缓存（作为Redis不可用的降级方案）
const memoryCache = new Map()

// 缓存操作封装
class CacheService {
  constructor() {
    this.redisAvailable = true
    this.setupErrorHandling()
  }

  // 设置错误处理
  setupErrorHandling() {
    client.on('error', () => {
      this.redisAvailable = false
      logger.warn('Redis不可用，切换到内存缓存模式')
    })

    client.on('connect', () => {
      this.redisAvailable = true
      logger.info('Redis恢复可用，切换回Redis缓存模式')
    })
  }

  // 初始化连接
  async connect() {
    try {
      await client.connect()
      this.redisAvailable = true
      logger.info('Redis连接初始化成功')
      return true
    } catch (error) {
      this.redisAvailable = false
      logger.error('Redis连接初始化失败，将使用内存缓存:', error)
      return false
    }
  }

  // 设置缓存
  async set(key, value, expireInSeconds) {
    try {
      if (this.redisAvailable && client.isOpen) {
        // Redis可用时使用Redis
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
        
        if (expireInSeconds) {
          await client.setEx(key, expireInSeconds, stringValue)
        } else {
          await client.set(key, stringValue)
        }
        
        logger.debug(`缓存已设置到Redis: ${key}`)
        return true
      } else {
        // Redis不可用时使用内存缓存
        const expireTime = expireInSeconds ? Date.now() + expireInSeconds * 1000 : null
        memoryCache.set(key, { value, expireTime })
        logger.debug(`缓存已设置到内存: ${key}`)
        return true
      }
    } catch (error) {
      logger.error(`设置缓存失败 ${key}:`, error)
      // 降级到内存缓存
      try {
        const expireTime = expireInSeconds ? Date.now() + expireInSeconds * 1000 : null
        memoryCache.set(key, { value, expireTime })
        logger.debug(`Redis失败，已降级到内存缓存: ${key}`)
        return true
      } catch (memoryError) {
        logger.error(`内存缓存也失败 ${key}:`, memoryError)
        return false
      }
    }
  }

  // 获取缓存
  async get(key) {
    try {
      if (this.redisAvailable && client.isOpen) {
        // Redis可用时使用Redis
        const value = await client.get(key)
        
        if (value === null) {
          logger.debug(`缓存未命中(Redis): ${key}`)
          return null
        }
        
        try {
          // 尝试解析JSON，如果失败则返回原始字符串
          const parsedValue = JSON.parse(value)
          logger.debug(`缓存命中(Redis): ${key}`)
          return parsedValue
        } catch {
          // 不是JSON格式，直接返回字符串
          logger.debug(`缓存命中(Redis): ${key}`)
          return value
        }
      } else {
        // Redis不可用时使用内存缓存
        const item = memoryCache.get(key)
        
        if (!item) {
          logger.debug(`缓存未命中(内存): ${key}`)
          return null
        }
        
        // 检查是否过期
        if (item.expireTime && Date.now() > item.expireTime) {
          memoryCache.delete(key)
          logger.debug(`缓存已过期(内存): ${key}`)
          return null
        }
        
        logger.debug(`缓存命中(内存): ${key}`)
        return item.value
      }
    } catch (error) {
      logger.error(`获取缓存失败 ${key}:`, error)
      
      // 尝试从内存缓存获取
      try {
        const item = memoryCache.get(key)
        
        if (!item) {
          logger.debug(`缓存未命中(内存，降级): ${key}`)
          return null
        }
        
        if (item.expireTime && Date.now() > item.expireTime) {
          memoryCache.delete(key)
          logger.debug(`缓存已过期(内存，降级): ${key}`)
          return null
        }
        
        logger.debug(`缓存命中(内存，降级): ${key}`)
        return item.value
      } catch (memoryError) {
        logger.error(`内存缓存获取也失败 ${key}:`, memoryError)
        return null
      }
    }
  }

  // 删除缓存
  async del(key) {
    try {
      if (this.redisAvailable && client.isOpen) {
        await client.del(key)
        logger.debug(`缓存已从Redis删除: ${key}`)
      }
      
      // 同时删除内存缓存
      memoryCache.delete(key)
      logger.debug(`缓存已从内存删除: ${key}`)
      
      return true
    } catch (error) {
      logger.error(`删除缓存失败 ${key}:`, error)
      return false
    }
  }

  // 检查键是否存在
  async exists(key) {
    try {
      if (this.redisAvailable && client.isOpen) {
        const result = await client.exists(key)
        return result === 1
      }
      
      // 检查内存缓存
      const item = memoryCache.get(key)
      if (!item) return false
      
      // 检查是否过期
      if (item.expireTime && Date.now() > item.expireTime) {
        memoryCache.delete(key)
        return false
      }
      
      return true
    } catch (error) {
      logger.error(`检查缓存存在性失败 ${key}:`, error)
      return false
    }
  }

  // 设置过期时间
  async expire(key, seconds) {
    try {
      if (this.redisAvailable && client.isOpen) {
        const result = await client.expire(key, seconds)
        return result === 1
      }
      
      // 对于内存缓存，更新过期时间
      const item = memoryCache.get(key)
      if (item) {
        item.expireTime = Date.now() + seconds * 1000
        return true
      }
      
      return false
    } catch (error) {
      logger.error(`设置缓存过期时间失败 ${key}:`, error)
      return false
    }
  }

  // 清空缓存
  async flush() {
    try {
      if (this.redisAvailable && client.isOpen) {
        await client.flushDb()
        logger.info('Redis缓存已清空')
      }
      
      // 清空内存缓存
      memoryCache.clear()
      logger.info('内存缓存已清空')
      
      return true
    } catch (error) {
      logger.error('清空缓存失败:', error)
      return false
    }
  }

  // 关闭连接
  async disconnect() {
    try {
      if (client.isOpen) {
        await client.quit()
        logger.info('Redis连接已关闭')
      }
    } catch (error) {
      logger.error('关闭Redis连接失败:', error)
    }
  }

  // 获取缓存状态
  getStatus() {
    return {
      redisAvailable: this.redisAvailable,
      memoryCacheSize: memoryCache.size
    }
  }
}

// 创建单例
const cacheService = new CacheService()

module.exports = cacheService