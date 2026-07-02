/**
 * 成员管理服务（成员列表 / 添加 / 移除 / 改角色 / 角色权限说明）
 * ------------------------------------------------------------------
 * 路径前缀 `/publisher/member/**`，走发行 publisher token。
 * 统一响应 {code,msg,data}；列表与写操作仅超管可用，无权返回 code=500 msg=403335。
 * 角色权限说明 GET /roles 任意登录成员可读，驱动页面「角色权限说明」与添加弹窗下拉。
 */
import { http } from "./http";

/** 成员角色：1 超管 / 2 管理员 / 3 员工。 */
export type MemberRole = 1 | 2 | 3;

/** 可添加的角色（add / updateRole 仅 2|3）。 */
export type AddableMemberRole = 2 | 3;

/** 成员账号状态：1 使用中 / 0 停用。 */
export type MemberStatus = 0 | 1;

/** 成员列表行（GET /publisher/member/list）。 */
export interface PublisherMember {
  memberUserId: number;
  nickname: string;
  /** 空串/null 均表示未设置头像（后端回复 C-2），前端展示占位图 */
  avatar: string | null;
  phoneMask: string;
  role: MemberRole;
  roleName: string;
  status: MemberStatus;
  statusName: string;
  /** 当前登录成员本人 */
  self: boolean;
  /** false 时不可移除（超管或本人） */
  removable: boolean;
  joinTime: string;
}

/** 角色权限项（roles 接口 permissions 数组元素）。 */
export interface MemberRolePermission {
  key: string;
  name: string;
  allowed: boolean;
}

/** 角色权限说明卡片（GET /publisher/member/roles）。 */
export interface MemberRoleCard {
  code: MemberRole;
  name: string;
  description: string;
  /** true 时出现在「添加账号」成员类型下拉 */
  addable: boolean;
  permissions: MemberRolePermission[];
}

/** 添加成员请求体。 */
export interface AddMemberBody {
  phone: string;
  role: AddableMemberRole;
}

/** 移除成员请求体。 */
export interface RemoveMemberBody {
  memberUserId: number;
}

/** 修改成员角色请求体（本期无 UI 入口，仅封装）。 */
export interface UpdateMemberRoleBody {
  memberUserId: number;
  role: AddableMemberRole;
}

/** 查询成员列表（超管置顶，服务端已排序）。 */
export function getMemberList(): Promise<PublisherMember[]> {
  return http.get<PublisherMember[]>("/publisher/member/list");
}

/** 添加成员。错误码 403328–403331 由 http 层 toast 后端 msg。 */
export function addMember(body: AddMemberBody): Promise<void> {
  return http.post<void>("/publisher/member/add", body);
}

/** 移除成员。成功后该成员被踢下线。 */
export function removeMember(body: RemoveMemberBody): Promise<void> {
  return http.post<void>("/publisher/member/remove", body);
}

/** 修改成员角色（仅 2|3，不可改超管）。 */
export function updateMemberRole(body: UpdateMemberRoleBody): Promise<void> {
  return http.post<void>("/publisher/member/updateRole", body);
}

/** 角色权限说明（3 张角色卡，驱动说明区与添加下拉）。 */
export function getMemberRoles(): Promise<MemberRoleCard[]> {
  return http.get<MemberRoleCard[]>("/publisher/member/roles");
}
