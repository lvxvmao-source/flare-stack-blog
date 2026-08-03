---
name: fuwari-anime-beautify
overview: 对 fuwari 主题进行全面二次元日系清新风格美化，涵盖所有主要前台页面（首页、文章列表、文章详情、搜索、友链、认证等），并在后台新增完整自定义配置项（装饰元素、BGM、Live2D看板娘、独立背景图、字体选择等）。
design:
  architecture:
    framework: react
  styleKeywords:
    - 轻二次元
    - 日系清新
    - 樱花色调
    - 磨砂玻璃
    - 圆润卡片
    - 轻盈动效
    - Pixiv风格
  fontSystem:
    fontFamily: ZCOOL XiaoWei
    heading:
      size: 28px
      weight: 700
    subheading:
      size: 18px
      weight: 600
    body:
      size: 15px
      weight: 400
  colorSystem:
    primary:
      - oklch(0.75 0.12 350)
      - oklch(0.7 0.14 350)
      - oklch(0.65 0.15 350)
      - oklch(0.9 0.06 350)
      - oklch(0.6 0.15 350)
    background:
      - oklch(0.97 0.01 350)
      - oklch(0.93 0.015 350)
      - oklch(1 0 0)
    text:
      - oklch(0.15 0.01 350)
      - oklch(0.35 0.01 350)
      - oklch(0.55 0.01 350)
    functional:
      - oklch(0.55 0.18 27)
      - oklch(0.55 0.15 145)
      - oklch(0.65 0.16 60)
      - oklch(0.55 0.18 280)
todos:
  - id: extend-config-schema
    content: 扩展 fuwari 主题配置 Schema：在 site-config.schema.ts 中新增樱花特效、页面独立背景、Live2D看板娘、BGM播放器、卡片样式、页脚语录、字体选择等完整配置项
    status: completed
  - id: create-anime-css
    content: 使用 [skill:Impeccable（前端设计工具集）] 创建二次元风格 CSS 体系：在 styles/anime.css 中定义樱花色系 OKLCH 变量、磨砂玻璃工具类、日系装饰分隔线、卡片柔光阴影、入场动效 keyframes
    status: completed
  - id: create-sakura-effect
    content: 使用 [skill:GSAP 动画开发助手] 实现樱花飘落特效组件 (components/effects/sakura-petals.tsx)：Canvas 绘制五瓣樱花、可配置密度速度、尊重 prefers-reduced-motion
    status: completed
    dependencies:
      - create-anime-css
  - id: create-live2d-bgm
    content: 实现 Live2D 看板娘组件 (live2d-widget.tsx) 和 BGM 悬浮播放器组件 (bgm-player.tsx)：ClientOnly 包裹确保 SSR 安全，支持角色切换和播放列表
    status: completed
  - id: beautify-layouts
    content: 美化布局组件：PublicLayout 动态页面背景+特效集成、AuthLayout 日系装饰背景、Navbar 磨砂玻璃+樱花激活态、Footer 可配置语录
    status: completed
    dependencies:
      - create-anime-css
      - extend-config-schema
  - id: beautify-pages
    content: 使用 [skill:Impeccable（前端设计工具集）] 美化全部13个页面组件：首页卡片浮起动效、文章列表时间轴渐变、文章详情标题装饰条+评论区表情包、搜索框发光动画、友链卡片渐变边框、认证页日系图案+涟漪动效、个人资料页毛玻璃卡片
    status: completed
    dependencies:
      - beautify-layouts
  - id: beautify-components
    content: 美化核心子组件：PostCard 磨砂玻璃+浮起动画、Profile 头像樱花环、Sidebar 磨砂背景、Tags 柔光边框、Archive 时间轴渐变连线+发光圆点
    status: completed
    dependencies:
      - create-anime-css
  - id: extend-admin-settings
    content: 扩展后台 Fuwari 主题设置组件：新增装饰特效、页面背景、看板娘、BGM、评论区、卡片样式、页脚、字体共8个设置区块的表单UI
    status: completed
    dependencies:
      - extend-config-schema
  - id: add-i18n-messages
    content: 补充中英文国际化消息：在 messages/zh.json 和 en.json 中新增所有配置项的标签、提示、按钮文案
    status: completed
    dependencies:
      - extend-admin-settings
  - id: update-theme-exports
    content: 更新主题入口文件和 theme-style.ts：导出新增特效组件、getDocumentStyle 注入新增 CSS 变量（卡片圆角、磨砂强度等动态值）
    status: completed
    dependencies:
      - create-sakura-effect
      - create-live2d-bgm
