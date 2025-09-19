# BMNR Tracker Proxy

简单的EdgeOne Functions代理服务器，用于代理访问trackbmnr.com。

## 功能

- 🔗 代理访问trackbmnr.com
- 🌐 CORS支持
- 🔧 调试信息
- 💊 健康检查

## 路由

- `/` - 首页
- `/proxy` - 代理到trackbmnr.com
- `/health` - 健康检查
- `/debug` - 调试信息
- `/test` - 功能测试

## 部署

项目使用EdgeOne Functions部署，入口文件为 `node-functions/index.js`。

## 使用

访问 `/proxy` 路径即可代理到目标网站：
```
https://your-domain.edgeone.app/proxy
```

## 许可证

MIT