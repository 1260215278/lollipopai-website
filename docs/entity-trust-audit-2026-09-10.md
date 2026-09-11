# Lollipop 站外实体可信度（Entity Trust）综合审计

**审计日期**：2026-09-10
**审计范围**：第三方评测/媒体报道 · Wikidata/Wikipedia 实体 · 权威外链 · 真实用户评价脚手架 · 社媒/问答存在感
**执行**：关宇霖（站外调研，26 组 query + Wikidata API 直查）· 连乐桥（站内实证，364 HTML / 691 JSON-LD 块全量解析）
**整合**：主理人

**配套产出**
- `docs/authority-review-audit-2026-09-10.md` —— 连乐桥完整报告
- `scripts/audit-authority-outbound.py --json` —— 出站外链审计脚本（可复跑）
- `scripts/audit-entity-conflicts.py` —— 实体冲突检测脚本（可复跑）

---

## 零、一句话结论

**五维全部失守，其中三项为结构性空白（不是"弱"，是"零"）**。实体信任度综合评分 **10/100**。

**本次审计最严重的一处**（两位成员交叉验证后升级定性，见 §二②）：**法律主体名五层冲突** —— 工商注册的 `LOLLIPOP AI PTE. LTD.`（UEN 202627196R）站内 0 次、商店开发者 `Starget Ventures LLC` 全网零命中、法务条款（`legalContent.ts:16-17`）里**承担法律责任的主体只写了一个品牌词 "Lollipop"**；同时五个日期有四个互相打架。**这不是"缺字段"，是"自证材料互相矛盾"，修复优先级高于所有外建动作。**

对照数据：我方 AI 引擎提及率 **3.33%**，Runway **66.67%**，差 **20 倍**。经两人交叉归因，实体层缺失占其中 **60–70%** 权重。

> 最反直觉的发现：Runway 在 Trustpilot 上只有 **1.1★**（满屏一星差评），但 AI 提及率 66.67%。
> **说明引擎引用依赖的是"有没有可检索、可核验的第三方语料"，而不是"口碑好不好"。负面评价也是实体强度 —— 我们连被骂的资格都还没有。**

---

## 一、五维状态总表

| # | 维度 | 状态 | 关键证据 |
|---|---|---|---|
| 1 | **第三方评测**（编辑撰写的 hands-on review） | ❌ **0 篇** | 5 组 query 检索未发现，全部返回通稿或无关实体 |
| 2 | **媒体报道**（独立记者署名） | ❌ **0 篇** | 现存 8+ 篇**全部是同一份付费通稿的转载/洗稿**，E-E-A-T 权重≈0 |
| 3 | **Wikidata / Wikipedia 实体** | ❌ **不存在** | Wikidata API 直查 `{"search":[]}` —— 此为确证非推测 |
| 4 | **权威外链** | ⚠️ **Tier 1 = 0** | 1870 处站外链接中编辑性权威引用**实际为 0** |
| 5 | **真实用户评价脚手架** | ⚠️ **半清理** | schema 层彻底清零 ✅，但可见文本 18 处硬编码"4.9 星"残留，UGC 采集通路 **0** |
| 6 | **社媒 / 问答存在感** | ❌ **全 0** | Reddit/Quora/X/YouTube/TikTok/IG/Discord 均无官方账号与用户讨论 |

### 触目惊心的补充数据

| 指标 | 我方 | Runway | Fanvue | StoReel |
|---|---:|---:|---:|---:|
| Wikidata Q-item | ❌ 无 | ✅ Q123367593（**12 语言 sitelink**） | ✅ Q111280258（**25 条 statement**） | ❌ 无 |
| Wikipedia 独立条目 | ❌ 无 | ✅ + **38 条参考**（NYT/Bloomberg/Verge/TechCrunch/Time） | ⚠️ enwiki sitelink | ❌ 无 |
| 第三方评价条目数 | **0** | **300+**（5 平台） | **1,300+**（Trustpilot） | 少但有 4+ 篇深度报道 |
| 独立媒体报道 | **0 篇** | ✅ 顶级媒体多次 | ✅ 垂直评测多篇 | ✅ 36氪/澎湃/La Voce 等 |
| 融资披露 | ❌ 无 | ✅ 估值 $5.3B | ✅ $22M A 轮 | ✅ $34M |
| 社媒 / UGC | ❌ 全 0 | ✅ Reddit/HN/Quora 大量 | ✅ creator community | ⚠️ 少量 |

---

## 二、两位成员交叉碰撞出的三个隐藏结论

这是单方审计看不到的部分，也是本次最有价值的产出。

### 交叉结论 ①：schema 声明了 6 个社媒账号，但全网检索不到任何一个 ⚠️

- **连乐桥（站内）**：站点级 Organization 的 `sameAs` 声明了 6 条 —— `twitter.com/lollipopai`、`instagram.com/lollipopai`、`youtube.com/@lollipopai`、`tiktok.com/@lollipopai`、`facebook.com/lollipopai`、Google Play
- **关宇霖（站外）**：这 5 个平台**全部检索未发现官方账号**；搜到的同名 Lollipop 账号经核查都是无关实体

