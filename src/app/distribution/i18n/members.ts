import type { Locale } from "../../i18n-types";

/**
 * 成员管理文案 —— figma 15149-28384 / 28629 / 29755 等。
 * zh-CN 为权威；zh-TW / en / pt 结构一致。
 */
export interface MembersMessages {
  title: string;
  addAccount: string;
  bannerText: string;
  colMemberInfo: string;
  colAccountStatus: string;
  colMemberType: string;
  colAction: string;
  /** 手机: {phone} */
  phoneLine: string;
  selfTag: string;
  remove: string;
  rolesSectionTitle: string;
  roleOwner: string;
  roleAdmin: string;
  roleStaff: string;
  roleDescriptions: Record<number, string>;
  statusActive: string;
  statusInactive: string;
  permissionLabels: Record<string, string>;
  addModalTitle: string;
  memberTypeLabel: string;
  phoneLabel: string;
  phonePlaceholder: string;
  cancel: string;
  confirm: string;
  vPhoneInvalid: string;
  addSuccess: string;
  removeModalTitle: string;
  removeModalDesc: string;
  removeConfirm: string;
  removeSuccess: string;
}

export const members: Record<Locale, MembersMessages> = {
  "zh-CN": {
    title: "成员管理",
    addAccount: "添加账号",
    bannerText:
      "管理员已拥有账户下全部剧目的查看权和管理权；员工默认具备可见剧目权限，无需在成员页手动分配。",
    colMemberInfo: "成员信息",
    colAccountStatus: "账号状态",
    colMemberType: "成员类型",
    colAction: "操作",
    phoneLine: "手机: {phone}",
    selfTag: "（我）",
    remove: "移除",
    rolesSectionTitle: "角色权限说明",
    roleOwner: "超管",
    roleAdmin: "管理员",
    roleStaff: "员工",
    roleDescriptions: {
      1: "拥有账户下所有功能权限，可管理成员、账号安全、剧目和结算。",
      2: "可查看并管理账户下全部剧目，不能管理账号安全和成员。",
      3: "可创建并送审新剧，默认查看账户下全部剧目和基础数据，不能上/下架。",
    },
    statusActive: "使用中",
    statusInactive: "已停用",
    permissionLabels: {
      dashboard: "数据概览",
      DASHBOARD_VIEW: "数据概览",
      course: "剧目管理",
      course_manage: "剧目管理",
      COURSE_MANAGE: "剧目管理",
      course_view_assigned: "可见剧目",
      COURSE_VIEW_ASSIGNED: "可见剧目",
      settlement_view: "结算数据",
      SETTLEMENT_VIEW: "结算数据",
      settlement_withdraw: "提现",
      SETTLEMENT_WITHDRAW: "提现",
      contract_view: "合同查看",
      CONTRACT_VIEW: "合同查看",
      contract_manage: "合同管理",
      CONTRACT_MANAGE: "合同管理",
      account_setting: "账号设置",
      ACCOUNT_SETTING: "账号设置",
      member_manage: "成员管理",
      MEMBER_MANAGE: "成员管理",
    },
    addModalTitle: "添加账号",
    memberTypeLabel: "成员类型",
    phoneLabel: "账号手机号",
    phonePlaceholder: "请输入手机号",
    cancel: "取消",
    confirm: "确定",
    vPhoneInvalid: "请输入手机号",
    addSuccess: "成员添加成功",
    removeModalTitle: "是否移除当前成员？",
    removeModalDesc:
      "移除后，当前成员账号将不再属于此账户，将无权限管理并查看账户内剧目、收益等，移除后无法恢复，请是否移除当前成员？",
    removeConfirm: "确认移除",
    removeSuccess: "成员已移除",
  },
  "zh-TW": {
    title: "成員管理",
    addAccount: "新增帳號",
    bannerText:
      "管理員已擁有帳戶下全部劇目的查看權和管理權；員工預設具備可見劇目權限，無需在成員頁手動分配。",
    colMemberInfo: "成員資訊",
    colAccountStatus: "帳號狀態",
    colMemberType: "成員類型",
    colAction: "操作",
    phoneLine: "手機: {phone}",
    selfTag: "（我）",
    remove: "移除",
    rolesSectionTitle: "角色權限說明",
    roleOwner: "超管",
    roleAdmin: "管理員",
    roleStaff: "員工",
    roleDescriptions: {
      1: "擁有帳戶下所有功能權限，可管理成員、帳號安全、劇目和結算。",
      2: "可查看並管理帳戶下全部劇目，不能管理帳號安全和成員。",
      3: "可建立並送審新劇，預設查看帳戶下全部劇目和基礎資料，不能上/下架。",
    },
    statusActive: "使用中",
    statusInactive: "已停用",
    permissionLabels: {
      dashboard: "數據概覽",
      DASHBOARD_VIEW: "數據概覽",
      course: "劇目管理",
      course_manage: "劇目管理",
      COURSE_MANAGE: "劇目管理",
      course_view_assigned: "可見劇目",
      COURSE_VIEW_ASSIGNED: "可見劇目",
      settlement_view: "結算資料",
      SETTLEMENT_VIEW: "結算資料",
      settlement_withdraw: "提現",
      SETTLEMENT_WITHDRAW: "提現",
      contract_view: "合約查看",
      CONTRACT_VIEW: "合約查看",
      contract_manage: "合約管理",
      CONTRACT_MANAGE: "合約管理",
      account_setting: "帳號設定",
      ACCOUNT_SETTING: "帳號設定",
      member_manage: "成員管理",
      MEMBER_MANAGE: "成員管理",
    },
    addModalTitle: "新增帳號",
    memberTypeLabel: "成員類型",
    phoneLabel: "帳號手機號",
    phonePlaceholder: "請輸入手機號",
    cancel: "取消",
    confirm: "確定",
    vPhoneInvalid: "請輸入手機號",
    addSuccess: "成員新增成功",
    removeModalTitle: "是否移除當前成員？",
    removeModalDesc:
      "移除後，當前成員帳號將不再屬於此帳戶，將無權限管理並查看帳戶內劇目、收益等，移除後無法恢復，請是否移除當前成員？",
    removeConfirm: "確認移除",
    removeSuccess: "成員已移除",
  },
  en: {
    title: "Member Management",
    addAccount: "Add Account",
    bannerText:
      "Admins already have full view and management rights for all dramas under this account. Staff have drama visibility by default, so no manual assignment is needed here.",
    colMemberInfo: "Member",
    colAccountStatus: "Status",
    colMemberType: "Role",
    colAction: "Action",
    phoneLine: "Phone: {phone}",
    selfTag: "(Me)",
    remove: "Remove",
    rolesSectionTitle: "Role Permissions",
    roleOwner: "Owner",
    roleAdmin: "Admin",
    roleStaff: "Staff",
    roleDescriptions: {
      1: "Full access to members, account security, dramas, and settlements.",
      2: "Can view and manage all dramas, but cannot manage account security or members.",
      3: "Can create and submit new dramas for review, and view all dramas and basic data by default. Cannot shelf or unshelf dramas.",
    },
    statusActive: "Active",
    statusInactive: "Disabled",
    permissionLabels: {
      dashboard: "Dashboard",
      DASHBOARD_VIEW: "Dashboard",
      course: "Drama Management",
      course_manage: "Drama Management",
      COURSE_MANAGE: "Drama Management",
      course_view_assigned: "Assigned Dramas",
      COURSE_VIEW_ASSIGNED: "Assigned Dramas",
      settlement_view: "Settlement Data",
      SETTLEMENT_VIEW: "Settlement Data",
      settlement_withdraw: "Withdrawals",
      SETTLEMENT_WITHDRAW: "Withdrawals",
      contract_view: "Contract View",
      CONTRACT_VIEW: "Contract View",
      contract_manage: "Contract Management",
      CONTRACT_MANAGE: "Contract Management",
      account_setting: "Account Settings",
      ACCOUNT_SETTING: "Account Settings",
      member_manage: "Member Management",
      MEMBER_MANAGE: "Member Management",
    },
    addModalTitle: "Add Account",
    memberTypeLabel: "Member Role",
    phoneLabel: "Phone Number",
    phonePlaceholder: "Enter phone number",
    cancel: "Cancel",
    confirm: "Confirm",
    vPhoneInvalid: "Please enter a phone number",
    addSuccess: "Member added successfully",
    removeModalTitle: "Remove this member?",
    removeModalDesc:
      "After removal, this member will no longer belong to this account and will lose access to dramas, earnings, and other data. This action cannot be undone. Do you want to remove this member?",
    removeConfirm: "Confirm Remove",
    removeSuccess: "Member removed",
  },
  pt: {
    title: "Gestão de Membros",
    addAccount: "Adicionar Conta",
    bannerText:
      "Administradores já possuem direitos completos de visualização e gestão de todos os dramas desta conta. Membros da equipe têm visibilidade de dramas por padrão, sem atribuição manual nesta página.",
    colMemberInfo: "Membro",
    colAccountStatus: "Status",
    colMemberType: "Função",
    colAction: "Ação",
    phoneLine: "Telefone: {phone}",
    selfTag: "(Eu)",
    remove: "Remover",
    rolesSectionTitle: "Permissões por Função",
    roleOwner: "Proprietário",
    roleAdmin: "Administrador",
    roleStaff: "Equipe",
    roleDescriptions: {
      1: "Acesso total a membros, segurança da conta, dramas e liquidações.",
      2: "Pode ver e gerenciar todos os dramas, mas não gerencia segurança da conta nem membros.",
      3: "Pode criar e enviar novos dramas para revisão, e ver todos os dramas e dados básicos por padrão. Não pode publicar ou retirar dramas da prateleira.",
    },
    statusActive: "Ativo",
    statusInactive: "Desativado",
    permissionLabels: {
      dashboard: "Painel",
      DASHBOARD_VIEW: "Painel",
      course: "Gestão de Dramas",
      course_manage: "Gestão de Dramas",
      COURSE_MANAGE: "Gestão de Dramas",
      course_view_assigned: "Dramas Atribuídos",
      COURSE_VIEW_ASSIGNED: "Dramas Atribuídos",
      settlement_view: "Dados de Liquidação",
      SETTLEMENT_VIEW: "Dados de Liquidação",
      settlement_withdraw: "Saques",
      SETTLEMENT_WITHDRAW: "Saques",
      contract_view: "Visualização de Contratos",
      CONTRACT_VIEW: "Visualização de Contratos",
      contract_manage: "Gestão de Contratos",
      CONTRACT_MANAGE: "Gestão de Contratos",
      account_setting: "Configurações da Conta",
      ACCOUNT_SETTING: "Configurações da Conta",
      member_manage: "Gestão de Membros",
      MEMBER_MANAGE: "Gestão de Membros",
    },
    addModalTitle: "Adicionar Conta",
    memberTypeLabel: "Função do Membro",
    phoneLabel: "Número de Telefone",
    phonePlaceholder: "Digite o telefone",
    cancel: "Cancelar",
    confirm: "Confirmar",
    vPhoneInvalid: "Digite um telefone",
    addSuccess: "Membro adicionado com sucesso",
    removeModalTitle: "Remover este membro?",
    removeModalDesc:
      "Após a remoção, este membro não pertencerá mais a esta conta e perderá acesso a dramas, receitas e outros dados. Esta ação não pode ser desfeita. Deseja remover este membro?",
    removeConfirm: "Confirmar Remoção",
    removeSuccess: "Membro removido",
  },
};
