import type { Locale } from "../../i18n";

/**
 * Swift 租户开通通知文案（2026-06-26 新增）。
 * 审核通过后后端异步开通 AI 视频创作工具 Swift 账号；开通失败（tenantSyncStatus=2）时，
 * 发行中心顶栏展示通知铃铛，点击弹窗说明原因并可手动重试。
 */
export interface TenantMessages {
  /** 铃铛 tooltip */
  notifyTitle: string;
  /** 失败弹窗标题 */
  failedTitle: string;
  /** 失败弹窗说明 */
  failedDesc: string;
  /** 失败原因标签 */
  reasonLabel: string;
  /** 重试触发成功提示 */
  retrySuccess: string;
}

export const tenant: Record<Locale, TenantMessages> = {
  "zh-CN": {
    notifyTitle: "通知",
    failedTitle: "Swift 账号开通失败",
    failedDesc:
      "您的 AI 视频创作工具 Swift 账号开通失败。可点击重试，或等待系统每 10 分钟自动重试。",
    reasonLabel: "失败原因",
    retrySuccess: "已重新触发开通，请稍后查看结果",
  },
  "zh-TW": {
    notifyTitle: "通知",
    failedTitle: "Swift 帳號開通失敗",
    failedDesc:
      "您的 AI 影片創作工具 Swift 帳號開通失敗。可點擊重試，或等待系統每 10 分鐘自動重試。",
    reasonLabel: "失敗原因",
    retrySuccess: "已重新觸發開通，請稍後查看結果",
  },
  en: {
    notifyTitle: "Notifications",
    failedTitle: "Swift account activation failed",
    failedDesc:
      "Activation of your AI video tool Swift account failed. You can retry now, or wait for the system to retry automatically every 10 minutes.",
    reasonLabel: "Reason",
    retrySuccess: "Activation retriggered. Please check back shortly.",
  },
  pt: {
    notifyTitle: "Notificações",
    failedTitle: "Falha na ativação da conta Swift",
    failedDesc:
      "A ativação da sua conta da ferramenta de vídeo IA Swift falhou. Você pode tentar novamente agora ou aguardar a nova tentativa automática do sistema a cada 10 minutos.",
    reasonLabel: "Motivo",
    retrySuccess: "Ativação reiniciada. Verifique novamente em breve.",
  },
};
