/**
 * 上剧中心服务（mock + 真实接口并存）
 * ------------------------------------------------------------------
 * 上剧相关接口尚未定义（见《开发计划》§6.2 待产出契约草案），因此本模块
 * 用 VITE_USE_MOCK 开关：
 *   - USE_MOCK=true（默认）：返回 distribution/mock/content.ts 的本地数据；
 *   - USE_MOCK=false：走 http.ts 调用真实接口（路径/字段以 contract-draft-content.md 为准，
 *     联调时按后端最终契约对齐）。
 * 封面/视频上传统一走 services/upload.ts 的 uploadFile()，不在本模块重复实现。
 *
 * 字段语义来自原型，不编造；真实分支的请求体严格对应 CreateDramaInput / 列表查询参数。
 */
import { http } from "./http";
import {
  mockDramas,
  mockEpisodes,
  type DramaRow,
  type EpisodeRecord,
  type CreateDramaInput,
  type DramaStatus,
} from "../distribution/mock/content";

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

/** 模拟网络延迟，便于演示 loading 态 */
function delay<T>(data: T, ms = 360): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

/** mock 运行时的内存数据副本（保证增/改/上下架在演示中可见且可持久于本次会话） */
let mockDramaStore: DramaRow[] = [...mockDramas];
const mockEpisodeStore: Record<string, EpisodeRecord[]> = JSON.parse(
  JSON.stringify(mockEpisodes),
);

/** 列表查询参数（真实接口用；mock 仅用 keyword 本地过滤） */
export interface DramaListQuery {
  /** 名称 / ID 关键字 */
  keyword?: string;
}

/** 获取短剧列表 */
export function fetchDramaList(query: DramaListQuery = {}): Promise<DramaRow[]> {
  if (USE_MOCK) {
    const kw = (query.keyword ?? "").trim();
    const list = kw
      ? mockDramaStore.filter((d) => d.name.includes(kw) || d.id.includes(kw))
      : mockDramaStore;
    return delay([...list]);
  }
  return http.get<DramaRow[]>("/app/drama/list", { params: { keyword: query.keyword } });
}

/** 获取单部短剧详情 */
export function fetchDramaDetail(id: string): Promise<DramaRow> {
  if (USE_MOCK) {
    const found = mockDramaStore.find((d) => d.id === id);
    if (!found) return Promise.reject(new Error("drama not found"));
    return delay({ ...found });
  }
  return http.get<DramaRow>("/app/drama/detail", { params: { id } });
}

/** 获取某部短剧的剧集明细 */
export function fetchEpisodes(dramaId: string): Promise<EpisodeRecord[]> {
  if (USE_MOCK) {
    return delay([...(mockEpisodeStore[dramaId] ?? [])]);
  }
  return http.get<EpisodeRecord[]>("/app/drama/episodes", { params: { dramaId } });
}

/**
 * 创建短剧（提交上剧流程：基本信息 + 上传剧集元数据 + 发布配置）。
 * publishStatus=online 时提交后进入审核中（reviewing）；offline 进入未上架（not_published）。
 * 视频文件本身在表单内通过 uploadFile() 上传，这里只提交元数据（含已上传的 URL）。
 */
export function createDrama(input: CreateDramaInput): Promise<DramaRow> {
  const status: DramaStatus = input.publishStatus === "online" ? "reviewing" : "not_published";
  if (USE_MOCK) {
    const created: DramaRow = {
      id: `D${Date.now()}`,
      name: input.name,
      description: input.description,
      cover: input.cover,
      episodes: input.totalEpisodes,
      uploadedEpisodes: 0,
      countries: input.countries,
      tags: input.tags,
      distribution: input.distribution,
      status,
      copyright: input.copyrightType,
      revenueType: input.distribution === "full" ? "full" : "account",
      channel: input.channel,
      uploadedAt: new Date().toISOString().slice(0, 10),
    };
    mockDramaStore = [created, ...mockDramaStore];
    mockEpisodeStore[created.id] = Array.from({ length: input.totalEpisodes }, (_, i) => ({
      ep: i + 1,
      title: `第${i + 1}集`,
      duration: "—",
      size: "—",
      uploadedAt: "—",
      status: "failed",
    }));
    return delay(created);
  }
  return http.post<DramaRow>("/app/drama/create", input);
}

/** 上架 / 下架短剧（online=上架，offline=下架） */
export function setDramaStatus(id: string, status: "online" | "offline"): Promise<DramaRow> {
  if (USE_MOCK) {
    mockDramaStore = mockDramaStore.map((d) => (d.id === id ? { ...d, status } : d));
    const updated = mockDramaStore.find((d) => d.id === id);
    if (!updated) return Promise.reject(new Error("drama not found"));
    return delay({ ...updated });
  }
  return http.post<DramaRow>("/app/drama/status", { id, status });
}

/**
 * 提交剧集视频元数据（剧集视频管理页保存已选视频）。
 * 视频文件经 uploadFile() 上传后，将 ep + URL 提交，状态转为 processing（转码中）。
 */
export interface EpisodeUploadMeta {
  ep: number;
  /** 已上传得到的视频 URL */
  videoUrl: string;
  /** 文件大小展示串 */
  size: string;
  /** 时长展示串 */
  duration: string;
}

export function submitEpisodeUploads(
  dramaId: string,
  metas: EpisodeUploadMeta[],
): Promise<EpisodeRecord[]> {
  if (USE_MOCK) {
    const today = new Date().toISOString().slice(0, 10);
    const list = mockEpisodeStore[dramaId] ?? [];
    metas.forEach((m) => {
      const idx = list.findIndex((e) => e.ep === m.ep);
      if (idx >= 0) {
        list[idx] = {
          ...list[idx],
          status: "processing",
          size: m.size,
          duration: m.duration,
          uploadedAt: today,
        };
      }
    });
    mockEpisodeStore[dramaId] = [...list];
    return delay([...list]);
  }
  return http.post<EpisodeRecord[]>("/app/drama/episodes/submit", { dramaId, episodes: metas });
}
