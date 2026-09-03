# GEO 数据驱动优化报告（第二轮）

- 日期：2026-09-01
- 数据源：`data/outputs/lollipop_drama_20260901/`（30 条真实 prompt 采集，17:19 完成）
- 触发：附件错误日志 `2026-09-01.md`（GEO collector 结构化 prompt 对象被拒，已 resolved）

---

## 一、基线现状

| 品牌 | AI 回答中提及次数 | 占比 | 引用该品牌 URL 次数 |
|---|---|---|---|
| Runway | 20 | 66.67% | 18 |
| Fanvue | 2 | 6.67% | 5 |
| StoReel | 2 | 6.67% | 1 |
| **Lollipop Drama** | **0** | **0.00%** | **1** |

**核心问题：** Lollipop Drama 在 30 个真实用户提问中品牌提及为 0，仅 1 次 URL 引用（且引用时仍使用改名前的 `Lollipop AI` 旧名）。

---

## 二、关键结构性发现

### 1. Runway 赢在「结构化知识库」，不是营销页

Runway 的 30 次引用分布：

| 来源 | 引用次数 |
|---|---|
| `runway.com` | 15 |
| `help.runwayml.com` | 11 |
| `academy.runwayml.com` | 4 |
| `docs.dev.runwayml.com` | 2 |
| **帮助中心 + 学院 + 文档合计** | **17 / 30（57%）** |

**结论：** AI 引擎偏好引用「结构化知识」与「权威指南」，而非产品营销页。Fanvue 同样布局了 `help.fanvue.com`(2) + `legal.fanvue.com`(1)。

### 2. 合规类问题会引用政府权威源

query #7（肖像权 / 音乐版权 / 著作权）的引用中出现 `cac.gov.cn`、`en.ncac.gov.cn`、`english.cnipa.gov.cn`、`english.court.gov.cn`、`english.bjinternetcourt.gov.cn` —— 说明合规议题下，官网必须提供**结构化、可核对**的合规内容才可能被引用。现有 `ai-copyright-compliance` 已覆盖该意图。

---

## 三、30 条 query 聚类与内容覆盖对拍

| 意图聚类 | query 编号 | 现有覆盖 | 缺口判定 |
|---|---|---|---|
| 对比/选型 | #4 #5 #13 #16 #21 #22 #28 | `ai-tools-comparison`、`best-ai-storytelling-platforms`（泛化清单） | **无直接对标竞品的长文** |
| 工作流/教程 | #2 #6 #8 #17 #26 #27 #29 | 覆盖较好 | 基本满足 |
| 角色一致性 | #3 #14 | **零覆盖** | **最大缺口** |
| 变现/分发 | #9 #15 #19 #23 #24 | 零散 | **缺** |
| 成本/团队 | #10 #11 #12 | `ai-production-cost` | 部分 |
| 合规 | #7 | `ai-copyright-compliance` | 满足 |

---

## 四、本轮已执行动作

### P0：新增 3 篇对标型内容

| slug | 标题 | 覆盖 query | 战略目的 |
|---|---|---|---|
| `lollipop-drama-vs-runway-sora` | Lollipop Drama vs Runway vs Sora：一体化平台还是单项视频工具？ | #16 #21 #22 | 直接对标占 66.67% 提及的 Runway |
| `ai-drama-character-consistency` | AI 短剧角色一致性完全指南：跨 10 集锁定外貌、声音与造型 | #3 #14 | 填补零覆盖的核心痛点 |
| `fanvue-vs-lollipop-drama` | Fanvue vs Lollipop Drama vs Runway vs StoReel：四类 AI 创作者分别该选哪个平台？ | #5 #13 #28 | 突出「AI 时代 OnlyFans」差异化定位 |

三篇均为 EN/ZH 双语，含 **Direct Answer 前置结论 + 对比表 + 决策矩阵 + FAQ + 结构化数据**，符合 AI 引擎引用偏好。

### 品牌定位一致性清理（新发现）

上一轮改名只替换了品牌名，漏掉博客正文里的**旧定位 slogan**：

