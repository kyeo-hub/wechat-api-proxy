require("dotenv").config()
const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const axios = require("axios")
const multer = require("multer")
const FormData = require("form-data")
const fs = require("fs")
const path = require("path")
const os = require("os")

const app = express()
const PORT = process.env.PORT || 3000

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(os.tmpdir(), "wechat-proxy-uploads")
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    cb(null, tempDir)
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})
const upload = multer({ storage: storage })

// Middleware
app.use(cors())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "通用微信API代理服务器运行中" })
})

// 获取access_token
app.get("/api/token", async (req, res) => {
  try {
    const { appid, secret } = req.query

    if (!appid || !secret) {
      return res.status(400).json({ error: "缺少appid或secret参数" })
    }

    const response = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
    )

    res.json(response.data)
  } catch (error) {
    console.error("获取access_token失败:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: "获取access_token失败",
      details: error.response?.data || error.message,
    })
  }
})

// 新增草稿
app.post("/api/draft/add", async (req, res) => {
  try {
    const { access_token } = req.query

    if (!access_token) {
      return res.status(400).json({ error: "缺少access_token参数" })
    }

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${access_token}`,
      req.body
    )

    res.json(response.data)
  } catch (error) {
    console.error("新增草稿失败:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: "新增草稿失败",
      details: error.response?.data || error.message,
    })
  }
})

// 获取草稿列表
app.post("/api/draft/batchget", async (req, res) => {
  try {
    const { access_token } = req.query

    if (!access_token) {
      return res.status(400).json({ error: "缺少access_token参数" })
    }

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/draft/batchget?access_token=${access_token}`,
      req.body
    )

    res.json(response.data)
  } catch (error) {
    console.error("获取草稿列表失败:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: "获取草稿列表失败",
      details: error.response?.data || error.message,
    })
  }
})

// 获取草稿详情
app.post("/api/draft/get", async (req, res) => {
  try {
    const { access_token } = req.query

    if (!access_token) {
      return res.status(400).json({ error: "缺少access_token参数" })
    }

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/draft/get?access_token=${access_token}`,
      req.body
    )

    res.json(response.data)
  } catch (error) {
    console.error("获取草稿详情失败:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: "获取草稿详情失败",
      details: error.response?.data || error.message,
    })
  }
})

// 更新草稿
app.post("/api/draft/update", async (req, res) => {
  try {
    const { access_token } = req.query

    if (!access_token) {
      return res.status(400).json({ error: "缺少access_token参数" })
    }

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/draft/update?access_token=${access_token}`,
      req.body
    )

    res.json(response.data)
  } catch (error) {
    console.error("更新草稿失败:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: "更新草稿失败",
      details: error.response?.data || error.message,
    })
  }
})

// 删除草稿
app.post("/api/draft/delete", async (req, res) => {
  try {
    const { access_token } = req.query

    if (!access_token) {
      return res.status(400).json({ error: "缺少access_token参数" })
    }

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/draft/delete?access_token=${access_token}`,
      req.body
    )

    res.json(response.data)
  } catch (error) {
    console.error("删除草稿失败:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: "删除草稿失败",
      details: error.response?.data || error.message,
    })
  }
})

// 获取草稿总数
app.get("/api/draft/count", async (req, res) => {
  try {
    const { access_token } = req.query

    if (!access_token) {
      return res.status(400).json({ error: "缺少access_token参数" })
    }

    const response = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/draft/getcount?access_token=${access_token}`
    )

    res.json(response.data)
  } catch (error) {
    console.error("获取草稿总数失败:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: "获取草稿总数失败",
      details: error.response?.data || error.message,
    })
  }
})

// 获取永久素材
app.post("/api/material/get", async (req, res) => {
  try {
    const { access_token } = req.query

    if (!access_token) {
      return res.status(400).json({ error: "缺少access_token参数" })
    }

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/material/get_material?access_token=${access_token}`,
      req.body
    )

    res.json(response.data)
  } catch (error) {
    console.error("获取永久素材失败:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: "获取永久素材失败",
      details: error.response?.data || error.message,
    })
  }
})

// 获取永久素材总数
app.get("/api/material/count", async (req, res) => {
  try {
    const { access_token } = req.query

    if (!access_token) {
      return res.status(400).json({ error: "缺少access_token参数" })
    }

    const response = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/material/get_materialcount?access_token=${access_token}`
    )

    res.json(response.data)
  } catch (error) {
    console.error("获取永久素材总数失败:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: "获取永久素材总数失败",
      details: error.response?.data || error.message,
    })
  }
})