---

## 用户需求

对 Fuwari 主题进行全面的**轻二次元/日系清新**风格美化，覆盖全部主要前台页面，同时在后台新增完整自定义配置项。

## 产品概述

打造一个具有日系插画站般精致视觉的博客主题 —— 柔和樱花色调、圆润卡片、透明毛玻璃、轻盈动效。用户在后台可以灵活调整装饰元素、独立页面背景、Live2D看板娘、BGM播放器等二次元特色功能。

## 核心功能

### 一、视觉美化（全部主要页面）

1. **全局视觉升级**：新增二次元风格 CSS 变量体系（樱花粉主色调、日系暖色中性色、柔和阴影层级、磨砂玻璃变量）；引入日系字体（ZCOOL XiaoWei / Ma Shan Zheng 展示字体 + Noto Sans SC 正文字体）；所有卡片圆角增大至 1.25rem，增加柔光边框和微阴影；Banner 区增加渐变遮罩和樱花粒子装饰
2. **首页美化**：文章卡片增加 hover 浮起动画 + 磨砂玻璃效果；置顶/热门标记替换为樱花/星芒图标；"查看全部"按钮增加脉动呼吸动画
3. **文章列表美化**：归档时间轴增加渐变色连接线和发光圆点；年份标题增加日系装饰分隔线
4. **文章详情美化**：标题左侧装饰条改为渐变樱花色；TOC 增加滚动光晕指示器；评论区增加二次元表情包选择器
5. **搜索页美化**：搜索框增加聚焦发光扩散动画；空状态增加日系插画引导
6. **友链页美化**：友链卡片增加头像浮起效果 + 渐变边框
7. **认证页美化**：登录/注册卡片增加装饰性日系图案背景；按钮增加涟漪动效
8. **个人资料页美化**：头像增加樱花装饰环；设置区块增加毛玻璃卡片

### 二、装饰特效系统

1. **樱花飘落特效**：基于 Canvas 的樱花花瓣飘落动画，可配置密度、速度、花瓣类型
2. **页面装饰粒子**：页面角落的星芒/光点浮动粒子效果
3. **Banner 动态装饰**：Banner 区域叠加动态渐变光晕

### 三、二次元特色功能

1. **Live2D 看板娘**：可开关的 Live2D 角色，支持多角色选择、位置调整、点击交互
2. **BGM 播放器**：底部悬浮音乐播放器，支持自定义播放列表
3. **评论区表情包**：评论区集成二次元表情包选择器

### 四、后台完整自定义设置

在现有的 homeBg、avatar、primaryHue 基础上新增：

- **装饰特效**：樱花飘落开关/密度/速度、粒子效果开关、Banner动画类型
- **页面独立背景**：首页/文章列表/文章详情/友链/搜索各页面的独立 Banner 背景图
- **Live2D 看板娘**：开关、角色选择、位置（左下/右下）
- **BGM 播放器**：开关、默认音量、播放列表（曲名+URL）
- **评论区表情包**：开关
- **卡片样式**：圆角大小、磨砂玻璃强度
- **页脚自定义**：二次元语录/签名文字
- **字体选择**：展示字体选择

## 技术方案

### 技术栈选择

基于现有项目架构，完全沿用当前技术栈：

- **前端框架**：React 19 + TanStack Start (SSR)
- **样式**：Tailwind CSS v4 + OKLCH 色彩空间 + CSS 自定义属性
- **数据校验**：Zod
- **国际化**：Paraglide (已有消息体系)
- **表单**：React Hook Form (已在管理后台使用)

### 实现策略

#### 1. CSS 变量体系扩展（`styles/index.css`）

在现有 OKLCH 变量基础上，新增二次元风格变量层：

