# CLA 3.0 / LumiNation 3.0 — HSK 备考域 · 已交付基线（本版不改）

| 项 | 值 |
|---|---|
| 文档编号 | CLA-3.0-03 |
| 产品系统名 | **C-LingoAIOS**（安卓平板客户端） |
| 对应代码分支 | `C-Lingo-LumiNation-3.0`（最后提交 `29f4e1d` / `LN 3.0.1`） |
| 文档性质 | **基线固化文档（as-built freeze）**，不是 to-be 需求文档 |
| 主读者 | H5 前端、安卓开发、后端开发、**测试（回归主责）** |
| 粒度承诺 | 开发能判断「不能碰什么」、测试能直接写回归用例 |
| 撰写日期 | 2026-09-15 |
| 状态 | 待评审 |
| 上游 | [`00-总纲.md`](00-总纲.md) 第四节（范围边界）、第十一节 R3 |

> **术语强制**：本产品是**安卓平板客户端**，产品系统名 **C-LingoAIOS**。全文不得称其为 iPad、iOS 客户端或苹果平板。交互设计按安卓平板的系统能力与使用习惯判断。

---

## 一、概述：本篇为什么和其他分域文档不一样

### 1.1 文档性质

`01`、`02`、`04`、`05` 四篇写的是 **3.0 要做成什么样**。本篇写的是 **HSK 备考域现在是什么样，并且 3.0 内不许动**。

业务方已决定：**HSK 备考域在 3.0 中写成「已交付基线，本版不改」**。理由：

1. 这块是外包交付物（三个仓库的 PR #1，平板端分支 `feat/hsk-mock-exam-flow-0728` @ `48a2022`），**代码归属尚未与外包约定**，自行改动会放大后续合并冲突面积与责任纠纷（见 `00-总纲.md` 风险 R3）。
2. 接口契约（5 个考试接口 + 请求头 + 返回结构）**已在本地联调验收通过**，动前端等于重新开一轮联调，而后端没有任何线上环境可回归（见工作区 `AGENTS.md`「上线前置条件清单」）。
3. 判卷链路依赖「作答开始时冻结的快照」，任何前端侧的分数推导都会破坏这个契约。

因此本篇的产出目标只有两个：

- **让开发知道不能碰什么**：每个模块标注「本版不改」，并给出代码位置，改动前必须先走第十三节流程。
- **让测试知道回归要测什么**：每个模块末尾给出 **GWT 回归验收标准**。本篇的 GWT **不是新功能验收**，而是**回归验证「冻结行为没有被其他域的改动破坏」**。

### 1.2 「本版不改」的准确含义

| 含义 | 说明 |
|---|---|
| 不改功能 | 不新增、不删除、不调整 HSK 备考域的任何交互与业务规则 |
| 不改接口 | 不改请求路径、请求头、请求体、不改前端消费的返回字段 |
| 不改存储 | 不改 localStorage 键名、结构、写入时机 |
| 不改判卷 | 不在前端做任何分数计算、正误推导 |
| **可以改的**（唯一例外） | 因壳层/多语言/多分辨率改造**被动波及**的样式与文案容器。这类改动必须以本篇 GWT 全量通过为出口条件 |

> 换句话说：`01` 的壳层改造、`06` 的多分辨率与 i18n 改造**会穿过** HSK 页面。允许穿过，但穿过之后必须跑本篇第十二节的回归集。

### 1.3 与既有 HSK PRD 的关系（不重写它们的内容）

| 文档 | 路径 | 本篇与它的关系 |
|---|---|---|
| PRD v2.4 HSK 后台建设 | `PRD/PRD-v2.4-HSK后台建设.md` | 定义**后台侧**：题型管理、试题管理、试卷管理、音频管理、用户与权限、数据统计、操作日志、数据库与 `/api/admin/*` 接口。本篇**不重复**这些内容；凡涉及「题目从哪来、试卷怎么配、音频怎么上传分发」，一律以 v2.4 为准 |
| PRD v2.5 HSK GO 串联 | `PRD/PRD-v2.5-HSK-GO串联.md` | 定义**诊断测试与 HSK GO 对接**：级别选择、诊断测试结构（HSK2 = 25 题 / 25 分钟）、测试结果与学习建议、HSK GO 入口与跳转/内嵌方案、测试历史。本篇第十一节的诊断卷旁支**沿用 v2.5 的术语**，差异点单独列出，不复制其 UI 稿 |

**术语沿用声明**：本篇「试卷 / 试题 / 题型 / 发布」四个词的语义与 v2.4 一致；「诊断测试 / HSK GO」的语义与 v2.5 一致。**注意 v2.4 的题型代码表（`T01`/`T02`/`T03`/`R01`/`R02`/`R03`）是后台题型管理的规划表，与本篇第七节的 9 种交付题型代码（`L01`…`W02`）不是同一套编码**，读文档时不要混用——对不上不是缺陷，是两份文档的作用域不同。[待确认] 两套题型编码是否需要在后台侧做一次对齐映射，需与外包确认。

### 1.4 冻结范围清单

**冻结（本版不改）：**

| 模块 | 主文件 | 本篇章节 |
|---|---|---|
| 接口契约 | `src/services/hskExamService.ts` | 第三节 |
| 作答生命周期 | `src/pages/HSKPrepTrainingPage.tsx` | 第四节 |
| 本地存储与多标签页 | `src/hsk/attemptPointerStore.ts`、`HSKPrepTrainingPage.tsx` | 第五节 |
| 音频独占控制 | `src/hsk/exclusiveAudioPlayer.ts` | 第六节 |
| 9 种题型渲染 | `HSKPrepTrainingPage.tsx` + `src/hsk/hskExamBlueprint.ts` | 第七节 |
| 判卷与结果 | 提交响应 + `getAttemptResultDetail` | 第八节 |
| 等级锁定三层 | `HSKPrepTrainingPage.tsx` | 第九节 |
| 官网 iframe 嵌入协议 | `HSKPrepTrainingPage.tsx` | 第十节 |

**同域但与真实模考链路分离的旁支**（见第十一节，同样不在 3.0 做功能改动，但它们的**处置方式**进第十三节待议）：`/hsk-test`、`/hsk-prep-test`、`/hsk-mock-exam`、`/hsk-skill-drill`、`/hsk-oral-review`、`/hsk-go-study`、`/hsk-standard` 系列、`/question-review`、`/mistakes-review`、`/study-report`、`/daily-gains`。

### 1.5 本篇的阅读顺序建议

- **测试**：直接看第十二节（回归集索引），再按索引回跳到对应模块读细节。
- **前端开发**：第二节（硬约束）→ 第九节（等级锁定）→ 第十三节（想改什么先看这里）。
- **后端开发**：第三节（接口契约）→ 第八节（判卷快照原则）。
- **产品 / 业务方**：第一节 → 第十三节 → 第十四节。

---

## 二、一期硬约束清单

`00-总纲.md` 第四节结论：**一期禁令在 3.0 中的有效范围收窄为「仅 HSK 备考域」**。快乐中文与 AI 评分已按代码现状纳入 3.0 范围，但下列四条在 HSK 域内**仍是硬约束**，任何改动提案都必须走第十三节流程。

### 约束 C1 · HSK1 / HSK2 可进入，HSK3–6 与 HSK7–9 是不可点击的锁定占位

**要求**：锁定等级必须做到三点——不可点击、**不请求试卷数据**、**不能通过路由参数绕过**。

**代码实现位置**（`src/pages/HSKPrepTrainingPage.tsx`，三层，详见第九节）：

| 层 | 位置 | 实现 |
|---|---|---|
| UI 层 | `LEVEL_PICKER_ITEMS`（L368-376）、渲染（L699-704） | HSK3-6 / HSK7-9 的 `enabled: false`，渲染为**不带 `onClick` 的 `Box`**，不是 `disabled` 按钮 |
| 逻辑层 | `handleSelectLevel`、`loadCatalogPapers`（L378、L4269-4288） | 仅当 `PHASE_ONE_LEVELS.has(level)` 才继续，否则直接返回，**不发起 `listPublishedPapers`** |
| 防御层 | `apiPaperToCatalog`（L191-194） | `levelNumber` 非 2 一律归为 1，后端即使返回 HSK3+ 试卷也不会以 HSK3+ 身份进入前端目录 |

URL 侧：`?level=3` 经解析后 `requestedLevel = null`，不触发自动 `handleSelectLevel`，因此不会自动拉卷。

**回归验证方法**：

1. 打开 `/hsk-prep-training`，开 DevTools Network 面板，点 HSK3 / HSK5 / HSK7-9 卡片 → **Network 面板应无任何 `/api/papers` 请求**，页面无跳转。
2. 直接访问 `/hsk-prep-training?level=3` → 停在等级选择页（或 `track` 指定的 HomeScreen），**不得**自动进入 HSK3 试卷列表。
3. 用后端注入一份 `level: "HSK3"` 的已发布试卷，访问 HSK1 列表 → 该卷若出现在列表中，等级标签必须是 HSK1（防御层生效），**不得**出现 HSK3 标签。

> **告警**：三层都是**客户端**约束。路由本身没有 guard，后端 `/api/papers` 也没有等级鉴权。见第九节「勿假设 URL 安全」。

### 约束 C2 · 固定 9 种题型 `L01 L02 L03 R01 R02 R03 R07 W01 W02`

**要求**：前端只渲染这 9 种题型，不新增、不改渲染语义。

**代码实现位置**：`attemptToPaper`（`HSKPrepTrainingPage.tsx` L267-327）把后端 `type` 去掉 `_group` 后缀得到 `templateCode`，再由 `src/hsk/hskExamBlueprint.ts` 映射到 `displayMode`。逐题型细节见第七节。

**回归验证方法**：对 HSK1 与 HSK2 各一份已发布试卷做全卷走查，记录每道题的 `templateCode` 与实际渲染形态，比对第七节的题型表。出现表外 `templateCode`、或某题型 `displayMode` 与表不符，即为回归失败。

### 约束 C3 · 判卷只用作答开始时冻结的计分模式、总分和答案快照，不读当前题库默认分值

**要求**：分数、模块分、单题正误、`scoringMode`、`totalScore`、`passScore` **全部来自后端返回**，前端不做任何计算与推导。

**代码实现位置**：提交后直接消费 `submitAttempt` 响应写入 `examResult`（L4396-4403）；复习详情走 `getAttemptResultDetail` → `AttemptReview.items`。前端无任何对照答案表。

**回归验证方法**：

1. 在一次作答**进行中**，从后台（`NSK-BackEnd`，见 `PRD/PRD-v2.4-HSK后台建设.md`）修改该试卷某题的默认分值或正确答案，然后提交这次作答 → 判卷结果必须仍按**开始作答时**的快照给分，不受后台改动影响。
2. 全局搜索前端代码，确认不存在任何按 `templateCode` 推导答案的分支（约束 C4）。