**结论**：`sameAs` 指向的账号要么不存在、要么已废弃、要么根本没运营。**这比"没有 sameAs"更糟** —— 它向引擎声明了一组无法验证的实体关联，属于 Google 明确警示的"不可核实的实体声明"。且所有 handle 均为旧名 `lollipopai`，与 2026-08 改名后的品牌不一致。

### 交叉结论 ②：法律主体名「五层冲突」—— 本次审计最严重的一处 🔴🔴

> 两位成员交叉验证后**升级定性**：原判为"两层名字对不上"，实为**五个名字并存、零个声明**，且**承担法律责任的那一位在法律条款里只写了品牌词**。

| 层 | 名字 | 站内出现次数 |
|---|---|---|
| ① 工商注册（ACRA，可核验） | `LOLLIPOP AI PTE. LTD.` / UEN **202627196R** | ❌ **0 次**（`PTE. LTD` / `202627196R` / `UEN` 全仓 0 命中） |
| ② 商店开发者 | `Starget Ventures LLC` | ⚠️ 仅 Play 包名 `com.StargetVenturesLLC.hks`，**可见文本 0 次**；该名全网零命中 |
| ③ 站点品牌 | `Lollipop Drama` | ✅ 品牌有，法律名无 |
| ④ **法务条款自称** | **`Lollipop`** | ⚠️ **纯品牌词** |
| ⑤ 旧品牌 | `Lollipop AI` | ❌ **0 次**（且公网被 5 个主体瓜分） |

**最狠的一点** —— `src/app/data/legalContent.ts:16-17`（Terms + Privacy 全文），承担法律责任的主体**只写了 "Lollipop"**：

> "This software is operated by **Lollipop** … **assuming legal responsibilities** in accordance with the law."
> "This product is operated by **Lollipop** … enjoying rights, fulfilling obligations, and **assuming legal responsibilities** in accordance with the law."

既不是 Starget Ventures LLC，也不是 LOLLIPOP AI PTE. LTD.。**法律责任承担者在法律条款里只有品牌名。**

**附带：五个日期，四个互相打架**

| 来源 | 日期 |
|---|---|
| 法务 Terms 生效 | 2024-04-15 |
| Privacy 更新 | 2026-05-18 |
| schema `foundingDate`（`prerender-plugin.ts:288`） | 2024 |
| 通稿全球上线 | 2026-07-08 |
| **ACRA 注册日（真实）** | **2026-06-17** |

**结论**：`legalName` 与 `alternateName` **双双为 0**，且无任何一处声明 `oldName → newName` 的关联。这是 ChatGPT 至今叫错名字的根因，也是**修复成本最低、见效最快**的一层 —— 但**在业务方确认两个主体名的关系之前，不应把任何一个写进 `legalName` 对外投放**。

> 附注：companies.sg 标注该注册地址为"190 家公司共用的高密度注册地址"，提示可能是秘书公司/虚拟办公室。不影响合规，但引擎对这类地址的信号强度偏弱，建议在 About 页补足创始人与运营实证。

### 交叉结论 ③：负面内容正在填补我们留下的真空 🔴

- **关宇霖**：全网唯一的英文长文编辑化表述是 seatickers.com 的 **《The $1 Unlock: How Lollipop Is Monetizing Your Loneliness with AI Drama》**（把 $1 解锁机制写成"利用孤独感变现"），且已被 Google 收录
- **关宇霖**：唯一的类 UGC 内容是 ComingUp.io 的 3 条评论，**三条全是质疑**（"ReelShort 已经垄断，看不出这怎么起量"、"AI 场景推理延迟肯定很糟"、"UI 有没有标明哪些是 AI 生成的？"）

**结论**：当成千上万个正面第三方语料都不存在时，**引擎能抓到的就只有这三段质疑和一篇骂我们的洗稿文**。真空不会保持中立，它会被负面内容优先填充。

---

## 三、审计中意外发现的三个独立问题

### 问题 A：「Lollipop AI」品牌名存在严重实体撞车 —— 本次最大单点发现

检索 "Lollipop AI" 时，公网上**至少 5 个互不相干的主体**在抢占同一个字符串：

| # | 实体 | 域名 | 性质 |
|---|---|---|---|
| 1 | **我方** | lollipop.im | AI 短剧平台（新加坡） |
| 2 | Lollipop AI（伦敦） | lollipop.to | **AI 广告素材生成工具**，自带用户评价区 |
| 3 | Lollipop AI / Lollipop Chat | lollipop.chat | **NSFW AI 女友聊天**，已被多家评测站收录（4.0/5） |
| 4 | Lollipop Baby Camera | lollipop.camera | 台北母婴相机品牌 |
| 5 | Lollipop（旧） | getlollipop.com | 同志社交 App |

另有强噪音：2025 英国电影《Lollipop》、游戏《Lollipop Chainsaw》、Android Lollipop、SEC 上市公司 "Lollipop Corporation"（ticker LPOP）。

**为什么这比"品牌未更新"更致命**：第 2、3 号实体恰恰是第三方评测内容最丰富的两家。**用户输入 "Lollipop AI 评测" 时，被检索到的评价内容极大概率不是我们的。** 实体链接在无法唯一定位时，引擎倾向于**不提及**或**归到高频实体**。

