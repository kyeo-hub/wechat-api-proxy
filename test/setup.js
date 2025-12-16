// 测试环境设置
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

// 设置Chai
chai.use(chaiHttp);
global.expect = chai.expect;

// 测试超时设置
chai.request.addMatcher((request, response) => {
  return {
    request: request,
    response: response,
  };
});

// 全局测试配置
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // 减少测试期间的日志输出

// 导出测试工具
module.exports = {
  chai,
  request: () => chai.request(server),
};