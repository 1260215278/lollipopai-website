import type { Locale } from "../../i18n";

/** 发行中心通用文案（动作、状态、错误兜底等） */
export interface CommonMessages {
  networkError: string;
  serverError: string;
  loading: string;
  submit: string;
  submitting: string;
  cancel: string;
  confirm: string;
  save: string;
  edit: string;
  delete: string;
  add: string;
  back: string;
  retry: string;
  empty: string;
  optional: string;
  brand: string;
  workspace: string;
  logout: string;
  language: string;
  publisher: string;
  menu: string;
  close: string;
}

export const common: Record<Locale, CommonMessages> = {
  "zh-CN": {
    networkError: "网络异常，请稍后重试",
    serverError: "服务器繁忙，请稍后重试",
    loading: "加载中...",
    submit: "提交",
    submitting: "提交中...",
    cancel: "取消",
    confirm: "确认",
    save: "保存",
    edit: "编辑",
    delete: "删除",
    add: "添加",
    back: "返回",
    retry: "重试",
    empty: "暂无数据",
    optional: "选填",
    brand: "Lollipop发行中心",
    workspace: "工作台",
    logout: "退出登录",
    language: "语言",
    publisher: "发行者",
    menu: "菜单",
    close: "关闭",
  },
  "zh-TW": {
    networkError: "網路異常，請稍後重試",
    serverError: "伺服器繁忙，請稍後重試",
    loading: "載入中...",
    submit: "提交",
    submitting: "提交中...",
    cancel: "取消",
    confirm: "確認",
    save: "儲存",
    edit: "編輯",
    delete: "刪除",
    add: "新增",
    back: "返回",
    retry: "重試",
    empty: "暫無資料",
    optional: "選填",
    brand: "Lollipop 發行中心",
    workspace: "工作台",
    logout: "登出",
    language: "語言",
    publisher: "發行者",
    menu: "選單",
    close: "關閉",
  },
  en: {
    networkError: "Network error, please try again later",
    serverError: "Server is busy, please try again later",
    loading: "Loading...",
    submit: "Submit",
    submitting: "Submitting...",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    back: "Back",
    retry: "Retry",
    empty: "No data",
    optional: "Optional",
    brand: "Lollipop Distribution",
    workspace: "Workspace",
    logout: "Log Out",
    language: "Language",
    publisher: "Publisher",
    menu: "Menu",
    close: "Close",
  },
  pt: {
    networkError: "Erro de rede, tente novamente mais tarde",
    serverError: "Servidor ocupado, tente novamente mais tarde",
    loading: "Carregando...",
    submit: "Enviar",
    submitting: "Enviando...",
    cancel: "Cancelar",
    confirm: "Confirmar",
    save: "Salvar",
    edit: "Editar",
    delete: "Excluir",
    add: "Adicionar",
    back: "Voltar",
    retry: "Tentar novamente",
    empty: "Sem dados",
    optional: "Opcional",
    brand: "Lollipop Distribuição",
    workspace: "Espaço de trabalho",
    logout: "Sair",
    language: "Idioma",
    publisher: "Distribuidor",
    menu: "Menu",
    close: "Fechar",
  },
};