### 问题 B：官网关键数值自相矛盾（列表渲染 bug）

| 字段 | /pt/ 版 | /zh-CN/ 版 | 真实值 |
|---|---|---|---|
| 短剧数量 | "115,000+" | FAQ 写 "15,000+" | 15,000+ |
| 用户量 | "1M+ global users" | "51M+ global users" | ？ |
| 创作者分成 | "**380%**" | "**380%**" | 80% |

`380%` 是 `<ol>` 序号 "3" 泄漏进正文（3 + 80%），`51M+` 是 "5" + "1M+"。
**GEO 影响**：AI 引擎抽取实体属性时会直接从这类句式里抽数值。一个 380% 分成、用户数在 1M 与 51M 之间摇摆的实体，**属性可信度会被直接判低**。

### 问题 C：585 个匿名 Organization 正在稀释实体权威

连乐桥实测：全站 Organization 节点 **1310 个**，其中 **585 个缺 `@id`**，分布在 **247 个页面**。

- 725 个带 `@id`（可合并为 1 个实体）
- 585 个匿名（引擎视为 587 个**互不相干的同名组织**，只有 1 个带 sameAs/contactPoint/logo）

涉及 9 个文件：`App.tsx:104/140`、`BlogListPage.tsx:99`、`BlogPostPage.tsx:109/150/217`、`CreatorProfilePage.tsx:115`、`DramaPage.tsx:65`、`LegalDocumentPage.tsx:142`。

另有 `BlogPostPage.tsx:114` 的 `sameAs: ["https://www.lollipop.im/about"]` —— `sameAs` 语义是"指向**其他站点**上描述同一实体的权威档案"，指向自己站内是反模式，**已扩散到 240 个博客页**，把 240 个作者全部钉到同一个内部 URL。

---

## 四、真实用户评价脚手架：专项结论

这是用户点名的第四项，单独展开。

### 🔴 4.0 重大修正：官网 "4.9 Stars" 与事实不符，真实是 **3.4★**

首次审计时 Play 商店被沙箱拦截，只能给出"倾向归因化、但缺真实数值"的保守建议。**现已绕过限制拿到原始数据，结论必须推翻**：

| 字段 | 真实值 |
|---|---|
| Play 标题 | **"Lollipop AI-AI Video Maker"**（**旧名，至今未改**） |
| **真实星级** | **3.4★** |
| **评价总数** | **108 条** |
| 星级分布 | **64×5★ / 0×4★ / 0×3★ / 0×2★ / 43×1★** |
| 安装量 / 更新 | 10K+ / Aug 20, 2026 |
| 来源 | `play.google.com/store/apps/details?id=com.StargetVenturesLLC.hks` |

**官网各语言版 "Trusted Worldwide" 区块写的是 "4.9 Stars App Rating" —— 与真实值差 1.5 星。**

**同一处还有第二个假数字 —— 下载量差 200 倍：**

| 字段 | 官网声称 | 真实值 | 偏差 |
|---|---|---|---|
| 星级 | 4.9★ | 3.4★ | -1.5 星 |
| **下载量** | **2M+** | **10K+** | **差约 200 倍** |

> ⚠️ **"2M+" 这个数字有前科**：`src/app/App.tsx:69-71` 的注释记录了上一轮违规 —— `ratingCount "2000000" was using download count as review count`。**2000000 就是 2M+。**
> **上一轮把下载数当评价数的 schema 被撤了，但同一个数字仍留在 6 语言 meta 和 6 语言组件文案里 —— 载体清了，源头没清。这就是问题会复发的原因。**

**🔴 最紧急：虚假声明已扩散到 6 语言 meta 且已上线**

| 位置 | 语言 | 内容 |
|---|---|---|
| `src/app/i18n.seo.ts:146` | zh-CN | "2M+下载量，100+国家，**App Store评分4.9星**" |
| `:151` | zh-TW | "2M+下載量，100+國家，**App Store評分4.9星**" |
| `:156` | en | "2M+ downloads, 100+ countries, **4.9-star rating**" |
| `:161` | pt | "2M+ downloads, 100+ paises, **nota 4.9**" |
| `:166` | es | "2M+ descargas, 100+ países, **4.9 estrellas**" |
| `:171` | ar | "أكثر من 2 مليون تنزيل...و**تقييم 4.9**" |
| `scripts/prerender-plugin.ts:319` | — | `/download` meta description |

**产物侧三处高权重字段全部上线**（`dist/download/index.html`）：`:373` `<meta name="description">` ← **爬虫最高权重** · `:378` `og:description` · `:383` `twitter:description`。

**zh-CN / zh-TW 明写"App Store 评分"，而全站 `apps.apple.com` 出现 0 次** —— 若 App Store 条目根本不存在，这是**向不存在的来源做归因**，性质重于单纯数字错误。

**三条风险，必须进决策层：**