// 获取永久素材列表
app.post("/api/material/batchget", async (req, res) => {
  try {
    const { access_token } = req.query

    if (!access_token) {
      return res.status(400).json({ error: "缺少access_token参数" })
    }

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/material/batchget_material?access_token=${access_token}`,
      req.body
    )

    res.json(response.data)
  } catch (error) {
    console.error("获取永久素材列表失败:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: "获取永久素材列表失败",
      details: error.response?.data || error.message,
    })
  }
})

// 上传永久素材
app.post("/api/material/add", upload.single("media"), async (req, res) => {
  try {
    const { access_token, type = "image" } = req.query

    if (!access_token) {
      return res.status(400).json({ error: "缺少access_token参数" })
    }

    if (!req.file) {
      return res.status(400).json({ error: "没有上传文件" })
    }

    const formData = new FormData()
    formData.append("media", fs.createReadStream(req.file.path))
    
    // 处理视频素材的特殊参数
    if (type === "video" && req.body.title && req.body.introduction) {
      formData.append("description", JSON.stringify({
        title: req.body.title,
        introduction: req.body.introduction
      }))
    }

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${access_token}&type=${type}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    )

    // 清理临时文件
    fs.unlinkSync(req.file.path)

    res.json(response.data)
  } catch (error) {
    console.error("上传永久素材失败:", error.response?.data || error.message)

    // 清理临时文件（如果存在）
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    res.status(error.response?.status || 500).json({
      error: "上传永久素材失败",
      details: error.response?.data || error.message,
    })
  }
})

// 删除永久素材
app.post("/api/material/delete", async (req, res) => {
  try {
    const { access_token } = req.query

    if (!access_token) {
      return res.status(400).json({ error: "缺少access_token参数" })
    }

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/material/del_material?access_token=${access_token}`,
      req.body
    )

    res.json(response.data)
  } catch (error) {
    console.error("删除永久素材失败:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: "删除永久素材失败",
      details: error.response?.data || error.message,
    })
  }
})

// 上传图文消息内的图片获取URL
app.post("/api/media/uploadimg", upload.single("media"), async (req, res) => {
  try {
    const { access_token } = req.query

    if (!access_token) {
      return res.status(400).json({ error: "缺少access_token参数" })
    }

    if (!req.file) {
      return res.status(400).json({ error: "没有上传文件" })
    }

    const formData = new FormData()
    formData.append("media", fs.createReadStream(req.file.path))

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${access_token}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    )

    // 清理临时文件
    fs.unlinkSync(req.file.path)

    res.json(response.data)
  } catch (error) {
    console.error("上传图文消息内的图片失败:", error.response?.data || error.message)

    // 清理临时文件（如果存在）
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    res.status(error.response?.status || 500).json({
      error: "上传图文消息内的图片失败",
      details: error.response?.data || error.message,
    })
  }
})

// 代理图片端点（用于处理跨域问题）
app.get("/api/proxy-image", async (req, res) => {
  try {
    const { url } = req.query

    if (!url) {
      return res.status(400).json({ error: "缺少url参数" })
    }

    // 解码URL
    const decodedUrl = decodeURIComponent(url)

    // 添加请求头
    const response = await axios.get(decodedUrl, {
      responseType: "arraybuffer",
      headers: {
        Referer: "https://www.notion.so/",
        Origin: "https://www.notion.so",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    // 设置正确的内容类型
    const contentType = response.headers["content-type"]
    res.setHeader("Content-Type", contentType)

    // 允许跨域
    res.setHeader("Access-Control-Allow-Origin", "*")

    // 返回图片数据
    res.send(response.data)
  } catch (error) {
    console.error("代理图片失败:", error.message)
    res.status(500).json({
      error: "代理图片失败",
      details: error.message,
    })
  }
})

// 发布草稿
app.post("/api/publish/submit", async (req, res) => {
  try {
    const { access_token } = req.query

    if (!access_token) {
      return res.status(400).json({ error: "缺少access_token参数" })
    }

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/freepublish/submit?access_token=${access_token}`,
      req.body
    )

    res.json(response.data)
  } catch (error) {
    console.error("发布草稿失败:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: "发布草稿失败",
      details: error.response?.data || error.message,
    })
  }
})

// 获取已发布的消息列表
app.post("/api/publish/batchget", async (req, res) => {
  try {
    const { access_token } = req.query

    if (!access_token) {
      return res.status(400).json({ error: "缺少access_token参数" })
    }

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/freepublish/batchget?access_token=${access_token}`,
      req.body
    )

    res.json(response.data)
  } catch (error) {
    console.error("获取已发布消息列表失败:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: "获取已发布消息列表失败",
      details: error.response?.data || error.message,
    })
  }
})

// 获取已发布图文信息
app.post("/api/publish/get", async (req, res) => {
  try {
    const { access_token } = req.query

    if (!access_token) {
      return res.status(400).json({ error: "缺少access_token参数" })
    }

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/freepublish/getarticle?access_token=${access_token}`,
      req.body
    )

    res.json(response.data)
  } catch (error) {
    console.error("获取已发布图文信息失败:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: "获取已发布图文信息失败",
      details: error.response?.data || error.message,
    })
  }
})

// 删除已发布文章
app.post("/api/publish/delete", async (req, res) => {
  try {
    const { access_token } = req.query

    if (!access_token) {
      return res.status(400).json({ error: "缺少access_token参数" })
    }

    const response = await axios.post(
      `https://api.weixin.qq.com/cgi-bin/freepublish/delete?access_token=${access_token}`,
      req.body
    )

    res.json(response.data)
  } catch (error) {
    console.error("删除已发布文章失败:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: "删除已发布文章失败",
      details: error.response?.data || error.message,
    })
  }
})

