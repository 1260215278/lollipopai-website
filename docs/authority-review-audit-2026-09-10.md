# 权威信号与真实用户评价审计 · 2026-09-10

审计人：连乐桥（链接策略 / 实体信任）
对象：https://www.lollipop.im（React SPA + 自研 SSG 预渲染）
实证方式：`scripts/audit-authority-outbound.py`、`scripts/audit-entity-conflicts.py`（均已跑通，输出见下）+ filesystem 全仓扫描

**权威信号健康度总分：26 / 100**

---

## 板块 1 · 全站出站外链盘点

脚本：`scripts/audit-authority-outbound.py`（已跑通，JSON 产物 `scripts/out/authority-outbound.json`）

```
扫描目录    : dist
HTML 页面数 : 364
含站外链接页: 362  (99.5%)
站外 <a> 总数: 1870
```

### 引用型外链域名聚合（共 6 个域名 / 1870 处）

| 域名 | 次数 | 覆盖页 | Tier | rel 标记 |
|---|---:|---:|---|---|
| play.google.com | 400 | 362 | T2 | noopener, noreferrer |
| facebook.com | 363 | 362 | T2 | noopener, noreferrer |
| instagram.com | 363 | 362 | T2 | noopener, noreferrer |
| twitter.com | 363 | 362 | T2 | noopener, noreferrer |
| youtube.com | 363 | 362 | T2 | noopener, noreferrer |
| h5.lollipop.im | 18 | 12 | T3（自有子域） | noopener, noreferrer |

### 权威性分级

| Tier | 域名数 | 处数 | 占比 |
|---|---:|---:|---:|
| Tier 1（政府/监管/标准/学术/认证） | **0** | **0** | **0.0%** |
| Tier 2（大厂官方/百科/权威媒体/商店/评台） | 5 | 1852 | 99.0% |
| Tier 3（其他第三方） | 1 | 18 | 1.0% |

### 结论

1. **Tier 1 权威引用 = 0**——全站没有一条政府、监管、标准组织、学术、认证机构的外链。
2. **Tier 2 的 99% 里有 78% 是"自家社媒档案"**（twitter/instagram/youtube/facebook 共 1452 处 = 77.6%），它们出现在 footer，本质是 NAP 自证信号，**不是编辑性权威引用**。剔除后真正引用第三方的只有 `play.google.com` 400 处（21.4%）+ `h5.lollipop.im` 18 处（自有子域）。
3. **编辑性权威引用实际为 0 处**。Wikipedia、新闻媒体、行业报告、标准文档——一条都没有。
4. **应用商店未构成垄断**（21.4%），但这只是因为社媒 footer 链接把分母撑大了。
5. **完全没有 App Store**：`dist/` 全站 `apps.apple.com` / `itunes.apple.com` 出现 **0 次**，源码里也没有任何 App Store URL。`FAQSection.tsx:137` 那个标着「App Store」的按钮实际指向 `https://h5.lollipop.im/`（H5 网页版）。而 meta description 与通稿都宣称 "Free on iOS & Android"。

### rel 属性审计

```
rel=noopener      1870 处
rel=noreferrer    1870 处
rel=preconnect     362 处
rel=dns-prefetch   362 处
→ 站外 <a> 共 1870 处，带 nofollow 的 0 处（0.0%）
→ 从未使用: sponsored, ugc
```

- **nofollow 使用量 = 0**：400 处 Google Play 下载 CTA（商业性质）和 1452 处社媒 footer 全部是 follow，权重无差别外流。
- **sponsored / ugc 从未使用**：商店下载按钮属于典型应标 `rel="sponsored"` 的场景。

---

## 板块 2 · Organization 实体关联

### 2.1 站点级 Organization（`index.html:65-90`）

`index.html` 的 `#site-schema` 是唯一的站点级定义，**全站 362 页共用**。实际字段：

```
name, url, logo, sameAs, contactPoint, slogan
```

字段覆盖审计（`dist` 实测）：

| 字段 | 状态 | 说明 |
|---|---|---|
| `name` | ✅ | Lollipop Drama |
| `url` | ✅ | |
| `logo` | ⚠️ | **= `og-image.png`（1200×630 分享图）**，不是 logo。违反 Google logo 规范（应为可识别标识，建议 ≥112×112） |
| `sameAs` | ✅ | 6 条（twitter / instagram / youtube / tiktok / facebook / play.google.com） |
| `contactPoint` | ✅ | email + sales + Worldwide |
| `slogan` | ✅ | |
| `image` | ❌ | 缺失 |
| `foundingDate` | ❌ | 站点级缺失，仅 `/about` 有（值 "2024"，见 2.3 冲突） |
| `founder` | ❌ | 站点级缺失，仅 `/about` 有（值冲突，见 2.3） |
| `foundingLocation` | ❌ | 缺失（`src/app/App.tsx:49-51` 已写但**未进 dist**） |
| `address` | ❌ | 站点级缺失，仅 `/about` 有 |
| `telephone` | ❌ | 缺失（+65 80742120 只在 `/contact` 页 schema 与可见文本里） |
| `email` | ⚠️ | 仅在 `contactPoint` 内，顶层无 |
| **`legalName`** | ❌ | **缺失 —— "Starget Ventures LLC" 全站仅以 Play Store 包名 `com.StargetVenturesLLC.hks` 形式出现（362 页，全在 JSON-LD 内），可见文本 0 次** |
| **`alternateName`** | ❌ | **缺失 —— 旧名 "Lollipop AI" 全站 0 次提及**，而外部 comingup.io 至今以 "Lollipop AI" 收录 |
| `knowsAbout` | ❌ | 缺失 |
| `areaServed` | ❌ | 缺失 |
| `description` | ❌ | 缺失 |
| `numberOfEmployees` / `award` / `memberOf` | ❌ | 缺失 |

**最严重的两条**：`legalName`（法律主体）与 `alternateName`（旧品牌名）双双缺失。旧名 "Lollipop AI" 在站内被彻底抹除，AI 引擎无法把外部档案里的 "Lollipop AI" 与 "Lollipop Drama" 判定为同一实体——这正是改名站最典型的实体断裂。