```css
/* 二次元风格变量 */
--anime-sakura-pink: oklch(0.75 0.12 350);      /* 樱花粉主调 */
--anime-sakura-light: oklch(0.9 0.06 350);       /* 浅樱花 */
--anime-sakura-deep: oklch(0.6 0.15 350);        /* 深樱花 */
--anime-card-glow: 0 0 30px oklch(0.7 0.12 350 / 0.15);  /* 卡片柔光 */
--anime-glass-bg: oklch(1 0 0 / 0.65);           /* 磨砂玻璃背景 */
--anime-glass-border: oklch(1 0 0 / 0.3);        /* 磨砂玻璃边框 */
--anime-shadow-sm: 0 2px 12px oklch(0.7 0.05 350 / 0.08);
--anime-shadow-md: 0 4px 24px oklch(0.7 0.05 350 / 0.12);
--anime-radius: 1.25rem;                          /* 统一圆角 */
```

#### 2. 配置 Schema 扩展（`site-config.schema.ts`）

扩展 `createFuwariThemeSiteConfigSchema()`：

```typescript
// 新增配置项
fuwari: {
  // 现有
  homeBg: string;
  avatar: string;
  primaryHue: number;
  
  // 新增：装饰特效
  sakuraEnabled: boolean;         // 樱花飘落开关
  sakuraDensity: number;          // 密度 1-10
  sakuraSpeed: number;            // 速度 1-5
  particlesEnabled: boolean;      // 粒子效果开关
  bannerAnimationType: "fade" | "parallax" | "kenburns" | "none";
  
  // 新增：页面独立背景
  postsBg: string;                // 文章列表页 Banner 背景
  postDetailBg: string;           // 文章详情页 Banner 背景
  searchBg: string;               // 搜索页 Banner 背景
  friendLinksBg: string;          // 友链页 Banner 背景
  
  // 新增：Live2D 看板娘
  live2dEnabled: boolean;
  live2dModel: "haru" | "hijiki" | "tororo" | "shizuku";
  live2dPosition: "left" | "right";
  
  // 新增：BGM 播放器
  bgmEnabled: boolean;
  bgmDefaultVolume: number;       // 0-100
  bgmPlaylist: Array<{ title: string; url: string }>;
  
  // 新增：评论区
  commentStickersEnabled: boolean;
  
  // 新增：卡片样式
  cardBorderRadius: number;       // 0.5-2 (rem)
  cardGlassIntensity: number;     // 0-1
  
  // 新增：页脚
  footerQuote: string;            // 页脚二次元语录
  
  // 新增：字体
  displayFont: "zcool" | "mashan" | "noto";
}
```

#### 3. 樱花飘落特效组件（新增）

创建 `components/effects/sakura-petals.tsx`：

- 使用 Canvas API 绘制飘落樱花花瓣
- 支持 `prefers-reduced-motion` 媒体查询自动禁用
- 通过 `requestAnimationFrame` 驱动，60fps 保证
- 花瓣类型：标准五瓣樱花 SVG 路径绘制
- 可配置参数：密度（花瓣数量）、速度、风向

#### 4. Live2D 看板娘组件（新增）

创建 `components/effects/live2d-widget.tsx`：

- 基于 live2d-widget.js 封装
- 支持角色切换（haru/hijiki/tororo/shizuku）
- 位置可配置（左下/右下）
- 通过 `ClientOnly` 包裹确保仅在客户端渲染（SSR 安全）

#### 5. BGM 播放器组件（新增）

创建 `components/effects/bgm-player.tsx`：

- 底部悬浮迷你播放器
- 支持播放/暂停、上一曲/下一曲
- 可折叠/展开
- 默认静音，用户主动点击后播放（符合浏览器自动播放策略）

#### 6. 页面 Banner 背景独立化

修改 `PublicLayout` 组件：

- 根据当前路由路径动态选择对应页面的背景图配置
- 首页用 `homeBg`，文章列表用 `postsBg`，以此类推
- 未配置时回退到默认 `homeBg`

#### 7. 后台设置组件扩展（`fuwari-theme-settings.tsx`）

新增以下设置区块：

- **装饰特效区块**：樱花开关+密度+速度滑块、粒子开关、Banner动画下拉选择
- **页面背景区块**：各页面独立背景图上传
- **看板娘区块**：开关、角色下拉选择、位置选择
- **BGM区块**：开关、音量滑块、播放列表编辑器（动态增删行）
- **评论区区块**：表情包开关
- **卡片样式区块**：圆角滑块、磨砂强度滑块
- **页脚区块**：语录文本输入
- **字体区块**：展示字体下拉选择

#### 8. 国际化消息补充

