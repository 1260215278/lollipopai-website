import { fileNameFromUrl } from "./shared";

export interface TemplateEpisodeRow {
  episodeNo: number;
  title?: string;
  videoUrl: string;
  fileName: string;
}

function cellText(value: unknown): string {
  return String(value ?? "").trim();
}

function findHeaderIndex(header: unknown[], names: string[], fallback: number): number {
  const index = header.findIndex((cell) => {
    const normalized = cellText(cell).toLowerCase();
    return names.some((name) => normalized.includes(name));
  });
  return index >= 0 ? index : fallback;
}

export async function parseEpisodeTemplate(file: File, plannedEpisodes: number): Promise<TemplateEpisodeRow[]> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return [];

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", blankrows: false });
  const headerRowIndex = rows.findIndex((row) =>
    row.some((cell) => {
      const text = cellText(cell);
      return text.includes("集号") || text.includes("集數") || text.toLowerCase().includes("episode");
    }),
  );
  const header = headerRowIndex >= 0 ? rows[headerRowIndex] : [];
  const episodeIndex = header.length ? findHeaderIndex(header, ["集号", "集數", "episode"], 0) : 0;
  const titleIndex = header.length ? findHeaderIndex(header, ["剧集标题", "劇集標題", "标题", "標題", "title"], 1) : 1;
  const videoIndex = header.length ? findHeaderIndex(header, ["视频链接", "影片連結", "video", "url", "link"], 2) : 2;
  const bodyRows = rows.slice(headerRowIndex >= 0 ? headerRowIndex + 1 : 0);

  return bodyRows
    .map((row) => {
      const episodeNo = Number(cellText(row[episodeIndex]));
      const videoUrl = cellText(row[videoIndex]);
      if (!Number.isInteger(episodeNo) || episodeNo < 1 || episodeNo > plannedEpisodes || !videoUrl) return null;
      const title = cellText(row[titleIndex]);
      return {
        episodeNo,
        title: title || undefined,
        videoUrl,
        fileName: fileNameFromUrl(videoUrl) || videoUrl,
      };
    })
    .filter((row): row is TemplateEpisodeRow => row !== null);
}