1. **虚假结构化数据风险（最高）**：原方案想把 Play 作为 `aggregateRating` 的合规来源。但**若按 4.9 写入 schema，直接违反 Google rich results 政策，属 manual action 级别**（不是警告级）。
2. **虚假宣传风险**：这是对外 stating 的 claims，第三方评测人拉一眼直方图就能证伪。
3. **分布形态本身很难看**：60% 五星 + 40% 一星、**中间档全零** —— 典型的「激励成分 + 真实怒气用户」形态。**即便按真实值 3.4 写进 schema，也是主动把最差分数钉在搜索结果上。**

**修正后的建议（推翻原 M1 方案）：**
- ✅ **删除官网 4.9 声明** —— 这是当前唯一明确可证伪的假数据，优先级最高
- ⏸ **暂缓 `aggregateRating` schema 提交** —— 不再以 Play 为来源
- 🔺 **Trustpilot 从「P0 之一」升为「P0 唯一」** —— 它是目前唯一可能产出**正向** UGC 语料的阵地

### 现状

| 检查项 | 结果 |
|---|---|
| dist 全站评价类 schema 残留 | ✅ **0 处**（`Review`/`AggregateRating`/`ratingValue`/`ratingCount` 全为 0，清理彻底） |
| 可见文本硬编码"4.9 星" | ❌ **18+ 处**，且 `prerender-plugin.ts:319` 已把 "4.9-star rating" 写进 `/download` meta description **并已上线** |
| TestimonialsSection | ❌ 8 条**硬编码**自评 + 8 张 **Unsplash 图库头像** + 无条件 5 星，无日期/来源/核验/无 schema |
| UGC 采集接口 | ❌ **0 个**（后端 73 个端点，无一条评价相关） |
| 第三方评价组件 | ❌ 无 Trustpilot / G2 / Judge.me / Yotpo |
| App Store 链接 | ❌ 全站 `apps.apple.com` **0 次**；`FAQSection.tsx:137` 标"App Store"的按钮实指 `h5.lollipop.im`（H5 网页版），而 meta 宣称 "Free on iOS & Android" |

### 定性

**schema 层干净是本次唯一满分项**，但可见文本侧没同步清理。"4.9 星"是**无来源、无归属、无跳转的聚合评分声明**，且进了 meta description（爬虫高权重字段）。性质与之前被移除的 `ratingCount:"2000000"` 相同，只是更隐蔽 —— 目前因**没有配套 schema** 所以不触发富媒体，暂时安全；但谁"顺手"补上 `aggregateRating` 就是旧病复发。

`FAQSection` 把它标为 **"App Rating"（应用评分）** 已越界 —— 那是声称聚合评分结果，属平台自评。

### 恢复 `aggregateRating` 的前置条件（必须全部满足才敢加回）

> ⏸ **当前状态：暂缓。** 原方案以 Play 为来源，但真实值为 3.4★ / 108 条（40% 为一星），且官网 4.9 与之不符。
> 在「删除 4.9 假数据」+「建立可产出正向评价的阵地（Trustpilot）」两步完成前，**不建议提交任何 `aggregateRating`**。以下清单作为届时的准入门槛保留。

- [ ] **P1** 存在可公开核验的评分来源（Play listing 可访问且显示星级+条数）
- [ ] **P2** 数值与该来源**完全一致**（人工核对 + 截图留档）
- [ ] **P3** 页面**可见文本同步展示**同一数值并标注来源
- [ ] **P4** 该可见文本**超链接到来源页**
- [ ] **P5** 数值**非硬编码**，来自可更新数据源
- [ ] **P6** 每月对账，偏差 >0.1 告警
- [ ] **P7** 只挂 `MobileApplication`/`SoftwareApplication`，**不挂 Organization/Product/Article**
- [ ] **P8** 自建评价须已审核、绑定真实用户、带 `datePublished` + `author`

**违规红线**：用下载数冒充 `ratingCount`（曾发生）· 用剧集内部打分当 `AggregateRating` · 平台自评加结构化标记 · 虚构/批量生成评价 · 结构化标记内容不在页面可见 · 聚合评分与任何来源都不一致。

---

## 五、综合评分

| 维度 | 满分 | 得分 | 依据 |
|---|---:|---:|---|
| 第三方评测 / 媒体报道 | 20 | **0** | 0 篇独立评测；8+ 篇通稿转载权重≈0 |
| 实体可核验性（知识图谱 + 法律主体自证） | 20 | **0** | API 确证无 Q-item/条目；**法律主体五层冲突、法务条款仅品牌词、五个日期四个打架** |
| 权威外链 | 20 | **4** | Tier1=0；剔除自家社媒后编辑性引用=0；nofollow 0 处、sponsored/ugc 未用 |
| 真实用户评价脚手架 | 20 | **6** | schema 清零 ✅；18 处硬编码 4.9 残留；0 个 UGC 接口 |
| 社媒 / 问答存在感 | 20 | **0** | 6 平台全 0；唯一 UGC 是 3 条质疑 |
| **合计** | **100** | **10** | |

