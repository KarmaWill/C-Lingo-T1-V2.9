# local-agent-app — 开发约束

产品规则、术语、启动命令、一期范围在上一层 `C-Lingo T1 V2.9/AGENTS.md`,先读那份。这份只讲 git 与代码改动的硬约束。

完整背景见 `产品看版/docs/HSK-联调协作-SOP.md` 与 `产品看版/decisions/2026-07-29-hsk-frontend-ownership-conclusion.md`。

## 基线

本轮 UI 优化基于外包开发者 Leon(git 署名 `Leon <leon_hfut@foxmail.com>`,中文名张晨)交付的 PR #1,最新提交 **`48a2022`**。

**基线只认 SHA,不认分支名。** 本地存着两个名字极像的分支:

```text
feat/hsk-mock-exam-flow        @ 59b5bdf   ← 0724 旧版,不要用
feat/hsk-mock-exam-flow-0728   @ 48a2022   ← 当前基线
```

拿错的后果是缺 `fix: align tablet scoring mode display` 那个计分模式修复。

## main 分支冻结

`main` 对应 Vercel 项目 `c-lingo-t1-v2-9` 的生产环境,push 即自动部署。当前阶段:

- 不 checkout 到 `main`
- 不向 `main` 提交
- 不 push `main`

所有工作在从 `48a2022` 开出的开发分支上做。

合并回 `main` 需同时满足三条:后端正式上线且有公网 HTTPS 地址、Vercel 配好 `VITE_CLINGO_EXAM_API_BASE_URL`、联调验证通过。第二条常被忽略——代码 fallback 是 `http://localhost:8082`,漏配会让访客浏览器去连它自己的 localhost。

## 禁止的破坏性操作

```text
git reset --hard        git checkout .        git clean
git push --force        git rebase            git squash
删除任何分支或 tag
```

认为必须执行以上任一操作时,**停下来说明原因,等用户答复**。

另外不用 rebase / squash 还有一个额外理由:保持 `48a2022` 等提交为 `main` 的祖先,将来推 `main` 时 GitHub 会自动把 PR #1 标为 merged,历史上也能区分哪部分是外包打底的。

## 开工前必须先确认并报告

1. 当前在哪个分支,HEAD 是哪个提交
2. 是否有未提交的改动
3. 要改的文件是否属于本轮范围

发现需要改的内容不在开发分支上时,停下来告诉用户,不要自己决定。

## 代码分层保护

| 路径 | 行数 | 性质 | 处置 |
|---|---:|---|---|
| `src/services/hskExamService.ts` | 240 | 后端契约适配层 | 谨慎 |
| `src/hsk/hskExamBlueprint.ts` | 475 | 试卷蓝图 / 结构规则 | 谨慎 |
| `src/hsk/attemptPointerStore.ts` | 163 | 作答进度指针与本地缓存 | 谨慎 |
| `src/hsk/exclusiveAudioPlayer.ts` | 73 | 音频独占播放 | 谨慎 |
| `src/pages/HSKPrepTrainingPage.tsx` | 3233 | 全流程 UI | 可自由重写 |

**「谨慎」的具体门槛:** 改动这四个文件前先说明原因,改完必须跑 `npm run test`。

这层是 HSK 一期联调换来的确定性资产,配套测试是重构时唯一的安全网:

```text
src/services/hskExamService.test.ts      85 行
src/hsk/attemptPointerStore.test.ts     189 行
src/hsk/exclusiveAudioPlayer.test.ts     78 行
src/hsk/hskExamBlueprint.test.ts         46 行
```

不要为了让 UI 好写而顺手改 service 层的数据结构——那会破坏已验收的后端契约,且不容易当场发现。

契约要变时由外包提供接口变更说明与重新导出的 `api-docs` JSON,再改 service 层。

重构顺序已定:**先抽数据层,再动 UI**。把页面里的 API 调用与流程状态抽成 hooks 移入 `src/hsk/`,页面退化为纯展示,此步不改视觉、有现成测试兜底;然后逐屏重写 UI。

## 接口契约查询

后端在跑时直接查 OpenAPI,不需要等外包写文档:

```text
http://127.0.0.1:8082/v3/api-docs            平板端 9 个接口
http://127.0.0.1:8082/swagger-ui/index.html  可视化
```

那 9 个接口就是本客户端的全部契约面:

```text
GET  /api/papers                              试卷列表
POST /api/papers/{paperId}/attempts           开始作答
GET  /api/attempts/{attemptId}                作答状态
POST /api/attempts/{attemptId}/submit         交卷
GET  /api/attempts/{attemptId}/result         成绩摘要
GET  /api/attempts/{attemptId}/result/detail  逐题详情
GET  /api/exams/{examId}/delivery             试卷内容
GET  /api/auth/ping  /api/health              健康检查
```

## 问题归属四分类

报问题前先自查环境,再判归属。**页面看着有问题 ≠ 前端问题**——先看接口返回的数据对不对:接口数据错是后端或数据问题,接口数据对但显示错才是前端问题。

| 类别 | 范围 | 谁修 |
|---|---|---|
| 前端展示层 | 渲染、布局、交互响应 | 我方 |
| 后端业务逻辑 | 判分、校验、数据处理 | 外包 |
| 数据 / 配置 | 管理台里内容配错 | 运营 |
| 环境 / 基础设施 | 端口、代理、环境变量、数据库连接 | 我方 |

先排除这四个「设计如此」,不要报成 bug:

- 官方模板每题分值显示 0 —— 官方卷不展示单题分值
- 成绩里分模块得分为 `null` —— `equal_ratio` 模式下如此
- 60 题的卷子 delivery 只返回 28 条 —— 复合题内嵌 5 小题,展开后才是 60
- `GET /admin/papers` 报 500 —— 列表接口要带 `/page` 后缀,与数据库无关

后端错误响应带 `requestId`,转给外包时必须附上,他靠这个在日志里定位。日志在 `后端本地联调-20260724/backend/runtime/logs/`。

「预期」必须引用出处,来源限定交付包 `backend/source/Clingo-Backend/docs/` 下的 04、07、09 三份文档。找不到依据的标注「预期待确认」,不要当成 bug 断言。09 号文档有明确的「不纳入」章节,超出一期范围的记为需求,不混进 bug 列表。