在 `messages/zh.json` 和 `messages/en.json` 中新增所有新增配置项的标签和提示文案。

### 架构设计

```mermaid
graph TD
    A[后台设置页面] --> B[site-config.schema.ts<br/>Zod Schema 扩展]
    B --> C[config.service.ts<br/>默认值合并]
    C --> D[D1 数据库存储]
    D --> E[__root.tsx<br/>SiteThemeProvider]
    E --> F[PublicLayout<br/>读取配置 + 动态背景]
    F --> G[各页面组件<br/>使用二次元CSS变量]
    
    H[新增特效组件] --> F
    H --> I[SakuraPetals<br/>樱花飘落Canvas]
    H --> J[Live2dWidget<br/>看板娘]
    H --> K[BgmPlayer<br/>BGM播放器]
    
    L[styles/index.css] --> G
    L --> M[anime 变量层<br/>--anime-* 变量]
    L --> N[磨砂玻璃类<br/>.glass-* 工具类]
    L --> O[二次元动效<br/>@keyframes anime-*]
```

### 目录结构

```
src/features/theme/themes/fuwari/
├── styles/
│   └── index.css                    # [MODIFY] 新增二次元 CSS 变量、磨砂玻璃类、动效 keyframes
│   └── anime.css                    # [NEW] 二次元专属样式（樱花色系、卡片装饰、日系分隔线等）
├── components/
│   ├── effects/
│   │   ├── sakura-petals.tsx        # [NEW] 樱花飘落 Canvas 特效组件
│   │   ├── live2d-widget.tsx        # [NEW] Live2D 看板娘组件
│   │   ├── bgm-player.tsx           # [NEW] BGM 悬浮播放器组件
│   │   └── particle-decoration.tsx  # [NEW] 页面粒子装饰组件
│   ├── post-card.tsx                # [MODIFY] 增加 hover 浮起动画、磨砂玻璃效果
│   ├── profile.tsx                  # [MODIFY] 头像增加樱花装饰环
│   ├── sidebar.tsx                  # [MODIFY] 增加磨砂玻璃背景
│   ├── tags.tsx                     # [MODIFY] 标签增加柔光边框
│   └── comments/
│       └── view/
│           └── comment-editor.tsx   # [MODIFY] 集成表情包选择器
├── layouts/
│   ├── public-layout.tsx            # [MODIFY] 动态页面背景、集成特效组件、Banner渐变遮罩
│   ├── auth-layout.tsx              # [MODIFY] 装饰性日系背景、卡片磨砂效果
│   ├── navbar.tsx                   # [MODIFY] 磨砂玻璃导航栏、樱花色激活态
│   └── footer.tsx                   # [MODIFY] 可配置二次元语录
├── pages/
│   ├── home/page.tsx                # [MODIFY] 卡片动画延迟、樱花色点缀
│   ├── posts/page.tsx               # [MODIFY] 归档时间轴渐变色
│   ├── post/page.tsx                # [MODIFY] 标题装饰条渐变、评论区美化
│   ├── search/page.tsx              # [MODIFY] 搜索框发光动画、空状态插画
│   ├── friend-links/page.tsx        # [MODIFY] 卡片浮起效果+渐变边框
│   ├── auth/login/page.tsx          # [MODIFY] 日系图案背景、按钮涟漪
│   ├── auth/register/page.tsx       # [MODIFY] 同登录页美化
│   └── user/profile/page.tsx        # [MODIFY] 毛玻璃卡片
├── theme-style.ts                   # [MODIFY] getDocumentStyle 注入新增 CSS 变量
└── index.ts                         # [MODIFY] 导出新增特效组件

src/features/config/
├── site-config.schema.ts            # [MODIFY] 扩展 Fuwari 配置 Zod Schema
├── components/
│   └── themes/
│       └── fuwari-theme-settings.tsx # [MODIFY] 新增所有配置项的表单组件

messages/
├── zh.json                          # [MODIFY] 新增中文国际化消息
└── en.json                          # [MODIFY] 新增英文国际化消息
```

### 实现注意事项

