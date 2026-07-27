import type { Locale } from "../../i18n";

/** 发行中心通用文案（动作、状态、错误兜底等） */
export interface CommonMessages {
  networkError: string;
  serverError: string;
  uploadRequestTooLarge: string;
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
  logout: string;
  language: string;
  publisher: string;
  menu: string;
  close: string;
  uploadTasks: string;
  uploadTaskCount: string;
  newUploadTask: string;
  continueUpload: string;
  pauseUpload: string;
  uploading: string;
  uploadPaused: string;
  uploadReady: string;
  uploadFailed: string;
  uploadDraft: string;
  uploadTaskProgress: string;
  noUploadTasks: string;
  /** 上传任务列表项「删除」按钮 aria/title */
  deleteUploadTask: string;
  /** 删除上传任务二次确认标题 */
  deleteUploadTaskTitle: string;
  /** 删除上传任务二次确认说明（含服务端草稿会一并删除） */
  deleteUploadTaskDesc: string;
  /** 删除上传任务确认按钮 */
  deleteUploadTaskOk: string;
  /** 删除成功 toast */
  deleteUploadTaskSuccess: string;
}

export const common: Record<Locale, CommonMessages> = {
  "zh-CN": {
    networkError: "网络异常，请稍后重试",
    serverError: "服务器繁忙，请稍后重试",
    uploadRequestTooLarge: "文件超过当前上传通道限制，请联系平台管理员",
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
    logout: "退出登录",
    language: "语言",
    publisher: "发行者",
    menu: "菜单",
    close: "关闭",
    uploadTasks: "上传任务",
    uploadTaskCount: "{n} 个上传任务",
    newUploadTask: "新建上传",
    continueUpload: "继续上传",
    pauseUpload: "挂起任务",
    uploading: "上传中",
    uploadPaused: "已挂起",
    uploadReady: "待发布",
    uploadFailed: "上传失败",
    uploadDraft: "草稿",
    uploadTaskProgress: "{done}/{total} 集 · {percent}%",
    noUploadTasks: "暂无上传任务",
    deleteUploadTask: "删除任务",
    deleteUploadTaskTitle: "删除上传任务？",
    deleteUploadTaskDesc:
      "删除后本地进度将清除；若已创建服务端草稿，草稿也会一并删除且不可恢复。上传中的任务会立即中断。",
    deleteUploadTaskOk: "确认删除",
    deleteUploadTaskSuccess: "上传任务已删除",
  },
  "zh-TW": {
    networkError: "網路異常，請稍後重試",
    serverError: "伺服器繁忙，請稍後重試",
    uploadRequestTooLarge: "檔案超過目前上傳通道限制，請聯絡平台管理員",
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
    logout: "登出",
    language: "語言",
    publisher: "發行者",
    menu: "選單",
    close: "關閉",
    uploadTasks: "上傳任務",
    uploadTaskCount: "{n} 個上傳任務",
    newUploadTask: "新增上傳",
    continueUpload: "繼續上傳",
    pauseUpload: "掛起任務",
    uploading: "上傳中",
    uploadPaused: "已掛起",
    uploadReady: "待發布",
    uploadFailed: "上傳失敗",
    uploadDraft: "草稿",
    uploadTaskProgress: "{done}/{total} 集 · {percent}%",
    noUploadTasks: "暫無上傳任務",
    deleteUploadTask: "刪除任務",
    deleteUploadTaskTitle: "刪除上傳任務？",
    deleteUploadTaskDesc:
      "刪除後本地進度將清除；若已建立服務端草稿，草稿也會一併刪除且不可恢復。上傳中的任務會立即中斷。",
    deleteUploadTaskOk: "確認刪除",
    deleteUploadTaskSuccess: "上傳任務已刪除",
  },
  en: {
    networkError: "Network error, please try again later",
    serverError: "Server is busy, please try again later",
    uploadRequestTooLarge: "The file exceeds the current upload gateway limit. Contact the platform administrator",
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
    logout: "Log Out",
    language: "Language",
    publisher: "Publisher",
    menu: "Menu",
    close: "Close",
    uploadTasks: "Upload tasks",
    uploadTaskCount: "{n} upload tasks",
    newUploadTask: "New upload",
    continueUpload: "Continue upload",
    pauseUpload: "Pause task",
    uploading: "Uploading",
    uploadPaused: "Paused",
    uploadReady: "Ready to publish",
    uploadFailed: "Upload failed",
    uploadDraft: "Draft",
    uploadTaskProgress: "{done}/{total} eps · {percent}%",
    noUploadTasks: "No upload tasks",
    deleteUploadTask: "Delete task",
    deleteUploadTaskTitle: "Delete this upload task?",
    deleteUploadTaskDesc:
      "Local progress will be cleared. If a server draft exists, it will also be deleted permanently. An in-progress upload will stop immediately.",
    deleteUploadTaskOk: "Delete",
    deleteUploadTaskSuccess: "Upload task deleted",
  },
  pt: {
    networkError: "Erro de rede, tente novamente mais tarde",
    serverError: "Servidor ocupado, tente novamente mais tarde",
    uploadRequestTooLarge: "O arquivo excede o limite atual do canal de envio. Contate o administrador da plataforma",
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
    logout: "Sair",
    language: "Idioma",
    publisher: "Distribuidor",
    menu: "Menu",
    close: "Fechar",
    uploadTasks: "Tarefas de envio",
    uploadTaskCount: "{n} tarefas de envio",
    newUploadTask: "Novo envio",
    continueUpload: "Continuar envio",
    pauseUpload: "Pausar tarefa",
    uploading: "Enviando",
    uploadPaused: "Pausado",
    uploadReady: "Pronto para publicar",
    uploadFailed: "Falha no envio",
    uploadDraft: "Rascunho",
    uploadTaskProgress: "{done}/{total} eps · {percent}%",
    noUploadTasks: "Nenhuma tarefa de envio",
    deleteUploadTask: "Excluir tarefa",
    deleteUploadTaskTitle: "Excluir esta tarefa de envio?",
    deleteUploadTaskDesc:
      "O progresso local será limpo. Se existir um rascunho no servidor, ele também será excluído permanentemente. Um envio em andamento será interrompido imediatamente.",
    deleteUploadTaskOk: "Excluir",
    deleteUploadTaskSuccess: "Tarefa de envio excluída",
  },
};