### 约束 C4 · 不做人工阅卷、AI 评分、反作弊、跨设备成绩同步；答案只来自后端快照

**要求**：

- 前端**不得**从题型代码或题面结构推导答案。
- 无人工阅卷入口、无 AI 评分调用、无反作弊探测（焦点离开、截屏检测等一律不做）。
- 成绩按 `deviceId` 隔离：清除浏览器数据 = 新设备，历史最高分互相隔离，**这是一期设计不是缺陷**。

**代码实现位置**：`getExamDeviceId()`（`hskExamService.ts` L185-192）生成匿名设备标识；`bestScore` / `bestScoreAt` 来自 `listPublishedPapers` 与提交响应，前端不本地累计。

**回归验证方法**：

1. 清除浏览器全部站点数据 → 重新进入，`bestScore` 归零、无历史作答 → 符合预期。
2. 换一个浏览器 profile 做一次考试 → 两个 profile 的最高分互不影响。
3. `/hsk-oral-review` 页面确认仍为纯占位（无录音、无评分接口调用），不得因 `04-AI与工具.md` 的 AI 评分改造被顺手接上（详见第十一节与第十三节 TBD-3）。

### GWT 回归验收 · 一期硬约束

**GWT-C1-01｜锁定等级不可点击且不发请求**
- **Given** 测试在安卓平板客户端打开 `/hsk-prep-training`，已进入等级选择页，DevTools Network 面板已清空
- **When** 依次点击 HSK3、HSK4、HSK5、HSK6、HSK7-9 卡片各一次
- **Then** 页面不发生任何跳转与状态切换；Network 面板中**没有任何** `/api/papers` 或 `/api/papers/{paperId}/attempts` 请求；卡片视觉保持锁定态且无按压反馈

**GWT-C1-02｜锁定等级不能通过 URL 绕过**
- **Given** 后端服务正常，设备已有有效 `X-Clingo-Device-Id`
- **When** 直接访问 `/hsk-prep-training?level=3`（以及 `?level=6`、`?level=9`）
- **Then** 页面停在等级选择页，不自动选中任何等级；无 `/api/papers?level=HSK3` 请求；控制台无未捕获异常

**GWT-C2-01｜题型集合未扩散**
- **Given** HSK1 与 HSK2 各一份已发布试卷
- **When** 逐题走完两份卷子（含示例子题）
- **Then** 出现的 `templateCode` 全集恰为 `L01 L02 L03 R01 R02 R03 R07 W01 W02` 的子集；每题渲染形态与本篇第七节题型表一致

**GWT-C3-01｜判卷用冻结快照**
- **Given** 一次 `status = in_progress` 的作答已开始，且已答完全部题目
- **When** 在提交前从后台修改该试卷某题的分值或正确答案，随后提交
- **Then** 返回的 `score`、`totalScore`、`passScore`、`scoringMode` 与该题正误判定，均与开始作答时的快照一致，不反映后台的即时改动

**GWT-C4-01｜成绩按设备隔离且无跨设备同步**
- **Given** 浏览器 A 已完成一次 HSK1 模考并产生 `bestScore`
- **When** 清除站点数据后重新进入，或改用另一个浏览器 profile 进入
- **Then** 试卷列表中的 `bestScore` 为空；无任何账号登录提示；不出现「同步历史成绩」类入口

---

## 三、接口契约基线（本版不改）

### 3.1 基址与请求头

**文件**：`local-agent-app/src/services/hskExamService.ts`

| 项 | 实现 | 位置 |
|---|---|---|
| 基址 | 环境变量 `VITE_CLINGO_EXAM_API_BASE_URL`，**fallback `http://localhost:8082`** | L1-4 |
| 网关令牌 | `buildExamUrl` 在有 `VITE_CLINGO_GATEWAY_TOKEN` 时把令牌附加到 URL | L194-203 |
| 设备标识头 | 所有请求携带 `X-Clingo-Device-Id` | L205-207 |
| 设备 ID 生成 | `getExamDeviceId()`：localStorage key `clingo-hsk-device-id`；优先 `crypto.randomUUID()`，不可用时 fallback `web-${Date.now()}-${random}` | L185-192 |

**两条必须写进测试意识的事实**：

1. **`X-Clingo-Device-Id` 只是匿名标识，不是鉴权**。它不校验、不签名、可被任意伪造。它的唯一作用是把「同一台设备的作答与最高分」归到一起。不得基于它做任何权限判断。
2. **CORS 当前全放开**。后端 `clingo-api/.../config/PublicExamCorsConfig.java` 硬编码 `allowedOriginPatterns("*")`，任何站点都能调用考试接口。这是已知的上线前置整改项（工作区 `AGENTS.md`「上线前置条件清单」第 6 条），**不在 3.0 前端侧处理**，进第十三节 TBD-7。

> 环境变量提醒（不改代码，但影响联调）：局域网真机验证时 `VITE_CLINGO_EXAM_API_BASE_URL` 必须填**本机局域网 IP**。该基址被打包进前端代码、由浏览器直连 8082，不走 vite 代理；填 `localhost` 时外部设备会解析成它自己，表现为「页面能开但试卷列表空」。

### 3.2 五个接口与前端消费字段

> 下表「前端消费的返回字段」是**契约的实际边界**：后端可以多返回字段，但**少返回或改名下表任一字段都会破坏前端**。

| # | 方法 | 路径 | 请求体 | 前端消费的返回字段 | 位置 |
|---:|---|---|---|---|---|
| 1 | `listPublishedPapers(level?)` | `GET /api/papers`，可选 `?level=HSK{n}` | — | `id`、`name`、`level`、`category`、`durationMinutes`、`questionCount`、`maxPlayCount`、`sectionSummary`、`totalScore`、`passScore`、`bestScore`、`bestScoreAt`、`activeAttemptId`、`activeAttemptExpiresAt` | L35-52、L226-228 |
| 2 | `startAttempt(paperId)` | `POST /api/papers/{paperId}/attempts` | — | `attemptId`、`paperId`、`status`、`startedAt`、`expiresAt`、`delivery.*` | L174-183、L231-232 |
| 3 | `getAttempt(attemptId)` | `GET /api/attempts/{attemptId}` | — | 同 #2，外加恢复用的 `result` | L235-236 |
| 4 | `submitAttempt(attemptId, answers)` | `POST /api/attempts/{attemptId}/submit` | `{ answers: Record<string, string> }` | `score`、`totalScore`、`passScore`、`scoringMode`、`scoreRate`、`passed`、`correctCount`、`incorrectCount`、`unansweredCount`、`durationSeconds`、`bestScore`、`moduleScores`、`reviewSummary` | L103-122、L239-246 |
| 5 | `getAttemptResultDetail(attemptId)` | `GET /api/attempts/{attemptId}/result/detail` | — | `result` + `items[]`（题干、选项、`submitted` / `correctAnswer`、`score`、`explanation`） | L146-172、L249-250 |

### 3.3 字段语义要点

| 字段 | 语义 | 消费方 |
|---|---|---|
| `activeAttemptId` / `activeAttemptExpiresAt` | 该 `deviceId + paperId` 当前是否已有 `in_progress` 作答。**同一组合同时只能有一个**，这是后端约束 | 刷新恢复的 fallback 通道（第五节） |
| `maxPlayCount` | 听力播放次数上限。前端取值优先级 `runtime.maxPlayCount || delivery.maxPlayCount || 2` | 音频独占控制（第六节） |
| `delivery` | 作答开始时冻结的**公开题目快照**（不含答案）+ 听力规则 | 题型渲染（第七节） |
| `scoringMode` | `equal_ratio` 或 `per_item`，决定结果页展示口径 | 判卷与结果（第八节） |
| `sectionSummary` / `moduleScores` | 分模块题量与分模块得分，均来自后端 | 试卷卡与结果页 |

### 3.4 异常与错误处理基线

| 情形 | 现有行为 |
|---|---|
| 网络失败 / 非 2xx | `service` 层抛出，页面捕获后写入 `flowError`，顶栏展示 alert |
| `getAttempt` 返回 404 | 刷新恢复流程中**丢弃该 pointer**，不报错（第五节） |
| `startAttempt` 返回 `status !== 'in_progress'` | 不进入 exam，走错误分支（L4353） |
| 该等级无已发布试卷 | 列表区展示 `No published papers for this level.`（L1326-1329） |
| 会话恢复失败 | 全屏错误态 + Back / Retry（L4537-4597） |

### GWT 回归验收 · 接口契约

**GWT-API-01｜请求头与基址正确**
- **Given** 后端 8082 已启动，`VITE_CLINGO_EXAM_API_BASE_URL` 指向该地址
- **When** 进入 `/hsk-prep-training` 并选择 HSK1
- **Then** Network 面板中 `GET /api/papers?level=HSK1` 请求命中配置基址；请求头含 `X-Clingo-Device-Id`，其值与 localStorage 的 `clingo-hsk-device-id` 一致

**GWT-API-02｜设备 ID 生成与持久化**
- **Given** 浏览器已清除站点数据
- **When** 首次进入 `/hsk-prep-training` 并触发任一考试接口
- **Then** localStorage 新增 `clingo-hsk-device-id`，为 UUID 形态（或 `web-` 前缀 fallback）；刷新页面后该值保持不变

**GWT-API-03｜五个接口路径与消费字段未变**
- **Given** 一次完整作答（开始 → 答题 → 提交 → 看详情）
- **When** 抓取全过程网络请求
- **Then** 依次出现 `GET /api/papers`、`POST /api/papers/{paperId}/attempts`、`POST /api/attempts/{attemptId}/submit`、`GET /api/attempts/{attemptId}/result/detail`；刷新场景额外出现 `GET /api/attempts/{attemptId}`；第 3.2 节所列字段在响应中全部存在且被页面正确展示

**GWT-API-04｜空题库文案**
- **Given** 某等级下后端无任何已发布试卷
- **When** 在该等级的试卷列表页停留
- **Then** 展示 `No published papers for this level.`，不出现空白页、不出现错误 alert

**GWT-API-05｜接口错误不吞掉**
- **Given** 后端停止服务
- **When** 点击开始考试
- **Then** 顶栏出现错误 alert，页面不进入 exam 屏；不产生 `clingo-hsk-active-attempt:*` 键；再次启动后端后重试可正常开始

---

## 四、作答生命周期基线（本版不改）

**主文件**：`local-agent-app/src/pages/HSKPrepTrainingPage.tsx`。路由 `/hsk-prep-training` 是**一期唯一的真实模考主流程**（官网 iframe 嵌的也是这个）。

