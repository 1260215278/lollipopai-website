# Google Sheet `gid=1237969387` 后端反馈（2026-07-09）

来源：https://docs.google.com/spreadsheets/d/1-tUJThXcPcqCv6P30MYPVeqgc0amBznxLRWqHJz9ePY/edit?gid=1237969387#gid=1237969387

## 需要后端确认 / 支持

| 表格行号 | 模块 | 前端检查结果 | 需要后端处理 |
| ---: | --- | --- | --- |
| 8 | 收益明细结算状态 | 官网发行中心收益明细页面按 `/publisher/settlement/earnings` 行数据的 `settleStatus` 渲染状态：`0=待结算`、`1=结算中`、`2=已结算`。前端无法从金额、剧名或月份可靠推断后管审核状态，也不能用本地规则覆盖接口状态。 | 请核查后管结算审核完成后，覆盖该收益日期和剧集的收益明细行是否返回 `settleStatus=2`。`settleStatus` 应以后管结算单审核/打款后的权威状态为准；如果该字段当前未关联结算单状态，请在 `/publisher/settlement/earnings` 聚合时按结算单状态回写或计算。 |
