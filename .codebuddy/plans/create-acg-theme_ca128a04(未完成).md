---
name: create-acg-theme
overview: 基于 default 主题复制所有文件，创建名为 "acg" 的新主题，并在整个系统中完成注册和配置。
todos:
  - id: copy-theme-files
    content: 将 src/features/theme/themes/default/ 完整复制为 src/features/theme/themes/acg/
    status: pending
  - id: adapt-acg-imports-css
    content: 修改 acg 主题内部文件：index.ts 中的 import 路径指向 ./ 自身；CSS 样式中 .default-theme 改为 .acg-theme；布局组件中 class 名同步修改
    status: pending
    dependencies:
      - copy-theme-files
  - id: register-theme
    content: 在 registry.ts 的 themeNames 和 themes 中注册 acg，在 blog.config.ts 中添加 acg 默认配置
    status: pending
    dependencies:
      - adapt-acg-imports-css
  - id: add-schema-config
    content: 在 site-config.schema.ts 中添加 acg 三层 Zod schema；在 config.service.ts 中添加 acg 配置解析逻辑
    status: pending
    dependencies:
      - register-theme
  - id: add-admin-settings
    content: 创建 acg-theme-settings.tsx 管理后台设置面板，在 site-settings-section.tsx 中导入并添加 switch case，在 site-config.helpers.ts 中添加 acg 预加载图片
    status: pending
    dependencies:
      - add-schema-config
  - id: update-i18n-tsconfig
    content: 更新 messages/zh.json 和 messages/en.json 中的资源路径校验信息；更新 tsconfig.json 中 @theme path mapping
    status: pending
    dependencies:
      - add-admin-settings
---

## 需求概述

创建一个名为 **acg** 的自定义主题，作为后续个性化定制的基础。该主题以现有 default 主题为模板完整复制，并在整个项目注册系统中完成集成。

## 核心功能

- 在 `src/features/theme/themes/acg/` 下创建完整主题目录，包含所有页面、布局、组件、样式文件
- 在主题注册表 (`registry.ts`) 中注册 acg 主题
- 在构建系统 (`vite.config.ts`、`tsconfig.json`) 中支持 acg 主题切换
- 在配置系统 (`blog.config.ts`、`site-config.schema.ts`、`config.service.ts`) 中添加 acg 配置
- 在管理后台 (`site-settings-section.tsx`) 中添加 acg 主题设置面板
- 在 i18n 文件中更新资源路径校验信息
- acg 主题的 CSS 样式作用域类名改为 `.acg-theme`（替换 default 的 `.default-theme`）

## 技术方案

### 实施策略

采用 **复制 → 适配 → 注册 → 集成** 四步走策略，以 default 主题为唯一模板复制全部文件，然后逐一修改内部引用和外部注册点，确保编译通过且可正常切换。

### 关键决策

1. **模板选择**：基于 default 主题而非 fuwari，因为 default 结构更完整（57 个文件），是项目的基础主题
2. **CSS 作用域**：将 default 的 `.default-theme` 改为 `.acg-theme`，保持样式隔离
3. **配置复用**：acg 的 ThemeRouterConfig 初始值与 default 相同（viewTransition: true, pendingMs: 0）
4. **Schema 策略**：为 acg 创建独立的 Zod schema 和配置空间（与 default 平行的结构），便于后续独立扩展

### 涉及文件清单

#### 新建文件（整个 acg 主题目录）

```
src/features/theme/themes/acg/
├── index.ts                          # 主题入口，导出 ThemeComponents
├── config.ts                         # 主题静态配置
├── styles/index.css                  # 主题样式（.acg-theme 作用域）
├── components/
│   ├── background-layer.tsx
│   ├── post-item.tsx
│   ├── content/
│   │   ├── render.tsx, content-renderer.tsx
│   │   ├── code-block.tsx, image-display.tsx, zoomable-image.tsx
│   └── comments/
│       ├── editor/
│       │   ├── comment-editor-toolbar.tsx, comment-insert-modal.tsx
│       └── view/
│           ├── comment-editor.tsx, comment-item.tsx, comment-list.tsx
│           ├── comment-render.tsx, comment-reply-form.tsx
│           ├── comment-section.tsx, comment-section-skeleton.tsx
│           └── expandable-content.tsx
├── layouts/
│   ├── public-layout.tsx, auth-layout.tsx, user-layout.tsx
│   ├── navbar.tsx, footer.tsx, mobile-menu.tsx, language-switcher.tsx
└── pages/
    ├── home/ (index.ts, page.tsx, skeleton.tsx)
    ├── posts/ (index.ts, page.tsx, skeleton.tsx)
    ├── post/ (index.ts, page.tsx, skeleton.tsx)
    ├── friend-links/ (index.ts, page.tsx, skeleton.tsx, *.tsx)
    ├── nav/ (index.ts, page.tsx, skeleton.tsx)
    ├── search/ (index.ts, page.tsx)
    ├── submit-friend-link/ (index.ts, page.tsx, form.tsx)
    ├── auth/login/ (index.ts, page.tsx, form.tsx, social-login.tsx)
    ├── auth/register/ (index.ts, page.tsx, form.tsx)
    ├── auth/forgot-password/ (index.ts, page.tsx, form.tsx)
    ├── auth/reset-password/ (index.ts, page.tsx, form.tsx)
    ├── auth/verify-email/ (index.ts, page.tsx)
    └── user/profile/ (index.ts, page.tsx)
```

以及管理后台设置面板：

```
src/features/config/components/themes/acg-theme-settings.tsx
```

#### 修改文件（11 个）

| 文件 | 修改内容 |
| --- | --- |
| `src/features/theme/registry.ts` | themeNames 加入 "acg"，themes 加入 acg 配置 |
| `src/blog.config.ts` | theme 下新增 acg 默认配置 |
| `src/features/config/site-config.schema.ts` | 新增 acg 主题的 Zod schema（3 层）+ 导出类型 |
| `src/features/config/service/config.service.ts` | resolveSiteConfig 中新增 acg 配置解析 |
| `src/features/theme/site-config.helpers.ts` | getThemePreloadImages 新增 acg case |
| `src/features/config/components/site-settings-section.tsx` | import + switch case 增加 acg |
| `messages/zh.json` | 资源路径校验信息加入 themes/acg/ |
| `messages/en.json` | 资源路径校验信息加入 themes/acg/ |
| `tsconfig.json` | @theme paths 更新（保持 default 为默认，可选） |


### 数据流

```
用户设置 THEME=acg
  → vite.config.ts 读取环境变量
  → @theme 别名指向 src/features/theme/themes/acg/
  → 路由组件 import theme from "@theme" 获得 acg 主题
  → __THEME_NAME__ 全局常量 = "acg"
  → 管理后台根据 __THEME_NAME__ 渲染 acg 设置面板
  → 配置系统根据 __THEME_NAME__ 解析对应配置
```

### 实现注意事项

- **CSS 作用域隔离**：`acg/styles/index.css` 中所有 `.default-theme` 替换为 `.acg-theme`，`acg/layouts/public-layout.tsx` 中对应修改
- **配置字段路径**：Schema 中 acg 的字段路径为 `site.theme.acg.*`，与 default/fuwari 平行
- **向后兼容**：所有 default 和 fuwari 相关代码保持不变，仅新增 acg 分支
- **类型安全**：`site-settings-section.tsx` 和 `site-config.helpers.ts` 中的 switch 使用 `satisfies never` 保证完整性