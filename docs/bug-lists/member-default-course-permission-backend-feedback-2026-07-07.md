# 成员员工默认剧目权限后端反馈（2026-07-07）

## 背景

本次前端已按产品要求移除成员列表里的「分配」按钮及对应弹窗逻辑，不再调用：

- `GET /publisher/member/course/list`
- `POST /publisher/member/course/assign`
- `POST /publisher/member/course/unassign`

前端按 `GET /publisher/member/me` 返回的 `permissions` 放行发行中心「上剧中心」入口和员工创建/送审新剧入口；管理员级上下架等操作仍只按 `COURSE_MANAGE` 放行。

## 需要后端同步

1. 员工角色默认授予 `COURSE_VIEW_ASSIGNED`。
2. `GET /publisher/member/me` 中员工账号的 `permissions` 建议稳定返回 `COURSE_VIEW_ASSIGNED`，避免前后端权限口径不一致。
3. `GET /publisher/member/roles` 中员工角色的 `permissions` 建议将 `COURSE_VIEW_ASSIGNED.allowed` 返回为 `true`。
4. 请确认员工可见剧目范围：
   - 若员工默认可看账户下全部剧目，请在 `/publisher/course/list`、`/publisher/course/detail`、`/publisher/dashboard/**` 等读接口按此口径返回。
   - 若员工只可看本人创建或其他规则下的剧目，请返回明确规则并保持所有读接口一致。
5. 如果后端不再支持手动分配，请确认上述 member course assign/list/unassign 接口是否废弃；若仍保留内部能力，也不要再要求前端调用它们完成员工基础可见权限。

## 验收建议

- 使用被邀请员工账号进入 `/distribution/content`，无需管理员手动分配即可看到符合后端规则的剧目列表。
- 员工可以进入上剧流程并创建新剧。
- 员工不能执行只属于 `COURSE_MANAGE` 的操作，例如上下架、管理员级剧目管理动作。
- 成员管理页员工角色权限说明中 `COURSE_VIEW_ASSIGNED` 为允许状态。
