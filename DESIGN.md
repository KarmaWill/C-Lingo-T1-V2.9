# C-LingoAIOS · UI 风格

安卓平板客户端视觉手册。业务规则（`attemptId`、一期 9 题型、HSK3+ 锁定、禁称 iPad）仍以仓库根目录 `AGENTS.md` 为准。

## 怎么用

1. 改某一页 UI：**只接受用户给的 Figma CSS 或 PNG**。没有这两样，不改皮、不编布局。
2. Locked 项与稿打架 → 听本文。该页独有内容布局 → 听这份 CSS/PNG。做完把可复用的补回本文 Locked。
3. 稿是 **Figma 1920×1200** 出数（个别选版本页用过 2508，换算进 1920 再 `figmaPx`）。

## 权威

| 听谁 | 管什么 |
|---|---|
| `AGENTS.md` | 产品名、一期范围、作答生命周期、音频令牌 |
| 本文 Locked | 壳、底栏、缩放、Back、色与圆角、已改页的铬 |
| 用户这份 Figma CSS / PNG | 这一页还没锁定的内容布局 |
| 代码 | 与 `AGENTS.md` 旧注释冲突时，以当前组件为准 |

## Locked

已在代码里。改任何页都要遵守。

### 画布与缩放

- 稿基准 **1920** 宽。运行时 `figmaPx(n, APP_SCREEN_SIZE)`。
- `APP_SCREEN_SIZE` = `VITE_SCREEN_SIZE`，未设时是 **`2000x1200`**。`MainLayout` / 底栏 / 页面 fallback 必须同一字符串，禁止一处 2000、一处 1024。
- 实现：`src/utils/figmaScale.ts`。`figmaScale()` 未传尺寸时按 1024/1920——**不要用这个默认值当壳尺寸**。
- 固定块（顶栏、底栏、Back）用 `figmaPx`。中间互动区 **flex 吃满剩余高度**，不要把稿上 160+40+960+40 加成绝对高度。
- `HubContainBoard` 只给「整块插画/固定画板」用，宿主必须 `width/height: 100%`。选级、选卷、答题这类流式页 **不要** 整页塞进 1920 contain。

### 字体

`FIGMA_FONT` / `APP_FONT_FAMILY`：Google Sans Flex → Noto Sans SC / Source Han Sans CN。

界面默认 **英文**。中文是内容（题干、听力/阅读标签），不是 chrome 默认语言。

### 色

| 角色 | 色 |
|---|---|
| 主青绿 | `#00B4A0`；渐变常见 `#00B4A0 → #26D6C3 → #37E7D4` |
| 选中/当前 | `#1CCFBD → #37E7D4`；图标 mask `#1BE0CA → #00B4A0` 或底栏现用 `#7BFFF2 → #00B1FF` |
| 强调橙 | `#FF6B35`（官方标、喇叭）；喇叭渐变 `#FF6B35 → #FF926A → #FFB99F` |
| 场景绿 | `#3FB266`（AI Scenarios 卡） |
| 页底 | `#F6F7F9` / `#F8F9F8` / `#FAFAFA` |
| 奶油底 | `#FFF8F0`（模考选版本页） |
| 表面 | `#FFFFFF` |
| 线 | `#E0E0DF` 控件边；`#E5E7EB` / `#E8ECEF` 顶底分割；`#E6EBF0` 侧栏边 |
| 卡边 | `#DDE4EA`；未答题号 `#D1DBE6` |
| 主文字 | `#292E2E` / `#1D1D1F` / `#2D3436` |
| 次文字 | `#6E6E73` / `#636E72` |
| 弱文字 | `#A5B0BA` / `#99ABBF` |
| 闲置图标 | `#D5D5D5` |
| 次按钮底 | `#F3F4F6`（Submit、角标未选） |
| 选中光晕 | `0px 0px 24px #BBD8D5` |
| 底栏阴影 | `0px 4px 20px rgba(213,213,213,0.6)` |

不要另起一套蓝主色（旧答题页 `#3B82F6` 已淘汰）。

### 触控与圆角

面向食指，最小热区大约 **80×80**。不要做 44 灰圆当主返回。

| 件 | 稿尺寸 | 圆角 |
|---|---|---|
| 返回 / 方图标钮 | 80×80 | 圆 = `100px`；方 = 16–18 |
| 备考线 Back 位置（intro） | 顶左 (60, 78) | `HskPrepBackButton` |
| 考试顶栏 Back | 垂直居中于 160 顶栏，左约 47 | 同组件，可用 `sx` 缩放到 `figmaPx` |
| 主按钮（下一题、Start） | 250×76 量级 | 38 |
| 图片选项卡 | 360×360 | 48 |
| 选项角标 | 60×60 | 36 |
| 题号格 | 71×69 | 15 |
| 复合题区间条 | 约 401×70 | 35 |