### 2.2 重复实体隐患：**1310 个 Organization 节点 / 362 页**

`scripts/audit-entity-conflicts.py` 实测：

```
全站 Organization 节点总数: 1310

  @id=https://www.lollipop.im/#organization
      出现 725 次 / 362 页   ✅ 有 @id（可合并）
      字段: address, contactPoint, founder, foundingDate, logo, name, sameAs, slogan, url

  (无 @id) name='Lollipop Drama'
      出现 585 次 / 247 页   ❌ 无 @id（独立实体，无法合并）
      字段: logo, name, url

每页 Organization 节点数分布：
      2 个/页 → 114 页
      3 个/页 →   8 页
      4 个/页 → 156 页
      5 个/页 →  70 页
      6 个/页 →  14 页
```

**585 个匿名 Organization 跨 247 页**，全部缺 `@id`。来源（`文件:行号`）：

| 文件:行号 | 用途 | 是否带 @id |
|---|---|---|
| `src/app/App.tsx:104` | `creating` schema 的 `creator` | ❌ |
| `src/app/App.tsx:140` | `contact` schema 的 `mainEntity` | ❌ |
| `src/app/pages/BlogListPage.tsx:99` | `publisher` | ❌ |
| `src/app/pages/BlogPostPage.tsx:109` | Person 的 `worksFor` | ❌ |
| `src/app/pages/BlogPostPage.tsx:150` | Article 的 `publisher` | ❌ |
| `src/app/pages/BlogPostPage.tsx:217` | HowTo 的 `publisher` | ❌ |
| `src/app/pages/CreatorProfilePage.tsx:115` | `worksFor` | ❌ |
| `src/app/pages/DramaPage.tsx:65` | `publisher` | ❌ |
| `src/app/pages/LegalDocumentPage.tsx:142` | `publisher` | ❌ |

团队 lead 提示的 `App.tsx:104/140` 双实体确认为真，但**实际范围比预想大得多：9 处定义、585 次渲染、247 页受影响**。单页最多 6 个 Organization 节点（博客页：site-schema×2 + Person.worksFor + Article.publisher + HowTo.publisher）。

后果：Google / AI 引擎看到的不是 1 个 Lollipop Drama 组织，而是 **587 个互不相干的 "Lollipop Drama" 组织节点**，其中只有 1 个带 sameAs / contactPoint / logo。实体权威被彻底稀释。

### 2.3 实体数据双源冲突（严重）

同一个 `/about` 的 Organization 存在**两套互相矛盾的数据源**：

**A. 构建时源** `scripts/prerender-plugin.ts:286-300`（**当前 dist 实际采用的**）
```json
{
  "@type": "Organization",
  "@id": "https://www.lollipop.im/#organization",
  "foundingDate": "2024",
  "founder": { "@type": "Person", "name": "Nyx Entertainment Group" },
  "address": { "@type": "PostalAddress", "streetAddress": "3 Gambas Crescent, Nordcom One", ... }
}
```
- `founder` 把**公司名塞进 Person 类型** → 类型错误
- 与公开通稿一致（Nyx + 韩国文化投资基金合资），但**与 B 冲突**

**B. 运行时源** `src/app/App.tsx:36-56`（2026-09-09 改，git 显示 `M` 未提交）
```js
"mainEntity": {
  "@id": "https://www.lollipop.im/#organization",   // 注意：没有 @type
  "founder": { "@type": "Person", "name": "James C.", "jobTitle": "Co-Founder", ... },
  "foundingLocation": { "@type": "Place", "address": "3 Gambas Crescent, #04-01, Nordcom One, Singapore 757088" }
}
```
- founder 换成 "James C."，与 A 完全不同
- **节点缺 `@type`**：`mainEntity` 只写了 `@id`，一旦站点级 schema 未加载，`/about` 会吐出一个没有类型、没有 name 的悬空节点

同时 `git status` 显示 `src/app/App.tsx`、`src/app/components/TestimonialsSection.tsx` 等为 `M`（已改未提交），**dist 未重建**，即线上产物与源码已经漂移。

**另有事实冲突**：`foundingDate: "2024"`，但 2026-07 通稿称 Lollipop 于 **2026-07-08/09 全球上线**。

### 2.4 `sameAs` 反模式（240 页受影响）

```
https://www.lollipop.im/about
    324 次 / 240 页 | 挂靠类型: Person | ❌ 站内自引
```
`src/app/pages/BlogPostPage.tsx:114`：
```js
url: "https://www.lollipop.im/about",
sameAs: ["https://www.lollipop.im/about"],
```
`sameAs` 的语义是"指向**其他站点**上描述同一实体的权威档案"。指向自己站内 `/about` 等于告诉 AI 引擎"这个 Person 就是我们的 about 页"，不仅无助于消歧，还会污染作者实体（240 个博客页的作者全被钉到同一个内部 URL 上）。**这是一个正在规模化扩散的反模式。**

外部 sameAs（6 条，362 页）本身是健康的，但 `tiktok.com/@lollipopai` 只存在于 JSON-LD，**footer 里没有对应的可点击链接**（footer 只有 twitter/instagram/youtube/facebook）——声明了档案却没链接，属于声明与实现不一致。

---

## 板块 3 · 真实用户评价填充脚手架现状

### 3.1 评价类 schema 残留：dist 全站 0 处 ✅

`scripts/audit-entity-conflicts.py` 对 364 个 HTML、691 个 ld+json 块做全量解析：

```
【3】评价信号残留扫描（Review / AggregateRating / ratingValue / ratingCount / reviewCount）
  ✅ dist 全站 0 处评价类 schema 字段残留
```

类型计数交叉验证：`Review` = 0，`AggregateRating` = 0，`Product` = 0。

源码侧残留仅为**注释**（说明性，不产出 schema）：

