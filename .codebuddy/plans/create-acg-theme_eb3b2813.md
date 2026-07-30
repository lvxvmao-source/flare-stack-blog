---
name: create-acg-theme
overview: 基于 default 主题创建 acg（二次元动漫风格）主题：更宽的布局、动漫风格配色（颜色集中注释管理）、完成全系统注册配置。
todos:
  - id: copy-acg-files
    content: 复制 default 主题全部文件到 acg 目录（使用脚本批量复制 src/features/theme/themes/default/ → acg/）
    status: completed
  - id: fix-absolute-imports
    content: 批量修改 acg 内部 7 处 `@/features/theme/themes/default/...` 绝对导入为相对路径
    status: completed
    dependencies:
      - copy-acg-files
  - id: replace-theme-refs
    content: 将 acg 布局文件中 4 处 `theme.default.xxx` 改为 `theme.acg.xxx`（navbar/footer/mobile-menu/public-layout）
    status: completed
    dependencies:
      - fix-absolute-imports
  - id: widen-layout
    content: 将 acg 全部页面和布局中 20+ 处 `max-w-3xl` 替换为 `max-w-6xl`（pages/skeletons/navbar/footer）
    status: completed
    dependencies:
      - replace-theme-refs
  - id: acg-css-redesign
    content: 使用 [skill:Impeccable（前端设计工具集）] 重写 acg/styles/index.css：动漫配色 CSS 变量 + 分区注释 + `.acg-theme` 类名
    status: completed
    dependencies:
      - widen-layout
  - id: register-theme-system
    content: 在 registry.ts、blog.config.ts、site-config.schema.ts、config.service.ts、site-config.helpers.ts 中注册 acg 主题
    status: completed
    dependencies:
      - acg-css-redesign
  - id: create-admin-panel
    content: 创建 acg-theme-settings.tsx 管理面板；在 site-settings-section.tsx 中添加 acg switch case
    status: completed
    dependencies:
      - register-theme-system
  - id: update-i18n-tsconfig
    content: 更新 messages/zh.json 和 en.json 资源路径校验；更新 tsconfig.json 的 @theme path mapping
    status: completed
    dependencies:
      - create-admin-panel
---

## 产品概述

创建一个名为 "acg" 的二次元动漫风格主题，相比默认主题占据更宽屏幕空间（1152px vs 768px），配色以樱花粉、天空蓝为主调，CSS 变量集中管理并附详细注释方便后续调色。

## 核心特性

- **宽幅布局**：内容区域从 `max-w-3xl`（768px）扩展至 `max-w-6xl`（1152px），充分利用大屏幕
- **动漫配色系统**：亮色模式采用温暖樱花粉背景 + 天空蓝强调色 + 薄荷绿辅助色；暗色模式采用深邃紫罗兰 + 暗粉点缀
- **注释完善的 CSS**：CSS 文件按「主题色」「排版」「暗色模式」等分区管理，每个变量标注用途和色号，方便二次修改
- **全系统注册集成**：在 registry、blog.config、site-config.schema、config.service、管理后台、i18n 中完成完整注册

## 技术栈

- 前端框架：React + TypeScript + Tailwind CSS v4
- 路由：TanStack Router
- 样式：CSS 自定义属性（HSL 格式）+ Tailwind utility classes
- 构建：Vite（通过 THEME 环境变量 + @theme 别名切换主题）

## 实施方案

### 整体策略

采用「复制 default → 批量修改内部引用 → 逐文件注册集成」三步走。default 主题是最完整的参考（57 个文件），acg 以其为模板复制后修改。

### 关键技术决策

1. **布局宽度选择 `max-w-6xl`（1152px）**

- 比 default 的 768px 宽 50%，充分利用屏幕
- 比 fuwari 的 1200px 略窄，保持适度的留白避免过度拉伸
- 在 1920px 屏幕上左右各留约 384px，平衡舒适阅读与空间利用

2. **配色方案**（HSL 格式，便于微调）

- 亮色模式：背景 `350 30% 98%`（暖白偏粉）、主色 `250 60% 50%`（蓝紫）、强调色 `340 70% 65%`（樱花粉）
- 暗色模式：背景 `250 25% 12%`（深邃紫）、主色 `340 60% 75%`（暗樱粉）、强调色 `210 50% 55%`（天空蓝）

3. **CSS 分区注释体系**

- `/* ===== 🎨 主题色系统 ===== */` — 所有颜色变量
- `/* ===== 📐 排版系统 ===== */` — 字体、标题、段落
- `/* ===== 🌙 暗色模式 ===== */` — dark 类覆盖
- `/* ===== 🔧 工具类 & 组件 ===== */` — 滚动条、动画等

### 需修改的文件清单（含具体改动）

#### 新建目录（完整复制 default 后修改）

```
src/features/theme/themes/acg/   (~57 个文件)
```

#### 修改文件（17 个）

