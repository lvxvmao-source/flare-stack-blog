---
name: markdown-import-editor
overview: 在文章编辑器的工具栏中添加"导入 Markdown"按钮，支持用户从本地选择 .md 文件，读取后自动解析 frontmatter（标题、标签、摘要等）并填入编辑器元数据区域，同时将正文 Markdown 转为 HTML 后加载到 TipTap 编辑器。
todos:
  - id: add-i18n-keys
    content: 在 messages/zh.json 和 messages/en.json 中添加"导入 Markdown"相关的 i18n 消息键
    status: completed
  - id: add-toolbar-button
    content: 在 editor-toolbar.tsx 中新增"导入 Markdown"按钮，添加隐藏的 input[type=file] 和文件读取逻辑
    status: completed
    dependencies:
      - add-i18n-keys
  - id: update-editor-wrapper
    content: 在 tiptap-editor/index.tsx 中新增 onMarkdownImport prop，传递给工具栏，在回调中使用 marked 转 HTML 并用 editor.commands.setContent 填入编辑器
    status: completed
    dependencies:
      - add-toolbar-button
  - id: update-post-editor
    content: 在 post-editor/index.tsx 中新增 handleMarkdownImport 函数，使用 gray-matter 解析 frontmatter，调用 normalizeFrontmatter 映射元数据，通过 handlePostChange 更新表单
    status: completed
    dependencies:
      - update-editor-wrapper
---

## 用户需求

在后台文章编辑器中添加一键导入本地 Markdown 文件的功能。用户点击工具栏按钮后，选择本地的 .md 文件，系统自动解析文件内容并填入编辑器中。

## 产品概述

为文章编辑器增加 Markdown 文件导入能力，让用户可以快速将已有的 Markdown 文档导入到编辑器中继续编辑，无需手动复制粘贴。

## 核心功能

- 工具栏新增"导入 Markdown"按钮，点击触发文件选择器（仅接受 .md 文件）
- 前端使用 `marked` 库将 Markdown 正文转为 HTML，通过 TipTap 的 `setContent` 命令填入编辑器
- 使用 `gray-matter` 解析 frontmatter，自动提取标题、slug、摘要、标签、状态、发布日期等元数据，填入文章表单
- 导入操作可被撤销（使用 TipTap 的 `undo`），用户不满意可以回退
- 兼容 Hugo、Hexo、Jekyll 等主流静态博客的 frontmatter 字段格式

## 技术方案

### 实现策略

在编辑器工具栏添加文件导入按钮，利用浏览器 `<input type="file">` 读取本地 .md 文件，通过 `FileReader` API 读取文件文本内容。前端使用已安装的 `marked` 库将 Markdown 转为 HTML，通过 TipTap editor 实例的 `setContent` 命令填入编辑器。同时使用 `gray-matter` 解析 frontmatter 元数据，通过 PostEditor 的 `handlePostChange` 回调更新文章表单。

### 技术栈

- `marked` (^17.0.3) — Markdown 转 HTML（浏览器端可用）
- `gray-matter` (^4.0.3) — frontmatter 解析
- `@tiptap/react` (^3.20) — 富文本编辑器
- React 19 — UI 框架

### 架构设计

```mermaid
flowchart TD
    A[用户点击工具栏"导入 Markdown"按钮] --> B[触发隐藏的 input type=file, accept=.md]
    B --> C[用户选择 .md 文件]
    C --> D[FileReader 读取文件文本]
    D --> E{gray-matter 解析}
    E --> F[提取 frontmatter 元数据]
    E --> G[提取 Markdown 正文]
    F --> H[normalizeFrontmatter 字段映射]
    H --> I[handlePostChange 更新表单]
    G --> J[marked 转为 HTML]
    J --> K[editor.commands.setContent 填入编辑器]
```

### 数据流

1. 文件选择 → `FileReader.readAsText` → 文本内容
2. `gray-matter(文本)` → `{ data: frontmatter对象, content: markdown正文 }`
3. `normalizeFrontmatter(data)` → 标准化的元数据（title, slug, summary, tags, status 等）
4. `marked.parse(content)` → HTML 字符串
5. `editor.commands.setContent(html)` → TipTap 编辑器更新
6. `handlePostChange(updates)` → PostEditor state 更新

### 实现细节

**文件选择流程**：

- 使用隐藏的 `<input type="file" accept=".md,.markdown,.txt">` 元素
- 按钮点击时通过 ref 触发 input 的 click 事件
- onChange 时读取文件并调用导入处理函数

**元数据映射**（复用现有 `normalizeFrontmatter`）：

- `title` → 文章标题
- `slug` / `url` / `permalink` → URL slug
- `summary` / `description` / `excerpt` → 摘要
- `tags` / `categories` → 标签（字符串数组，需在 PostEditor 中查找/创建对应标签）
- `draft` / `status` → 发布状态
- `publishedAt` / `date` → 发布日期

**标签处理**：frontmatter 中的标签是字符串数组，而 PostEditor 中的 tagIds 是数字数组。导入时需要匹配已有标签名称获取 ID，未匹配到的标签需要提示用户手动添加或自动创建。

**错误处理**：文件读取失败、Markdown 解析异常时通过 toast 提示用户，不影响编辑器当前内容。

### 影响范围

| 文件 | 修改类型 | 说明 |
| --- | --- | --- |
| `src/components/tiptap-editor/ui/editor-toolbar.tsx` | MODIFY | 新增"导入 Markdown"按钮和文件选择逻辑 |
| `src/components/tiptap-editor/index.tsx` | MODIFY | 新增 `onMarkdownImport` prop，传递到工具栏 |
| `src/features/posts/components/post-editor/index.tsx` | MODIFY | 新增 `handleMarkdownImport` 回调，整合导入逻辑 |
| `messages/zh.json` | MODIFY | 新增中文本地化消息 |
| `messages/en.json` | MODIFY | 新增英文本地化消息 |


### 关键代码结构

**EditorToolbar 新增 props**：

```typescript
interface EditorToolbarProps {
  editor: Editor | null;
  onLinkClick: () => void;
  onImageClick: () => void;
  onFormulaInlineClick: () => void;
  onFormulaBlockClick: () => void;
  onMarkdownImport?: (content: string) => void; // 新增
}
```

**PostEditor 新增导入处理函数**：

```typescript
const handleMarkdownImport = useCallback((rawContent: string) => {
  // 1. gray-matter 解析
  const { data, content } = parseFrontmatter(rawContent);
  // 2. 标准化 frontmatter
  const fm = normalizeFrontmatter(data);
  // 3. 更新元数据
  if (fm) {
    const updates: Partial<PostEditorData> = {};
    if (fm.title) updates.title = fm.title;
    if (fm.slug) updates.slug = fm.slug;
    if (fm.summary) updates.summary = fm.summary;
    // ... 更多字段映射
    handlePostChange(updates);
  }
  // 4. marked 转 HTML 并设置编辑器内容
  // 在 EditorToolbar 或 Editor 组件中执行
}, [handlePostChange]);
```