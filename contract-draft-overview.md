# 接口契约草案 · 数据概览（Overview）

> 状态：**草案，待后端确认**。当前前端走本地 mock（`VITE_USE_MOCK=true`），字段语义反推自原型 `dashboard/HomePage.tsx` 与 Figma 设计稿 `node-id=15077-19718`，**不在业务代码里编字段**。确认后锁定再切真接口（`VITE_USE_MOCK=false`）。
>
> 通用约定（沿用入驻接口）：
> - context-path：`/sqx_fast`（由 `http.ts` 注入，路径无需重复带）
> - 鉴权：请求头 `token`（取自 `auth.getToken()`）
> - 统一响应：`{ code, msg, data }`，`code === 0` 成功取 `data`；非 0 由前端 toast 后端翻译好的 `msg`
> - 金额/数值口径：所有计数字段返回**原始整数**，由前端按当前语言格式化（简中/繁中用「万/亿」，英/葡用「K/M」；精确计数如评论/分享用千分位）

---

## 1. 获取数据概览（聚合）

一次性返回顶部统计卡 + 7/30 日趋势 + 剧集排行，避免首屏多次请求。

- **Method / Path**：`GET /app/publisher/dashboard/overview`
- **请求参数**：无（数据范围由 token 对应的发行者账号决定）
- **响应 `data`**：

```jsonc
{
  "stats": {
    "totalDramas":    { "value": 5,       "monthlyAdded": 2 },     // 上剧总数 + 本月新增部数
    "totalViews":     { "value": 3802000, "momPercent": 23.4 },    // 累计播放量 + 较上月环比%
    "totalLikes":     { "value": 138000,  "momPercent": 18.7 },    // 累计点赞数 + 较上月环比%
    "totalFavorites": { "value": 76000,   "momPercent": 15.2 }     // 累计收藏数 + 较上月环比%
  },
  "trend": {
    "7":  [ { "date": "6/10", "plays": 3480, "likes": 1150, "favs": 730 } /* …逐日 */ ],
    "30": [ { "date": "5/11", "plays": 800,  "likes": 200,  "favs": 120 } /* …隔日采样 */ ]
  },
  "ranking": [
    {
      "rank": 1,
      "title": "星河恋人",
      "episodes": 24,
      "plays": 1482000,
      "likes": 32000,
      "favs": 18000,
      "comments": 4521,
      "shares": 9830,
      "trend": "up"        // "up" | "down" 排名涨跌
    }
    // …按 plays 降序
  ]
}
```

### 字段说明

| 字段 | 类型 | 语义 | 备注 |
|---|---|---|---|
| `stats.totalDramas.value` | int | 上剧总数 | Figma：「5 部」 |
| `stats.totalDramas.monthlyAdded` | int | 本月新增部数 | Figma：「本月新增 2 部」 |
| `stats.totalViews.value` | int | 累计播放量（原始数值） | Figma：「380.2万」=3,802,000 |
| `stats.totalViews.momPercent` | number | 较上月环比百分比 | 正=增长；Figma：「较上月 +23.4%」 |
| `stats.totalLikes` / `stats.totalFavorites` | 同上 | 累计点赞 / 收藏 | 结构同 `totalViews` |
| `trend["7"]` / `trend["30"]` | array | 近 7 / 30 天趋势点 | 前端可切换周期 |
| `trend[].date` | string | 日期标签 | 直接展示，格式 `M/D` |
| `trend[].plays` / `likes` / `favs` | int | 当日播放 / 点赞 / 收藏 | 前端可切换指标维度 |
| `ranking[].rank` | int | 排名（从 1 起） | rank ≤ 3 高亮 |
| `ranking[].title` | string | 剧集名称 | |
| `ranking[].episodes` | int | 集数 | Figma：「24 集」 |
| `ranking[].plays` / `likes` / `favs` | int | 总播放 / 点赞 / 收藏 | 大数值，前端紧凑格式化 |
| `ranking[].comments` / `shares` | int | 评论 / 分享数 | 精确计数，前端千分位（4,521 / 9,830） |
| `ranking[].trend` | enum | 排名涨跌 `"up" \| "down"` | |

---

## 2. 待后端确认的问题

1. **趋势周期**：是否固定只支持 7 / 30 天两档？是否需要自定义日期范围（若需，建议改为 `GET /app/publisher/dashboard/trend?period=7|30` 或 `?start=&end=`，与聚合接口拆分）。
2. **趋势采样粒度**：近 30 天是「隔日采样」还是「逐日返回」？前端只负责画图，按返回点数渲染，建议后端明确点数上限。
3. **排行口径**：固定「按播放量降序 Top 5」，还是支持排序字段 / 分页？当前 mock 为 Top 5。
4. **`momPercent` 计算口径**：自然月还是滚动 30 天？无上月数据时返回 `0` 还是 `null`？（前端目前按 number 处理，`>=0` 显示绿色上升箭头。）
5. **统计卡是否需更多维度**（如累计评论 / 分享 / 收益）？Figma 当前仅 4 张卡。
6. **聚合 vs 拆分**：是否接受单接口聚合返回（首屏一次拉齐）？若各模块刷新频率不同，可拆为 `stats` / `trend` / `ranking` 三个接口。

---

## 3. 前端落地

- Service：`src/app/services/dashboard.ts`（`getDashboardOverview()`，`USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'`，mock 与 `http.get` 真实分支并存）。
- Mock：`src/app/distribution/mock/dashboard.ts`（数值取自原型 HomePage）。
- 类型：见 `dashboard.ts` 中 `DashboardData` / `DashboardStats` / `TrendPoint` / `DramaRankItem`（强类型，零 `any`）。
- 页面：`src/app/distribution/pages/OverviewPage.tsx`，含 加载 / 错误 / 重试 态；文案全部走 `messages.distribution.overview.*`。