### 4.1 内屏状态机

页面内部用一个 `screen` 状态在同一路由内切换（L80、L4056），**不换 URL**：

```text
home ──→ papers ──→ intro ──→ exam ──→ result ──→ review
 ↑         ↑          ↑                   │
 └─────────┴──────────┴───────────────────┘
            （各级 Back，website 嵌入模式下隐藏）
```

| 内屏 | 内容 |
|---|---|
| `home` | HomeScreen，等级选择（`LEVEL_PICKER_ITEMS`） |
| `papers` | 该等级已发布试卷列表（含 `bestScore`、时长、题量） |
| `intro` | 考前规则页 |
| `exam` | 答题主界面（倒计时、导航组、侧栏、音频） |
| `result` | 成绩页（来自提交响应） |
| `review` | 逐题复习详情（来自 `getAttemptResultDetail`） |

另有 **VersionScreen**（官方 / C-Lingo 版本选择）位于 `home` 之前；带 `track` 参数时跳过（见第十节）。

### 4.2 URL 参数

| 参数 | 取值 | 作用 |
|---|---|---|
| `mode` | `website` | `isWebsiteEmbed = true`：隐藏各级 Back；退出走 `handleBackToHome` 而非 `navigate('/hsk-test')`；向 parent `postMessage` 状态（第十节） |
| `parentOrigin` | origin 字符串 | postMessage 的目标 origin |
| `track` | `official` \| `clingo` | 跳过 VersionScreen 直接进 HomeScreen；试卷列表按 source 过滤 |
| `level` | `1` \| `2` | 会话恢复完成后自动 `handleSelectLevel`；**`3` 及以上被忽略**（约束 C1） |
| `skin` | — | **代码中完全没有读取**。官网按 `AGENTS.md` 会传这个参数，当前为空实现 → 第十三节 TBD-1 |

### 4.3 完整时序

```text
用户                前端 HSKPrepTrainingPage            后端 8082           localStorage
 │                          │                              │                    │
 │ 选等级 HSK1/HSK2         │                              │                    │
 ├─────────────────────────>│ loadCatalogPapers            │                    │
 │                          ├─ GET /api/papers?level=HSK1 ─>│                    │
 │                          │<──── papers[] ───────────────┤                    │
 │ 选卷 → Start             │                              │                    │
 ├─────────────────────────>│ handleStartExam (L4349)      │                    │
 │                          ├─ POST /api/papers/{id}/attempts ─>│               │
 │                          │<─ attemptId/startedAt/expiresAt/delivery ─┤        │
 │                          │  校验 status==='in_progress' (L4353)      │        │
 │                          ├──────── 写 pointer ──────────────────────────────>│
 │                          │         clingo-hsk-active-attempt:{attemptId}      │
 │                          │  attemptToPaper(delivery) → 题型渲染               │
 │                          │  examDeadlineMs = Date.parse(expiresAt) (L1981-83) │
 │ 作答 / 播放听力          │                              │                    │
 ├─────────────────────────>│ 每次 state 变化 ─────────────────────────────────>│
 │                          │   hsk-attempt-{attemptId}                          │
 │                          │   {answers,currentQuestionIndex,activeSubIndex,playCounts}
 │                          │                              │                    │
 │                  timeRemaining → 0                      │                    │
 │                          │  进入宽限期 60s，isAnsweringClosed = true          │
 │                          │  停止音频，禁作答，**仍可 Submit**                 │
 │                  grace → 0                              │                    │
 │                          │  isExpired = true，Submit 禁用，**无自动交卷**     │
 │ Submit                   │                              │                    │
 ├─────────────────────────>│ POST /api/attempts/{id}/submit {answers} ─>│       │
 │                          │<──── AttemptResult ──────────┤                    │
 │                          ├─ 清 hsk-attempt-*、清 pointer ───────────────────>│
 │                          ├─ 写 clingo-hsk-latest-result ────────────────────>│
 │                          │  screen = result (L4391-4426)                      │
 │ 查看详情                 │                              │                    │
 ├─────────────────────────>│ GET /api/attempts/{id}/result/detail ─>│          │
 │                          │<──── result + items[] ───────┤                    │
 │                          │  screen = review                                   │
```

### 4.4 全部状态分支表

| 状态 | 判定条件 | UI 表现 | 位置 |
|---|---|---|---|
| 会话恢复中 | `sessionRestoring` | 全屏 `Loading exam…` | L4529-4534 |
| 恢复错误 | `sessionRestoreError` | 全屏错误文案 + Back / Retry | L4537-4597 |
| 未开始 | 内屏在 `home`/`papers`/`intro` 且无 active pointer | 正常选级、选卷、看规则 | — |
| 进行中 | `scan.active` 为真，或 pointer 对应作答 `status = in_progress` | 直接进入 `exam` 屏，恢复 index / answers / playCounts | L4192-4235 |
| **宽限期** | `timeRemaining = 0 && graceRemaining > 0`，窗口 **60 秒** | 计时标签变 `Grace period`；`isAnsweringClosed = true` 禁止作答与音频；**Submit 仍可点** | L1960、L2006-2009 |
| 提交中 | `submitting` | 按钮文案 `Submitting…`，防重复提交 | — |
| 已提交 | 提交成功 | `result` 屏展示 `examResult`，异步拉取 review 详情 | L4391-4426 |
| **超时** | `isExpired`（宽限期也耗尽） | 展示 `Time expired`；**Submit 按钮禁用**；**前端无自动交卷** | L2008 |
| 错误 | `flowError` 或 API 抛错 | 顶栏 alert | — |
| 空题库 | `visiblePapers.length === 0` | `No published papers for this level.` | L1326-1329 |

### 4.5 倒计时与宽限期规则（最容易被误改的一块）

| 规则 | 实现 |
|---|---|
| 截止时间来源 | `examDeadlineMs = Date.parse(expiresAt)`；`expiresAt` 不可解析时 fallback 为 `now + durationMinutes * 60s`（L1981-1983） |
| 末段提示 | 剩余 5 分钟内 `isCriticalTime` 为真，用户可隐藏倒计时显示（L2082-2096） |
| 宽限期长度 | **60 秒**（L1960） |
| 宽限期语义 | `isAnsweringClosed = timeRemaining <= 0`（L2009）：**停止一切作答与音频**，但**保留提交能力**，给用户一个「时间到了，但还能把已答的交上去」的窗口 |
| 超时后 | 宽限期耗尽 → `isExpired` → **Submit 禁用**；**前端不自动交卷**，答案留在本地缓存 |

> **这条是本域最反直觉的规则，必须原样保留**：真实模考**超时禁止提交且不自动交卷**；而旁支的诊断卷 `/hsk-mock-exam` **倒计时结束自动交卷**。两者规则相反，见第十一节对照表与第十三节 TBD-5。

### 4.6 作答生命周期六步（冻结）

1. `handleStartExam` 调 `startAttempt(paperId)`（L4349），校验返回 `status === 'in_progress'`（L4353）。
2. 倒计时以 `expiresAt` 为准，fallback `now + duration*60s`（L1981-1983）。
3. 宽限期 60 秒，`isAnsweringClosed = timeRemaining <= 0`（L2009）。
4. 答案缓存键 `hsk-attempt-{attemptId}`，**同一标签页刷新**可恢复 index / answers / playCounts（L1974-1990）。
5. 提交成功后：清 `hsk-attempt-*` → 清 pointer → 写 `clingo-hsk-latest-result`（L4391-4426）。
6. 刷新恢复走 `scanAttemptPointers`，详见第五节。

### GWT 回归验收 · 作答生命周期

**GWT-LIFE-01｜开始作答产生合法 attempt**
- **Given** 设备在 HSK1 某试卷上无进行中作答
- **When** 在 intro 屏点击开始考试
- **Then** 发出 `POST /api/papers/{paperId}/attempts`；响应 `status = in_progress`；页面进入 exam 屏；localStorage 出现 `clingo-hsk-active-attempt:{attemptId}`；倒计时初值等于 `expiresAt - now`（误差 ≤ 2 秒）

**GWT-LIFE-02｜同一 paperId 不产生并行作答**
- **Given** 设备在试卷 P 上已有 `in_progress` 作答
- **When** 回到试卷列表再次点击试卷 P 的开始
- **Then** 不产生第二个 `attemptId`；页面回到原作答（或给出明确的「已有进行中作答」提示），`listPublishedPapers` 返回的 `activeAttemptId` 与本地 pointer 一致

**GWT-LIFE-03｜倒计时以 expiresAt 为准**
- **Given** 后端返回的 `expiresAt` 与 `durationMinutes` 推算值刻意不同（例如剩余 3 分钟，而 `durationMinutes = 25`）
- **When** 进入 exam 屏
- **Then** 倒计时显示按 `expiresAt` 计算，不使用 `durationMinutes`

**GWT-LIFE-04｜宽限期行为**
- **Given** 一次作答的倒计时即将归零
- **When** 倒计时到 0
- **Then** 计时标签变为 `Grace period` 并开始 60 秒倒数；点击任一选项、田字格/文本框输入、点击喇叭均无响应；**Submit 按钮仍可点击**且可成功提交

**GWT-LIFE-05｜超时禁止提交且不自动交卷**
- **Given** 作答已进入宽限期且用户不操作
- **When** 宽限期 60 秒耗尽
- **Then** 展示 `Time expired`；Submit 按钮变为禁用；**页面不自动发出** `POST /api/attempts/{attemptId}/submit`；`hsk-attempt-{attemptId}` 缓存仍在

**GWT-LIFE-06｜提交后清理与落地**
- **Given** 一次可提交的作答
- **When** 点击 Submit 且后端返回成功
- **Then** 按钮期间显示 `Submitting…` 且不可重复点击；成功后 `hsk-attempt-{attemptId}` 与 `clingo-hsk-active-attempt:{attemptId}` 均被清除；`clingo-hsk-latest-result` 写入；页面进入 result 屏并异步加载 review 详情

**GWT-LIFE-07｜末 5 分钟隐藏倒计时**
- **Given** 作答剩余时间进入 5 分钟内
- **When** 使用倒计时区域的隐藏控制
- **Then** 倒计时可被隐藏与恢复；隐藏期间计时逻辑照常推进，宽限期与超时判定不受影响

---

## 五、本地存储基线（本版不改）

### 5.1 四个键