| 文件:行号 | 内容 |
|---|---|
| `src/app/App.tsx:69-71` | `// aggregateRating removed — ratingCount "2000000" was using download count as review count...` |
| `src/app/App.tsx:94` | `// aggregateRating removed from Product — same reason as above` |
| `src/app/pages/DramaPage.tsx:61-62` | `// aggregateRating removed — platform has no user review system yet; using views (e.g. "52M") as ratingCount violates Google's review snippet spam policy...` |
| `src/app/components/TestimonialsSection.tsx:69-72` | `// 2026-09-09 审计 P1-2：移除 Product + Review 结构化数据...` |
| `scripts/prerender-plugin.ts:270-273` | `// 2026-09-09 审计 P1-2：移除首页 Product + 8 条自评 Review...` |

JS bundle 侧：`dist/assets/app-distribution-Cc7eYh_q.js` 中 `aggregateRating/ratingValue/reviewCount/ratingCount` 计数均为 **0**；唯一的 `"Review"` 命中是 i18n 文案 `colReview:"Review"`（审核状态标签），与评价无关。

**结论：清理是彻底的，这是本次审计唯一满分项。**

### 3.2 但可见文本侧的"4.9 星"声明未同步清理（重大遗留）

schema 干净了，**可见文本没有**。全站 362 个 HTML 全部含 "4.9"：

| 位置 | 声明 |
|---|---|
| `src/app/components/FAQSection.tsx:124` | `{ icon: "award", label: "App Rating", value: "4.9 Stars" }` |
| `src/app/components/FAQSection.tsx:219/314/409/504/599` | 中/繁/葡/西/阿 5 个语言同款 `4.9 星 / 4.9 Estrelas / 4.9 estrellas / 4.9 نجوم` |
| `src/app/components/ProductOverview.tsx:99, 189` | `{ val: "4.9★", label: "App Rating" }` |
| `src/app/i18n.tsx:263, 679, 1090, 1501, 1912, 2323` | 6 个语言的 `rating: "4.9"` |
| `src/app/i18n.tsx:266, 682, 1093, 1504, 1915, 2326` | 6 个语言的 `{ value: "4.9★", label: "App Rating" }` |
| `src/app/components/DownloadCTA.tsx:113-117` | 5 个实心星图标 + `rating: "4.9"` |
| **`scripts/prerender-plugin.ts:319`** | **`/download` 的 meta description 直接写 `"4.9-star rating"`** —— 已随构建上线 |

风险：这是一个**无来源、无归属、无跳转的聚合评分声明**，且被写进 meta description（爬虫高权重字段）。它比之前的 `ratingCount: "2000000"` 更隐蔽，但性质相同——用不可核验的数字冒充聚合评分。目前因**没有配套 schema** 所以不触发 review snippet 富媒体，暂时安全；但一旦有人"顺手"给它补上 `aggregateRating`，就是旧病复发。

### 3.3 TestimonialsSection：硬编码假数据，无 schema

`src/app/components/TestimonialsSection.tsx`

- 数据源：`src/app/i18n.tsx:190-228`（en），**8 条硬编码评价**，结构为 `{ name, role, text }`
  ```
  { name: "Sarah M.", role: "Premium · USA", text: "I'm completely addicted..." }
  { name: "James L.", role: "VIP · UK", ... }
  ... 共 8 条
  ```
- 头像：`TestimonialsSection.tsx:6-15` 硬编码 8 个 **Unsplash 图库照片 URL**（`photo-1608185383614-...` 等），不是真实用户头像
- 星级：`:21-23` 每卡无条件渲染 **5 个实心黄星**——所有评价都是满分
- **无日期、无来源、无身份核验、无 schema 输出**（`:69-72` 注释说明已主动移除）

风险定性：这是**平台自评（self-serving reviews）**——站点在自己的页面上发布对自己有利的用户评价。按 Google 评价摘要政策，此类评价：
- 若以 `Review`/`AggregateRating` 结构化标记 → **明确违规**，可致富媒体结果被移除或人工处罚
- 若仅作可见营销文案、无结构化标记 → 一般不构成富媒体违规，但**不得标注为"评分"**

当前状态属于后者，尚可接受；但 `FAQSection` 把它标注为 **"App Rating"（应用评分）** 就越界了——那是在声称一个聚合评分结果。

### 3.4 UGC 采集通路：完全不存在

| 检查项 | 结果 |
|---|---|
| 后端 API | ✅ 存在真实后端（`src/app/services/http.ts:21-25`，`VITE_API_BASE` + `/sqx_fast`），共 **73 个端点** |
| 评价/评分端点 | ❌ **0 个**。全量 grep `review\|comment\|rate\|score\|feedback\|rating` 于 `src/app/services/*.ts`，仅命中内部统计字段（`commentCount`、`growthRate`、`playMomRate`），无一条 UGC 采集接口 |
| 评价提交表单 | ❌ 无 |
| 第三方评价组件 | ❌ 无 Trustpilot widget / G2 badge / Judge.me / Yotpo。出站扫描证实：全站第三方评价平台外链仅 `play.google.com` 1 个 |
| 可用的媒体资产 | ⚠️ `src/app/components/PressPage.tsx` 已写好（含 2 篇公司公告 + 媒体素材 + 社媒链接），但 **grep 全仓无任何路由引用，`dist/press` 不存在**——孤儿组件，未上线 |

---

### 3.5 缺口清单 + 落地方案

#### 短期（0 后端改动，1 天内可完成）

