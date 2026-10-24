# Crunchbase 建档字段包 — Lollipop Drama

> 用途：在 Crunchbase 后台创建/修改组织档案时直接复制粘贴。
> 生成日期：2026-10-23｜依据：官网 llms.txt、Organization schema、About 页 i18n 文案（与官网口径一致）
> 操作前提：将现有档案名称改为 **Lollipop Drama**，删除错误的 **Professional Services** 分类。

---

## 1. 基本信息（Basic Info）

| CB 后台字段 | 填写内容 |
|---|---|
| Organization Name | `Lollipop Drama` |
| Website | `https://www.lollipop.im` |
| Operating Status | `Active` |
| Founded Date | `Jul 2026` ⚠️ 见下方冲突提示 |
| Headquarters | `Singapore`（详细地址：3 Gambas Crescent, #04-01, Nordcom One, Singapore 757088） |
| Contact Email | `business@lollipop.im` |
| Parent Organization | `Nyx Entertainment Group` |
| Investors / Backers | `Korean Cultural Investment Fund` |

### ⚠️ Founded Date 冲突提示（提交前请确认）

- 你要求 CB 填 **Jul 2026**；
- 但官网 llms.txt 与 Organization schema 的 `foundingDate` 均为 **2024**。
- 跨平台实体信息不一致会削弱 Google/AI 引擎的实体消歧与信任信号（与 lollipop 项目 GEO 审计的实体一致性原则冲突）。
- **建议**：若 Jul 2026 是产品正式上线日，公司成立日仍填 `2024`，将 Jul 2026 写进长文案中的 "launched in July 2026"；若确认要填 Jul 2026，建议同步把官网 llms.txt/schema 的口径统一调整。

---

## 2. About — 短版（Short Description，可直接粘贴）

```text
Lollipop Drama is an AI-powered short drama streaming and creator platform. Stream 15,000+ vertical dramas across 10+ genres, or create your own with built-in AI tools — with an industry-leading 80% creator revenue share. Available on iOS and Android in 100+ countries.
```

（259 字符；若后台限制更严，可用 173 字符备用版：）

```text
AI-powered short drama streaming and creator platform: 15,000+ vertical dramas, built-in AI creation tools, 80% creator revenue share, 100+ countries.
```

## 3. About — 长版（Full Description，可直接粘贴）

```text
Lollipop Drama is a global AI-powered short drama streaming and creator monetization platform, launched as a joint venture between Nyx Entertainment Group (Hong Kong) and the Korean Cultural Investment Fund. The platform offers 15,000+ premium short dramas across 10+ genres — including romance, revenge, thriller, fantasy and CEO dramas — in a mobile-first vertical format (1-3 minute episodes, 20-100 episodes per series).

For creators, Lollipop Drama provides built-in AI production tools covering text-to-video, image-to-video, image generation, face swap, style transfer and 4K output, together with an industry-leading 80% revenue share (competitors such as ReelShort and DramaBox typically pay 10-20%). Creators monetize through episode unlocks, premium subscriptions, fan tips and brand sponsorships, supported by a multilingual localization workflow across English, Chinese, Portuguese, Spanish and Arabic.

As of 2026, Lollipop Drama serves 1M+ registered users and 100K+ active creators across 100+ countries on iOS and Android. The company is registered in Singapore and positions itself as the AI-native alternative in the global short drama market — "the OnlyFans of the AI era" for AI premium series and AI influencers.
```

---

## 4. 分类（Categories / Industries）

**删除**：`Professional Services` ❌（分类错误，会误导投资者搜索与 AI 抓取）

**建议添加**（按相关度排序，CB 允许选择多个）：

| 优先级 | Category | 理由 |
|---|---|---|
| 1 | `Entertainment` | 核心赛道 |
| 2 | `Video Streaming` | 产品形态（与 ReelShort/DramaBox 同类目） |
| 3 | `Artificial Intelligence (AI)` | AI 创作工具与 AI 内容是核心差异化 |
| 4 | `Mobile Apps` | iOS/Android 应用 |
| 5 | `Digital Entertainment` | 细分定位 |
| 6 | `Content Creators` | 创作者经济平台属性 |
| 7 | `Subscription Service` | 商业模式之一 |
| 8 | `Generative AI`（如可选） | 强化 AI 原生定位 |

> 建议至少选 3-5 个，覆盖「流媒体 + AI + 移动应用 + 创作者经济」四个面。

---

## 5. 团队表（Team Members，与官网 About 页一致）

| 姓名 | CB 角色字段 | 一句话简介（可直接粘贴） |
|---|---|---|
| **James C.** | Founder / Co-Founder | 15+ years in entertainment technology. Previously led content strategy at a top-3 streaming platform in Southeast Asia. Oversees Lollipop Drama's dual human+AI content vision and global partnerships. |
| **Sarah L.** | Team Member — Head of Operations | Scaled mobile entertainment products across 20+ markets in APAC and Latin America. Former operations lead at a Tencent-backed short drama platform. Manages creator onboarding and multilingual localization. |
| **David P.** | Team Member — CTO | PhD in distributed systems. Built recommendation engines serving 50M+ daily active users. Leads the AI creation toolkit engineering team and 4K streaming infrastructure. |
| **Emily W.** | Team Member — Head of Finance | Former investment banker specializing in digital media M&A. Manages creator payout infrastructure across 100+ countries and the 80% revenue share economics model. |

> 备注：官网 About 页目前公开 4 人；若后续确定第 5 人（如 Head of Content / CMO），建议官网与 CB 同步补齐，保持跨平台一致。
> CB 操作提示：Team 成员需先建 People 档案再关联到 Organization；James C. 同时勾选 "Founder" 标记（官网 schema 的 `founder` 字段即 James C.）。

---

## 6. 社交与产品链接（Links 区块，逐个添加）

| 类型 | URL |
|---|---|
| Twitter/X | `https://twitter.com/lollipopai` |
| Instagram | `https://www.instagram.com/lollipopai` |
| YouTube | `https://www.youtube.com/@lollipopai` |
| TikTok | `https://www.tiktok.com/@lollipopai` |
| Facebook | `https://www.facebook.com/lollipopai` |
| Google Play | `https://play.google.com/store/apps/details?id=com.StargetVenturesLLC.hks` |
| App Store 落地页 | `https://h5.lollipop.im/` |

（与官网 schema `sameAs` 数组完全一致）

---

## 7. 建档完成后回链（关闭信息环）

CB 档案审核通过后：

1. 将 CB 档案 URL（形如 `https://www.crunchbase.com/organization/lollipop-drama`）加入官网 `index.html` Organization schema 的 `sameAs` 数组（对应 geo-external-actions-guide 步骤 3-4）；
2. 同步更新 `llms.txt` 的 Brand Fact Sheet（增加 Crunchbase 行）；
3. 若 Founded Date 最终采用 2024，一并复核 llms.txt / schema / CB 三处一致。

---

## 附：CB 后台逐项操作速查

1. 打开现有组织档案 → Edit → **Name 改为 `Lollipop Drama`**
2. Categories 中移除 `Professional Services`，按第 4 节添加新分类
3. About/Description 粘贴第 2-3 节文案
4. Details → Founded Date、Headquarters、Contact Email、Parent Organization
5. People → 逐个创建并关联 4 名团队成员（James C. 勾 Founder）
6. Links → 添加第 6 节 7 条链接
7. Submit for review（CB 审核通常 1-3 个工作日）