| key | 结构 | 写入时机 | 位置 |
|---|---|---|---|
| `clingo-hsk-active-attempt:{attemptId}` | `{ attemptId, catalog, storedAt }` | `startAttempt` 成功后 | `src/hsk/attemptPointerStore.ts` L83-91；`HSKPrepTrainingPage.tsx` L4354 |
| `clingo-hsk-active-attempt`（legacy，无后缀） | 同上 | **只读迁移**：读到就迁移到新键，新写入一律走带 `attemptId` 的新键 | `attemptPointerStore.ts` L34-35、L58-59 |
| `clingo-hsk-latest-result` | pointer | 提交成功时；恢复到一份已提交的卷子时 | L123、L141-155、L4402 |
| `hsk-attempt-{attemptId}` | `{ answers, currentQuestionIndex, activeSubIndex, playCounts }` | 考试中每次相关 state 变化 | L1961-1968、L2062-2068 |

另有设备标识键 `clingo-hsk-device-id`（见第三节），以及旁支页面自己的键（第十一节），**不要混为一谈**。

### 5.2 多标签页规则（冻结，易被误改）

`AGENTS.md` 的原文要求：「多标签页的『当前作答』指针必须按 `attemptId` 用独立存储键，旧页面只能清自己的键」。当前实现满足：

| 规则 | 实现 | 位置 |
|---|---|---|
| pointer 按 `attemptId` 分键 | 键名后缀就是 `attemptId`，两个标签页两份作答互不覆盖 | `attemptPointerStore.ts` L88-90 |
| 清理只清自己 | 清 pointer 时**只匹配当前 `attemptId`**，不做前缀批量删除 | `attemptPointerStore.ts` L94-110 |
| 跨标签页同步 | 监听 `storage` 事件同步 `attemptInProgress` 状态 | `HSKPrepTrainingPage.tsx` L4101-4109 |

> **反向 checklist（改动踩线信号）**：一旦看到「按 `clingo-hsk-active-attempt` 前缀批量 `removeItem`」「把 pointer 收敛回单键」「用 sessionStorage 替换 localStorage」三者之一，就是破坏了本节基线。

### 5.3 刷新恢复算法（冻结）

`scanAttemptPointers`（L4185-4253）：

```text
1. 扫描 localStorage 中全部 clingo-hsk-active-attempt:* 键（含 legacy 单键迁移）
2. 对每个 pointer 调 GET /api/attempts/{attemptId}
     ├─ 404                 → 丢弃该 pointer（静默，不报错）
     ├─ status=in_progress  → 进入 exam 屏，按 hsk-attempt-{attemptId} 恢复
     │                        currentQuestionIndex / answers / playCounts
     └─ status=submitted    → 进入 result 屏，并写 clingo-hsk-latest-result
3. 若本地无可用 pointer → fallback：调 listPublishedPapers，
   读其中的 activeAttemptId（后端视角的进行中作答），据此恢复
4. 恢复过程中页面处于 sessionRestoring；失败落 sessionRestoreError（Back / Retry）
```

**fallback 通道的意义**：即使本地 pointer 被清（换标签页、清了部分存储），只要后端仍持有 `in_progress` 作答，也能恢复回去；这同时是「同一 `deviceId + paperId` 只能有一个 `in_progress`」约束在前端的兜底表达。

### GWT 回归验收 · 本地存储与恢复

**GWT-STORE-01｜pointer 按 attemptId 分键**
- **Given** 标签页 A 正在做试卷 P1，标签页 B 正在做试卷 P2（两份不同的 `attemptId`）
- **When** 两个标签页均处于 exam 屏
- **Then** localStorage 同时存在 `clingo-hsk-active-attempt:{A}` 与 `clingo-hsk-active-attempt:{B}` 两个键，互不覆盖

**GWT-STORE-02｜旧页面只清自己的键**
- **Given** GWT-STORE-01 的状态
- **When** 在标签页 A 完成提交
- **Then** 仅 `clingo-hsk-active-attempt:{A}` 与 `hsk-attempt-{A}` 被清除；标签页 B 的 pointer 与答案缓存**完好**；标签页 B 刷新后仍能恢复到原作答与原题号

**GWT-STORE-03｜同标签页刷新恢复**
- **Given** 一次进行中的作答，已答 8 题、当前停在第 12 题、某听力组已播 1 次
- **When** 刷新页面
- **Then** 先展示 `Loading exam…`，随后直接回到 exam 屏；答案、`currentQuestionIndex`、`activeSubIndex`、`playCounts` 全部与刷新前一致；倒计时按 `expiresAt` 续算而非重置

**GWT-STORE-04｜失效 pointer 静默丢弃**
- **Given** localStorage 中存在一个指向已不存在作答的 `clingo-hsk-active-attempt:{X}`
- **When** 进入 `/hsk-prep-training`
- **Then** `GET /api/attempts/{X}` 返回 404 后该 pointer 被丢弃；页面正常进入等级/试卷选择，**不展示错误态**

**GWT-STORE-05｜本地 pointer 丢失后的后端 fallback 恢复**
- **Given** 后端存在该设备的 `in_progress` 作答，但本地 `clingo-hsk-active-attempt:*` 已被手动删除
- **When** 进入 `/hsk-prep-training`
- **Then** 通过 `listPublishedPapers` 的 `activeAttemptId` 恢复到进行中作答；若本地答案缓存已丢失，答案为空但题目与倒计时正确

**GWT-STORE-06｜恢复到已提交作答**
- **Given** 本地 pointer 指向的作答后端状态为 `submitted`
- **When** 进入 `/hsk-prep-training`
- **Then** 直接进入 result 屏展示成绩；`clingo-hsk-latest-result` 被写入；不重复发起提交请求

**GWT-STORE-07｜legacy 单键迁移**
- **Given** localStorage 中只有无后缀的 `clingo-hsk-active-attempt`（旧版本遗留）
- **When** 进入 `/hsk-prep-training`
- **Then** 该键被读取并迁移；后续写入落到 `clingo-hsk-active-attempt:{attemptId}`；恢复行为与新键一致

---

## 六、音频独占控制基线（本版不改）

`AGENTS.md` 已把这条列为「已知易错点」：音频需独占控制，切题、进入宽限期、离开答题页都要停当前音频，并用**播放代次令牌**阻止旧 `play()` 的异步回调把已停的音频重新启动。

### 6.1 代次令牌机制

**文件**：`local-agent-app/src/hsk/exclusiveAudioPlayer.ts`

| 机制 | 实现 | 位置 |
|---|---|---|
| 代次计数 | 模块内维护自增的 `generation` | L22-35 |
| `stop()` | **先自增 generation**，再 `pause()` 并清除 listener | L22-35 |
| `play()` | 进入时**捕获当前 generation**；`await` 之后比对，若代次已变则**放弃启动**（不 play、不挂 listener） | L40-64 |

**为什么必须这样**：`HTMLAudioElement.play()` 返回 Promise。用户快速切题时，旧题的 `play()` Promise 可能在新题渲染之后才 resolve；没有代次令牌就会出现「已经切到下一题，上一题的音频却响起来」。代次比对让迟到的回调自然失效。

### 6.2 触发停止的三个时机

| # | 时机 | 实现 | 位置 |
|---|---|---|---|
| 1 | **切换导航组**（切题 / 切听力组） | effect cleanup 调 `stop()` | `HSKPrepTrainingPage.tsx` L2211-2218 |
| 2 | **进入宽限期** | `isAnsweringClosed` 为真时再次 `stop()` | L2220-2223 |
| 3 | **离开答题页** | 组件卸载时走同一 cleanup 链路 | L2211-2218 |

另有一条并发保护：播放进行中若 `audioPlayer.isActive` 为真，**拒绝二次播放**（L2205），防止重复点喇叭叠音、也防止重复消耗播放次数。

### 6.3 播放次数规则

| 规则 | 实现 | 位置 |
|---|---|---|
| 计数维度 | `playCounts[groupId]`，**按音频组计数**，不是按小题 | L325 |
| 上限取值 | `runtime.maxPlayCount || delivery.maxPlayCount || 2` | L325、L2203-2207 |
| 首次进组 | **自动播放一次**（并计入次数） | L2211-2213 |
| 达上限后 | 喇叭不可再触发播放 |  L2203-2207 |
| 持久化 | `playCounts` 写入 `hsk-attempt-{attemptId}`，刷新后不清零 | L1961-1968 |

> **注意取值优先级**：`runtime.maxPlayCount` 优先于 `delivery.maxPlayCount`，最后才是硬编码的 `2`。后端下发规则时若两处不一致，以 `runtime` 为准。

### GWT 回归验收 · 音频独占

**GWT-AUDIO-01｜切题立即停音**
- **Given** 某听力组音频正在播放
- **When** 在音频播放中途切换到另一个导航组
- **Then** 原音频**立即停止**；不出现两段音频重叠；切到新组后，新组音频按「首次进组自动播放」规则播放且只播一次

**GWT-AUDIO-02｜代次令牌阻止迟到回调**
- **Given** 处于某听力组，网络或解码存在延迟
- **When** 点击播放后**立刻**连续切换 3 个导航组
- **Then** 最终停留的组只播放它自己的音频；先前组的音频不会在切走之后响起；`playCounts` 中每组的计数不出现异常跳增

**GWT-AUDIO-03｜进入宽限期停止音频**
- **Given** 某听力音频正在播放且倒计时即将归零
- **When** 倒计时到 0 进入宽限期
- **Then** 音频立即停止；宽限期内点击喇叭无任何播放；`playCounts` 不再增加

**GWT-AUDIO-04｜离开答题页停止音频**
- **Given** 某听力音频正在播放
- **When** 通过提交或退出离开 exam 屏
- **Then** 音频立即停止；在 result / review 屏或退出后的页面上听不到残留音频

**GWT-AUDIO-05｜播放中拒绝二次播放**
- **Given** 某听力音频正在播放
- **When** 连续点击喇叭 5 次
- **Then** 不产生叠音；`playCounts[groupId]` 只增加与实际启动次数相符的值，不因连点被多扣

**GWT-AUDIO-06｜播放次数上限与持久化**
- **Given** 后端下发 `maxPlayCount = 2` 的听力组
- **When** 首次进组自动播放 1 次后，手动再播 1 次，然后尝试第 3 次
- **Then** 第 3 次不可触发，喇叭呈不可用态；刷新页面后该组仍为已达上限，不被重置

---

## 七、9 种题型基线（本版不改）

### 7.1 渲染管线

```text
后端 delivery.type ──去掉 "_group" 后缀──> templateCode
       │                                        │
       │                          src/hsk/hskExamBlueprint.ts
       │                                        ↓
       │                                   displayMode
       ↓                                        ↓
runtime.questions[]  ──拆成子题行──>  题面渲染 + 侧栏题号槽位
```

- 入口：`attemptToPaper`（`HSKPrepTrainingPage.tsx` L267-327）
- 映射表：`src/hsk/hskExamBlueprint.ts`
- 组题：后端一条记录内嵌 `questions` 数组，前端拆成多行子题

### 7.2 题型总表