| # | 动作 | 位置 | 合规说明 |
|---|---|---|---|
| S1 | **删除或归因化 "4.9 星"** | `FAQSection.tsx:124/219/314/409/504/599`、`ProductOverview.tsx:99/189`、`i18n.tsx` 6 处 × 2、`prerender-plugin.ts:319` | 优先项。要么删掉，要么改成 `"Rated 4.6 on Google Play"` 并**超链接到 Play Store listing**，让声明可核验 |
| S2 | **给 testimonials 去"评分化"** | `TestimonialsSection.tsx` + `i18n.tsx` | 标题 `User Reviews` → `What Our Community Says`；去掉"App Rating"标签。保留文案（属于营销表述），但不声称是聚合评分 |
| S3 | **修 `Person.sameAs` 反模式** | `BlogPostPage.tsx:114` | 直接删除该行。240 页受影响，一行改动 |
| S4 | **给 585 个匿名 Organization 加 `@id`** | 9 个文件（见 2.2 表） | 统一改为 `{"@id": "https://www.lollipop.im/#organization"}` 或至少补 `@id` + `@type`。单页 Organization 节点从 4-6 个降到 1 个逻辑实体 |
| S5 | **补 `legalName` / `alternateName` / `telephone` / `image` / `description` / `knowsAbout` / `areaServed`** | `index.html:69-90` | `alternateName: "Lollipop AI"` 对消歧最关键 |
| S6 | **logo 换成真 logo** | `index.html:74` | 当前 `og-image.png`（1200×630）当 logo，需独立的正方形/横向 logo 文件 |
| S7 | **footer 补 TikTok 链接**（或删掉 schema 里的声明） | `index.html:79` vs footer 组件 | 声明与实现二选一 |
| S8 | **`rel="sponsored"`** 加到 400 处商店 CTA | `DownloadCTA.tsx:134`、`FAQSection.tsx:136/231`、`App.tsx:72` | 商业下载按钮应标 sponsored |

#### 中期（需后端 + 前端）

| # | 动作 | 说明 |
|---|---|---|
| M1 | **商店真实评分回引** | 用 Google Play 官方 listing 的真实星级/条数填 `aggregateRating`，并**必须**：① 数值与商店页面一致；② 页面可见文本同步展示同一数值；③ 标注来源并链接到 listing；④ 只标 `MobileApplication`/`SoftwareApplication`，不标 `Organization` |
| M2 | **补 App Store** | 现状是 0 个 App Store 链接。若确实无 iOS 原生上架，应停止宣称 "on iOS & Android"，或改指 H5 并如实标注 |
| M3 | **自建评价采集** | 后端加 `/app/review/submit` + `/app/review/list`（复用现有 73 端点的 `sqx_fast` 基础设施）；评价需绑定已登录用户、带时间戳、可审核 |
| M4 | **动态注入 `Review` schema** | 只输出**已审核通过**的真实评价，且**必须与页面可见文本逐条一致**（Google 要求 markup 与用户可见内容匹配） |
| M5 | **上线 PressPage** | `src/app/components/PressPage.tsx` 已是现成资产，加路由即可。但注意它的 2 篇"press releases"都是自发布公司公告，`url` 指向站内 `/about`——应补充真实的第三方报道外链（见下方清单） |
| M6 | **接入第三方印证** | Trustpilot / G2 等，并把它们加进 `sameAs` |

#### 明确违反 Google 评价摘要政策的做法（红线）

| 做法 | 定性 |
|---|---|
| 用下载数/浏览量冒充 `ratingCount` | ❌ 违规（`App.tsx:69-71`、`DramaPage.tsx:61-62` 注释已记录，曾发生） |
| 用剧集内部打分（如 `rating: "9.2"`）当 `AggregateRating` | ❌ 违规 —— 那是编辑评分，不是用户评价 |
| 平台在自己页面发布有利于自己的用户评价并加结构化标记（self-serving reviews） | ❌ 违规（TestimonialsSection 现状若补 schema 即触雷） |
| 虚构评价、批量生成评价、互换评价 | ❌ 违规 |
| 结构化标记的评价内容不在页面上可见 | ❌ 违规 |
| 评价无作者、无日期、无来源 | ⚠️ 高风险 |
| 聚合评分数值与任何可核验来源都不一致（如硬编码 4.9） | ⚠️ 高风险，且叠加富媒体标记即转违规 |

#### 恢复 `aggregateRating` 的前置条件清单

**必须全部满足才可恢复**，否则维持现状（现状反而是安全的）：

- [ ] **P1** 存在可公开核验的评分来源（Google Play listing 页面可访问且显示星级 + 条数）
- [ ] **P2** `ratingValue` 与 `ratingCount` 数值**与该来源页面完全一致**（人工核对 + 截图留档）
- [ ] **P3** 页面上**可见文本同步展示同一数值**，并标注来源（如 "4.6 ★ on Google Play · 12,483 reviews"）
- [ ] **P4** 该可见文本**超链接到来源页面**（`play.google.com/store/apps/details?id=...`）
- [ ] **P5** 数值**不是硬编码**，来自可更新的数据源（API / 构建期抓取 / CMS）
- [ ] **P6** 加设**对账机制**：每月核对一次商店实际数值，偏差 >0.1 即告警
- [ ] **P7** 只挂在 `MobileApplication` / `SoftwareApplication` 上，**不挂在 `Organization`、`Product`（无实体商品）、`Article`**
- [ ] **P8** 若有自建评价系统：仅输出已审核、绑定真实用户、带 `datePublished` 与 `author` 的评价

**建议加在哪几个页面**（按优先级）：
1. `/download`（`MobileApplication`/`SoftwareApplication`）—— 唯一有真实商店 listing 支撑的页面
2. `/`（首页 SoftwareApplication，与 index.html site-schema 的 `MobileApplication` 节点合并）
3. `/creating`（SoftwareApplication，AI 工具）—— 需先有独立评分来源，否则不加

**不要加在**：`/about`、`/blog/*`、`/drama/*`、`/genre/*`、`/creator/*`、法务页。

---

## 板块 4 · 权威信号健康度评分

### 26 / 100

