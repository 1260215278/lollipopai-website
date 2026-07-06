# 发行中心 · 账号信息页 UI 小改 前端对接（2026-07-02）

- 域：出品方控制台 `/publisher/**`，请求头 `token` 带**发行 token**，接口均**仅超管**（无权限 `code=500, msg=403335`）
- 响应通用格式：`{code, msg, data}`，`code=0` 成功
- 本文只列**本次新增/变化**的部分；完整契约见 `docs/api/发行中心-成员与账号-前端对接.md`
- 后端已部署要求：先跑 DDL（已执行✅）再发版

---

## 1. Tab「账号信息」· 公司信息区块（新增）

### 1.1 GET `/publisher/account/info` — 响应新增 `company` 块

```json
{
  "code": 0,
  "data": {
    "profile":  { "accountCode": "CRT-20260001", "nickname": "…", "avatar": "…", "certified": 1,
                  "registerTime": "2026-01-15 10:00:00", "lastLoginTime": "2026-06-10 09:42:00" },
    "contact":  { "phoneMask": "+86 138****8888", "phoneBound": true,
                  "emailMask": "c***@example.com", "emailBound": true },
    "security": { "passwordSet": true, "twoFactorEnabled": true, "securityLevel": 2 },
    "notify":   { "notifyEmail": 1, "notifySms": 1 },
    "company":  {                                   // 🆕 本次新增
      "companyName":    "北京星河文化传媒有限公司",   // 未填时为 null
      "creditCode":     "91110105MA01ABC123",       // 统一社会信用代码，可 null
      "companyAddress": "北京市朝阳区建国路88号",     // 注册地址，可 null
      "companyPhone":   "+86 010-8888-8888"         // 联系电话，可 null
    }
  }
}
```

> 「安全级别-查看建议」不出新接口：前端按 `passwordSet / twoFactorEnabled / contact.emailBound` 三项里缺哪项拼建议文案即可（securityLevel = 三项满足个数：1低 2中 3高）。

### 1.2 POST `/publisher/account/updateCompany` — 修改公司信息（新增）

请求体（**覆盖式**：三个选填项不传或传空 = 清空该项）：

```json
{
  "companyName":    "北京星河文化传媒有限公司",   // 必填
  "creditCode":     "91110105MA01ABC123",       // 选填
  "companyAddress": "北京市朝阳区建国路88号",     // 选填
  "companyPhone":   "+86 010-8888-8888"         // 选填
}
```

- 成功：`{"code":0}`
- 公司名为空：`{"code":500,"msg":"公司名称不能为空"}`（i18n 码 `403367`）

## 2. Tab「设备管理」

### 2.1 GET `/publisher/account/loginRecords` — 近期登录记录（新增）

当前成员最近 **20** 条，登录时间倒序，**含失败尝试**：

```json
{
  "code": 0,
  "data": [
    { "device": "Chrome · Windows", "location": "CN", "loginTime": "2026-06-30 09:42:00", "success": true },
    { "device": "未知设备",          "location": null, "loginTime": "2026-06-01 03:12:00", "success": false }
  ]
}
```

- `success=false` 渲染红点+「失败」徽标，`true` 绿点+「成功」
- 失败口径：只记录**能定位到用户**的失败（用户被禁用/无发行成员身份/账户停用）。token 验签失败的尝试无从归属用户，不会出现在列表里
- `device` 为 UA 解析结果（`浏览器 · 系统`），解析不出时为「未知设备」

### 2.2 `location` 字段口径（`/sessions` 与 `/loginRecords` 一致）

- 值为**国家 ISO 码**（如 `"CN"`），由前端按当前语言映射显示（CN → 中国 / China）
- 解析不到（内网 IP、Geo 库未装、存量老会话）为 `null` → 显示「未知位置」
- UI 稿里的城市级（"北京，中国"）后端暂只支持到国家级，城市部分前端不用等

### 2.3 POST `/publisher/account/sessions/logoutAll` — 语义变化 ⚠️

- **旧**：踢掉当前成员所有会话（含自己，操作完就被登出）
- **新**：「退出所有**其他**设备」——保留当前会话，其余全部下线；**前端操作后无需跳登录页**，刷新设备列表即可
- 请求体不变（`{}`），被踢设备后续请求返回 `code=401, msg=403343` → 跳登录

## 3. 无变化但 UI 会用到的（速查）

| UI 元素 | 接口 | 备注 |
|---|---|---|
| 修改昵称 / 更换头像 | POST `/updateNickname` `{nickname}` / `/updateAvatar` `{avatar}` | 头像 URL 来自 `POST /alioss/upload` |
| 绑定邮箱-修改 | GET `/sendEmailCode?email=` → POST `/bindEmail` `{email,code}` | 码错 `403337` / 占用 `403338` |
| 消息通知两个开关 | POST `/notify` `{notifyEmail,notifySms}`（1/0） | |
| 修改密码 | POST `/changePassword` `{oldPassword?,smsCode?,newPassword}` | 与 App 登录同一密码 |
| 两步验证-管理 | POST `/twoFactor/enable|disable` `{smsCode}` | 先 GET `/sendSmsCode` 发码 |
| 已登录设备-终止 | POST `/sessions/kick` `{sessionId}` | |
| 注销账号 | POST `/cancel` `{confirm:true, smsCode}` | 守卫 `403341/403342` |
