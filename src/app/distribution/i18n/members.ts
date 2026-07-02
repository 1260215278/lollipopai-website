import type { Locale } from "../../i18n";

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
      "管理员已拥有账户下全部剧目的查看权和管理权，无需对管理员进行剧目分配、查看操作。",
    colMemberInfo: "成员信息",
    colAccountStatus: "账号状态",
    colMemberType: "成员类型",
    colAction: "操作",
    phoneLine: "手机: {phone}",
    selfTag: "（我）",
    remove: "移除",
    rolesSectionTitle: "角色权限说明",
    addModalTitle: "添加账号",
    memberTypeLabel: "成员类型",
    phoneLabel: "账号手机号",
    phonePlaceholder: "请输入该成员注册 App 时的手机号",
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
      "管理員已擁有帳戶下全部劇目的查看權和管理權，無需對管理員進行劇目分配、查看操作。",
    colMemberInfo: "成員資訊",
    colAccountStatus: "帳號狀態",
    colMemberType: "成員類型",
    colAction: "操作",
    phoneLine: "手機: {phone}",
    selfTag: "（我）",
    remove: "移除",
    rolesSectionTitle: "角色權限說明",
    addModalTitle: "新增帳號",
    memberTypeLabel: "成員類型",
    phoneLabel: "帳號手機號",
    phonePlaceholder: "請輸入該成員註冊 App 時的手機號",
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
      "Admins already have full view and management rights for all dramas under this account. No need to assign or manage dramas for admins separately.",
    colMemberInfo: "Member",
    colAccountStatus: "Status",
    colMemberType: "Role",
    colAction: "Action",
    phoneLine: "Phone: {phone}",
    selfTag: "(Me)",
    remove: "Remove",
    rolesSectionTitle: "Role Permissions",
    addModalTitle: "Add Account",
    memberTypeLabel: "Member Role",
    phoneLabel: "Phone Number",
    phonePlaceholder: "Enter the phone number used to register the App",
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
      "Administradores já possuem direitos completos de visualização e gestão de todos os dramas desta conta. Não é necessário atribuir dramas aos administradores.",
    colMemberInfo: "Membro",
    colAccountStatus: "Status",
    colMemberType: "Função",
    colAction: "Ação",
    phoneLine: "Telefone: {phone}",
    selfTag: "(Eu)",
    remove: "Remover",
    rolesSectionTitle: "Permissões por Função",
    addModalTitle: "Adicionar Conta",
    memberTypeLabel: "Função do Membro",
    phoneLabel: "Número de Telefone",
    phonePlaceholder: "Digite o telefone usado no cadastro do App",
    cancel: "Cancelar",
    confirm: "Confirmar",
    vPhoneInvalid: "Digite um número de telefone",
    addSuccess: "Membro adicionado com sucesso",
    removeModalTitle: "Remover este membro?",
    removeModalDesc:
      "Após a remoção, este membro não pertencerá mais a esta conta e perderá acesso a dramas, receitas e outros dados. Esta ação não pode ser desfeita. Deseja remover este membro?",
    removeConfirm: "Confirmar Remoção",
    removeSuccess: "Membro removido",
  },
};