| 维度 | 满分 | 得分 | 依据 |
|---|---:|---:|---|
| 出站权威外链质量 | 20 | **4** | Tier 1 = 0 处；剔除自家社媒后编辑性引用 = 0；nofollow 0 处、sponsored/ugc 从未使用；App Store 缺失 |
| 实体关联强度 sameAs / 组织档案 | 20 | **7** | sameAs 6 条✅(+7)；缺 legalName / alternateName / telephone / image / knowsAbout / areaServed / description(-6)；logo 用错图(-2)；双源 founder 冲突(-2) |
| 评价信号真实性与完整性 | 25 | **6** | dist 评价 schema 残留 0 ✅(+8)；18+ 处硬编码 4.9 无来源(-8)；prerender meta 写 4.9(-3)；8 条无日期无来源自评(-4) |
| 结构化数据一致性与无冲突 | 20 | **7** | 691 块 JSON-LD 解析 100% 成功 ✅(+5)；585 个匿名 Organization / 247 页(-8)；Person.sameAs 站内自引 240 页(-3)；dist 与 src 漂移(-2) |
| UGC / 第三方印证通道 | 15 | **2** | 后端 73 端点可用(+2)；0 评价端点 / 0 表单 / 0 第三方组件(-6)；PressPage 孤儿(-2)；App Store 缺失(-3) |

### 补齐后预计提升

| 阶段 | 动作 | 预计得分 |
|---|---|---:|
| 现状 | — | **26** |
| 低垂果实（1 天内） | S1–S8 全部完成（改文案 + 加 @id + 补 Organization 字段 + rel 标记） | **48–54**（+22~28） |
| 中期（2–4 周） | M1 商店评分合规回引 + M3/M4 自建评价采集 + M5 PressPage 上线 + M6 第三方印证 | **71–81**（+45~55） |

### 1 天内可做的低垂果实（按 ROI 排序）

1. **`BlogPostPage.tsx:114` 删一行** —— 消除 240 页的 sameAs 反模式（5 分钟）
2. **9 个文件加 `@id`** —— 585 个重复实体归并为 1 个（30 分钟，纯机械改动，可用脚本批量）
3. **`index.html` 补 `legalName` + `alternateName` + `telephone` + `description` + `knowsAbout` + `areaServed`** —— 直接提升 AI 引擎实体消歧（20 分钟）
4. **处理 4.9 星**：`prerender-plugin.ts:319` 的 meta description 优先（已上线），要么删要么归因（20 分钟）
5. **换 logo**：做一个真 logo 替换 `og-image.png`（30 分钟）
6. **商店 CTA 加 `rel="sponsored"`**（10 分钟）

---

## 附：可用的第三方权威外链候选（已实测存在）

全部来自 2026-07 全球上线通稿的多源派发。注意：前 5 条同源，应折算为「1 篇通稿 + N 次派发」，真正的独立撰稿目前仅 seatickers 一条。

| 来源 | URL | 性质 | 建议用法 |
|---|---|---|---|
| GlobeNewswire | `https://www.globenewswire.com/news-release/2026/07/09/3324858/0/en/Lollipop-Launches-Global-Streaming-Platform-for-Short-Dramas-Pioneering-Human-AI-Content.html` | 原始通稿 | PressPage 引用 |
| The Manila Times | `https://www.manilatimes.net/2026/07/09/tmt-newswire/globenewswire/lollipop-launches-global-streaming-platform-for-short-dramas-pioneering-human-ai-content/2381696` | 媒体转载 | **权威度最高**，优先引用 |
| The World Newswire | `https://www.theworldnewswire.com/agp-article/925212075` | 转载 | 次要 |
| FinanceWire | `https://financewire.com/2026/07/13/lollipop-launches-global-streaming-platform-for-short-dramas-pioneering-human-ai-content-2` | 转载 | 次要 |
| seatickers.com | `https://seatickers.com/business/the-1-unlock-how-lollipop-is-monetizing-your-loneliness-with-ai-drama` | **独立撰稿** | 唯一非派发源，价值最高 |
| comingup.io | `https://www.comingup.io/p/lollipop-ai` | 产品目录（仍用旧名） | 需联系改名为 Lollipop Drama |

**可提取的实体事实**：Allen Yang（Head of Content，多篇一致）、media@lollipop.im（媒体联系）、2026-07-08/09 全球上线（新加坡）、Nyx Entertainment Group + 韩国文化投资基金合资。

---

## 附：审计脚本

| 脚本 | 用途 | 状态 |
|---|---|---|
| `scripts/audit-authority-outbound.py` | 出站外链盘点 / Tier 分级 / rel 审计 | ✅ 已跑通，产物 `scripts/out/authority-outbound.json` |
| `scripts/audit-entity-conflicts.py` | JSON-LD 实体冲突 / sameAs 审计 / 评价信号残留 / 字段覆盖 | ✅ 已跑通 |

复跑：`python scripts/audit-authority-outbound.py --json` / `python scripts/audit-entity-conflicts.py`

---

# 增补（2026-09-10 · 与 keyword-researcher 交叉验证后）

## A. 法律主体名「三层冲突」——本次审计最严重的实体一致性问题

keyword-researcher 的工商检索 + 本人在 filesystem 侧的复核，拼出一个此前没人发现的完整事实：**这个品牌在三个层面使用了三个互不相同的主体名，且三个名字没有一个是站点主动声明的。**

| 层 | 主体名 | 出处 | 站内是否声明 |
|---|---|---|---|
| ① 工商注册（ACRA） | **LOLLIPOP AI PTE. LTD.**，UEN **202627196R**，2026-06-17 注册，状态 Live，地址 3 Gambas Crescent #04-01 Nordcom One | keyword-researcher 工商检索 | ❌ **全站 0 次** |
| ② 应用商店开发者 | **Starget Ventures LLC** | Google Play 包名 `com.StargetVenturesLLC.hks` | ⚠️ 仅以包名形式出现 362 次，**全在 JSON-LD 内，可见文本 0 次**，`legalName` 未声明 |
| ③ 站点对外品牌 / 法务条款 | **Lollipop Drama** / 条款内自称 **"Lollipop"** | 品牌 + `src/app/data/legalContent.ts:16-17` | ⚠️ 品牌有，法律名无 |

### filesystem 实证

1. `src/app/data/legalContent.ts:16`（Terms）与 `:17`（Privacy）——法务正文**通篇只写 "Lollipop"**：
   > "Lollipop is the registered copyright owner of this software…"
   > "This software is **operated by Lollipop** and provides video services to you…"
   > "This product is **operated by Lollipop**, providing you with services and **enjoying rights, fulfilling obligations, and assuming legal responsibilities** in accordance with the law."

   **承担法律责任的主体在法律条款里只写了一个品牌词 "Lollipop"**——既不是 Starget Ventures LLC，也不是 LOLLIPOP AI PTE. LTD.。这是合规与实体一致性的双重问题。