// 通用API代理端点，用于处理未特别实现的API
app.all("/api/proxy/*", async (req, res) => {
  try {
    const { access_token } = req.query
    const path = req.originalUrl.replace(/^\/api\/proxy\//, '')
    
    if (!access_token) {
      return res.status(400).json({ error: "缺少access_token参数" })
    }

    // 构建完整URL
    let url = `https://api.weixin.qq.com/${path}?access_token=${access_token}`
    
    // 如果请求是GET，我们需要将查询参数合并
    if (req.method === 'GET') {
      const originalQuery = { ...req.query }
      delete originalQuery.access_token // 移除已添加的access_token
      
      const searchParams = new URLSearchParams(originalQuery).toString()
      if (searchParams) {
        url += '&' + searchParams
      }
      
      const response = await axios.get(url, { 
        headers: req.headers,
        params: req.query 
      })
      
      res.json(response.data)
    } else if (req.method === 'POST') {
      const response = await axios.post(
        url,
        req.body,
        { headers: req.headers }
      )
      
      res.json(response.data)
    }
  } catch (error) {
    console.error("API代理失败:", error.response?.data || error.message)
    res.status(error.response?.status || 500).json({
      error: "API代理失败",
      details: error.response?.data || error.message,
    })
  }
})

// 一键发布图文消息（复合接口）
app.post("/api/publish-news", upload.single("thumb_media"), async (req, res) => {
  try {
    const { access_token, title, content, author, digest, content_source_url, need_open_comment = 0, only_fans_can_comment = 0 } = req.query

    if (!access_token || !title || !content) {
      return res.status(400).json({ error: "缺少必要参数：access_token、title或content" })
    }

    let thumb_media_id = null

    // 第一步：如果有上传封面图片，则上传图片获取media_id
    if (req.file) {
      try {
        const formData = new FormData()
        formData.append("media", fs.createReadStream(req.file.path))

        const uploadResponse = await axios.post(
          `https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${access_token}&type=image`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
          }
        )

        thumb_media_id = uploadResponse.data.media_id
        console.log("图片上传成功，media_id:", thumb_media_id)
      } catch (uploadError) {
        console.error("上传封面图片失败:", uploadError.response?.data || uploadError.message)
        // 清理临时文件
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path)
        }
        return res.status(500).json({
          error: "上传封面图片失败",
          details: uploadError.response?.data || uploadError.message,
        })
      }

      // 清理临时文件
      fs.unlinkSync(req.file.path)
    }

    // 第二步：创建草稿
    try {
      const draftData = {
        articles: [
          {
            title,
            content,
            author: author || "",
            digest: digest || "",
            content_source_url: content_source_url || "",
            thumb_media_id,
            need_open_comment: parseInt(need_open_comment),
            only_fans_can_comment: parseInt(only_fans_can_comment),
          },
        ],
      }

      const draftResponse = await axios.post(
        `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${access_token}`,
        draftData
      )

      const media_id = draftResponse.data.media_id
      console.log("草稿创建成功，media_id:", media_id)

      // 第三步：发布草稿
      try {
        const publishResponse = await axios.post(
          `https://api.weixin.qq.com/cgi-bin/freepublish/submit?access_token=${access_token}`,
          { media_id }
        )

        console.log("图文消息发布成功")
        return res.json({
          success: true,
          message: "图文消息发布成功",
          publish_id: publishResponse.data.publish_id,
          media_id: media_id,
          thumb_media_id: thumb_media_id,
        })
      } catch (publishError) {
        console.error("发布草稿失败:", publishError.response?.data || publishError.message)
        return res.status(500).json({
          error: "发布草稿失败",
          details: publishError.response?.data || publishError.message,
          media_id: media_id, // 返回已创建的草稿ID，用户可以手动发布
        })
      }
    } catch (draftError) {
      console.error("创建草稿失败:", draftError.response?.data || draftError.message)
      return res.status(500).json({
        error: "创建草稿失败",
        details: draftError.response?.data || draftError.message,
      })
    }
  } catch (error) {
    console.error("一键发布图文消息失败:", error.response?.data || error.message)

    // 清理临时文件（如果存在）
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    res.status(500).json({
      error: "一键发布图文消息失败",
      details: error.response?.data || error.message,
    })
  }
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`通用微信API代理服务器运行在端口 ${PORT}`)
})