| 代码 | `displayMode` | 渲染结构 | 用户操作 | 位置 |
|---|---|---|---|---|
| `L01` | `image` | 单题：喇叭 + 三张图片卡 A/B/C | 听音频 → 点选一张图片卡 | L3090-3253 |
| `L02_group` | `text-composite` | 组题：**共享一段音频** + 子题 tab；每个子题若干文字选项 | 听音频 → 在当前子题点选文字选项，**选中后自动跳到下一子题** | L2950-3071、L2111-2116 |
| `L03` | `image-match`（当 `hasCompositeImageOptions`）否则 `text` | image-match：左侧共享图库（字母 A–E 标注），右侧子题列表 | 点左侧图库字母，为右侧各子题分配 A–E；**同一组内字母互斥**（一个字母只能给一个子题） | L2794-2948、L2119-2151 |
| `R01_group` | `image-match` | 同 `L03` 的图片匹配布局 | 同 `L03` | 同上 |
| `R02_group` | `text-composite` | 同 `L02` 的组题文字选择（无音频） | 点选文字选项后自动跳下一子题 | 同 `L02` |
| `R03_group` | `text-composite` | 同 `L02` 的组题文字选择（阅读材料 + 多子题） | 同上 | 同上 |
| `R07` | `text` | 单题：题干 + 四个文字选项 | 单题四选一 | — |
| `W01` | 组题时 `text-composite`，否则 `text` | 依据后端是否成组切换 | **点选**作答，**不写田字格** | — |
| `W02` | `writing`（**全域唯一** `displayMode === 'writing'`，L304-305） | 多行 `TextField`，占位文案「请输入答案」 | 键入答案文本 | L3102-3112 |

**两条最容易被改错的地方：**

1. **`W01` 不是手写题**。它是点选题，**不渲染田字格**。`AGENTS.md`「田字格必须是正方形」的规则约束的是**教材域的汉字书写界面**，不是 HSK `W01`。
2. **`W02` 是 HSK 域唯一的文本输入题**，用多行 `TextField`，不是田字格、不是笔迹画布。

### 7.3 组题拆分与导航

| 机制 | 实现 | 位置 |
|---|---|---|
| 导航组合并 | `buildExamNavGroups` 按 `displayMode` + `audioGroupId` 把子题合并成一个导航组 | L1877-1900 |
| 侧栏槽位合并 | `buildSidebarSlots` 把连续子题合并为 range 格（如 `11–15`） | L1919-1954 |
| 组内自动推进 | `text-composite` 选中当前子题选项后自动跳下一子题 | L2111-2116 |
| 匹配互斥 | `image-match` 组内字母互斥分配 | L2119-2151 |

> **题量口径**（`AGENTS.md` 已记，测试务必知道）：`L02_group`、`R03_group` 一条 delivery 记录内嵌 `questions` 数组（每组 5 小题），所以 **60 题的卷子 delivery 只返回 28 条**。核对题量必须**递归展开**并**排除 `isExample`**。见第八节 8.4。

### 7.4 `isExample` 示例子题（冻结）

HSK 官方卷在部分题型前有「例」。实现如下：

| 规则 | 实现 | 位置 |
|---|---|---|
| 识别 | 子题 id 以 `example-` 为前缀 | L287、L306-310 |
| 侧栏标签 | 单题显示 `Example`；成组显示 `Example · 11–15` | L1919-1954 |
| 题面徽章 | `Example · not scored` | — |
| 作答 | `handleSelectAnswer` **跳过**，不写入 answers | — |
| 匹配 | `image-match` 的字母分配**跳过** | — |
| 未完成计数 | Submit 前的「未作答题数」统计**跳过** | — |

即：**示例子题完整渲染、可见、可读，但不可作答、不计分、不计题号、不计入未完成**。

### GWT 回归验收 · 题型渲染

**GWT-Q-01｜`L01` 听力图片单选**
- **Given** 一份含 `L01` 的 HSK1 试卷，进入该题导航组
- **When** 音频自动播放结束后点击图片卡 B
- **Then** 三张图片卡均完整渲染且可点区域按食指尺寸；B 卡呈选中态、A/C 取消选中；答案写入 `hsk-attempt-{attemptId}` 的 `answers`

**GWT-Q-02｜`L02_group` 共享音频 + 子题 tab 自动推进**
- **Given** 进入一个 `L02_group` 导航组（内含 5 个子题）
- **When** 在子题 1 点选任一文字选项
- **Then** 该选项呈选中态；界面**自动切换到子题 2**；组内共享音频**不重新播放**、`playCounts` 不增加；侧栏该组显示为合并 range 槽位

**GWT-Q-03｜`L03` / `R01_group` 图片匹配互斥**
- **Given** 进入 image-match 组，左侧共享图库含 A–E 五张图，右侧 5 个子题
- **When** 先把字母 C 分配给子题 1，再把字母 C 分配给子题 3
- **Then** 子题 3 取得 C；子题 1 的 C **被取消**（组内字母互斥），不出现两个子题同持 C 的状态

**GWT-Q-04｜`L03` 在非图片选项时降级为 `text`**
- **Given** 一份 `L03` 题目的后端数据**不含**复合图片选项
- **When** 进入该题
- **Then** 渲染为文字选择形态（`text`），不出现空图库或破图占位

**GWT-Q-05｜`R02_group` / `R03_group` 文字组题**
- **Given** 进入 `R02_group` 或 `R03_group`
- **When** 依次作答组内全部子题
- **Then** 渲染与 `L02_group` 一致但**无音频控件**；阅读材料区完整可读；选中后自动推进到下一子题

**GWT-Q-06｜`R07` 单题四选一**
- **Given** 进入 `R07` 题
- **When** 点选任一选项后再改选另一个
- **Then** 单选语义正确（同时只有一个选中）；答案以最后一次选择为准

**GWT-Q-07｜`W01` 是点选题，不渲染田字格**
- **Given** 进入 `W01` 题（成组或单题两种数据各测一次）
- **When** 观察渲染
- **Then** 呈现为文字/选项点选界面；**页面内不存在田字格元素**；成组时按 `text-composite` 行为自动推进

**GWT-Q-08｜`W02` 文本输入**
- **Given** 进入 `W02` 题
- **When** 在输入框键入多行文本后切走再切回
- **Then** 输入框为多行 `TextField`，空态占位为「请输入答案」；切走再切回内容保留；刷新页面后内容仍在（来自 `hsk-attempt-{attemptId}`）

**GWT-Q-09｜`isExample` 示例子题不可作答不计分**
- **Given** 一份含示例子题的试卷
- **When** 尝试点击示例子题的选项 / 为其分配匹配字母
- **Then** 无任何选中反馈，`answers` 中不出现该 id；题面显示 `Example · not scored` 徽章；侧栏显示 `Example`（成组时 `Example · 11–15`）；提交前的未作答计数**不包含**示例子题

**GWT-Q-10｜侧栏槽位与导航组一致**
- **Given** 一份同时含单题与组题的试卷
- **When** 逐个点击侧栏槽位
- **Then** 单题为独立格、组题为 range 格；点击任一槽位跳转到对应导航组；跳转触发音频停止（见 GWT-AUDIO-01）

---

## 八、判卷与结果基线（本版不改）

### 8.1 快照原则（本域最高优先级的业务规则）

| 原则 | 说明 |
|---|---|
| 分数来源 | `score`、`totalScore`、`passScore`、`scoreRate`、`passed`、`correctCount`、`incorrectCount`、`unansweredCount`、`durationSeconds`、`bestScore`、`moduleScores`、`reviewSummary` **全部来自提交响应**（L4396-4403） |
| 计分模板 | `scoringMode` 由**作答开始时冻结的快照**决定，不读当前题库默认分值 |
| 正误来源 | 逐题 `submitted` / `correctAnswer` / `score` / `explanation` 来自 `getAttemptResultDetail` 的 `items[]` |
| 最高分 | `bestScore` 来自后端结果，**不是前端本地比较得出的** |
| 前端职责 | **只渲染，不计算**。前端不得从 `templateCode` 或题面结构推导答案 |

### 8.2 两种 `scoringMode` 的展示口径

| `scoringMode` | 展示 | 位置 |
|---|---|---|
| `equal_ratio` | 结果页展示 **correct / total**（答对题数 / 总题数）口径 | L3376-3384、L4019-4020 |
| `per_item` | 结果页展示**单题分值**口径 | 同上 |

### 8.3 `equal_ratio` 下 score 为 0 是设计如此

`AGENTS.md` 已记录并已在联调中确认：**官方模板（`equal_ratio`）下每题 `score` 均为 0、`moduleScores` 内得分为 null**。

**这不是丢数据、不是接口缺陷、不允许在前端「补算」**。测试遇到该现象应判为通过，不得提 Bug；开发不得为了「看起来好看」在前端按题数乘权重把分数算出来——那样会违反 8.1 的快照原则。

### 8.4 题量核对方法（递归展开）

平板端 delivery 的条数 ≠ 试卷题量。核对步骤：

```text
1. 取 delivery 的题目数组
2. 对每条记录：
     ├─ 若含内嵌 questions[]（L02_group / R03_group 等）→ 递归展开其子题
     └─ 否则计为 1 题
3. 从展开结果中**排除** isExample 为真的子题
4. 得到的数量应等于试卷配置的 questionCount
```

**已知样例**：一份 60 题的卷子，delivery 只返回 **28 条**记录（`L02_group`、`R03_group` 每组内嵌 5 小题）。用 28 去对 60 会误判为丢题。

### GWT 回归验收 · 判卷与结果

**GWT-SCORE-01｜结果全部来自提交响应**
- **Given** 一次已答完的作答
- **When** 点击 Submit
- **Then** result 屏展示的总分、及格线、正确/错误/未答题数、耗时、模块分**逐项等于**提交响应中的对应字段；前端不出现任何与响应不一致的数值

**GWT-SCORE-02｜`equal_ratio` 下 score 为 0 不判缺陷**
- **Given** 使用官方模板（`scoringMode = equal_ratio`）的试卷
- **When** 完成提交并查看结果与详情
- **Then** 结果页按 correct / total 口径展示；详情中每题 `score` 为 0、`moduleScores` 内得分为 null；页面**不展示错误态、不在前端补算分数**；该现象判为**符合预期**

**GWT-SCORE-03｜`per_item` 展示单题分**
- **Given** 使用 `per_item` 模板的试卷
- **When** 查看结果与详情
- **Then** 结果页与详情按单题分值口径展示，数值与响应一致

**GWT-SCORE-04｜复习详情字段完整**
- **Given** 一次已提交的作答
- **When** 进入 review 屏
- **Then** 发出 `GET /api/attempts/{attemptId}/result/detail`；每题展示题干、选项、用户 `submitted` 与 `correctAnswer`、`explanation`；示例子题不参与正误统计

