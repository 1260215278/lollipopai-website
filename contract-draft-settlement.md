# 结算中心 · 接口契约草案（P3）

> 状态：**草案，待后端确认**。本期前端以 mock 交付（`services/settlement.ts` 内 `VITE_USE_MOCK !== "false"` 时走 mock），字段语义来自原型三页（`dashboard/PaymentPage.tsx` / `EarningsPage.tsx` / `WithdrawPage.tsx`）与 figma（`15150-*` / `15151-*` / `15135-27153` / `15188-33359`）。
>
> 全局约定（同《发行者入驻-前端接口.md》）：
> - context-path：`/sqx_fast`
> - 鉴权：请求头 `token`（取自 `auth.getToken()`）
> - 统一响应：`{ code, msg, data }`，`code === 0` 成功取 `data`；非 0 由前端 toast `msg`（后端已按语言翻译）
> - 金额：以「元」为单位的 number（前端展示为 `¥ 1,234.50`）
>
> 路径为草案命名，可由后端按规范调整；前端只需对应修改 `services/settlement.ts` 的 http 分支，页面无需改动。

---

## 1. 收款管理（对公收款账户）

### 1.1 获取已绑定收款账户

- **GET** `/app/publisher/payout/account`
- 请求：无（鉴权 token）
- 响应 `data`：`PayoutAccount | null`（未绑定为 `null`）

```jsonc
{
  "companyName": "北京星河文化传媒有限公司", // 公司名称（后端按账号带入）
  "accountNo": "6222021234567890123",        // 银行账号
  "bank": "中国银行",                          // 开户银行
  "branch": "深圳支行"                         // 支行名称（可空）
}
```

### 1.2 获取自动带入的公司名称

- **GET** `/app/publisher/payout/company`
- 用途：新增/修改表单的「公司名称」只读字段（figma 显示「自动带入」徽标）
- 响应 `data`：`string`（公司名称）
- 备注：若公司名称随入驻申请已确定，后端也可直接在 1.1 返回，省去此接口。

### 1.3 新增收款账户

- **POST** `/app/publisher/payout/account`
- 请求 body：`PayoutAccountBody`

```jsonc
{
  "accountNo": "6222021234567890123", // 必填，银行账号
  "bank": "中国银行",                   // 必填，开户银行
  "branch": "深圳支行"                  // 选填，支行名称
}
```

- 响应 `data`：`PayoutAccount`（含带入的 `companyName`）
- 校验：`accountNo` / `bank` 必填（前端已校验，后端二次校验）。

### 1.4 修改收款账户

- **POST** `/app/publisher/payout/account/update`
- 请求 body：同 1.3 `PayoutAccountBody`
- 响应 `data`：`PayoutAccount`
- 备注：figma 仅「修改」无「删除」，故不提供删除接口；如后端需要删除，再行约定。

---

## 2. 收益明细

### 2.1 收益总览

- **GET** `/app/publisher/earnings/summary`
- 请求：无
- 响应 `data`：`EarningsSummary`

```jsonc
{
  "totalCumulative": 7501.50, // 累计总收益
  "withdrawable": 3444.00,    // 可提现
  "processing": 257.00,       // 结算中
  "withdrawn": 3800.50,       // 已提现
  "relatedDramas": 3,         // 关联剧集数
  "estThisMonth": 1684.50,    // 本月预估
  "bills": 7,                 // 结算账单数
  "growthRate": 41.4,         // 本月较上月增长百分比（正数为增长）
  "monthlyTrend": [           // 月度收益趋势（1-12 月）
    { "month": 1, "total": 0 },
    { "month": 2, "total": 320 }
    // ... 至 12 月
  ]
}
```

### 2.2 按月查询收益明细

- **GET** `/app/publisher/earnings/detail`
- 请求 query：`month`（`yyyy-MM`，选填；不传返回全部，前端据全部数据派生可选月份 Tab）
- 响应 `data`：`EarningsDetailRow[]`

```jsonc
[
  {
    "month": "2026-06",     // 归集月份 yyyy-MM
    "drama": "星河恋人",      // 剧集名称
    "type": "full",          // 收益类型：full=全量推荐订阅(4:6) / account=账户主页订阅(2:8)
    "ratio": "60%",          // 出品方分成比例
    "views": "112.3万",      // 播放量（展示串）
    "amount": 1684.50,       // 结算金额
    "status": "processing"   // settled=已结算 / processing=结算中 / pending=待结算
  }
]
```

---

## 3. 结算记录

### 3.1 结算记录列表

- **GET** `/app/publisher/settlement/records`
- 请求：无（前端做状态筛选 + 周期/类型搜索）
- 响应 `data`：`SettlementRecord[]`

```jsonc
[
  {
    "id": "ST20260610001",  // 记录 id（提交结算申请时回传）
    "date": "2026-06-10",   // 结算日期 yyyy-MM-dd
    "period": "2026-05",    // 结算周期 yyyy-MM
    "ratio": "4：6",         // 结算比例「平台：出品方」（注意为全角冒号，与 figma 一致）
    "type": "full",          // full=全量推荐订阅 / account=账户主页订阅
    "accountType": "cn",     // cn=中国公户 / overseas=海外公户
    "accountNo": "****4567", // 账户号码（已脱敏尾号）
    "amount": 2160.00,       // 结算金额
    "status": "unpaid"       // unpaid=未打款 / paid=已打款
  }
]
```

### 3.2 提交结算申请

- **POST** `/app/publisher/settlement/apply`
- 触发：结算记录行内「申请结算」按钮（figma 15188-33359；`unpaid` 行可点，`paid` 行禁用）
- 请求 body：

```jsonc
{ "recordId": "ST20260610001" } // 目标结算记录 id
```

- 响应 `data`：无（`code === 0` 即成功）
- 前端行为：成功后 toast「结算申请已提交」并刷新/乐观更新该行状态。
- 待确认：申请成功后该记录的目标状态（mock 暂按进入打款流程乐观置为 `paid`；实际应由后端状态机决定，建议提供「申请中/审核中」等中间态，前端再补对应 i18n 与徽章色）。

---

## 4. 类型枚举汇总（与前端 `services/settlement.ts` 对齐）

| 字段 | 枚举 | 含义 |
|---|---|---|
| `EarningsType` / `type` | `full` / `account` | 全量推荐订阅 / 账户主页订阅 |
| `EarningsRowStatus` | `settled` / `processing` / `pending` | 已结算 / 结算中 / 待结算 |
| `SettlementAccountType` / `accountType` | `cn` / `overseas` | 中国公户 / 海外公户 |
| `SettlementStatus` / `status` | `unpaid` / `paid` | 未打款 / 已打款 |

## 5. 待确认问题（交后端 / 产品）

1. 公司名称带入：随 1.1 返回，还是单独 1.2 接口？
2. 收款账户是否支持删除？figma 仅「修改」。
3. 结算申请成功后的状态机：是否存在「申请中/审核中」中间态？若有，请给出枚举值与文案，前端补充徽章与 i18n。
4. 账户号码脱敏规则：由后端返回脱敏串（如 `****4567`），还是返回完整号码由前端脱敏？本期按后端返回脱敏串处理。
5. 金额单位与精度：当前按「元 + 两位小数」；若涉及多币种，需补充币种字段。
