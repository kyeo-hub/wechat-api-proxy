const { expect, request } = require('./setup');

describe('API端点测试', () => {
  describe('GET /', () => {
    it('应该返回服务器状态', (done) => {
      request()
        .get('/')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('status', 'ok');
          done();
        });
    });
  });

  describe('GET /api/token', () => {
    it('应该返回错误当缺少appid或secret', (done) => {
      request()
        .get('/api/token')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(400);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('error');
          done();
        });
    });
  });

  describe('GET /api/cache/status', () => {
    it('应该返回缓存状态', (done) => {
      request()
        .get('/api/cache/status')
        .end((err, res) => {
          expect(err).to.be.null;
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.property('success', true);
          expect(res.body.data).to.be.a('object');
          done();
        });
    });
  });
});