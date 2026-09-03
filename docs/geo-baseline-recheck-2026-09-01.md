# GEO 基线复核与可复现管线（2026-09-01）

## 一、这次做了什么

原来那批 GEO 数据（`data/outputs/lollipop_drama_20260901/`）是由一个外部 "GEO Agent" 产出的，
**项目里没有采集脚本，也没有平台 API**，无法一键重跑。

所以这轮做了两件事：

1. **反推并校准了统计口径** —— 从原始 JSON 反算出与旧 CSV 完全一致的数字
2. **固化为可复现工具** `scripts/geo-collect.py` + 品牌配置 `data/geo-brands.json`

现在 `python scripts/geo-collect.py --analyze --raw <file> --out <dir>` 就能复算出全部指标，
`--collect` 配上 API key 就能重跑采集。

## 二、口径校准结果：4 个 CSV 字节级精确复现

| 文件 | 结果 |
|---|---|
| `summary.csv` | ✅ 79 字节完全一致 |
| `citation_domains.csv` | ✅ 1951 字节完全一致 |
| `queries_full.csv` | ✅ 2777 字节完全一致（含 BOM） |
| `mention_stats.csv` | ✅ 101 字节完全一致（`--strict` 模式） |

反推出来的口径（写进了 `data/geo-brands.json` 的 `_calibration`）：

- 引用域名：取 **`citations[].url`**（不是 `domain` 字段）的 hostname，去掉 `www.`，**不去重**计数
- 品牌引用：`citations[].url` 里出现 `citePatterns` 任一子串即计 1，**不去重**
- 品牌提及：该条 `answerText` 出现任一 alias 即计 1，除以总条数（记录级）

> 中途踩的坑：一开始按「每条记录去重」算，`sciencedirect.com` 算成 1（基线 4）、`openai.com` 算成 3（基线 4）。
> 原因是记录 29 里 sciencedirect 被引了 4 次不同 URL —— **必须不去重**。

## 三、修正后的基线：Lollipop 不是 0%，是 3.33%

| 品牌 | 被引次数 | 提及（严格口径） | 提及（含旧名） |
|---|---|---|---|
| **LollipopDrama** | 1 | **0（0.00%）** | **1（3.33%）** |
| Fanvue | 5 | 2（6.67%） | 2（6.67%） |
| StoReel | 1 | 2（6.67%） | 2（6.67%） |
| Runway | 18 | 20（66.67%） | 20（66.67%） |

**旧报告里的「提及率 0%」是测量假象，不是真实状态。**

证据 —— 记录 17（第 17 条 query）的实际情况：

- 正文里明确写了 **`Lollipop AI +1`**（作为推荐来源）
- 引用了 `https://www.lollipop.im/blog/ai-tools-comparison/?lang=pt`
- 引用标题：`AI Short Drama Tools Compared 2026 | Lollipop AI`

也就是说 **ChatGPT 确实提到了我们、也引用了我们的页面**，只是用的还是**旧品牌名 "Lollipop AI"**。
旧工具的 alias 只匹配 "LollipopDrama"，于是记成 0。

### 为什么引擎还在用旧名

已核过：`dist/` 和 `src/` 里 **"Lollipop AI" 残留为 0**，
`ai-tools-comparison` 当前 title 是 `AI Short Drama Tools Compared 2026 | Lollipop Drama`。

所以旧名来自**搜索引擎 / ChatGPT 的索引缓存**，改名还没传播过去（正常，通常要数周）。
含义很直接：**在索引刷新之前，AI 引擎会继续用 "Lollipop AI" 称呼我们**。
因此 alias 集合必须含旧名，否则会持续低估自己的曝光。

## 四、两个口径 caveat（沿用旧口径以保持可比）

1. **Runway 被低估**：基线 `citePatterns` 只写了 `runwayml.com`，漏了
   `runway.com`（15 次）与 `docs.dev.runwayml.com`（2 次）。真实 Runway 引用数应为 **35** 而非 18。
   为保持与基线可比，配置里沿用了原口径；想看真实值就把 patterns 改成
   `["runwayml.com", "runway.com"]`。
2. **Runway 的结构性优势**（这条才是重点）：30 次引用里
   `help.runwayml.com` 11 + `academy.runwayml.com` 4 + `docs.dev.runwayml.com` 2 = **17 次（57%）来自结构化知识子域**，
   而不是营销页。这正是建 `/guides/` 知识区的直接依据。

## 五、新增产出

- `scripts/geo-collect.py` —— 分析 + 采集（支持 `--dry-run` 不花钱预览）
- `data/geo-brands.json` —— 品牌配置（含口径校准说明与 caveat）
- `per_query_detail.json` —— **逐条 query 明细**（哪条提到了我、哪条引用了竞品、各自引了哪些域名），
  这是原来没有的，用来定位具体缺口

## 六、怎么重跑采集

```bash
export OPENAI_API_KEY=sk-...
python scripts/geo-collect.py --collect \
    --prompts data/prompts/prompts_Lollipop_Drama_20260901_171518.json \
    --out data/raw

# 先看会发什么、不花钱
python scripts/geo-collect.py --collect --prompts <file> --out data/raw --dry-run
```

采集走 **OpenAI Responses API + `web_search_preview`**（与原始 ChatGPT 联网回答同源），
每条 query 后自动拼上 ` Please provide relevant web links or sources for your answer.`
—— 与原始采集一致，否则结果不可比。

⚠️ **重跑前必须想清楚**：ChatGPT 的联网回答有随机性，同一条 query 两次结果可能不同。
单轮 30 条的置信区间很宽（提及 1/30 与 3/30 在统计上难区分）。
**建议至少连跑 3 轮取平均**，或者把重点放在「引用域名结构」这类更稳定的指标上，
而不是逐条比对提及数。

## 七、下一步

1. 拿到 `OPENAI_API_KEY` 后重跑，与本次基线对比
2. 把 `data/geo-brands.json` 的 Runway patterns 补全，得到真实竞品量级
3. 结合 `per_query_detail.json` 定位「提到了竞品但没提到我们」的具体 query，
   反向补内容（这正是 `/guides/` 扩产时用的选题方法）