2. 全仓精确检索（含大小写与空格变体）均为 **0 匹配**：
   - `Starget Ventures`（带空格）= 0
   - `PTE. LTD` / `PTE LTD` = 0
   - `202627196R` / `UEN` = 0
   - `LOLLIPOP AI PTE` = 0
   - 唯一命中是 Play 包名 `com.StargetVenturesLLC.hks`（无空格）

3. 时间线还有第三处不一致：
   - 法务 Terms 生效日 **2024-04-15**
   - Privacy 最后更新 **2026-05-18**
   - `/about` schema `foundingDate: "2024"`（`prerender-plugin.ts:288`）
   - 2026-07 通稿称 **2026-07-08/09 全球上线**
   - ACRA 注册日 **2026-06-17**
   → **五个日期，四个互相矛盾**。

### 影响

Google / AI 引擎做实体对齐时，`legalName` 是唯一能把"品牌名"锚定到"法律实体"的强信号。当前状态是：
- 站点自称 Lollipop Drama
- 商店开发者叫 Starget Ventures LLC
- 工商注册叫 LOLLIPOP AI PTE. LTD.
- 旧品牌叫 Lollipop AI
- 法务条款只写 Lollipop

**五个名字，零个 `legalName`，零个 `alternateName`。** 引擎无法确认这是同一家公司，实体可信度直接归零。

### 修订后的建议（替换原 S5）

- `legalName` 应填 **ACRA 注册名**（`LOLLIPOP AI PTE. LTD.`），因为这是唯一有公开工商记录可核验的主体
- `alternateName` 填 `["Lollipop AI", "Lollipop"]`
- 新增 `taxID` / `vatID`：`UEN 202627196R`
- `foundingDate` 应改为 ACRA 注册日 **2026-06-17**（而非 2024）
- ⚠️ **投放前必须由业务方确认**：Starget Ventures LLC 与 LOLLIPOP AI PTE. LTD. 的关系（母子公司 / 前后主体 / 错误填写）。若二者确实无关，**Google Play 开发者名即为错误**，应先改商店资料。在确认前，不建议把任何一个写进 `legalName` 并对外投放。

---

## B. 品牌名撞车 → 外链锚文本强制规范

keyword-researcher 实测："Lollipop AI" 在公网至少有 **5 个不同主体**在抢（我方 lollipop.im / lollipop.to 伦敦 AI 广告工具 / lollipop.chat NSFW 聊天 / lollipop.camera 台北婴儿摄像头 / getlollipop.com 同志社交）。

叠加本人在 filesystem 侧的发现——**站内 "Lollipop AI" 出现 0 次**——结论是：旧名既没被站内声明，又被 5 个外部主体瓜分。**单独使用 "Lollipop AI" 没有任何品牌资产价值，只有混淆风险。**

### 外链锚文本规范（新增交付）

| 场景 | 允许 | 禁止 |
|---|---|---|
| 所有对外投放 / 客座 / 目录提交 | **"Lollipop Drama"**（或 "Lollipop Drama — AI short drama platform"） | 单独 "Lollipop AI" / "Lollipop" |
| 锚文本落点页要求 | 落地页首段须同时出现 **"short drama"**（消歧）+ **"lollipop.im"**（域名锚定） | 只写品牌不写品类 |
| `sameAs` / 目录档案 | 统一用 **Lollipop Drama** | 沿用旧名 |

---

## C. 评价平台：现状空白 + 新建优先级

keyword-researcher 实测 Trustpilot / G2 / Capterra / SaaSHub 均无 lollipop.im profile 痕迹。本人 filesystem 侧交叉验证：**全站第三方评价平台外链仅 `play.google.com` 1 个**，无 Trustpilot / G2 / Judge.me / Yotpo 任何组件或外链。

对比基准（keyword-researcher 提供）：

| 竞品 | Trustpilot | G2 | Capterra |
|---|---:|---:|---:|
| Runway | 232–310 条（虽仅 1.1–1.2 星） | 14–38 条 | 11 条 |
| Fanvue | 1,334–1,600+ 条（4.2–4.6 星） | — | — |
| **Lollipop Drama** | **0** | **0** | **0** |

**关键判断（本人认同并写入方案）**：评价体系里「有差评」远好于「无记录」。Runway 只有 1.1 星但有 232+ 条语料，AI 引擎在回答"XX 怎么样"时至少能引用；零记录则完全不可引用。

### 修订后的评价阵地优先级

| 优先级 | 平台 | 理由 |
|---|---|---|
| **P0** | **Google Play**（已存在） | 唯一已有 listing 的阵地，且是唯一能合规支撑 `aggregateRating` 的来源。先把数值核准 + 可见文本归因化 |
| **P0** | **Trustpilot** | 产生可被 AI 引用的 UGC 语料最快；免费建 profile；域名 `lollipop.im` 尚未被占 |
| **P1** | **Product Hunt**（已存在，需修正） | `https://www.producthunt.com/products/lollipop-ai` —— 旧名 + 过期数据（5,000 剧 / 70% 分成），hunter 非官方。**改名为 Lollipop Drama + 更新数据**的 ROI 高于新开阵地 |
| **P1** | **G2 / Capterra** | B2B 侧（AI 创作工具）需要，配合 `/creating` 页 |
| **P2** | comingup.io / sideprojectors.com | 已收录但用旧名，批量改名即可 |

### 「已存在但需修正」清单（比新开阵地便宜得多）

| 平台 | URL | 待修正 |
|---|---|---|
| Product Hunt | `https://www.producthunt.com/products/lollipop-ai` | 旧名 + 过期文案（5,000 剧/70% 分成，现为 15,000+/80%）+ hunter 非官方 |
| comingup.io | `https://www.comingup.io/p/lollipop-ai` | 旧名 |
| sideprojectors.com | `https://www.sideprojectors.com/project/87986/lollipop-ai` | 旧名 |

