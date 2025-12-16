# 通用微信API代理服务器

一个功能全面的微信API代理服务器，支持微信公众号草稿管理、素材管理等功能，并解决跨域问题。

## 功能特性

- 获取access_token
- 草稿管理（新增、获取、更新、删除、获取草稿总数）
- 素材管理（上传、获取、删除、获取素材列表、获取素材总数）
- 发布管理（发布草稿、获取已发布消息、删除已发布文章）
- 图文消息内的图片上传
- 图片代理（解决跨域问题）
- 通用API代理（支持未特别实现的API）
- CORS支持

## 安装与配置

1. 克隆仓库
2. 安装依赖：
   ```
   npm install
   ```
3. 创建 `.env` 文件（参考 `.env.example`）
4. 启动服务器：
   ```
   npm start
   ```
   或使用开发模式：
   ```
   npm run dev
   ```

## API接口

### 获取访问令牌

```
GET /api/token?appid=YOUR_APPID&secret=YOUR_SECRET
```

### 草稿管理

#### 新增草稿
```
POST /api/draft/add?access_token=YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "articles": [
    {
      "title": "文章标题",
      "content": "文章内容",
      "thumb_media_id": "封面图片素材ID",
      "author": "作者名",
      "digest": "文章摘要",
      "content_source_url": "原文链接",
      "need_open_comment": 0,
      "only_fans_can_comment": 0
    }
  ]
}
```

#### 获取草稿列表
```
POST /api/draft/batchget?access_token=YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "offset": 0,
  "count": 20,
  "no_content": 0
}
```

#### 获取草稿详情
```
POST /api/draft/get?access_token=YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "media_id": "草稿ID"
}
```

#### 更新草稿
```
POST /api/draft/update?access_token=YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "media_id": "草稿ID",
  "index": 0,
  "articles": [...]
}
```

#### 删除草稿
```
POST /api/draft/delete?access_token=YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "media_id": "草稿ID"
}
```

#### 获取草稿总数
```
GET /api/draft/count?access_token=YOUR_ACCESS_TOKEN
```

### 素材管理

#### 获取永久素材
```
POST /api/material/get?access_token=YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "media_id": "素材ID"
}
```

#### 获取永久素材总数
```
GET /api/material/count?access_token=YOUR_ACCESS_TOKEN
```

#### 获取永久素材列表
```
POST /api/material/batchget?access_token=YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "type": "image",
  "offset": 0,
  "count": 20
}
```

#### 上传永久素材
```
POST /api/material/add?access_token=YOUR_ACCESS_TOKEN&type=image
Content-Type: multipart/form-data

media: [FILE]

// 对于视频素材，还需额外提交：
// title: 视频标题
// introduction: 视频简介
```

#### 删除永久素材
```
POST /api/material/delete?access_token=YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "media_id": "素材ID"
}
```

#### 上传图文消息内的图片获取URL
```
POST /api/media/uploadimg?access_token=YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data

media: [FILE]
```

### 发布管理

#### 发布草稿
```
POST /api/publish/submit?access_token=YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "media_id": "草稿ID"
}
```

#### 获取已发布的消息列表
```
POST /api/publish/batchget?access_token=YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "offset": 0,
  "count": 20,
  "no_content": 0
}
```

#### 获取已发布图文信息
```
POST /api/publish/get?access_token=YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "article_id": "文章ID"
}
```

#### 删除已发布文章
```
POST /api/publish/delete?access_token=YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "article_id": "文章ID",
  "index": 0
}
```

### 其他功能

#### 图片代理（解决跨域问题）
```
GET /api/proxy-image?url=ENCODED_IMAGE_URL
```

#### 通用API代理
```
GET/POST /api/proxy/{WECHAT_API_PATH}?access_token=YOUR_ACCESS_TOKEN
```

## 一键发布图文消息

为了方便使用，我们还提供了一个复合接口，可以将上传图片、创建草稿和发布三个步骤合并为一个请求：

```
POST /api/publish-news?access_token=YOUR_ACCESS_TOKEN&title=文章标题&content=文章内容&author=作者&digest=摘要&content_source_url=原文链接&need_open_comment=0&only_fans_can_comment=0
Content-Type: multipart/form-data

thumb_media: [封面图片文件，可选]
```

### 参数说明：

- `access_token`: 访问令牌（必需）
- `title`: 文章标题（必需）
- `content`: 文章内容，支持HTML标签（必需）
- `author`: 作者（可选）
- `digest`: 文章摘要（可选，如果不提供则默认截取正文前54个字）
- `content_source_url`: 原文链接（可选）
- `need_open_comment`: 是否打开评论，0不打开(默认)，1打开（可选）
- `only_fans_can_comment`: 是否粉丝才可评论，0所有人可评论(默认)，1粉丝才可评论（可选）
- `thumb_media`: 封面图片文件（可选，如果不提供则需要在其他地方先上传图片并获取thumb_media_id）

### 返回结果：

成功时返回：
```json
{
  "success": true,
  "message": "图文消息发布成功",
  "publish_id": "发布ID",
  "media_id": "草稿ID",
  "thumb_media_id": "封面图片ID"
}
```

## 部署

### 使用Docker

构建Docker镜像：
```
docker build -t wechat-api-proxy .
```

运行容器：
```
docker run -p 3000:3000 wechat-api-proxy
```

### 使用Docker Compose

```
docker-compose up
```

### 部署到Vercel

此服务器也可以部署到Vercel：

1. 使用Vercel CLI部署：
   ```
   vercel
   ```

## 错误处理

所有API端点都包含错误处理，如果微信API返回错误，代理服务器会将错误信息连同状态码一起返回。错误响应格式：

```json
{
  "error": "错误描述",
  "details": "详细错误信息"
}
```

## 注意事项

- 此代理服务器仅用于解决跨域问题，不应在生产环境中暴露访问令牌
- 上传的文件会存储在临时目录，处理完成后会自动删除
- 所有请求都会记录在控制台（使用morgan中间件）