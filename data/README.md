# C-LingoAIOS 教材数据包

## `happy_chinese2/`

快乐中文第二册离线数据包（源：桌面 `~/Desktop/happy_chinese2`）。

| 文件 | 用途 |
|------|------|
| `catalog.json` | **书本目录**：单元 → 课 → 学习目标。驱动 Fun Chinese Hub 课表、课页 Learning Goals |
| `content.json` | 各课学习内容（字/词/句/句型/对话/语法/闪卡），key = 课 `id`（如 `L20063`） |
| `quizzes.json` | 课堂小测（每课约 5 题） |
| `happy_chinese_images/` | 小测配图；路径见 `字段说明.md` |
| `字段说明.md` | 字段权威说明（多语言对象、`catalog` / `content` / `quizzes` 结构） |

运行时通过 `public/data/happy_chinese2` → 本目录的符号链接提供静态访问：

- `/data/happy_chinese2/catalog.json`
- `/data/happy_chinese2/content.json`
- `/data/happy_chinese2/happy_chinese_images/...`

书架上的 **Happy Chinese Volume 2**（`hc-2`）对应本包。Hub DEMO 默认读 **Unit 1**；课序号 `2` = `catalog` 里 `order: 2` 的课（`L20063`「她比我高」）。

代码入口：`src/data/happyChinese2/`（`catalog.json` 有一份拷贝供 Vite 静态 import；`content.json` 运行时 fetch `/data/happy_chinese2/content.json`）。

> 改包内 `catalog.json` 后请同步：`cp data/happy_chinese2/catalog.json src/data/happyChinese2/catalog.json`