1. **性能**：樱花 Canvas 在 `prefers-reduced-motion` 时完全禁用；Live2D 和 BGM 仅在客户端加载（`ClientOnly` 包裹）；所有动画使用 `transform` + `opacity` 确保 GPU 加速
2. **兼容性**：新增配置项全部设置合理的默认值，确保已有用户升级后不受影响；未配置的页面背景自动回退到 `homeBg`
3. **日志**：特效组件加载失败时静默降级，不阻塞页面渲染
4. **安全性**：BGM 播放列表 URL 校验合法音频格式；Live2D 模型文件从可信 CDN 加载

## 设计风格

采用**轻二次元/日系清新**风格，灵感来源于 Pixiv 插画站和日本同人博客。核心视觉语言围绕以下元素展开：

- **柔和樱花色调**：以 oklch 色彩空间定义，樱花粉（hue 350, chroma 0.12）作为主色调，辅以浅樱、深樱渐变
- **圆润卡片**：所有卡片统一使用 1.25rem 圆角，配以柔光边框和微阴影，模拟日系手账的温和触感
- **透明磨砂玻璃**：侧边栏、导航栏、认证卡片使用 backdrop-blur 磨砂效果，透出底层柔和的背景色
- **轻盈动效**：使用 ease-out-quart 缓动，卡片 hover 时轻微上浮（translateY(-4px)），入场动画采用逐元素延迟的 fade-in-up

## 页面设计

### 首页

- Banner 区域叠加动态渐变光晕 + 可选樱花粒子装饰
- 文章卡片在 hover 时上浮 4px，阴影扩散，模拟"浮出水面"效果
- 置顶文章使用樱花粉左边框装饰，热门文章使用暖橙色星芒标记
- "查看全部"按钮使用樱花色脉动呼吸动画（scale 1 → 1.03 循环）

### 文章列表

- 归档时间轴使用樱花色渐变连线（从透明到 --anime-sakura-pink 再到透明）
- 年份标题左侧增加日系风格装饰分隔线（渐变短线 + 圆点）
- 文章条目 hover 时时间轴圆点放大并扩散光晕

### 文章详情

- 标题左侧装饰条从单一主色调改为樱花色渐变
- TOC 当前高亮项显示柔光背景指示器
- 评论区卡片增加磨砂玻璃效果，回复框 hover 时边框变为樱花色

### 搜索页

- 搜索框聚焦时产生樱花色发光扩散动画（box-shadow 脉冲）
- 空状态展示日系插画风格引导图（线条风格 + 柔和配色）

### 友链页

- 友链卡片 hover 时头像区域放大 + 边框渐变变为樱花色
- 卡片整体轻微上浮

### 认证页（登录/注册等）

- 卡片背景增加隐约的日系图案装饰（如和风麻叶纹、樱花剪影）
- 输入框聚焦时边框变为樱花色并增加微光
- 提交按钮增加涟漪点击动效

### 个人资料页

- 头像增加樱花色装饰环
- 设置区块使用磨砂玻璃卡片样式

## 交互与动效

- **入场动画**：所有主要内容块使用 100ms 递增延迟的 fade-in-up 动画
- **hover 反馈**：可交互元素 hover 时轻微缩放（1.02）或上浮（-4px），过渡 200ms
- **按钮涟漪**：主要按钮点击时产生从点击位置扩散的圆形涟漪
- **樱花飘落**：全站可选的 Canvas 樱花花瓣飘落特效
- **Live2D 看板娘**：角落的二次元角色，点击有反馈动画

## 响应式设计

- 桌面端（lg+）：完整三栏布局，侧边栏磨砂玻璃效果，特效全开
- 平板端（md）：两栏布局，侧边栏收起为可展开面板
- 移动端（sm-）：单栏布局，简化动效，樱花特效降级（减少花瓣数量），Live2D 看板娘缩小

## Agent Extensions

### Skill

- **Impeccable（前端设计工具集）**
- 用途：在设计二次元风格时参考 bolder.md、animate.md、color-and-contrast.md 等设计原则，确保避免 AI 泛化审美，产出独特、生产级的前端界面设计
- 预期结果：CSS 变量体系、动效曲线、字体搭配、色彩方案均遵循最佳实践，避免青紫渐变、毛玻璃滥用等常见问题

- **GSAP 动画开发助手**
- 用途：实现樱花飘落特效的 Canvas 动画、页面入场编排动画、Banner 视差效果等复杂动效
- 预期结果：高性能（60fps）、支持 prefers-reduced-motion、代码结构清晰的动画实现