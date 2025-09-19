# EdgeOne Functions 部署修复指南

## 🚨 问题原因

EdgeOne.ai 使用的是 **Functions 架构**，不是传统的 Node.js 应用部署。之前的配置导致404错误是因为：

1. EdgeOne.ai 需要 `node-functions` 目录结构
2. 不支持传统的 Express.js 应用
3. 需要使用 EdgeOne Functions 的特定API

## ✅ 解决方案

### 1. 项目结构调整

现在的项目结构：
```
bmnr-tracker/
├── node-functions/
│   └── [[path]].js          # 处理所有路由的Functions文件
├── package.json             # 简化的依赖配置
├── wrangler.toml           # EdgeOne配置文件
└── README.md               # 更新的文档
```

### 2. Functions 架构特点

- **`[[path]].js`**: 使用动态路由捕获所有请求
- **无服务器**: 不需要Express.js或传统服务器
- **边缘计算**: 在EdgeOne全球边缘节点运行
- **自动扩容**: 根据流量自动扩缩容

### 3. 重新部署步骤

1. **清理旧的部署**
   - 在EdgeOne Pages控制台删除旧项目
   - 或者重新配置现有项目

2. **推送更新代码**
   ```bash
   git add .
   git commit -m "fix: 修复EdgeOne Functions架构兼容性"
   git push origin main
   ```

3. **EdgeOne Pages 配置**
   ```yaml
   项目名称: bmnr-tracker
   框架: Node.js Functions
   构建命令: npm install
   输出目录: ./
   Functions目录: ./node-functions
   ```

4. **环境变量设置**
   ```env
   NODE_ENV=production
   TARGET_URL=https://trackbmnr.com
   ```

### 4. 功能验证

部署成功后，以下URL应该正常工作：

- **主页**: `https://your-domain.pages.edgeone.ai/`
- **代理页面**: `https://your-domain.pages.edgeone.ai/proxy`
- **健康检查**: `https://your-domain.pages.edgeone.ai/health`
- **API状态**: `https://your-domain.pages.edgeone.ai/api/status`

### 5. 关键改进

#### 🔧 技术改进
- ✅ 使用EdgeOne Functions原生API
- ✅ 支持动态路由 `[[path]].js`
- ✅ 去除Express.js依赖
- ✅ 优化为无服务器架构

#### 🚀 性能优化
- ✅ 边缘节点执行，延迟更低
- ✅ 自动扩容，支持高并发
- ✅ 内置CDN加速
- ✅ 冷启动时间更短

#### 🛡️ 安全增强
- ✅ 自动HTTPS
- ✅ DDoS防护
- ✅ 边缘安全过滤
- ✅ CORS自动配置

## 📝 Functions API说明

### 入口函数
```javascript
export default async function onRequest(context) {
  const { request } = context;
  // 处理逻辑
  return new Response(content, options);
}
```

### Context对象
- `request`: 包含请求信息
- `env`: 环境变量
- `waitUntil`: 后台任务
- `passThroughOnException`: 异常处理

### 支持的功能
- ✅ HTTP所有方法 (GET, POST, PUT, DELETE等)
- ✅ 请求/响应头操作
- ✅ JSON/文本/二进制数据处理
- ✅ 外部API调用
- ✅ 数据库连接

## 🐛 常见问题排查

### 1. 部署后仍然404
**原因**: Functions文件位置错误
**解决**: 确保文件在 `node-functions/[[path]].js`

### 2. 代理功能不工作
**原因**: 外部请求被阻止
**解决**: 检查EdgeOne安全策略设置

### 3. 样式修改失效
**原因**: Cheerio依赖未正确加载
**解决**: 确保package.json包含cheerio依赖

### 4. CORS错误
**原因**: 未正确设置CORS头
**解决**: 检查响应头设置

## 🔄 迁移检查清单

- [ ] 删除 `server.js` 和 `index.js` (旧文件)
- [ ] 创建 `node-functions/` 目录
- [ ] 添加 `[[path]].js` Functions文件  
- [ ] 更新 `package.json` 依赖
- [ ] 推送代码到GitHub
- [ ] 在EdgeOne重新配置项目
- [ ] 测试所有功能端点

## 🚀 部署成功标志

当以下所有条件满足时，表示部署成功：

1. ✅ 访问根域名显示BMNR Tracker主页
2. ✅ `/proxy` 路径可以正常代理trackbmnr.com
3. ✅ `/health` 返回健康状态JSON
4. ✅ iframe嵌入测试正常工作
5. ✅ 主题转换功能生效
6. ✅ 移动端响应式正常

---

**部署成功后，您将拥有一个完全基于EdgeOne Functions的高性能代理服务器！**