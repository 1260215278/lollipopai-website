import { Component, type ReactNode } from "react";
import { getMessages } from "../i18n";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * 全局渲染兜底（bug15）：捕获子树渲染期未捕获异常，避免整页白屏，
 * 展示「服务器繁忙 + 重试」并提供刷新恢复，而非把整站留成空白。
 * 重试只重置错误态并重新挂载子树；若仍异常会再次进入兜底，但站点框架不丢失。
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // 渲染期异常落 console，便于复现定位（白屏根因）
    console.error("[ErrorBoundary]", error);
  }

  // 重试：直接 reload，丢弃可能已损坏的内存状态，最稳妥地恢复页面
  private handleRetry = () => window.location.reload();

  render() {
    if (!this.state.hasError) return this.props.children;
    const t = getMessages().distribution.common;
    // 浅色兜底：避免发行中心等内容区因渲染异常整页黑屏
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F5F5F5] px-6 text-center">
        <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white px-6 py-8 shadow-sm">
          <p className="text-sm text-gray-600 leading-relaxed">{t.serverError}</p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-5 h-[40px] px-5 rounded-[10px] bg-[#111111] text-white text-sm hover:opacity-90"
            style={{ fontWeight: 500 }}
          >
            {t.retry}
          </button>
        </div>
      </div>
    );
  }
}
