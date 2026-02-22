# InsightFlow Landing Page

基于 **Next.js + TypeScript + Tailwind CSS** 的单页落地页项目。

## 运行说明

```bash
npm install
npm run dev
```

默认访问：`http://localhost:3000`

## 构建命令

```bash
npm run build
npm run start
```

## 页面结构说明

首页入口：`src/app/page.tsx`

模块顺序如下：
1. Hero（含邮箱收集表单）
2. 示例报告卡片网格
3. 集成展示区（滚动进入视口淡入上移）
4. 客户评价轮播（支持键盘左右方向键）
5. 价格切换（月付 / 年付）
6. FAQ
7. 页脚

## 设计与可访问性

- 薰衣草到蓝色渐变主背景
- 玻璃拟态卡片（半透明 + 高光边框 + backdrop blur）
- 统一 `14px` 圆角按钮与可见 focus ring
- 语义化 section 与标题层级、表单 label、可键盘操作轮播
