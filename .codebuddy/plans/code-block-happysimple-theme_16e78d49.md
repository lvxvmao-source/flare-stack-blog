---
name: code-block-happysimple-theme
overview: 将 Shiki 代码高亮主题从 vitesse-dark 切换到 material-theme-palenight，使其与 happysimple Typora 主题的代码块显示完全一致（暗色背景 + 匹配的 token 颜色），并在亮/暗模式下都保持暗色代码块背景。
todos:
  - id: switch-shiki-theme
    content: 在 src/lib/shiki.ts 中将 import 从 vitesse-dark 切换为 material-theme-palenight，更新 themes 对象和 createHighlighterCore 配置
    status: completed
  - id: clean-code-block-css
    content: 在 src/features/theme/themes/fuwari/components/content/code-block.tsx 中移除强制覆盖背景色和字体色的内联 <style> 块，更新 fallback HTML 字符串
    status: completed
---

## 用户需求

将代码块语法高亮切换到与 Typora happysimple 主题接近的 Shiki 内置主题，使亮/暗模式下代码块均保持暗色背景，且不同 token 类型的颜色与 happysimple 保持一致。

## 核心改动

1. 将 Shiki 高亮主题从 `vitesse-dark` 切换为 `material-theme-palenight`
2. 移除 `code-block.tsx` 中强制覆盖背景色和字体色的内联 `<style>` 块
3. 更新 fallback HTML 字符串
4. 保持 wrapper 的 `--fuwari-code-bg` 背景色不变（已经是 `#292d3e`，与 palenight 一致）

## 技术方案

### 实现策略

将 Shiki 的 `highlight()` 函数从使用 `vitesse-dark` 主题切换为 `material-theme-palenight`，该主题背景色 `#292D3E` 与 happysimple 完全一致。由于 palenight 是暗色主题，单主题模式下生成的 HTML 中所有 `<span>` 的内联 `style="color:..."` 都是浅色/彩色值，在暗色背景上可见。

### 关键决策

- **选择 material-theme-palenight 而非 happysimple 自定义主题**：palenight 是 Shiki 内置主题，无需额外维护，且背景色 `#292D3E` 与 happysimple 的 `#292d3e` 完全一致。token 颜色虽有差异（如 comment 从 `#fff` 变为 `#676E95`），但整体风格协调。
- **继续使用单主题模式**：`theme: "material-theme-palenight"` 而非双主题 `{ light, dark }`，避免 CSS 变量兼容问题。
- **移除 CSS 强制覆盖**：删除 code-block.tsx 中强制 `background-color` 和 `color` 的内联 `<style>`，让 Shiki 生成的 HTML 自然渲染。

### 性能考虑

- Shiki 服务端渲染 `highlightedHtml` 存入数据库，前端只需 `dangerouslySetInnerHTML`，无运行时开销
- 主题文件约 20KB，一次性加载，无额外运行时成本