---

## D. 评分调整

原评分 **26/100** 是基于「缺 `legalName`」这一已知项。交叉验证后发现问题比"缺失"更严重——是**五个主体名互不一致且全部未声明**。因此下调「实体关联强度」与「结构化数据一致性」两项：

| 维度 | 原分 | 修订 | 说明 |
|---|---:|---:|---|
| 实体关联强度 sameAs/组织档案 | 7 | **4** | 由"缺字段"升级为"三层主体名冲突 + 五个日期矛盾"，且法务条款主体仅写品牌词 |
| 结构化数据一致性与无冲突 | 7 | 7 | 维持（原有重复实体问题已计入） |
| 其余三项 | — | 维持 | |
| **总分** | **26** | **23** | |

补齐后预计：低垂果实阶段 **45–51**（+22~28，其中修 legalName/alternateName/taxID 单条动作即可贡献约 6 分）；中期 **68–78**。

---

# 增补 2（2026-09-10 · Play Store 真实数据到手后，方案推翻重写）

> 数据来源：keyword-researcher 用 `Invoke-WebRequest` 直连 Play Store 实测（HTTP 200，HTML 1.24MB）。本人未能独立复现（沙箱 curl/WebFetch 均失败），故标注为**单一来源但可复核**。

## E. Play Store 真实数据：官方 4.9 星是假的，真实 3.4 星

| 字段 | 官网 / schema 声称 | **Play Store 真实值** | 偏差 |
|---|---|---|---|
| 星级 | **4.9** | **3.4** | **-1.5 星** |
| 评价数 | （未声称） | **108 条** | — |
| 下载量 | **2M+**（200 万） | **10K+** | **差约 200 倍** |
| 标题 | Lollipop Drama | **"Lollipop AI-AI Video Maker"**（旧名未改） | 品牌不一致 |

**星级分布（极度双峰，中间全空）**：64×5★ / 0×4★ / 0×3★ / 0×2★ / **43×1★**

### 这推翻了 M1 方案

原 M1「用 Google Play 真实评分合规回引 `aggregateRating`」在**纸面上成立**，但实测数据让它失去意义：

1. **合规回引只能填 3.4 / 108**。填 4.9 属**虚假结构化数据** —— Google 富媒体结果政策明确要求 `aggregateRating` 必须来自真实聚合的用户评价，这是 **manual action 级别**的风险，不是"警告"级别。
2. **填真实的 3.4 等于把最差分数主动钉进搜索结果** —— 商业上不可接受。
3. **分布形态是负面资产**：60% 五星 + 40% 一星、中间 0 条，是典型的"刷好评 + 真实愤怒用户"形态。第三方评测人拉一眼直方图大概率写成负面，主动示人只会放大风险。

**修订后的结论**：
- **M1 降级并改写**：不回引 Play 评分；`aggregateRating` **暂缓提交**
- **Trustpilot 从"P0 之一"升为"P0 唯一"** —— 需要一个「有真实语料 + 分数可控」的新载体
- **短期动作从"归因化 4.9"改为"删除 4.9"** —— 归因化已不可能（归因到 3.4 是自伤，归因到不存在的 App Store 是虚假）

## F. 虚假声明已从可见文本扩散到 meta / og / twitter 三处（已上线）

这是本次最需要立即止血的项。原报告只发现 `prerender-plugin.ts:319` 一处，现已定位到**完整扩散面**。

### F1. 源码侧：`src/app/i18n.seo.ts` 的 `/download` 描述，6 个语言全中

| 行号 | 语言 | 内容要点 |
|---|---|---|
| `i18n.seo.ts:146` | zh-CN | "2M+下载量，100+国家，**App Store评分4.9星**" |
| `i18n.seo.ts:151` | zh-TW | "2M+下載量，100+國家，**App Store評分4.9星**" |
| `i18n.seo.ts:156` | en | "2M+ downloads, 100+ countries, **4.9-star rating**" |
| `i18n.seo.ts:161` | pt | "2M+ downloads, 100+ paises, **nota 4.9**" |
| `i18n.seo.ts:166` | es | "2M+ descargas, 100+ países, **4.9 estrellas**" |
| `i18n.seo.ts:171` | ar | "أكثر من 2 مليون تنزيل في 100+ دولة و**تقييم 4.9**" |

⚠️ **zh-CN / zh-TW 两版明确写"App Store 评分"** —— 而全站 `apps.apple.com` 出现 **0 次**，App Store 上架页是否存在都未证实。**这是"向不存在的来源做归因"，比单纯的数字错误性质更重。**

### F2. 产物侧：`dist/download/index.html` 三处高权重字段全部上线

| 行号 | 字段 |
|---|---|
| `:373` | `<meta name="description">` |
| `:378` | `<meta property="og:description">` |
| `:383` | `<meta name="twitter:description">` |

三处同样是 `"2M+ downloads, 100+ countries, 4.9-star rating."`。**meta description 是爬虫最高权重的可见字段，og/twitter 决定分享卡片。**

### F3. "2M+" 这个数字本身有前科

`src/app/App.tsx:69-71` 的注释记录了上一轮违规：
> `aggregateRating removed — ratingCount "2000000" was using download count as review count`

**2000000 就是 2M+**。当时把下载数当评价数填进 schema 的做法已被撤除，但**同一个数字仍留在 6 个语言的 meta description + 6 个语言的组件文案里**（`i18n.tsx:265, 681, 1092` 等 `{ value: "2M+", label: "Downloads" }`）。违规的载体被清了，**数据源头没清**。

## G. Starget 的身份：美国怀俄明 LLC（跨法域冲突）

keyword-researcher 从 Play 商店开发者信息页取得（**公开展示字段**）：

> **Starget Ventures LLC**
> 📧 kingsaudiasaudia422@gmail.com
> 📍 30 N Gould St, Sheridan, WY 82801-6317, **United States**
> ☎️ **+966** 55 119 2039（沙特区号）

