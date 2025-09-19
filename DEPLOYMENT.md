# EdgeOne.ai 部署指南

本文档提供在EdgeOne.ai平台上部署BMNR Tracker的详细步骤和最佳实践。

## 🚀 快速部署

### 步骤1：准备GitHub仓库

1. **上传代码到GitHub**
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for EdgeOne deployment"
   git branch -M main
   git remote add origin https://github.com/yourusername/bmnr-tracker.git
   git push -u origin main
   ```

2. **确保项目结构正确**
   ```
   bmnr-tracker/
   ├── server.js              # ✅ 主服务器文件
   ├── package.json           # ✅ 包含正确的scripts
   ├── edgeone.config.js      # ✅ EdgeOne配置
   ├── vercel.json           # ✅ 备用配置
   └── README.md             # ✅ 项目文档
   ```

### 步骤2：EdgeOne Pages部署

1. **访问控制台**
   - 打开 [EdgeOne Pages](https://pages.edgeone.ai)
   - 使用GitHub账号登录

2. **创建新项目**
   - 点击 "创建项目"
   - 选择 "从GitHub导入"
   - 授权访问您的仓库

3. **配置部署设置**
   ```yaml
   项目名称: bmnr-tracker
   框架: Node.js
   构建命令: npm run build
   启动命令: npm start
   输出目录: ./
   Node.js版本: 18.x
   ```

4. **环境变量配置**
   ```env
   NODE_ENV=production
   TARGET_URL=https://trackbmnr.com
   PORT=3000
   ```

5. **部署设置**
   - 分支: main
   - 自动部署: 启用
   - 预览部署: 启用

### 步骤3：验证部署

1. **访问部署URL**
   ```
   https://your-project.pages.edgeone.ai
   ```

2. **健康检查**
   ```bash
   curl https://your-project.pages.edgeone.ai/health
   ```

3. **测试代理功能**
   ```
   https://your-project.pages.edgeone.ai/proxy
   ```

## 🔧 高级配置

### 自定义域名

1. **添加自定义域名**
   - 在EdgeOne控制台中添加域名
   - 配置DNS CNAME记录
   - 启用HTTPS证书

2. **DNS配置示例**
   ```
   类型: CNAME
   名称: tracker (或 @)
   值: your-project.pages.edgeone.ai
   TTL: 300
   ```

### 性能优化

1. **缓存策略**
   ```javascript
   // 在edgeone.config.js中配置
   staticFiles: {
     headers: {
       '**/*.{js,css,png,jpg,jpeg,gif,ico,svg}': {
         'Cache-Control': 'public, max-age=86400'
       }
     }
   }
   ```

2. **压缩配置**
   ```javascript
   optimization: {
     compress: true,
     http2: true,
     edgeCache: true
   }
   ```

### 安全配置

1. **安全头设置**
   ```javascript
   security: {
     headers: {
       'X-Content-Type-Options': 'nosniff',
       'X-XSS-Protection': '1; mode=block',
       'Referrer-Policy': 'strict-origin-when-cross-origin'
     }
   }
   ```

2. **CORS配置**
   ```javascript
   '/proxy/**': {
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
   }
   ```

## 📊 监控和日志

### 日志配置

1. **启用日志收集**
   ```javascript
   monitoring: {
     performance: true,
     errorTracking: true,
     logLevel: 'info'
   }
   ```

2. **自定义日志**
   ```javascript
   console.log(`[${new Date().toISOString()}] Request: ${req.method} ${req.path}`);
   ```

### 性能监控

1. **关键指标**
   - 响应时间
   - 内存使用率
   - CPU使用率
   - 错误率

2. **监控端点**
   ```javascript
   app.get('/metrics', (req, res) => {
     res.json({
       uptime: process.uptime(),
       memory: process.memoryUsage(),
       timestamp: new Date().toISOString()
     });
   });
   ```

## 🔄 CI/CD配置

### 自动部署

EdgeOne Pages自动检测GitHub推送并触发部署：

```yaml
# .github/workflows/deploy.yml
name: Deploy to EdgeOne
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
    - name: Deploy to EdgeOne
      run: echo "EdgeOne auto-deployment triggered"
```

### 分支部署策略

1. **生产环境** (main分支)
   - 自动部署到生产域名
   - 完整的性能优化
   - 启用监控和日志

2. **预览环境** (feature分支)
   - 自动创建预览URL
   - 基础功能测试
   - 开发者调试模式

## 🚨 故障排除

### 常见部署问题

1. **构建失败**
   ```bash
   # 检查package.json中的scripts
   {
     "scripts": {
       "start": "node server.js",
       "build": "echo 'No build needed'"
     }
   }
   ```

2. **启动失败**
   ```bash
   # 检查端口配置
   const PORT = process.env.PORT || 3000;
   ```

3. **依赖问题**
   ```bash
   # 确保package.json包含所有依赖
   npm ls --production
   ```

### 调试技巧

1. **查看部署日志**
   - 在EdgeOne控制台查看构建日志
   - 检查启动日志中的错误信息

2. **本地测试**
   ```bash
   # 模拟生产环境
   NODE_ENV=production npm start
   ```

3. **网络问题**
   ```bash
   # 测试目标网站连通性
   curl -I https://trackbmnr.com
   ```

## 📈 扩展和优化

### 区域部署

```javascript
// 配置多区域部署
regions: [
  'asia-east1',     // 亚洲东部 - 主要用户群体
  'us-west1',       // 美国西部 - 备用区域
  'europe-west1'    // 欧洲西部 - 全球覆盖
]
```

### 负载均衡

EdgeOne.ai自动提供负载均衡，无需额外配置。

### 缓存优化

```javascript
// 智能缓存策略
app.use((req, res, next) => {
  if (req.path.startsWith('/proxy')) {
    res.set('Cache-Control', 'public, max-age=300'); // 5分钟
  } else if (req.path.startsWith('/api')) {
    res.set('Cache-Control', 'no-cache');
  }
  next();
});
```

## 🔐 安全最佳实践

### 环境变量管理

```env
# 生产环境变量
NODE_ENV=production
TARGET_URL=https://trackbmnr.com

# 安全相关
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

### 访问控制

```javascript
// IP白名单（可选）
const allowedIPs = process.env.ALLOWED_IPS?.split(',') || [];

app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
});
```

### HTTPS强制

EdgeOne.ai自动提供HTTPS，无需额外配置。

## 📚 参考资源

- [EdgeOne Pages官方文档](https://pages.edgeone.ai/document)
- [Node.js部署指南](https://pages.edgeone.ai/document/framework-nodejs)
- [EdgeOne.ai定价](https://edgeone.ai/pricing)
- [技术支持](https://edgeone.ai/support)

## 🆘 获取帮助

如果在部署过程中遇到问题：

1. 查看[EdgeOne Pages文档](https://pages.edgeone.ai/document)
2. 检查[GitHub Issues](https://github.com/yourusername/bmnr-tracker/issues)
3. 联系EdgeOne技术支持
4. 在项目仓库提交Issue

---

**部署成功后，您将获得：**
- 🌍 全球CDN加速访问
- 🔒 自动HTTPS证书
- 📊 性能监控面板
- 🚀 毫秒级响应时间
- 💰 免费使用额度