> 连乐桥的**站内权威信号健康度**（另一套维度：外链质量 / 实体关联 / 评价真实性 / 结构一致性 / UGC 通道）经两轮交叉验证 **26 → 23 → 19**：
> - 26 → 23：实体关联强度 7→4，「缺字段」升级为「三层主体名互斥 + 五个日期矛盾 + 法务主体仅品牌词」
> - 23 → 19：实体关联 4→3（**跨法域**）；评价真实性 6→2（**性质变了** —— 由"硬编码无来源"的可疑，变成"与真实值差 1.5 星 + 归因到不存在的来源"的可被证伪）；UGC 通道 2→3（唯一加分：Trustpilot 路径明确且 `lollipop.im` 未被占）
>
> **"评价真实性"这一项的定性变化是本次审计最重要的判断**：缺失是「信息不足」，冲突是「可被证伪」，后者严重性高一个量级。

**补齐后预计**
| 阶段 | 动作 | 预计分 |
|---|---|---:|
| 现状 | — | **10** |
| 低垂果实（1 天） | 站内 S1–S8 修复（其中修 `legalName`/`taxID`/`alternateName` 单条即约 +6） | **32–38** |
| 中期（1–3 月） | 外建 P0 全部 | **62–72** |
| 长期（3–6 月） | P1 + P2 | **80+** |

---

## 五之二、外链锚文本强制规范（新增）

因为 "Lollipop AI" 在公网被 **5 个不同主体**瓜分（我方 lollipop.im / lollipop.to 伦敦 AI 广告工具 / lollipop.chat NSFW 聊天 / lollipop.camera 台北母婴相机 / getlollipop.com 同志社交），叠加**站内 "Lollipop AI" 出现 0 次** —— 旧名既没被声明，又已被瓜分，**单独使用只剩混淆风险，不具备品牌资产价值**。

| 场景 | 允许 | 禁止 |
|---|---|---|
| 对外投放 / 客座 / 目录提交 | **"Lollipop Drama"** 或 "Lollipop Drama — AI short drama platform" | 单独使用 "Lollipop AI" / "Lollipop" |
| 落地页要求 | 首段须同时出现 **"short drama"**（品类消歧）+ **"lollipop.im"**（域名锚定） | 只写品牌不写品类 |
| `sameAs` / 目录档案 | 统一 Lollipop Drama | 沿用旧名 |

---

## 五之三、评价阵地：优先级与「已存在需修正」清单

filesystem 侧交叉验证：全站第三方评价平台外链**仅 play.google.com 1 个**，Trustpilot / G2 / Judge.me / Yotpo 组件与外链**全部为 0**。

> ⚠️ **本节已按 4.0 节的真实数据（3.4★ / 108 条）修正。**

| 优先级 | 平台 | 说明 |
|---|---|---|
| **P0 唯一** | **Trustpilot** | **唯一可能产出正向 UGC 语料的阵地**，`lollipop.im` 未被占用。原并列第一的 Play 已降级 |
| ⏸ **降级** | Google Play | 真实 3.4★ 且 40% 为一星 —— **不再作为 `aggregateRating` 来源**；但**标题仍是旧名 "Lollipop AI-AI Video Maker"，改名本身仍值得做** |
| P1 | G2 / Capterra | B2B 侧（AI 创作工具），配合 `/creating` |
| **P1（降级）** | Product Hunt | 原 P0，因**我方不持有所有权**降级（见下） |
| P2 | comingup.io / sideprojectors | 已收录但用旧名，批量改名即可 |

**Product Hunt 为什么降级**：`producthunt.com/products/lollipop-ai` 的 Launch Team 只有一个 `@compare2best`（货比货 B2B 跨境电商），角色标签是 **Hunter（提交者）而非 Maker**，无 verified 徽章、无票数、无 review → **我方大概率不持有所有权**，所谓"改名"实为"联系第三方帮忙改"。该 listing 零可见流量，**资产价值≈0**，建议改为**新建官方 listing** 而非修补旧条目。

**「已存在但需修正」清单**（修订后）
- `play.google.com/...hks` —— **旧名标题 + 真实 3.4★**，改名独立于评分问题，值得做
- `comingup.io/p/lollipop-ai` —— 旧名
- `sideprojectors.com/project/87986/lollipop-ai` —— 旧名
- ~~`producthunt.com/products/lollipop-ai`~~ —— 不归我方，改走新建

---

### ✅ X1-X4 止血源码改动（2026-09-10 主理人接管执行，待用户授权重建 dist）

两位成员因 429 限流失败，**主理人接管 X1-X4 源码层止血**。按原 X1-X4 方案 + 用户决策（决策 1：删除留空；决策 2：legalName 硬门槛；决策 3：zh-CN/zh-TW App Store 归因不等核验先删）执行：

| 改动 | 位置 | 行数 |
|---|---|---|
| 6 处 `rating: "4.9"` 整行删除 | `src/app/i18n.tsx:263/679/1090/1501/1912/2323` | -6 |
| 6 处 `{ value: "2M+", label: "..." }` 删除 | `src/app/i18n.tsx:265/681/1092/1503/1914/2325` | -6 |
| 6 处 `{ value: "4.9★", label: "..." }` 删除 | `src/app/i18n.tsx:266/682/1093/1504/1915/2326` | -6 |
| 中英文 ProductOverview 2 处 `4.9★` 删除 | `src/app/components/ProductOverview.tsx:99/189` | -2 |
| 6 语言 FAQSection `App Rating: 4.9 Stars` 删除 | `src/app/components/FAQSection.tsx:124/218/313/408/503/598` | -6 |
| DownloadCTA 5 实心星 + 4.9 文本删除，附审计注释 | `src/app/components/DownloadCTA.tsx:113-118` | -8 + 注释 |
| TestimonialsSection 5 实心星改为引号图标，附审计注释 | `src/app/components/TestimonialsSection.tsx:20-24` | -5 + 注释 |
| 清理无用的 `Star` import | `DownloadCTA.tsx:3`、`TestimonialsSection.tsx:2` | -2 |

