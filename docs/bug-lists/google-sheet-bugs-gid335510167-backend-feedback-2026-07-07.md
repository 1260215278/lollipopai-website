# Google Sheet `gid=335510167` 后端反馈（2026-07-07）

来源：https://docs.google.com/spreadsheets/d/1-tUJThXcPcqCv6P30MYPVeqgc0amBznxLRWqHJz9ePY/edit?gid=335510167#gid=335510167

## 需要后端确认 / 支持

| 表格行号 | 模块 | 前端检查结果 | 需要后端处理 |
| ---: | --- | --- | --- |
| 2 | 入驻验证码模板 | 入驻页前端发码成功 toast 是通用“验证码已发送”，没有展示“登录验证码”；`sendPublisherCode` 只传 `phone/email/language`，不控制邮件/短信正文。 | 请调整 `/app/publisher/sendCode` 的短信/邮件模板：入驻场景不要写“登录验证码”，建议统一为“验证码”或明确“入驻验证码”。 |
| 3 | Swift 开通失败原因 | 入驻审核通过页 Swift 开通异常时，前端已直接展示 `/publisher/tenant/status` 返回的 `tenantSyncMsg`，不再改写或补前端说明文案。 | 请确保 `tenantSyncStatus=2` 时 `tenantSyncMsg` 返回明确、可给用户理解的具体失败原因，不要只返回“认证失败”这类笼统结论；如需用户操作，请在文案中说明下一步。 |
| 5 | 入驻手机号区号 | 前端已改为登录手机号本地保存带区号，入驻页可拆分 `+1 2127128166` 为区号 `+1` 与本地号，并在发码/提交时重新拼完整号码。 | 请确保登录/注册/入驻提交返回的 `user.phone`、`/app/publisher/status` 的 `apply.phone` 均为带区号完整手机号。历史数据如果只存本地号，前端无法反推出真实区号。 |
| 6 | 短剧 H5 价格展示 | 当前仓库是官网前端，不包含短剧 H5；复现问题为短剧 H5 搜索 `shix` 时未展示单独设置的价格 `77.7` 和 `7.7`。 | 请排查短剧 H5 使用的搜索、剧集详情或价格接口，确认是否返回单独设置的价格覆盖字段，以及 H5 当前账号/地区/币种下的价格计算逻辑是否覆盖为默认价格。 |
| 7 | 结算申请置灰 | 前端按钮完全按 `/publisher/settlement/summary.canApply` 置灰，按 `blockReason` 展示原因；已补充 `NO_SETTLEABLE_EARNINGS` 文案说明“仅可提交截至上月末的完整自然月收益”。 | 请核查账号 `+8613745642400` 的 `summary` 返回：`canApply`、`blockReason`、`pendingMonths`、`pendingTotalCny`、`hasPayoutAccount`、`payoutAccount`。若有余额和默认收款账号但仍不可提交，请返回明确 `blockReason`；不要出现 `canApply=false` 且 `blockReason=null`。 |
| 8 | 批量导入外链视频 | 前端已兼容 Excel 超链接目标，并按契约循环调用 `/publisher/course/saveEpisode` 提交外链 `videoUrl`。 | 如果保存后仍不可播放，请排查后端对外链 URL 的探测、转码、大小/时长回写、CORS/OSS 访问和 `uploadStatus` 失败原因返回。 |
| 12 | 两步验证登录 | 后端已提供契约：`POST /publisher/login/byAppToken` 在已开 2FA 时返回顶层 `stage=2FA_REQUIRED` 与 `data.challengeToken/phoneMask/expireSeconds`，前端已接入二次验证码界面。 | 请按 `发行中心-后端反馈20260707-前端对接.md` 部署 `verify2fa` 接口与 403396-403398 i18n/DDL；部署后需用真实 2FA 账号复测 byAppToken challenge、验证码重试/过期、403398 成员未绑手机号提示。 |
| 13 | 员工默认剧目权限 | 前端已移除成员列表「分配」按钮、分配弹窗和 `/publisher/member/course/list|assign|unassign` 调用；上剧中心入口改按 `me().permissions` 中的 `COURSE_VIEW_ASSIGNED` 放行。 | 请将员工角色默认授予 `COURSE_VIEW_ASSIGNED`，并让 `/publisher/member/me.permissions`、`/publisher/member/roles.permissions` 与该口径一致；同时确认员工可见剧目范围。详见 `member-default-course-permission-backend-feedback-2026-07-07.md`。 |
| 14 | 成员页多语言 | 前端已对成员角色、状态和常见权限 key 做多语言映射；未知权限 key 仍只能展示后端返回的 `name`。 | 请保持 `/publisher/member/roles.permissions[].key` 稳定，或按 `Accept-Language` 返回 `name/description`，避免英文环境下出现中文权限说明。 |
| 15 | 邮箱账号信息 / 绑定手机号 | 后端已确认 `/publisher/account/info.contact.emailMask/emailBound` 对邮箱注册账号回显正确；绑定手机号契约为 `GET /publisher/account/sendPhoneCode?phone=` 与 `POST /publisher/account/bindPhone` JSON。前端已接入并直接信任后端账号信息。 | 请按 `发行中心-后端反馈20260707-前端对接.md` 部署相关后端代码；部署后需用邮箱注册账号复测邮箱回显、未绑手机号发码、绑定成功后 `phoneMask/phoneBound` 刷新，以及 40021/40023/401179/403336 错误文案。 |
| 16 | 登录通知与记录 | 前端账号信息页只保存通知开关；登录行为发生在登录接口，前端不能补写后管通知记录。 | 登录成功/失败后的短信、邮件通知及发送成功/失败记录，需要后端登录服务或通知服务根据 `notifySms/notifyEmail` 触发并落库，后管据此查询。 |

## 前端已处理

| 表格行号 | 处理 |
| ---: | --- |
| 3 | 入驻通过页 Swift 开通异常时直接展示后端 `tenantSyncMsg`，不再替换为固定提示或增加“开通说明”标签；后端需补齐具体原因。 |
| 4 | 邮箱忘记密码 `forgetPassWord` 已改为 JSON 请求体。 |
| 5 | 登录页保存手机号时写入 `${areaCode}${phone}`；入驻页回填时拆分区号，发码/提交统一拼完整手机号。 |
| 7 | `NO_SETTLEABLE_EARNINGS` 提示补充“完整自然月收益”条件。 |
| 8 | 批量模板导入兼容 Excel 超链接目标。 |
| 9 | 官网发行中心未知子路由重定向已修复。 |
| 10 | 账号信息昵称输入限制为 50 字符，提交前也截断到 50 字符。 |
| 11 | 账号信息公司名称、统一社会信用代码、注册地址、联系电话 4 个字段均限制为 50 字符。 |
| 12 | 两步验证登录已接入 `stage=2FA_REQUIRED`、验证码倒计时/重发与 `/publisher/login/verify2fa`。 |
| 13 | 成员页已移除员工剧目分配按钮和弹窗；上剧中心入口改按 `me().permissions` 中的 `COURSE_VIEW_ASSIGNED` 放行，后端需同步默认权限与可见剧目范围。 |
| 14 | 成员页角色、状态、常见权限 key 增加多语言映射，并补齐 `COURSE_VIEW_ASSIGNED`、`SETTLEMENT_WITHDRAW`、`CONTRACT_VIEW`、`CONTRACT_MANAGE`。 |
| 15 | 账号信息页已接入绑定/换绑登录手机号；邮箱账号信息回显直接信任后端 `contact.emailMask/emailBound`。 |