事实陈述（不作意图推断）：
1. Starget **确实存在**，不是虚构 —— 但它是**怀俄明州 LLC**，不是新加坡实体
2. `30 N Gould St, Sheridan, WY` 是业内知名的**注册代理/虚拟地址**，大量 LLC 共用
3. 联系方式为 **免费 Gmail + 沙特区号手机**
4. 站点对外宣称的运营地是**新加坡**（3 Gambas Crescent），电话 **+65 80742120**

**实体一致性问题从"名字打架"升级为"跨法域打架"**：

| 层 | 主体 | 法域 | 联系方式 |
|---|---|---|---|
| 工商（ACRA） | LOLLIPOP AI PTE. LTD. / UEN 202627196R | 🇸🇬 新加坡 | — |
| 应用商店开发者 | Starget Ventures LLC | 🇺🇸 美国怀俄明 | Gmail + 沙特 +966 |
| 站点 footer / contact schema | Lollipop Drama | 🇸🇬 新加坡 | +65 80742120 |
| 法务条款 | "Lollipop" | 未声明 | — |
| Play 商店标题 | "Lollipop AI - AI Video Maker" | — | — |

对 AI 引擎而言，「免费邮箱 + 虚拟注册地址 + 跨法域 + 多个主体名」是典型的**弱信任信号组合**。

## H. `legalName` 建议从"风险提示"升级为"硬门槛"

原报告写的是「投放前必须让业务方确认（风险提示）」。**采纳 keyword-researcher 意见，改为硬门槛**：

> **在业务方书面确认 `Starget Ventures LLC` ↔ `LOLLIPOP AI PTE. LTD.` 的关系之前，`legalName` 一律不上线。**

理由（keyword-researcher 原话，本人认同并强化）：写进去的 `legalName` 如果同时被商店（怀俄明 LLC）和法务条款（"Lollipop"）打脸，**比什么都不写更糟** —— 它把一个内部不一致**变成了可被引擎交叉验证并证伪的公开声明**。缺失是"信息不足"，冲突是"可被证伪"。

`foundingDate` 同理：`2024` / `2026-05-18` / `2026-06-17` / `2026-07-08` 四个日期冲突，只有 ACRA 的 **2026-06-17** 有公开登记件支撑，其余均源自我方自述。**在确认前，建议删除 `foundingDate` 而非猜测。**

## I. 评分再下调：23 → 19 / 100

| 维度 | 上轮 | 本轮 | 说明 |
|---|---:|---:|---|
| 出站权威外链质量 | 4 | 4 | 维持 |
| 实体关联强度 | 4 | **3** | 由"跨主体名"升级为"跨法域"（怀俄明 LLC vs 新加坡 PTE LTD），且 `legalName` 现无法安全上线 |
| 评价信号真实性与完整性 | 6 | **2** | 4.9 由"无来源"升级为**"与真实值 3.4 严重不符 + 向不存在的 App Store 归因"**；2M+ 与真实 10K+ 差 200 倍；且已扩散到 meta/og/twitter 三处上线字段。唯一保留分是"schema 残留 0"（避免了最坏后果） |
| 结构化数据一致性 | 7 | 7 | 维持 |
| UGC / 第三方印证 | 2 | **3** | 唯一加分项：Trustpilot 路径明确且 `lollipop.im` 未被占 |
| **总分** | **23** | **19** | |

**注意评分逻辑**：评价信号这一项从 6 掉到 2，不是因为"又多发现一处 4.9"，而是因为**性质变了** —— 原先判定为"硬编码但无来源"（可疑），现在实测证明它**与真实数据差 1.5 星、且归因到一个不存在的来源**（可被证伪的虚假声明）。后者在 Google 政策下是 manual action 级别。

## J. 修订后的行动清单（替换原 S1 / M1）

### 立即止血（P0，1 小时内可完成，纯删除）

| # | 动作 | 位置 |
|---|---|---|
| **X1** | 删除 meta/og/twitter 三处的 "2M+ downloads" + "4.9-star rating" | `dist` 已上线 → 源头在 `src/app/i18n.seo.ts:146/151/156/161/166/171` 与 `scripts/prerender-plugin.ts:319`，**改完必须重建** |
| **X2** | 删除 6 语言组件里的 "2M+ Downloads" 与 "4.9★ App Rating" | `i18n.tsx:265/266, 681/682, 1092/1093, 1503/1504, 1914/1915, 2325/2326`；`FAQSection.tsx:124/219/314/409/504/599`；`ProductOverview.tsx:99/189` |
| **X3** | `DownloadCTA.tsx:113-117` 的 5 实心星 + rating 一并处理 | 星级图标本身即构成评分暗示 |
| **X4** | testimonials 去"评分化" | 标题 `User Reviews` → `What Our Community Says` |

⚠️ **X1 是全部动作里优先级最高的**：它是唯一已经上线、且落在爬虫最高权重字段上的可证伪虚假声明。

### 暂缓（等业务方确认）

- `legalName` / `taxID` / `foundingDate` —— **硬门槛，确认前不上线**
- `aggregateRating` —— **暂缓提交**（Play 3.4 不可用，Trustpilot 尚无数据）

### 唯一推进的 P0 建设项

- **Trustpilot 建档**（`lollipop.im` 未被占）—— 需要真实用户邀请机制配合，不可刷量

### 中期

- Play 商店资料修正：**标题改 Lollipop Drama**、开发者主体与站点/工商对齐
- 处理 43 条一星评价反映的产品问题（这是目前唯一成规模的真实用户语料）
- 待 Trustpilot 有真实语料后，再评估是否恢复 `aggregateRating`

## K. 仍待 keyword-researcher 回补

1. **App Store（iOS）条目是否存在** —— zh-CN/zh-TW 明确写"App Store 评分"，若 App Store 根本不存在，这是虚假归因
2. **108 条评价的文本内容**（尤其 43 条一星在骂什么）—— 目前唯一成规模的真实用户语料，对后续 UGC 应对与产品改进都有用