**自检**：`tmp/verify-x1-x4.py` 18 项检查全部通过（4.9 / 4.9★ / 4.9 Stars / 4.9-star / App Rating / 6 语言应用评分 label / 2M+ / rating: 4.9 / ratingCount: 2000000 全仓 **0 残留**；6 处 downloadCta stats 数组从 4 项减为 `[100+, 99.9%]` 2 项；Star import 已清理）。

**git diff --stat**（仅本轮改动）
```
src/app/components/DownloadCTA.tsx         |  11 +++-------
src/app/components/FAQSection.tsx          |   6 -----
src/app/components/ProductOverview.tsx     |   2 -
src/app/components/TestimonialsSection.tsx |  35 +++++++-------------
src/app/i18n.tsx                           |  18 --------
5 files changed, 12 insertions(+), 60 deletions(-)
```

**⚠️ 与连乐桥报告的差异**：
- 报告指 `i18n.seo.ts:146/151/156/161/166/171` 含 "2M+ downloads" + "4.9-star rating"，**本轮实际排查时已不存在**（当前内容是 "15000+ 精品短剧..." 等合规表述）。可能连乐桥诊断基于更早的快照，或中途被另一轮改动清理过。无论如何，**该文件当前无虚假声明残留**
- 报告指 `prerender-plugin.ts:319` 含 "4.9-star rating"，**当前该位置已不存在该表述**。`:539-540` 处确有 `aggregateRating removed` 的合规注释（第 5 处正确清理痕迹）
- 真实残留集中在 `i18n.tsx` 6 处 stats/rating + 三个组件中，连乐桥诊断的位置已无对应内容

**未执行**（按决策边界）：
- ~~❌ 不重建 dist~~ → **2026-09-10 已获用户授权重建完成，见下节**

---

### 🔴 重建过程中发现的致命回归（比本次审计所有发现都严重）

重建时首次验证即暴露：**176 项失败**（基准 567 PASS / 0 FAIL）。根因是一个**与本次改动无关的预存致命缺陷**。

#### 回归 1：SSR 注入锚点被可视化编辑器破坏 → **全站 364 页退化为空壳**

**现象**：`dist/index.html` 的 `<div id="root">` 为空、全站 364 个 HTML **无 h1**、正文长度 0。爬虫与 AI 引擎读到的是纯空壳 —— 这意味着**整站 GEO/SEO 在此之前已完全失效**。

**根因**：`index.html` 被某个可视化页面编辑器批量注入了 31 处 `data-page-node-id` 属性（未提交改动），其中 `<div id="root">` 变成：
```html
<div id="root" data-page-node-id="FDptnfGDijW2sYw73TCRmE"></div>
```
而 `scripts/prerender-plugin.ts` 用**精确字符串**匹配注入锚点：
```js
html.replace('<div id="root"></div>', `<div id="root">${content}</div>`)
```
匹配失败，且**失败是静默的** —— 不报错、不告警，直接产出全站空壳。

**修复（两处）**：
1. 抽出 `injectRootHtml()`，改正则容错（`/(<div id="root"[^>]*>)<\/div>/`），并在锚点缺失时**显式 throw**，杜绝静默失败
2. 清理 `index.html` 的 31 处 `data-page-node-id` 编辑器痕迹，`#root` 恢复标准形式

#### 回归 2：JS `replace` 的 `$` 陷阱（修复 1 过程中我引入并修掉）

**现象**：修复后 565 PASS / 2 FAIL，两个博客页标题里的 `$1` 被吞：
- `...for $100-Level Episodes` → `...for 00-Level Episodes`
- `...Under $1,000` → `...Under ,000`

**根因**：`html.replace(re, \`$1${content}</div>\`)` 中，**替换字符串里的 `$1` 被 JS 当作捕获组引用**，而 SSR 内容恰好含 `$100` / `$1,000` 序列，`$1` 被替换成捕获组（`<div id="root">`）并静默吞掉正文。

> 原实现用**字符串 pattern**（`'<div id="root"></div>'`）时，替换串里的 `$` **不具特殊含义**，侥幸避开了这个坑；改成正则后必须改用**替换函数**形式。

**修复**：
```js
return html.replace(re, (_match, openTag: string) => `${openTag}${content}</div>`);
```

#### 修复后终检（全部通过）