**GWT-SCORE-05｜题量递归核对**
- **Given** 一份配置为 60 题的试卷
- **When** 统计 delivery 返回条数与递归展开后的子题数
- **Then** delivery 条数为 28（组题内嵌），递归展开并排除 `isExample` 后为 60；侧栏题号最大值为 60；不因条数差异报缺陷

**GWT-SCORE-06｜`bestScore` 来自后端**
- **Given** 同一试卷已完成两次作答，第二次分数低于第一次
- **When** 回到试卷列表
- **Then** 该卷展示的 `bestScore` 为两次中的较高分，且与后端 `listPublishedPapers` 返回值一致；前端不出现本地比较得出的不同数值

---

## 九、等级锁定基线（本版不改）

### 9.1 三层实现

| 层 | 文件与位置 | 实现 | 被绕过时的后果 |
|---|---|---|---|
| **UI 层** | `HSKPrepTrainingPage.tsx` L368-376（`LEVEL_PICKER_ITEMS`）、L699-704（渲染） | HSK3-6、HSK7-9 的 `enabled: false`；渲染为**没有 `onClick` 的 `Box`** | 用户能点进锁定等级 |
| **逻辑层** | L378（`PHASE_ONE_LEVELS`）、L4269-4288（`handleSelectLevel` / `loadCatalogPapers`） | 只有 `PHASE_ONE_LEVELS.has(level)` 才继续，否则直接 return，**不请求试卷数据** | 锁定等级会发出 `/api/papers?level=HSK3` |
| **防御层** | L191-194（`apiPaperToCatalog`） | `levelNumber` 非 2 一律当作 1 | HSK3+ 试卷会以 HSK3+ 身份进入前端目录 |

URL 侧：`?level=3` 解析后 `requestedLevel = null`，不触发自动 `handleSelectLevel`，因此不会自动拉卷。

> 渲染成「无 `onClick` 的 `Box`」而不是 `disabled` 按钮，是刻意为之：锁定卡片是**占位展示**，不提供按压反馈，避免用户反复尝试。改造壳层样式时不要顺手把它换成 `<Button disabled>`。

### 9.2 告警：勿假设 URL 安全

**必须写进开发与测试的共识**：

1. **路由本身没有 guard**。`App.tsx` 对 `/hsk-prep-training` 没有任何等级校验中间件，能挡住 HSK3+ 的只有上面三层页面内逻辑。
2. **后端没有鉴权**。`X-Clingo-Device-Id` 只是匿名标识；CORS `allowedOriginPatterns("*")` 全放开。**任何人可以直接 `curl` 后端拿到任意等级的试卷数据**，客户端锁定拦不住这件事。
3. 因此：**锁定等级是产品呈现约束，不是安全边界**。不得把任何需要真正保密的内容（如答案、未发布题库）寄托在这三层上。

真正的收口要在后端做（等级白名单 + CORS 收紧 + 网关鉴权），属于上线前置条件，见第十三节 TBD-6 / TBD-7 与工作区 `AGENTS.md`。

### GWT 回归验收 · 等级锁定

**GWT-LOCK-01｜UI 层锁定态**
- **Given** 进入等级选择页
- **When** 观察并点击 HSK3-6、HSK7-9 卡片
- **Then** 卡片呈锁定视觉；**无按压/涟漪反馈**；点击不触发任何导航或状态变化

**GWT-LOCK-02｜逻辑层不请求数据**（同 GWT-C1-01，回归集中保留一处即可）
- **Given** Network 面板已清空
- **When** 反复点击锁定等级卡片 10 次
- **Then** 无任何 `/api/papers` 请求发出

**GWT-LOCK-03｜URL 参数不绕过**
- **Given** —
- **When** 依次访问 `?level=3`、`?level=4`、`?level=6`、`?level=9`、`?level=abc`、`?level=`（空）
- **Then** 全部停在等级选择页，无自动选级、无数据请求、无未捕获异常

**GWT-LOCK-04｜防御层归一**
- **Given** 后端返回一份 `level = "HSK5"` 的已发布试卷
- **When** 该数据进入前端目录
- **Then** 其等级被归一为 HSK1，不在界面上出现 HSK5 标签；不会因此在等级选择页多出 HSK5 入口

**GWT-LOCK-05｜锁定不等于安全（文档级确认）**
- **Given** 测试直接用 `curl -H "X-Clingo-Device-Id: x" {EXAM_API}/api/papers?level=HSK5`
- **When** 观察返回
- **Then** 后端可能正常返回数据 → **这不判为客户端缺陷**，而是记录为已知的后端上线前置项（TBD-7），确认客户端无对应改动即可

---

## 十、官网 iframe 嵌入基线（本版不改）

官网（`C-Lingo官网`）通过 iframe 嵌入 `/hsk-prep-training`，参数形如 `?mode=website&skin=...&track=...`。

### 10.1 `mode=website` 的三个行为差异

| 差异 | 非嵌入（`/hsk-test` 进入） | `mode=website` |
|---|---|---|
| 各级 Back 按钮 | 显示 | **隐藏** |
| 退出行为 | `navigate('/hsk-test')` | 走 `handleBackToHome`（内屏回到 home，不做路由跳转） |
| 状态外发 | 无 | 向 parent `postMessage` |

### 10.2 postMessage 协议

```ts
// 平板端 → 官网父页面
window.parent.postMessage(
  {
    type: 'clingo:hsk-state',
    screen,       // 'home' | 'papers' | 'intro' | 'exam' | 'result' | 'review'
    inProgress,   // boolean：是否有进行中作答
  },
  parentOrigin   // 来自 URL 的 ?parentOrigin=
);
```

**约定要点**：

- 消息 `type` 固定为 `clingo:hsk-state`。官网侧据此决定是否拦截「关闭 / 离开」操作（有进行中作答时提醒用户）。
- 目标 origin 取自 URL 参数 `parentOrigin`。[待确认] 当前未见对 `parentOrigin` 的白名单校验，是否需要收紧属于安全议题，进第十三节 TBD-7。

### 10.3 `track` 参数

| 取值 | 行为 |
|---|---|
| `official` | 跳过 VersionScreen，直接进 HomeScreen；试卷列表按 source 过滤为官方卷 |
| `clingo` | 同上，过滤为 C-Lingo 卷 |
| 缺省 | 先展示 VersionScreen 让用户选 |

### 10.4 `skin` 参数：官网传了，平板端没读

**事实**：`HSKPrepTrainingPage.tsx` **完全没有读取 `skin`**。而 `AGENTS.md` 记录官网嵌入时会带上这个参数。

**当前后果**：官网不同皮肤下嵌入的 HSK 界面**外观一致**，`skin` 是空参数。这不影响功能，但属于**契约与实现不一致**，进第十三节 TBD-1，**3.0 内不实现**。

### GWT 回归验收 · 官网嵌入

**GWT-EMBED-01｜`mode=website` 隐藏 Back**
- **Given** 通过 `?mode=website&parentOrigin={官网 origin}` 打开
- **When** 在 home / papers / intro / exam / result / review 各屏观察
- **Then** 各级 Back 按钮均不显示；退出操作回到内屏 home，**不跳转**到 `/hsk-test`

**GWT-EMBED-02｜postMessage 协议正确**
- **Given** 官网页面 iframe 嵌入平板端 HSK 页并监听 message
- **When** 依次走 home → papers → intro → exam → result
- **Then** 每次内屏切换官网都收到 `{ type: 'clingo:hsk-state', screen, inProgress }`；进入 exam 后 `inProgress = true`，提交后变为 `false`；消息 origin 与 `parentOrigin` 一致

**GWT-EMBED-03｜`track` 跳过版本选择并过滤**
- **Given** —
- **When** 分别以 `?track=official` 与 `?track=clingo` 打开
- **Then** 均跳过 VersionScreen 直接进 HomeScreen；试卷列表分别只含对应 source 的卷；不带 `track` 时正常展示 VersionScreen

**GWT-EMBED-04｜`skin` 参数当前无效果（记录基线，不判缺陷）**
- **Given** —
- **When** 以不同 `?skin=` 值打开同一页面
- **Then** 界面外观**完全一致** → 判为**符合当前基线**，记录为 TBD-1，不提缺陷

**GWT-EMBED-05｜嵌入态下作答链路完整**
- **Given** 官网 iframe 内的 `?mode=website&track=official&level=1`
- **When** 完整走一次作答（开始 → 答题 → 音频 → 提交 → 看详情）
- **Then** 全流程与非嵌入态行为一致；音频独占、宽限期、超时规则、判卷展示均不变

---

## 十一、与真实模考分离的旁支（务必分章理解）

**这一节存在的唯一目的是防止误判。** HSK 域下有多条路由看起来像考试，但**只有 `/hsk-prep-training` 是接后端的真实模考**。其余页面要么是本地 mock，要么是占位。测试写用例时把旁支的现象拿去对照第四至八节的基线，会产出大量假缺陷。

### 11.1 对照总表

| 路由 | 组件 | 调考试 API | 有 `attemptId` | 超时行为 | 本质 |
|---|---|---|---|---|---|
| `/hsk-prep-training` | `HSKPrepTrainingPage` | **是** | **是** | **宽限期 60s → 禁止提交，无自动交卷** | 真实模考 |
| `/hsk-test` | `HSKTestPage` | 否（**本页无后端调用**） | 否 | — | Preparation Hub 导航页 |
| `/hsk-prep-test` | `HSKPrepTestIntroPage` | 否 | 否 | — | 诊断卷规则页 |
| `/hsk-mock-exam` | `HSKMockExamPage` | **否** | 否 | **倒计时结束自动交卷** | 本地 mock 诊断卷 |
| `/hsk-skill-drill` | `HSKSkillDrillPage` | 否 | 否 | — | drill 卡片，带 `?type=` 时只展示文案 |
| `/hsk-oral-review` | `HSKOralReviewPage` | 否 | 否 | — | AI Speaking Rater **纯占位** |
| `/hsk-go-study` | `HSKGoStudyPlaceholderPage` | 否 | 否 | — | Grammar Snap 静态 mock |
| `/hsk-standard` + 4 子页 | `HSKStandardPageShell` 系列 | 否 | 否 | — | School Edition 静态说明卡 |
| `/question-review` | `QuestionReviewPage` | 否 | 否 | — | 课程题总览，本地判分 |
| `/mistakes-review` | `MistakesReviewPage` | 否 | 否 | — | 错题筛选与练习 |
| `/study-report` | `StudyReportPage` | 否 | 否 | — | 单元学习报告（mock 统计） |
| `/daily-gains` | `DailyGainsPage` | 否 | 否 | — | 静态占位 |

