# CI/CD 流程指南

本文档介绍了微信API代理服务器的持续集成和持续部署流程。

## 概述

我们使用GitHub Actions作为CI/CD平台，实现了以下自动化流程：

1. **代码质量检查** - ESLint、Prettier格式检查
2. **自动化测试** - 单元测试和覆盖率报告
3. **安全扫描** - 依赖漏洞和容器镜像安全扫描
4. **自动构建** - Docker镜像构建和多平台支持
5. **自动部署** - 多环境部署和健康检查

## 工作流程

### 推送到开发分支 (develop)

当您推送代码到`develop`分支时，会触发以下流程：

1. **代码质量检查**
   - ESLint代码规范检查
   - Prettier格式检查
   - 代码风格统一

2. **自动化测试**
   - 运行单元测试
   - 生成测试覆盖率报告

3. **安全扫描**
   - 依赖漏洞扫描
   - 容器镜像安全扫描

4. **构建Docker镜像**
   - 构建多平台Docker镜像（AMD64和ARM64）
   - 推送到GitHub Container Registry

5. **部署到开发环境**
   - 自动部署到开发环境
   - 执行健康检查

### 推送到主分支 (main)

当您推送代码到`main`分支时，会触发与开发分支相同的流程，但最后一步是部署到生产环境。

### 创建标签 (Release)

当您创建版本标签（如`v1.0.0`）时，会触发发布流程：

1. **创建GitHub Release**
   - 自动生成变更日志
   - 创建Release页面

2. **构建和发布Docker镜像**
   - 构建带有版本标签的Docker镜像
   - 推送到GitHub Container Registry

3. **部署到生产环境**
   - 部署指定版本到生产环境
   - 执行冒烟测试
   - 发送部署通知

4. **更新文档**
   - 更新API文档
   - 部署文档网站

## 本地开发设置

### 前置条件

1. 安装Node.js (v18或更高版本)
2. 安装Docker
3. 安装Git

### 设置步骤

1. 克隆仓库：
   ```bash
   git clone <repository-url>
   cd wechat-api-proxy
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 设置Git钩子：
   ```bash
   npm run prepare
   ```

4. 启动开发服务器：
   ```bash
   npm run dev
   ```

### 代码质量检查

在提交代码前，请运行以下命令：

```bash
# 检查代码规范
npm run lint:check

# 检查代码格式
npm run format:check

# 运行测试
npm test

# 生成测试覆盖率报告
npm run test:coverage
```

### 修复代码问题

```bash
# 自动修复ESLint问题
npm run lint:fix

# 自动格式化代码
npm run format
```

## 部署指南

### 手动触发部署

您可以通过GitHub界面手动触发部署：

1. 进入Actions页面
2. 选择"Release"工作流
3. 点击"Run workflow"
4. 选择目标环境和版本

### 使用部署脚本

如果您有直接访问服务器的权限，可以使用部署脚本：

```bash
# 部署到生产环境
./scripts/deploy.sh deploy

# 回滚到上一版本
./scripts/deploy.sh rollback

# 执行健康检查
./scripts/deploy.sh health
```

### 环境变量

部署脚本需要以下环境变量：

```bash
export TARGET_HOST=your-server.com
export TARGET_USER=your-username
export IMAGE_TAG=v1.0.0
export REDIS_PASSWORD=your-redis-password
```

## Caddy配置

我们使用Caddy作为反向代理和HTTPS终端，相比Nginx，Caddy提供了更简单的配置和自动HTTPS证书管理。

### Caddy主要特点

1. **自动HTTPS** - 自动获取和续期SSL证书
2. **简单配置** - 使用Caddyfile进行声明式配置
3. **内置健康检查** - 对后端服务进行健康检查
4. **低资源占用** - 相比Nginx更轻量级

### 配置文件

`caddy/Caddyfile` - 主配置文件，包含：
- 全局设置（日志、HTTPS等）
- 站点配置（API代理、静态文件等）
- CORS和安全头设置

### 自定义配置

如果您需要自定义Caddy配置：

1. 修改`caddy/Caddyfile.template`文件
2. 运行初始化脚本：
   ```bash
   ./scripts/setup-caddy.sh init
   ```

### 证书管理

Caddy会自动从Let's Encrypt获取和续期证书。如果您需要手动触发证书获取：

```bash
./scripts/setup-caddy.sh cert
```

## 监控和告警

### 健康检查

Docker容器包含内置的健康检查：

```bash
# 手动执行健康检查
docker exec wechat-api-proxy node healthcheck.js
```

### 日志查看

```bash
# 查看容器日志
docker logs wechat-api-proxy

# 查看应用日志
docker exec wechat-api-proxy tail -f logs/combined.log
```

### 性能监控

应用提供了内置的缓存状态API：

```bash
# 查看缓存状态
curl http://localhost:3000/api/cache/status
```

## 故障排除

### 部署失败

如果部署失败，请检查：

1. **环境变量**：确保所有必要的环境变量已设置
2. **网络连接**：确保可以访问GitHub Container Registry
3. **资源限制**：确保服务器有足够的资源
4. **配置文件**：确保Docker Compose文件正确

### 回滚

如果新版本有问题，可以使用以下方法回滚：

1. **GitHub界面**：
   - 进入Actions页面
   - 找到成功的部署工作流
   - 点击"Re-run jobs"

2. **部署脚本**：
   ```bash
   ./scripts/deploy.sh rollback
   ```

3. **手动回滚**：
   ```bash
   # 切换到上一个Docker镜像标签
   docker pull wechat-api-proxy:previous-tag
   docker-compose up -d
   ```

## 最佳实践

1. **分支策略**：
   - 使用`develop`分支进行开发
   - 使用`main`分支进行生产发布
   - 创建功能分支进行新功能开发

2. **提交信息**：
   - 使用清晰的提交信息
   - 遵循约定式提交规范

3. **代码审查**：
   - 所有代码必须经过代码审查
   - 确保CI/CD流程通过

4. **版本管理**：
   - 使用语义化版本控制
   - 创建标签进行发布

5. **监控**：
   - 定期检查部署状态
   - 监控应用性能和错误率

## 联系支持

如果您在CI/CD流程中遇到问题，请：

1. 检查Actions页面的错误信息
2. 查看相关文档和FAQ
3. 在GitHub上创建Issue
4. 联系开发团队