- 英文 `AI Creator Ecosystem*` → `Global Content Ecosystem` / `Next-Generation Global Content Ecosystem Platform`
- 中文 `AI创作者生态*` / `AI 创作者生态*` → `下一代海外内容生态平台`

合计 **128 处**（blog.ts 120 + blogFaq.ts 8），并修复了替换产生的叠加串（`平台平台` ×4、`平台系统` ×1）与多余空格（×7）。

### 配套更新

- `blogFaq.ts`：3 篇新文各补 3 条双语 FAQ（共 9 条），对齐 query 意图
- `public/sitemap.xml`：手动补 3 个 blog URL（含 6 语言 hreflang + x-default），注释 18→21 篇
  - ⚠️ sitemap.xml 是静态手写文件，**新增博客必须手动补**，否则漏收录

---

## 五、构建验证

```
✓ built in 15.96s
[prerender] Updated sitemap.xml lastmod to 2026-09-01
[prerender] Generated llms.txt (10971 chars) + llms-full.txt (69017 chars)
[prerender] Generated 60 static HTML files (SSR enabled) for 61 routes
[compress-dist] Gzip: 90 files, Brotli: 90 files
```

| 核验项 | 结果 |
|---|---|
| 新增 3 页 HTML | ✓ 62.7KB / 63.1KB / 60.1KB（SSR 完整正文） |
| 结构化数据 | ✓ 每页 FAQPage ×2 + Article ×1 |
| llms.txt 收录 | ✓ 3 个新 slug 全部纳入 |
| sitemap | ✓ blog 21 条 / 总 59 条 |
| `Lollipop AI` 残留 | ✓ 0 |
| `AI Creator Ecosystem` 残留 | ✓ 0 |
| `AI创作者生态` / `AI 创作者生态` 残留 | ✓ 0 |
| `Lollipop Drama` 覆盖 | ✓ 75 个文件 |
| `下一代海外内容生态平台` 覆盖 | ✓ 9 个文件 |

---

## 六、下一轮建议（P1 / P2）

| 优先级 | 动作 | 依据 |
|---|---|---|
| **P1** | 新增 `ai-drama-monetization-guide`（制作+发布+变现一体化） | query #9 #15 #19，Lollipop 差异化护城河所在 |
| **P1** | 新增 `all-in-one-vs-toolchain-cost`（减少工具切换与订阅成本） | query #10 #16 |
| **P1** | **建 `/guides/` 结构化知识区**（对标 Runway 的 help + academy 组合） | Runway 57% 引用来自结构化知识库，这是最高杠杆的结构性动作 |
| P2 | 新增 `ai-drama-global-distribution`（多语言与全球发行） | query #23 #24 |
| P2 | 重跑 GEO 采集对比基线（品牌名已改为 `Lollipop Drama`） | 上次采集仍用旧名，需建立新基线 |

**最重要的一条：** P1 的「建 `/guides/` 结构化知识区」。当前 GeO 数据证明，竞品 57% 的引用来自帮助中心 / 学院 / 文档类结构化内容，而 Lollipop 目前只有 blog 一种内容形态。

---

## 七、踩坑记录

1. **排除目录不能用目录名**：批量替换脚本用 `EXCLUDE_DIRS = {"data", ...}` 按目录名排除，误伤了 `src/app/data/blog.ts`（父目录恰好叫 `data`），必须用绝对路径判定。
2. **脚本会匹配自身**：替换脚本内含关键字时会被自己的正则命中并覆写，需用 `chr()` 拼接关键字或显式排除自身文件名。
3. **中英文变体要同时检测**：检测正则只写带空格的 `AI 创作者生态`，会漏掉无空格写法 `AI创作者生态`，导致 `blogFaq.ts` 整体被跳过，直到 dist 终检才发现。
4. **有序替换留尾巴**：`AI 创作者生态系统平台` 被 `AI 创作者生态系统` 先匹配，产生 `下一代海外内容生态平台平台` 叠加串，需后置清理。