### 11.2 ⚠ 最重要的一条差异：超时规则相反

| | `/hsk-prep-training`（真实模考） | `/hsk-mock-exam`（诊断卷） |
|---|---|---|
| 倒计时归零后 | 进入 **60 秒宽限期**，禁止作答与音频，**仍可手动提交** | **直接自动交卷** |
| 宽限期耗尽 | `Time expired`，**Submit 禁用**，**不自动交卷** | 不存在宽限期概念 |
| 答案去向 | 留在 `hsk-attempt-{attemptId}`，等用户处置 | 立即本地判分 |

**测试注意**：在诊断卷上看到「时间到自动交卷」是**正确的**；在真实模考上看到「时间到自动交卷」是**严重回归缺陷**。反之亦然。两套规则是否要统一是业务议题，见第十三节 TBD-5。

### 11.3 逐页基线

#### `/hsk-test` — Preparation Hub（`HSKTestPage.tsx`）

导航枢纽，**本页无任何后端调用**。

| 元素 | 行为 |
|---|---|
| Diagnostic 入口 | → `/hsk-prep-test` |
| AI Speaking Rater 入口 | → `/hsk-oral-review` |
| Mock 区 HSK1 / HSK2 | → `/hsk-prep-training?track={track}&level={n}` |
| Mock 区 HSK3-6 | `disabled`（约束 C1 在 Hub 侧的体现） |
| Past Papers / C-Test tab | **只改本地 `paperTrack` 状态**，不请求数据 |
| GO 按钮 | → `/hsk-prep-training`，**不带 level** |
| 分数展示 | 读 localStorage `hsk-diagnostic-best-score` 与 `hsk-speaking-latest-score` |

> `hsk-speaking-latest-score` 由 Hub 读取，但 `/hsk-oral-review` 自己**不写**这个键（该页是纯占位）。即口语分数当前**无来源**。见 TBD-3。

#### `/hsk-prep-test` — 诊断卷规则页（`HSKPrepTestIntroPage.tsx`）

Test 01 规则说明：**25 题 / 25 分钟 / 100 分**（与 `PRD/PRD-v2.5-HSK-GO串联.md` 的 HSK2 诊断结构一致）。勾选规则后 Start → `/hsk-mock-exam`。无后端调用。

#### `/hsk-mock-exam` — 本地 mock 诊断卷（`HSKMockExamPage.tsx`）

| 项 | 实现 |
|---|---|
| 题目来源 | `CURRENT_LESSON` 的课程题，**完全不调用考试 API** |
| 题型 | 课程 `ExerciseType`，**不是** `L01`–`W02` |
| `attemptId` | 无 |
| 宽限期 | 无 |
| 超时 | **自动交卷** |
| 结果写入 | `question_{id}_result` + `saveDiagnosticBestScore` |

#### `/hsk-skill-drill`

`?type=` 选择 drill，展示 6 张卡。**带 `type` 时只展示文案，没有答题环节。**

#### `/hsk-oral-review`

AI Speaking Rater **纯占位**：只有 Back 按钮，**无录音、无评分、无接口**。

#### `/hsk-go-study`

Grammar Snap 语法路径**静态 mock**。节点 `locked` 时 `disabled`，**不导航到真实课程**。（与 `PRD/PRD-v2.5-HSK-GO串联.md` 的 HSK GO 对接方案是两回事：v2.5 讨论的是跳转/内嵌官方 HSK GO 应用，本页只是本地静态路径图。）

#### `/hsk-standard` 及 4 个子页

`speaking-pro` / `writing-training` / `study-work-china` / `seminar`，School Edition（Burnside 视觉），共用 `HSKStandardPageShell`，内容**全是静态说明卡**，无 API、无 attempt。`00-总纲.md` 定为 **P2**。

#### `/question-review`、`/mistakes-review`、`/study-report`、`/daily-gains`

| 路由 | 基线 |
|---|---|
| `/question-review` | 课程题总览，读 `location.state.lesson` 或 `CURRENT_LESSON`，**本地判分**写 `question_{id}_result`。**不是** HSK 后端 review API（那是 `getAttemptResultDetail`） |
| `/mistakes-review` | 从 `question_*_result` 筛出错题 + 错题练习模式 |
| `/study-report` | 单元学习报告（词汇/句型/汉字统计为 mock）；`?hskLevel=1-6` **只影响展示标签**，不影响数据 |
| `/daily-gains` | **静态占位**（硬编码 1240 词等） |

### GWT 回归验收 · 旁支分离

**GWT-BRANCH-01｜Hub 无后端调用**
- **Given** Network 面板已清空
- **When** 进入 `/hsk-test`，切换 Past Papers / C-Test tab 各两次
- **Then** **无任何**考试 API 请求；tab 切换只改变本地展示；HSK3-6 的 Mock 入口为 `disabled`

**GWT-BRANCH-02｜诊断卷不接后端且超时自动交卷**
- **Given** 通过 `/hsk-prep-test` 勾选规则后进入 `/hsk-mock-exam`
- **When** 放任倒计时归零
- **Then** 全程**无任何** `/api/*` 考试接口请求；**自动交卷**并展示本地判分结果；写入 `question_{id}_result` 与诊断最高分；**不产生** `attemptId` 或 `clingo-hsk-active-attempt:*`

**GWT-BRANCH-03｜真实模考超时不自动交卷（与 GWT-BRANCH-02 互为反证）**
- **Given** `/hsk-prep-training` 的一次作答进入宽限期且用户不操作
- **When** 宽限期耗尽
- **Then** **不自动提交**；Submit 禁用；这与诊断卷行为相反，**属于预期**

**GWT-BRANCH-04｜占位页保持占位**
- **Given** —
- **When** 依次访问 `/hsk-oral-review`、`/hsk-go-study`、`/hsk-standard` 及其 4 个子页、`/daily-gains`
- **Then** 页面正常渲染、有明确返回路径、**无接口调用**、无录音/评分能力；不出现裸空白页与未捕获异常

**GWT-BRANCH-05｜`/hsk-skill-drill` 带 type 时无答题**
- **Given** —
- **When** 访问 `/hsk-skill-drill` 与 `/hsk-skill-drill?type={任一}`
- **Then** 无 type 时展示 6 张卡；带 type 时只展示文案，**无答题交互**

**GWT-BRANCH-06｜本地判分页与 HSK 后端 review 不串**
- **Given** 一次课程题作答与一次 HSK 模考作答都已完成
- **When** 分别进入 `/question-review` 与模考 review 屏
- **Then** `/question-review` 数据来自 `question_{id}_result`（本地），模考 review 来自 `getAttemptResultDetail`（后端）；两者数据互不污染，`/mistakes-review` 只收录课程题错题

---

## 十二、回归验收 GWT 总集（本篇最重要的产出）

### 12.1 用法

- 本节是**索引与执行规范**，用例正文在各模块末尾（点编号回跳）。
- **触发条件**：任何触及壳层（`01`）、多分辨率与 i18n（`06`）、路由表（`App.tsx`）、公共组件库的改动合并前，必须跑 **必跑集**；发版前跑**全量集**。
- **判定**：任一必跑用例失败即阻塞合并。失败先按「是否触碰了本篇冻结范围」定位，再按第十三节流程处置——**不得为了让用例通过而改 HSK 业务逻辑**。

### 12.2 回归集索引

| 编号 | 名称 | 模块 | 必跑 |
|---|---|---|:--:|
| GWT-C1-01 | 锁定等级不可点击且不发请求 | 硬约束 | ✅ |
| GWT-C1-02 | 锁定等级不能通过 URL 绕过 | 硬约束 | ✅ |
| GWT-C2-01 | 题型集合未扩散 | 硬约束 | ✅ |
| GWT-C3-01 | 判卷用冻结快照 | 硬约束 | ✅ |
| GWT-C4-01 | 成绩按设备隔离且无跨设备同步 | 硬约束 | |
| GWT-API-01 | 请求头与基址正确 | 接口 | ✅ |
| GWT-API-02 | 设备 ID 生成与持久化 | 接口 | |
| GWT-API-03 | 五个接口路径与消费字段未变 | 接口 | ✅ |
| GWT-API-04 | 空题库文案 | 接口 | |
| GWT-API-05 | 接口错误不吞掉 | 接口 | |
| GWT-LIFE-01 | 开始作答产生合法 attempt | 生命周期 | ✅ |
| GWT-LIFE-02 | 同一 paperId 不产生并行作答 | 生命周期 | ✅ |
| GWT-LIFE-03 | 倒计时以 `expiresAt` 为准 | 生命周期 | |
| GWT-LIFE-04 | 宽限期行为 | 生命周期 | ✅ |
| GWT-LIFE-05 | 超时禁止提交且不自动交卷 | 生命周期 | ✅ |
| GWT-LIFE-06 | 提交后清理与落地 | 生命周期 | ✅ |
| GWT-LIFE-07 | 末 5 分钟隐藏倒计时 | 生命周期 | |
| GWT-STORE-01 | pointer 按 `attemptId` 分键 | 存储 | ✅ |
| GWT-STORE-02 | 旧页面只清自己的键 | 存储 | ✅ |
| GWT-STORE-03 | 同标签页刷新恢复 | 存储 | ✅ |
| GWT-STORE-04 | 失效 pointer 静默丢弃 | 存储 | |
| GWT-STORE-05 | 本地 pointer 丢失后的后端 fallback 恢复 | 存储 | |
| GWT-STORE-06 | 恢复到已提交作答 | 存储 | |
| GWT-STORE-07 | legacy 单键迁移 | 存储 | |
| GWT-AUDIO-01 | 切题立即停音 | 音频 | ✅ |
| GWT-AUDIO-02 | 代次令牌阻止迟到回调 | 音频 | ✅ |
| GWT-AUDIO-03 | 进入宽限期停止音频 | 音频 | ✅ |
| GWT-AUDIO-04 | 离开答题页停止音频 | 音频 | ✅ |
| GWT-AUDIO-05 | 播放中拒绝二次播放 | 音频 | |
| GWT-AUDIO-06 | 播放次数上限与持久化 | 音频 | ✅ |
| GWT-Q-01 … GWT-Q-10 | 9 题型 + 侧栏槽位 | 题型 | ✅（全部） |
| GWT-SCORE-01 | 结果全部来自提交响应 | 判卷 | ✅ |
| GWT-SCORE-02 | `equal_ratio` 下 score 为 0 不判缺陷 | 判卷 | ✅ |
| GWT-SCORE-03 | `per_item` 展示单题分 | 判卷 | |
| GWT-SCORE-04 | 复习详情字段完整 | 判卷 | ✅ |
| GWT-SCORE-05 | 题量递归核对 | 判卷 | ✅ |
| GWT-SCORE-06 | `bestScore` 来自后端 | 判卷 | |
| GWT-LOCK-01 … 05 | 等级锁定三层 + 安全告警 | 锁定 | ✅（01/03） |
| GWT-EMBED-01 … 05 | 官网嵌入协议 | 嵌入 | ✅（01/02/05） |
| GWT-BRANCH-01 … 06 | 旁支分离 | 旁支 | ✅（02/03） |

