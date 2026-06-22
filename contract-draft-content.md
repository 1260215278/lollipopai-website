# 上剧中心 · 接口契约草案（交后端确认）

> 适用模块：发行中心 / 上剧中心（P2-Content）
> 现状：上剧相关接口**尚未定义**，前端以 `VITE_USE_MOCK` 开关 mock 先行（`src/app/services/content.ts`）。
> 全局约定（沿用入驻接口）：`context-path=/sqx_fast`；鉴权 `header: token`；统一响应 `{ code, msg, data }`，`code=0` 成功、非 0 时 `msg` 可直接展示。
> 字段语义来自原型 `dashboard/ContentPage.tsx` 与 figma 设计稿，**未编造**；以下路径/字段为前端建议，最终以后端契约为准（联调时对齐 `services/content.ts` 真实分支）。
> 封面 / 剧集视频文件统一走已有 `POST /alioss/upload`（multipart, `file=`，返回 `data` 为 URL 字符串），本草案不再重复。

---

## 1. 数据字典

### DramaRow（短剧列表项 / 详情）
| 字段 | 类型 | 语义 |
|---|---|---|
| `id` | string | 短剧 ID（mock 形如 `D20260105001`） |
| `name` | string | 短剧名称 |
| `description` | string | 剧情简介（≤200 字） |
| `cover` | string | 封面 URL（空串=未上传） |
| `episodes` | number | 总集数 |
| `uploadedEpisodes` | number | 已上传集数（列表展示「M/N 集已上传」兜底） |
| `countries` | string[] | 上架国家 value 列表，枚举 `us` / `ph` / `in` |
| `tags` | string[] | 标签 value 列表（见标签枚举） |
| `distribution` | string | 发布范围：`account`(账号主页) / `full`(全量推荐) |
| `status` | string | `online`(已上架) / `offline`(已下架) / `reviewing`(审核中) / `not_published`(未上架) |
| `copyright` | string | 版权类型：`self`(自制) / `licensed`(授权) |
| `revenueType` | string | 收益方式：`account`(账户主页订阅 2:8) / `full`(全量推荐订阅 4:6) |
| `channel` | string | 频道：`male`(男频) / `female`(女频) / `general`(通用) |
| `uploadedAt` | string | 上传日期 `YYYY-MM-DD` |

> `distribution=full` ⇒ `revenueType=full`（平台4:出品方6）；`distribution=account` ⇒ `revenueType=account`（平台2:出品方8）。
> 标签枚举：`urban|rural|romance|youth|family|mystery|comeback|plot|wuxia|comedy|ancient|campus`。

### EpisodeRecord（单集明细）
| 字段 | 类型 | 语义 |
|---|---|---|
| `ep` | number | 集序号（1-based） |
| `title` | string | 剧集标题 |
| `duration` | string | 时长 `m:ss`，未知 `—` |
| `size` | string | 文件大小展示串（如 `130.0 MB`），未知 `—` |
| `uploadedAt` | string | 上传日期，未知 `—` |
| `status` | string | `uploaded`(已上传) / `processing`(转码中) / `failed`(上传失败) |

---

## 2. 接口列表

### 2.1 短剧列表
- `GET /app/drama/list`
- Query：`keyword?`(名称 / ID 模糊)
- `data`: `DramaRow[]`

### 2.2 短剧详情
- `GET /app/drama/detail`
- Query：`id`
- `data`: `DramaRow`

### 2.3 剧集明细
- `GET /app/drama/episodes`
- Query：`dramaId`
- `data`: `EpisodeRecord[]`

### 2.4 创建短剧（提交上剧流程）
- `POST /app/drama/create`
- Body（来自上剧三步：基本信息 + 上传剧集元数据 + 发布配置）：
  | 字段 | 类型 | 必填 | 语义 |
  |---|---|---|---|
  | `name` | string | 是 | 短剧名称 |
  | `description` | string | 是 | 简介 |
  | `cover` | string | 是 | 封面 URL（经 /alioss/upload） |
  | `countries` | string[] | 是 | 上架国家 value |
  | `tags` | string[] | 是 | 标签 value |
  | `totalEpisodes` | number | 是 | 总集数 |
  | `copyrightType` | string | 是 | `self` / `licensed` |
  | `channel` | string | 是 | `male` / `female` / `general` |
  | `distribution` | string | 是 | `account` / `full` |
  | `publishStatus` | string | 是 | `online`(立即上架→进入审核) / `offline`(暂不上架) |
- `data`: 新建的 `DramaRow`（`publishStatus=online` ⇒ `status=reviewing`；`offline` ⇒ `status=not_published`）。
- 备注：剧集视频文件本身在表单内逐个 `POST /alioss/upload`，创建时仅提交元数据（含已上传 URL）。若后端要求创建即带剧集元数据，可在 body 增加 `episodes: { ep, title, videoUrl }[]`（前端当前在「剧集视频管理」单独提交，见 2.6）。

### 2.5 上 / 下架
- `POST /app/drama/status`
- Body：`{ id: string, status: "online" | "offline" }`
- `data`: 更新后的 `DramaRow`
- 业务规则：`reviewing` 状态不可上下架（前端已禁用操作入口）。

### 2.6 提交剧集视频元数据（剧集视频管理页保存）
- `POST /app/drama/episodes/submit`
- Body：`{ dramaId: string, episodes: { ep: number, videoUrl: string, size: string, duration: string }[] }`
- `data`: 更新后的 `EpisodeRecord[]`（提交的集状态转 `processing` 转码中）。
- 备注：`videoUrl` 来自 `POST /alioss/upload`；`size` / `duration` 为前端读取的展示串。

---

## 3. 前端写死常量（不入接口）

### 国家收费规则（US / PH / IN，平台统一定价、只读）
> 硬约束：前端写死、原样移植原型、数值不可改。仅作展示，不参与提交。

| 国家(value) | flag | 整部剧 | 单集 | 15s 广告费 |
|---|---|---|---|---|
| 美国 (`us`) | 🇺🇸 | $80 | $10 | 无 |
| 菲律宾 (`ph`) | 🇵🇭 | $12 | $1.5 | $0.008/次 |
| 印度 (`in`) | 🇮🇳 | $8 | $0.8 | $0.005/次 |

> 出处：`src/app/distribution/mock/content.ts` 的 `COUNTRIES` 常量。

---

## 4. 待后端确认的问题
1. 列表是否分页 / 排序？当前 mock 返回全量，前端本地按 `keyword` 过滤。
2. 创建短剧时剧集视频是「随创建一起提交元数据」还是「创建后在剧集管理页单独提交」？（前端当前按后者实现，见 2.4 备注 / 2.6）
3. 审核状态机是否需要前端轮询 / 推送？当前 `reviewing` 为提交后即时态，无轮询。
4. `size` / `duration` 由前端计算上报还是后端转码后回填？（前端当前计算 mock 串上报，建议以后端回填为准。）
5. 上架国家维度：figma 列表/发布配置局部出现「上架语言（英语/葡萄牙语/中文）」措辞，但收费值与详情/下架页一致采用国家（US/PH/IN）。本期按**国家**建模，若后端以语言维度落库，需对齐 `countries` 字段语义。
