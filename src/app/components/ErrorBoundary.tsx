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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-black text-white px-6 text-center">
        <p className="text-sm text-white/70">{t.serverError}</p>
        <button
          type="button"
          onClick={this.handleRetry}
          className="h-[40px] px-5 rounded-[10px] bg-white text-[#111] text-sm"
          style={{ fontWeight: 500 }}
        >
          {t.retry}
        </button>
      </div>
    );
  }
}