返回：白底、`1px #E0E0DF`、chevron `#2D3436`。组件：`src/components/hsk/HskPrepBackButton.tsx`。备考线复用它，不要再画灰底圆。

### 壳 · 底栏 4+1

文件：`src/components/MainUI/BottomNavigator.tsx`（以该文件 `FIGMA` 为准）。

- 左胶囊 4 个 tab + 右 Camera，Camera **不进** 胶囊。
- 选中：SVG **mask 填渐变**，不要青绿方底 + 反白。
- 未选中：`#D5D5D5`。
- 白底 + 上表阴影。
- 回溯：整栏缩成约 381×69 = dock 被改成 shrink-to-content，或 gap 130 被算成中心距。

### 壳 · 顶栏头像

`src/components/home/HubLangProfile.tsx`：`/images/clingo-mascot-avatar.png`（像素已水平翻转，朝左）。不要用 `fox-avatar.png`，不要再 `scaleX(-1)`。

### 备考线已落地页

路由：`/hsk-prep-test`、`/hsk-prep-training`（选版本 / 选级 / 选卷 / 开考 intro / 答题）。

- 顶栏约 160 高、白底、底边 `#E5E7EB`。标题居中，倒计时在标题下。
- 考试 Submit：灰底 `#F3F4F6`、圆角 50，不是青绿实心小钮。
- 考试反馈：考试路由默认藏 `FeedbackEntryButton`，顶栏自画并用 `openFeedback({ screen: 'hsk_exam', force: true })`。
- 左进度轨：白底、听力青绿竖标 +「听力」、阅读灰标 +「阅读」、`Part n`。
- L01：题号 `n · 题干`，不要「Question 1 L01 图片选择」。喇叭 120×80 橙渐变。三张 360 方卡。
- 底栏 Previous 白描边；Next 青绿渐变；未答完 Next disabled。
- 只换皮：不要改 `attemptId`、本地答案、听力次数、`ExclusiveAudioPlayer`。

### AI 练习模式

`/ai-chat` 的 `TopicSelectionScreen`：全屏、无底栏。页底 `#F8F9F8`，顶栏 160。左 Free Chat 橙卡，右 Scenarios 绿卡 + 280 方场景。回溯：又出现「Choose practice mode」+ 窄双栏 + 「DIY」= 旧分辨率分支被加回来了。

## Target

全产品要长成上面这套语言。下面这些页 **现在还不是**，标待稿。没有 CSS/PNG，不优化。

| 页 | 状态 |
|---|---|
| 壳（顶栏头像、底栏 4+1、状态栏） | Locked |
| `/ai-chat` 选模式 | Locked |
| HSK 备考线（诊断 intro + 模考到答题） | Locked 铬；各题型内容布局仍可按新稿补 |
| `/hsk-test` 入口 | 部分；新稿再对齐 |
| Library / 书架 / 点读 | 待稿 |
| `/Home` 教材、课程、课时 | 待稿 |
| Camera | 待稿 |
| Profile / 设置 | 待稿 |
| 快乐中文（一期不展示） | 不改 |
| HSK 成绩页 / 技能练 / 口语复盘 | 待稿 |
| Explore `/apps` | 部分；新稿再对齐 |

Target 共性（有稿时一起用，不要另起炉灶）：

- 去儿童化，12+，东南亚 / 欧美。
- 弧线触摸、大圆角、白表面、青绿主色、橙作强调，不用卡通 Q 版装饰当主交互。
- 一屏能放下的首页不制造页内滚动；中间区 flex，底栏用 `getBottomNavReserve` 留空。
- 食指热区；主操作不要小于约 80。
- 汉字田字格必须 `aspect-ratio: 1 / 1`。

## 禁止

- 称本产品为 iPad / iOS / 苹果平板。交互按安卓平板。
- 为过 detector 去改考试进度条的 `transition: width`。
- 整页 1920 绝对定位塞进 `HubContainBoard` 当「适配」。
- 没有 Figma CSS / PNG 时「顺手美化」待稿页。
- 把 DESIGN.md 的颜色抄进作答/判卷逻辑。

## 改页清单

有稿之后按这个做，不要加步骤：

1. 把 CSS/PNG 对上 Locked（Back、色、`figmaPx`、底栏是否该在）。
2. 只动该页皮。考试页不碰 `attemptId` / 音频令牌。
3. 可复用的铬写回本文 Locked，待稿表改状态。