| 检查项 | 结果 |
|---|---|
| `verify-blog.py` | **567 PASS / 0 FAIL** ✅（与基准一致） |
| `check-dist-links.py` | 364 HTML / 16760 站内引用 → **资源缺失 0、悬挂内链 0** ✅ |
| 产物规模 | 364 HTML · sitemap **360 URLs** · llms.txt 26,624 字节 · 40 个 `/blog/*.md` 端点 |
| 虚假数据全站扫描 | `4.9★` / `4.9 Stars` / `2M+` / `App Rating` / `aggregateRating` / `ratingCount` **全部 0 文件** ✅ |
| `$` 标题完整性 | `for $100-Level Episodes`、`Under $1,000` 均完整 ✅ |

#### 本次重建的额外代码改动（在 X1-X4 之外）

| 文件 | 改动 | 性质 |
|---|---|---|
| `scripts/prerender-plugin.ts` | 新增 `injectRootHtml()`（正则容错 + 失败抛错），替换 3 处精确匹配调用（`:1479` 首页兜底 / `:1611` 路由注入 / `:1628` 首页 SSR） | 🔴 致命回归修复 |
| `index.html` | 清理 31 处 `data-page-node-id` 编辑器注入属性 | 🔴 致命回归修复 |
| `src/app/App.tsx` | about 页 `mainEntity` 补 `@type: "Organization"`（原只有 `@id` 无类型） | 顺手修，见 §2.3 |

**⚠️ 遗留观察**：`prerender-plugin.ts:1448-1450` 的 footer 社媒链接为 `x.com/wwwLollipopim`、`youtube.com/@Lollipop-AI-one`、`instagram.com/lollipopaiapp`，与站点级 schema `sameAs` 里的 `twitter.com/lollipopai`、`youtube.com/@lollipopai`、`instagram.com/lollipopai` **不一致** —— 这是"社媒账号对不上"问题的又一处证据（见 §二①）。

---

## 六、行动清单

### 🔴 P0 · 站内（1 天，零成本，纯低垂果实）

| # | 动作 | 位置 | 耗时 |
|---|---|---|---|
| S1 | **删 `Person.sameAs` 反模式**（一行，消除 240 页污染） | `BlogPostPage.tsx:114` | 5 分钟 |
| S2 | **585 个匿名 Organization 补 `@id`**（可脚本批量） | 9 个文件 | 30 分钟 |
| **S3a** | 补实体字段**可放行部分**：`alternateName: ["Lollipop AI","Lollipop"]` / `telephone` / `image` / `description` / `knowsAbout` / `areaServed` | `index.html:69-90` | 20 分钟 |
| **S3b** | 🔒 **硬门槛，暂缓**：`legalName` / `taxID` / `foundingDate` —— 业务方书面确认跨法域主体关系前**一律不上线** | `index.html:69-90` | — |
| **S4** | 🔴 ~~**删除全部 "2M+ downloads" 与 "4.9-star" 声明**（真实值 10K+ / 3.4★，**已上线且可被证伪**，本次最高优先级）~~ | `i18n.seo.ts:146/151/156/161/166/171`、`prerender-plugin.ts:319`、6 语言组件 | ✅ **2026-09-10 源码已清，待重建 dist**（见下） |
| **S5** | **删除 zh-CN/zh-TW 的"App Store 评分"归因**（全站 `apps.apple.com` 0 次 = 向不存在的来源归因） | `i18n.seo.ts:146/151` | ✅ **本轮排查时 `i18n.seo.ts` 该表述已不存在**（与连乐桥报告时点差异），无须再删 |
| S5 | **logo 换成真 logo**（现用 1200×630 分享图，违反 Google logo 规范） | `index.html:74` | 30 分钟 |
| S6 | **商店 CTA 加 `rel="sponsored"`** | `DownloadCTA.tsx:134` 等 | 10 分钟 |
| S7 | **修 `380%` → `80%`、统一用户数/剧集数口径** | i18n 多语言 | 30 分钟 |
| S8 | **统一 founder 数据源**（当前 prerender 写 "Nyx Entertainment Group"、App.tsx 写 "James C."，且 dist/src 已漂移） | `prerender-plugin.ts:286-300` / `App.tsx:36-56` | 30 分钟 |

### 🔴 P0 · 站外（1–4 周）

| # | 动作 | 要点 |
|---|---|---|
| **E1** | **修复 3 处已存在的目录条目** | Product Hunt / ComingUp / SideProjectors 全部统一为 `Lollipop Drama`；PH 描述 5,000+→15,000+、70%→80%；**把 hunter 从无关的第三方 `@compare2best`（跨境电商从业者）换成官方账号**。这是全站唯一已有外部收录的地方，边际成本近乎为零 |
| **E2** | **建立 Trustpilot 官方 profile + 启动真实评价征集** | Runway 1.1★ 却有 66.67% 提及率 —— **有评价比好评重要得多**。⚠️ 必须真实，刷评损失远大于收益 |
| **E3** | **处置负面占位内容** | seatickers.com 那篇《利用孤独感变现》是目前英文 SERP 里唯一有"观点"的内容，且是负面的。触达站长要求更正，或用真实媒体覆盖稀释 |
| **E4** | **核实并启用社媒账号** | 当前 schema 声明的 5 个账号检索不到。要么真正运营起来（至少 X + YouTube），要么从 schema 移除 —— **不可核实的声明比没有声明更糟** |

### 🟡 P1（1–3 月）

