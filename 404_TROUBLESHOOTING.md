# EdgeOne.ai 404错误详细排查指南

## 🚨 当前问题状态
您的项目部署后仍然显示404错误，让我们逐步排查和解决。

## 📋 排查检查清单

### 1. EdgeOne控制台检查

#### 1.1 项目状态检查
- [ ] 访问 [EdgeOne Pages控制台](https://pages.edgeone.ai)
- [ ] 确认项目部署状态显示为 "部署成功" 或 "运行中"
- [ ] 检查是否有任何错误信息或警告

#### 1.2 构建日志检查
```bash
# 在控制台查看构建日志，寻找以下信息：
✅ Build completed successfully
✅ Functions detected
✅ Deployment successful
❌ 如果看到错误，记录具体错误信息
```

#### 1.3 Functions配置验证
- [ ] 确认Functions类型选择：`Node Functions` 或 `Edge Functions`
- [ ] 检查Functions目录设置：`./node-functions` 或 `./edge-functions`
- [ ] 验证构建命令：留空或 `npm install`

### 2. 代码结构验证

#### 2.1 当前项目结构
```
bmnr-tracker/
├── node-functions/
│   ├── index.js          # 简单测试文件
│   └── [[path]].js       # 动态路由处理
├── edge-functions/       # 备选方案
│   └── [[path]].js
├── package.json          # 最简化配置
└── 404_TROUBLESHOOTING.md
```

#### 2.2 验证Functions文件
检查以下文件是否存在且内容正确：
- [ ] `node-functions/index.js` - 基础测试
- [ ] `node-functions/[[path]].js` - 完整功能
- [ ] `edge-functions/[[path]].js` - 备选方案

### 3. 分步测试方案

#### 步骤1: 最简测试
1. **删除复杂的Functions文件**
   ```bash
   git rm node-functions/\[\[path\]\].js
   git commit -m "test: 使用最简Functions测试"
   git push
   ```

2. **只保留 `node-functions/index.js`**
   - 应该返回: "Hello from EdgeOne Node Functions! 🚀"

3. **测试URL**: `https://your-domain.pages.edgeone.ai/`

#### 步骤2: 切换到Edge Functions
如果Node Functions不工作，尝试Edge Functions：

1. **移除node-functions目录**
   ```bash
   git rm -r node-functions/
   git add edge-functions/
   git commit -m "test: 切换到Edge Functions"
   git push
   ```

2. **在EdgeOne控制台重新配置**
   - Functions类型: `Edge Functions`
   - Functions目录: `./edge-functions`

#### 步骤3: 验证部署设置
在EdgeOne控制台检查以下设置：

```yaml
项目名称: bmnr-tracker
仓库: 您的GitHub仓库
分支: main
框架: 自动检测 或 Functions
构建命令: (留空)
输出目录: ./
Functions目录: ./node-functions 或 ./edge-functions
```

### 4. 常见问题解决

#### 4.1 Functions未被识别
**症状**: 404错误，没有Functions日志
**解决方案**:
```bash
# 1. 确保文件名正确
ls node-functions/
# 应该看到: index.js 或 [[path]].js

# 2. 检查文件内容格式
head -5 node-functions/index.js
# 应该看到: export default async function onRequest
```

#### 4.2 依赖问题
**症状**: 构建失败，依赖错误
**解决方案**:
```json
// package.json 使用最简配置
{
  "name": "bmnr-tracker",
  "version": "1.0.0",
  "dependencies": {}
}
```

#### 4.3 权限问题
**症状**: GitHub连接失败
**解决方案**:
- 重新授权GitHub访问权限
- 确认仓库是public或已授权

#### 4.4 域名问题
**症状**: 自定义域名404，但EdgeOne域名正常
**解决方案**:
- 检查DNS CNAME记录
- 等待DNS传播（最多24小时）

### 5. 调试命令

#### 5.1 本地验证Functions语法
```bash
# 检查JavaScript语法
node -c node-functions/index.js
# 应该没有输出，表示语法正确
```

#### 5.2 测试EdgeOne CLI (如果可用)
```bash
# 如果EdgeOne提供CLI工具
edgeone-cli deploy --dry-run
```

### 6. 紧急恢复方案

如果以上方法都不工作，使用以下应急方案：

#### 方案A: 静态HTML页面
```bash
# 创建简单的index.html
echo '<!DOCTYPE html><html><body><h1>BMNR Tracker Working!</h1></body></html>' > index.html
git add index.html
git commit -m "emergency: 静态页面测试"
git push
```

#### 方案B: 使用Vercel替代
EdgeOne兼容Vercel配置，可以直接部署到Vercel作为备选。

### 7. 获取技术支持

#### 7.1 EdgeOne支持渠道
- 官方文档: https://edgeone.ai/docs
- 技术支持: support@edgeone.ai
- 社区论坛: 查找EdgeOne官方社区

#### 7.2 提供信息给技术支持
准备以下信息：
- 项目URL
- GitHub仓库链接
- 错误截图
- 构建日志
- 具体的404错误页面内容

### 8. 分步执行计划

**立即执行** (按顺序)：

1. **第一步**: 推送最简化版本
   ```bash
   cd /Users/ahxin/GitHub/bmnr-tracker
   git add .
   git commit -m "fix: 404问题排查 - 最简化Functions"
   git push origin main
   ```

2. **第二步**: 在EdgeOne控制台重新部署
   - 删除现有项目或重新配置
   - 重新连接GitHub仓库
   - 选择Node Functions
   - 等待部署完成

3. **第三步**: 测试基础访问
   - 访问主域名
   - 检查是否显示 "Hello from EdgeOne Node Functions! 🚀"

4. **第四步**: 如果仍然404，切换到Edge Functions
   - 按照上面步骤2的说明操作

### 9. 成功标志

当以下任一情况出现时，表示修复成功：
- ✅ 访问主域名显示"Hello from EdgeOne Node Functions! 🚀"
- ✅ 访问主域名显示BMNR Tracker页面
- ✅ 任何非404的响应内容

### 10. 联系信息

如果按照以上步骤仍然无法解决，请：
1. 截图保存所有错误信息
2. 记录每一步的执行结果
3. 提供EdgeOne控制台的构建日志
4. 说明具体在哪一步出现问题

**记住**: EdgeOne.ai是相对较新的平台，可能存在文档不完整或平台bug的情况。如果所有方法都不工作，可能需要联系官方技术支持。