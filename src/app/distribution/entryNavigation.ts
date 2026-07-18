import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useI18n } from "../i18n";
import {
  getAppToken,
  isAppAuthed,
  isPublisherAuthed,
  subscribeAuthChange,
} from "../services/auth";
import { ApiError } from "../services/http";
import {
  getPublisherEntryStatus,
  type PublisherEntryStatus,
} from "../services/publisher";

const ENTRY_REQUEST_TIMEOUT_MS = 3000;
const ENTRY_STATUS_CACHE_MS = 60_000;

let entryStatusCache: { appToken: string; expiresAt: number; status: PublisherEntryStatus } | null = null;
let entryStatusRequest: { appToken: string; promise: Promise<PublisherEntryStatus> } | null = null;

export interface DistributionNavigationState {
  publisherEntryTarget: "CONSOLE_2FA";
}

export type DistributionEntryDecision =
  | { kind: "navigate"; path: "/distribution/enroll" | "/distribution/overview"; state?: DistributionNavigationState }
  | { kind: "error"; message: string };

async function withEntryRequestTimeout<T>(request: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), ENTRY_REQUEST_TIMEOUT_MS);
  try {
    return await request(controller.signal);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function loadPublisherEntryStatus(): Promise<PublisherEntryStatus> {
  const appToken = getAppToken();
  if (!appToken) return Promise.reject(new ApiError(401, "missing app token"));

  if (entryStatusCache?.appToken === appToken && entryStatusCache.expiresAt > Date.now()) {
    return Promise.resolve(entryStatusCache.status);
  }
  if (entryStatusRequest?.appToken === appToken) return entryStatusRequest.promise;

  const promise = withEntryRequestTimeout((signal) =>
    getPublisherEntryStatus({ toastOnError: false, signal }),
  )
    .then((status) => {
      if (getAppToken() === appToken) {
        entryStatusCache = {
          appToken,
          expiresAt: Date.now() + ENTRY_STATUS_CACHE_MS,
          status,
        };
      }
      return status;
    })
    .finally(() => {
      if (entryStatusRequest?.promise === promise) entryStatusRequest = null;
    });

  entryStatusRequest = { appToken, promise };
  return promise;
}

/**
 * 使用已预取的后端权威 entryTarget 解析目标页；不在点击时串行调用 byAppToken/status。
 */
export async function resolveDistributionEntry(serverError: string): Promise<DistributionEntryDecision> {
  if (isPublisherAuthed()) {
    return { kind: "navigate", path: "/distribution/overview" };
  }
  if (!isAppAuthed()) {
    return { kind: "navigate", path: "/distribution/enroll" };
  }

  try {
    const status = await loadPublisherEntryStatus();
    switch (status.entryTarget) {
      case "ENROLL":
      case "APPLICATION_PENDING":
      case "APPLICATION_REJECTED":
        return { kind: "navigate", path: "/distribution/enroll" };
      case "CONSOLE":
        return { kind: "navigate", path: "/distribution/overview" };
      case "CONSOLE_2FA":
        return {
          kind: "navigate",
          path: "/distribution/overview",
          state: { publisherEntryTarget: "CONSOLE_2FA" },
        };
      case "BLOCKED":
        return { kind: "error", message: status.blockMessage };
    }
  } catch (err) {
    return { kind: "error", message: err instanceof Error ? err.message : serverError };
  }
}

/** 公共官网顶栏使用：解析完成前留在当前页面，确定目标后只导航一次。 */
export function useDistributionEntryNavigation(): () => void {
  const navigate = useNavigate();
  const { messages } = useI18n();
  const resolvingRef = useRef(false);

  useEffect(() => {
    const prefetch = () => {
      if (!isAppAuthed()) {
        entryStatusCache = null;
        return;
      }
      void loadPublisherEntryStatus().catch(() => undefined);
    };
    prefetch();
    return subscribeAuthChange(prefetch);
  }, []);

  return useCallback(() => {
    if (resolvingRef.current) return;
    resolvingRef.current = true;
    void resolveDistributionEntry(messages.distribution.common.serverError)
      .then((decision) => {
        if (decision.kind === "error") {
          toast.error(decision.message);
          return;
        }
        navigate(decision.path, decision.state ? { state: decision.state } : undefined);
      })
      .finally(() => {
        resolvingRef.current = false;
      });
  }, [messages.distribution.common.serverError, navigate]);
}