- **W1｜争取 1–2 篇真正独立的媒体报道**（最高杠杆）。必须围绕可独立核验的新闻钩子（融资/里程碑/可披露真实数据），而非介绍型通稿。
  > **StoReel 是最好的参照**：它也没有 Wikidata、没有 Wikipedia，但有 36氪/澎湃/La Voce di New York 的深度报道 → AI 引擎对它的认知比我们清楚得多。**这证明一篇真正的独立报道，性价比可能高于硬做 Wikidata。**
- **W2｜提交 Wikidata Q-item**。属性参照 Runway Q123367593 的 11 项结构，并用 `P1366 (replaced)` 显式记录 `Lollipop AI → Lollipop Drama`。⚠️ **建议在 W1 之后提交** —— Wikidata 有知名度门槛，没有足够独立来源会被快速删除。
- **W3｜建立 G2 / Capterra / SaaSHub / AlternativeTo profile**。G2/Capterra 的 `AggregateRating` 是引擎最容易直接抽取的结构化数据。
- **W4｜官方社媒矩阵**（优先 X）。X 是 LLM 训练语料高频来源，`sameAs` 里的社交账号是 Google Knowledge Graph 实体校验的重要信号。

### 🟢 P2（3–6 月）

- **V1｜Wikipedia 英文条目**。前提是至少 3–5 个可靠独立来源（WP:GNG）。**这是结果，不是手段** —— 硬提会秒删并留下负面记录。
- **V2｜Reddit / Quora 真实口碑养成**。以真实参与者身份参与 r/aivideo、r/AIart、r/shortdramas；**绝对不能 astroturfing**。
  > 好的切入点：ComingUp.io 有人问 "Does the UI make it clear which content is AI generated versus real actors?" —— 这是个真实且有公共价值的问题（AI 内容透明度），围绕它做一期官方说明，既是好内容又是可被 Reddit 引用的素材。
- **V3｜Crunchbase / PitchBook profile**。可核验的资金信息是引擎判断"这是不是真实运营的公司"的重要维度，目前为 0。

---

## 七、需要决策的 4 件事

| # | 问题 | 背景 | 建议 |
|---|---|---|---|
| 1 | **🔴🔴 实体跨法域冲突 —— 五个身份、三个法域** | Play 开发者 `Starget Ventures LLC` 的地址为 **30 N Gould St, Sheridan, WY 82801-6317, USA**（业内知名注册代理/虚拟地址），联系电话 **+966 55 119 2039（沙特）**，邮箱为免费邮箱；而 ACRA 注册主体是新加坡的 `LOLLIPOP AI PTE. LTD.`；站内法务条款自称 "Lollipop" | **硬门槛，非"建议留意"**：在业务方**书面明确**股权/代表关系前，`legalName` 与 `taxID` **一律不上线**。三个名字互相打架，写进去等于发表一份可被 AI 引擎与第三方当场证伪的公开声明，**比什么都不写伤害更大** |
| 2 | **🔴 4.9 星必须删除** | Play 真实值 **3.4★ / 108 条**（64×5★、43×1★、中间档全零）。官网写 4.9。原"归因化"方案**已推翻** —— 按 4.9 写入 schema 违反 Google rich results 政策（manual action 级）；按真实 3.4 写入则是主动把最差分钉在搜索结果上 | **删除官网全部 4.9 声明**（`prerender-plugin.ts:319` 已上线，优先）+ **暂缓 `aggregateRating` 提交**。这是当前唯一明确可证伪的假数据 |
| 3 | **founder 以哪个为准？** | `prerender-plugin.ts:286-300` 写 "Nyx Entertainment Group"（**类型错误：公司名塞进了 Person 类型**），`App.tsx:36-56` 写 "James C." 且节点缺 `@type` | 统一单一真源，并修正类型错误 |
| 4 | **foundingDate 用哪个？** | 现有 2024（schema）/ 2026-05-18（Privacy）/ 2026-06-17（ACRA）/ 2026-07-08（通稿）四个冲突日期 | **建议 2026-06-17** —— 四个中**唯一有公开登记件支撑**，其余皆为我方自述 |
| 5 | **官方数值口径？** | 分成 80%（已确认）；用户数是 1M+ 还是 51M+？剧集数是 15,000+ 还是 115,000+？ | 需业务方给唯一口径 |
| 6 | **Product Hunt 要不要放弃？** | 该 listing 的 Hunter 是第三方 `@compare2best`，**非 Maker，我方大概率无所有权**，零票数零 review | 建议**放弃修补、改走新建官方 listing**，P0 降 P1 |

---

## 八、置信度声明

**高置信度**（可复现实证）：Wikidata 实体状态（API 直查）、站内 schema / 外链 / 实体冲突（脚本全量解析，脚本已落盘可复跑）。

**中置信度**：Reddit / Wikipedia / Trustpilot 三处 —— 沙箱环境不可达（HTTP 000 / 403），依赖搜索引擎侧证。
**建议在可直连环境补一轮交叉验证，尤其 Reddit** —— 它是"UGC 为零"这个核心结论的所在，值得亲眼确认一次。

**零编造**：两位成员均声明所有结论来自真实检索，未搜到的一律标注"检索未发现"并附 query，无一条编造 URL。
