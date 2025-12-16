// 预启动检查脚本
const fs = require('fs');
const path = require('path');
const os = require('os');
const logger = require('../utils/logger');

function checkEnvironmentVariables() {
  const requiredEnvVars = ['PORT'];
  const optionalEnvVars = [
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_PASSWORD',
    'REDIS_DB',
    'LOG_LEVEL',
    'NODE_ENV'
  ];
  
  // 检查必需的环境变量
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    logger.error(`缺少必需的环境变量: ${missingVars.join(', ')}`);
    logger.error('请检查.env文件或设置这些环境变量');
    return false;
  }
  
  // 显示可选的环境变量状态
  const varStatus = optionalEnvVars.map(varName => {
    const value = process.env[varName];
    return {
      name: varName,
      set: value !== undefined,
      value: varName.includes('PASSWORD') ? '[已设置]' : (value || '[未设置]')
    };
  });
  
  logger.info('环境变量状态:');
  varStatus.forEach(({ name, set, value }) => {
    const status = set ? '✓' : '○';
    logger.info(`  ${status} ${name}: ${value}`);
  });
  
  return true;
}

function checkDirectories() {
  // 检查并创建必要的目录
  const directories = [
    'logs',
    path.join(os.tmpdir(), 'wechat-proxy-uploads')
  ];
  
  let allDirsExist = true;
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        logger.info(`创建目录: ${dir}`);
      } catch (error) {
        logger.error(`无法创建目录 ${dir}:`, error.message);
        allDirsExist = false;
      }
    } else {
      logger.debug(`目录已存在: ${dir}`);
    }
  });
  
  return allDirsExist;
}

function main() {
  logger.info('执行预启动检查...');
  
  const envCheck = checkEnvironmentVariables();
  const dirCheck = checkDirectories();
  
  if (envCheck && dirCheck) {
    logger.info('预启动检查通过');
    return true;
  } else {
    logger.error('预启动检查失败');
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const success = main();
  process.exit(success ? 0 : 1);
}

module.exports = { main };