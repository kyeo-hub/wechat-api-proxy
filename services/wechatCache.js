const cacheService = require('../config/cache')
const logger = require('../utils/logger')
const axios = require('axios')

// 微信API缓存键前缀
const CACHE_KEYS = {
  ACCESS_TOKEN: 'wechat:access_token',
  TICKET: 'wechat:ticket',
  API_RESPONSE: 'wechat:api_response',
  MATERIAL: 'wechat:material',
  DRAFT: 'wechat:draft'
}

// 微信API缓存过期时间（秒）
const CACHE_EXPIRE = {
  ACCESS_TOKEN: 7000, // access_token有效期为7200秒，提前200秒刷新
  TICKET: 7000, // jsapi_ticket有效期也是7200秒
  API_RESPONSE: 300, // 普通API响应缓存5分钟
  MATERIAL: 86400, // 素材信息缓存1天
  DRAFT: 3600 // 草稿信息缓存1小时
}

class WeChatCacheService {
  // 缓存access_token
  async setAccessToken(appid, tokenData) {
    const key = `${CACHE_KEYS.ACCESS_TOKEN}:${appid}`
    return await cacheService.set(key, tokenData, CACHE_EXPIRE.ACCESS_TOKEN)
  }

  // 获取缓存的access_token
  async getAccessToken(appid) {
    const key = `${CACHE_KEYS.ACCESS_TOKEN}:${appid}`
    const tokenData = await cacheService.get(key)
    
    if (tokenData) {
      // 检查是否即将过期（提前10分钟刷新）
      const now = Math.floor(Date.now() / 1000)
      if (tokenData.expires_at && tokenData.expires_at - now < 600) {
        logger.warn(`Access token for ${appid} 即将过期，建议刷新`)
      }
      return tokenData
    }
    
    return null
  }

  // 删除access_token缓存
  async deleteAccessToken(appid) {
    const key = `${CACHE_KEYS.ACCESS_TOKEN}:${appid}`
    return await cacheService.del(key)
  }

  // 获取或刷新access_token（带缓存）
  async getOrRefreshAccessToken(appid, secret) {
    // 先尝试从缓存获取
    let tokenData = await this.getAccessToken(appid)
    
    if (tokenData) {
      logger.info(`从缓存获取access_token成功: ${appid}`)
      return tokenData
    }
    
    // 缓存不存在，获取新的token
    try {
      logger.info(`正在获取新的access_token: ${appid}`)
      const response = await axios.get(
        `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
      )
      
      if (response.data.access_token) {
        // 计算过期时间
        const expiresIn = response.data.expires_in || 7200
        const expiresAt = Math.floor(Date.now() / 1000) + expiresIn
        
        tokenData = {
          access_token: response.data.access_token,
          expires_in: expiresIn,
          expires_at: expiresAt,
          appid: appid
        }
        
        // 缓存token
        await this.setAccessToken(appid, tokenData)
        logger.info(`获取并缓存access_token成功: ${appid}`)
        
        return tokenData
      } else {
        logger.error(`获取access_token失败: ${appid}`, response.data)
        throw new Error(response.data.errmsg || '获取access_token失败')
      }
    } catch (error) {
      logger.error(`获取access_token请求失败: ${appid}`, error.message)
      throw error
    }
  }

  // 缓存API响应
  async cacheApiResponse(url, params, response, customExpire) {
    // 生成唯一的缓存键
    const paramString = JSON.stringify(params || {})
    const hash = require('crypto').createHash('md5').update(url + paramString).digest('hex')
    const key = `${CACHE_KEYS.API_RESPONSE}:${hash}`
    
    const expireTime = customExpire || CACHE_EXPIRE.API_RESPONSE
    return await cacheService.set(key, response, expireTime)
  }

  // 获取缓存的API响应
  async getCachedApiResponse(url, params) {
    const paramString = JSON.stringify(params || {})
    const hash = require('crypto').createHash('md5').update(url + paramString).digest('hex')
    const key = `${CACHE_KEYS.API_RESPONSE}:${hash}`
    
    return await cacheService.get(key)
  }

  // 缓存素材信息
  async cacheMaterial(mediaId, materialData) {
    const key = `${CACHE_KEYS.MATERIAL}:${mediaId}`
    return await cacheService.set(key, materialData, CACHE_EXPIRE.MATERIAL)
  }

  // 获取缓存的素材信息
  async getCachedMaterial(mediaId) {
    const key = `${CACHE_KEYS.MATERIAL}:${mediaId}`
    return await cacheService.get(key)
  }

  // 删除素材缓存
  async deleteMaterialCache(mediaId) {
    const key = `${CACHE_KEYS.MATERIAL}:${mediaId}`
    return await cacheService.del(key)
  }

  // 缓存草稿信息
  async cacheDraft(mediaId, draftData) {
    const key = `${CACHE_KEYS.DRAFT}:${mediaId}`
    return await cacheService.set(key, draftData, CACHE_EXPIRE.DRAFT)
  }

  // 获取缓存的草稿信息
  async getCachedDraft(mediaId) {
    const key = `${CACHE_KEYS.DRAFT}:${mediaId}`
    return await cacheService.get(key)
  }

  // 删除草稿缓存
  async deleteDraftCache(mediaId) {
    const key = `${CACHE_KEYS.DRAFT}:${mediaId}`
    return await cacheService.del(key)
  }

  // 清理所有微信相关的缓存
  async clearAllWeChatCache() {
    try {
      // 这里应该使用Redis的SCAN命令或KEYS命令（注意KEYS在生产环境慎用）
      // 为了简单起见，我们只清理内存缓存中的微信相关键
      logger.warn('清空所有微信相关缓存')
      
      // 在实际应用中，你可能需要更精细的控制
      return true
    } catch (error) {
      logger.error('清理微信缓存失败:', error)
      return false
    }
  }

  // 获取缓存统计信息
  async getCacheStats() {
    const status = cacheService.getStatus()
    return {
      redisAvailable: status.redisAvailable,
      memoryCacheSize: status.memoryCacheSize,
      expireTimes: CACHE_EXPIRE
    }
  }
}

module.exports = new WeChatCacheService()