| 文件 | 改动内容 |
| --- | --- |
| `acg/index.ts` | 无绝对路径导入需修改（所有导入已是 `./` 相对路径） |
| `acg/styles/index.css` | 全部 CSS 变量改为动漫色系，添加分区注释，`.acg-theme` 类名 |
| `acg/layouts/public-layout.tsx` | `default-theme` → `acg-theme`；`theme.default.background` → `theme.acg.background` |
| `acg/layouts/navbar.tsx` | `max-w-3xl` → `max-w-6xl`；`theme.default.navBarName` → `theme.acg.navBarName` |
| `acg/layouts/footer.tsx` | `max-w-3xl` → `max-w-6xl`；`theme.default.navBarName` → `theme.acg.navBarName` |
| `acg/layouts/mobile-menu.tsx` | `theme.default.navBarName` → `theme.acg.navBarName` |
| `acg/pages/home/page.tsx` | `max-w-3xl` → `max-w-6xl`；`@/features/theme/themes/default/components/post-item` → `../../components/post-item` |
| `acg/pages/home/skeleton.tsx` | `max-w-3xl` → `max-w-6xl` |
| `acg/pages/posts/page.tsx` | `max-w-3xl` → `max-w-6xl`；绝对路径→相对路径 |
| `acg/pages/posts/skeleton.tsx` | `max-w-3xl` → `max-w-6xl` |
| `acg/pages/post/page.tsx` | `max-w-3xl` → `max-w-6xl`；绝对路径→相对路径 |
| `acg/pages/post/skeleton.tsx` | `max-w-3xl` → `max-w-6xl` |
| `acg/pages/friend-links/page.tsx` | `max-w-3xl` → `max-w-6xl` |
| `acg/pages/friend-links/skeleton.tsx` | `max-w-3xl` → `max-w-6xl` |
| `acg/pages/nav/page.tsx` | `max-w-3xl` → `max-w-6xl`；绝对路径→相对路径 |
| `acg/pages/nav/skeleton.tsx` | `max-w-3xl` → `max-w-6xl` |
| `acg/pages/search/page.tsx` | `max-w-3xl` → `max-w-6xl` |
| `acg/pages/submit-friend-link/page.tsx` | `max-w-3xl` → `max-w-6xl` |
| `acg/pages/user/profile/page.tsx` | `max-w-3xl` → `max-w-6xl` |
| `acg/pages/auth/login/page.tsx` | 无布局宽度（使用 `max-w-sm` auth form） |
| `acg/pages/auth/register/page.tsx` | 同上 |
| `acg/components/content/render.tsx` | 绝对路径→相对路径（`@/features/theme/themes/default/...` → `./...`） |
| `acg/components/content/content-renderer.tsx` | 绝对路径→相对路径 |
| `acg/components/content/image-display.tsx` | 绝对路径→相对路径 |


#### 外部注册文件（6 个）

| 文件 | 改动内容 |
| --- | --- |
| `src/features/theme/registry.ts` | `themeNames` 数组加入 `"acg"`；`themes` 对象加入 acg 配置（viewTransition: true, pendingMs: 0） |
| `src/blog.config.ts` | `theme` 下新增 `acg: { navBarName: "导航栏名称" }` |
| `src/features/config/site-config.schema.ts` | 新增 acg 主题三层 Zod schema + 导出类型（与 default 结构一致） |
| `src/features/config/service/config.service.ts` | `resolveSiteConfig` 中新增 acg 配置解析分支 |
| `src/features/theme/site-config.helpers.ts` | `getThemePreloadImages` 新增 `case "acg"` |
| `src/features/config/components/site-settings-section.tsx` | 导入 `AcgThemeSettings`，switch case 新增 `"acg"` |
| `src/features/config/components/themes/acg-theme-settings.tsx` | **新建**，acg 管理后台设置面板（复制 default-theme-settings.tsx，替换字段路径为 `site.theme.acg.*`） |
| `messages/zh.json` | 资源路径校验信息加入 `themes/acg/` |
| `messages/en.json` | 资源路径校验信息加入 `themes/acg/` |
| `tsconfig.json` | `@theme` paths 保持不变（default 为编译默认，运行时由 vite 覆盖） |


### 数据流

```
.env 设置 THEME=acg
  → vite.config.ts 解析 → @theme → src/features/theme/themes/acg/
  → 路由 import theme from "@theme" → 获得 acg 主题组件
  → __THEME_NAME__ = "acg" → 管理后台渲染 acg 设置面板
  → 配置系统 siteConfig.theme.acg.* → navbar/footer 显示导航名称
```

## 使用的技能

### Skill

- **Impeccable（前端设计工具集）**
- 用途：设计 acg 主题的颜色系统、排版、间距和视觉节奏，确保二次元动漫风格的高品质呈现
- 预期结果：产出一套完整的动漫配色方案（light/dark 双模式 HSL 值），确定排版层级和视觉节奏

### SubAgent

- **code-explorer**
- 用途：验证 default 主题中所有 `max-w-3xl` 出现位置、`theme.default` 引用位置、`@/features/theme/themes/default` 绝对导入位置，确保批量替换无遗漏
- 预期结果：完整列出所有需修改的精确文件和行号