### 12.3 端到端回归（跨模块，本节新增）

**GWT-E2E-01｜单次完整模考全链路**
- **Given** 后端 8082 正常、后台有一份已发布的 HSK1 试卷、设备无进行中作答
- **When** 从 `/hsk-test` 进入 → 选 HSK1 → 选卷 → 读规则 → 开始 → 完整作答（含听力播放、组题自动推进、图片匹配、`W02` 文本输入、跳过示例子题）→ 提交 → 查看详情
- **Then** 全链路无未捕获异常；接口调用序列符合 GWT-API-03；音频全程独占；结果与详情数值全部来自后端；localStorage 最终只留 `clingo-hsk-device-id` 与 `clingo-hsk-latest-result`（`hsk-attempt-*` 与 pointer 已清）

**GWT-E2E-02｜中断与恢复全链路**
- **Given** 一次进行中的作答，已答部分题、已播部分听力
- **When** 依次执行：刷新页面 → 关闭标签页后重新打开 → 手动删除本地 pointer 后重新进入
- **Then** 三种情况均能恢复到进行中作答；前两种答案与 `playCounts` 完整；第三种通过 `activeAttemptId` fallback 恢复题目与倒计时；三种情况倒计时均按 `expiresAt` 续算

**GWT-E2E-03｜壳层/多分辨率改造后的 HSK 不破版**
- **Given** `01` 壳层与 `06` 多分辨率改造已合入
- **When** 在 1024×768、960×540、1920×1125、2000×1200 四种分辨率下各走一遍 GWT-E2E-01
- **Then** 题面、图片卡、侧栏槽位、倒计时、喇叭、Submit 全部可见可点（按食指尺寸）；无横向滚动、无元素重叠；**业务行为与 GWT-E2E-01 完全一致**

**GWT-E2E-04｜多语言改造后的 HSK 不改语义**
- **Given** `06` 的 i18n 基座已合入（含阿拉伯语 RTL）
- **When** 切换界面语言后走 GWT-E2E-01
- **Then** HSK 题目内容（中文题干、选项）**不被翻译**；界面控件文案按语言切换；RTL 下答题区布局不错位；作答、判卷、存储行为完全不变

---

## 十三、HSK 域待议项（需与外包约定代码归属后再排期）

**全部 `[待确认]`，3.0 内一律不做。** 任何一项要动，必须先完成两件事：

1. 与外包（PR #1 交付方）约定**该文件的代码归属**与后续交付边界；
2. 评估对已验收接口契约的影响，并确认是否需要重新联调。

### TBD 清单

| # | 议题 | 现状 | 影响 | 建议处置方向 |
|---|---|---|---|---|
| **TBD-1** | **`skin` 参数未实现** `[待确认]` | 官网按 `AGENTS.md` 会传 `?skin=`，`HSKPrepTrainingPage.tsx` **完全不读**。不同皮肤下嵌入外观一致 | 契约与实现不一致；官网侧多品牌/多客户皮肤诉求无法落地 | 二选一：(a) 官网停止传该参数，更新 `AGENTS.md`；(b) 平板端实现 skin 主题映射。需先确认业务上是否真有多皮肤需求 |
| **TBD-2** | **超时无自动交卷是否符合预期** `[待确认]` | 宽限期 60s 耗尽后 `Time expired`，**Submit 禁用且不自动交卷**，答案留在本地缓存 | 用户答了一整卷却因超时拿不到成绩；后端该 attempt 长期挂在 `in_progress`，且会阻塞同一 `deviceId + paperId` 的新作答 | 需业务方裁定：是保持现状（贴近真实考场「交卷截止」语义），还是改为宽限期结束自动提交。改动涉及后端 attempt 过期策略，属跨端议题 |
| **TBD-3** | **`/hsk-oral-review` 占位如何收口** `[待确认]` | AI Speaking Rater 纯占位，无录音无评分无接口；但 `/hsk-test` Hub 会读 `hsk-speaking-latest-score` 展示分数 → **该分数当前无来源，永远为空** | Hub 上出现永远空着的分数位，信任受损（对应 `00-总纲.md` 风险 R8） | 三选一：(a) Hub 隐藏该分数位，页面改为明确「敬请期待」；(b) 下线该入口；(c) 接入 `04-AI与工具.md` 的评分能力——但这会触碰一期「不做 AI 评分」在 HSK 域内的硬约束，需业务方明确豁免 |
| **TBD-4** | **`/hsk-standard` 系列（5 个页面）P2 处置** `[待确认]` | School Edition 静态说明卡，无 API 无 attempt，`00-总纲.md` 定为 P2 | 5 条路由长期占位；面向学校客户的商务承诺不明 | 需业务方给出：是否仍有学校客户诉求？若无，建议整块从路由表摘除；若有，独立立项并给内容源 |
| **TBD-5** | **诊断卷与模考两套规则是否要统一** `[待确认]` | `/hsk-mock-exam` 超时**自动交卷**、本地判分、无 `attemptId`；`/hsk-prep-training` 超时**禁止提交**、后端判分、有 `attemptId`。两者规则相反 | 用户在同一产品内遇到相反的超时行为，认知成本高；测试易误判 | 需业务方裁定统一方向。若统一，建议诊断卷也接后端（与 `PRD/PRD-v2.5-HSK-GO串联.md` 的「测试历史记录」后端需求呼应），而非把模考改成自动交卷 |
| **TBD-6** | **路由级 guard 缺失** `[待确认]` | `App.tsx` 对 `/hsk-prep-training` 无等级 guard；锁定只靠页面内三层 | 页面内逻辑一旦被改动，锁定即失效且无第二道防线 | 建议加一层路由级参数校验（把 `PHASE_ONE_LEVELS` 上提）。属防御性改动，但会改到 HSK 页面入口，需先定归属 |
| **TBD-7** | **CORS 收紧与匿名标识安全边界** `[待确认]` | 后端 `PublicExamCorsConfig.java` 硬编码 `allowedOriginPatterns("*")`；`X-Clingo-Device-Id` 无校验；`parentOrigin` 无白名单 | 任何站点可调考试接口；设备标识可伪造；postMessage 目标 origin 可被构造 | 属**上线前置条件**（工作区 `AGENTS.md` 清单第 6 条），由后端与运维侧处理；前端侧仅需在 `parentOrigin` 上加白名单校验。3.0 不做 |
| **TBD-8** | **两套题型编码是否对齐** `[待确认]` | `PRD/PRD-v2.4-HSK后台建设.md` 的后台题型表用 `T01/T02/T03/R01/R02/R03`；交付实现用 `L01/L02/L03/R01/R02/R03/R07/W01/W02`。`R01`–`R03` 字面相同但语义不必然相同 | 后台配置人员与前端开发对同一代码的理解可能不一致，配错题型 | 需与外包确认后台实际使用的编码表，并在 v2.4 或本篇补一张映射表 |
| **TBD-9** | **HSK 域埋点** `[待确认]` | `PRD/PRD-v2.5-HSK-GO串联.md` 第 5 节定义了 `hsk_level_select`、`hsk_test_start`、`hsk_test_answer`、`hsk_test_complete`、`hsk_go_click` 五个事件；当前实现**未见埋点** | `00-总纲.md` 的 KPI 在 HSK 域不可测 | `06-非功能需求.md` 的埋点体系若要覆盖 HSK 域，就必须改 HSK 页面 → **与「本版不改」冲突**。需业务方裁定：HSK 域是否豁免埋点，或把埋点作为唯一允许的 HSK 侧改动（改动面小、不触碰业务逻辑） |

> **TBD-9 是本篇内部唯一的真实冲突点**，建议评审时优先裁定：要么 HSK 域在 3.0 内不做埋点（KPI 缺 HSK 数据），要么把「只读式埋点」列为冻结例外。

---

## 十四、本篇 `[待确认]` 清单

| # | 事项 | 出处 | 责任方 | 优先级 |
|---:|---|---|---|---|
| 1 | 两套题型编码（v2.4 `T01…` vs 交付 `L01…`）是否需要对齐映射表 | 1.3、TBD-8 | 产品 + 外包 | 中 |
| 2 | `skin` 参数：官网停传 还是 平板端实现 | 10.4、TBD-1 | 产品 + 官网 | 中 |
| 3 | `parentOrigin` 是否需要白名单校验 | 10.2、TBD-7 | 前端 + 安全 | 高 |
| 4 | 宽限期耗尽后是否改为自动交卷 | 4.5、TBD-2 | 业务方裁定 | **高** |
| 5 | 超时后挂在 `in_progress` 的 attempt 由谁、何时过期 | TBD-2 | 后端 + 外包 | **高** |
| 6 | `/hsk-oral-review` 占位收口方式（隐藏分数位 / 下线 / 接评分） | 11.3、TBD-3 | 业务方裁定 | 高 |
| 7 | `hsk-speaking-latest-score` 无写入方，是否移除 Hub 上的分数位 | 11.3、TBD-3 | 产品 | 中 |
| 8 | `/hsk-standard` 5 个页面是否保留 | 11.3、TBD-4 | 业务方 | 低 |
| 9 | 诊断卷与模考两套超时规则是否统一、统一到哪一侧 | 11.2、TBD-5 | 业务方裁定 | 高 |
| 10 | 诊断卷是否按 `PRD/PRD-v2.5-HSK-GO串联.md` 接后端测试历史 | 11.3、TBD-5 | 产品 + 后端 | 中 |
| 11 | 是否加路由级等级 guard | 9.2、TBD-6 | 前端（需先定归属） | 中 |
| 12 | 后端 CORS 收紧与考试接口鉴权时间点 | 3.1、9.2、TBD-7 | 后端 + 运维 | **高** |
| 13 | **HSK 域是否豁免埋点；若不豁免，埋点是否作为冻结例外** | TBD-9 | 业务方裁定 | **高** |
| 14 | HSK 域代码归属与后续外包交付边界的书面约定 | 1.1、第十三节前言 | 业务方 + 外包 | **高** |
| 15 | 回归集「必跑集」的执行频率与责任人（每次合并 / 每日 / 发版前） | 12.1 | 测试负责人 | 中 |

---

**上一篇** → [`02-首页与教材.md`](02-首页与教材.md)　|　**下一篇** → [`04-AI与工具.md`](04-AI与工具.md)　|　**总纲** → [`00-总纲.md`](00-总纲.md)
