import { EPISODE_TITLE_LIMIT, fileNameFromUrl } from "./shared";

export interface TemplateEpisodeRow {
  episodeNo: number;
  title?: string;
  videoUrl: string;
  fileName: string;
}

function cellText(value: unknown): string {
  return String(value ?? "").trim();
}

function matchesHeaderCell(cell: unknown, names: string[]): boolean {
  const normalized = cellText(cell).toLowerCase();
  return names.some((name) => normalized.includes(name.toLowerCase()));
}

function findHeaderIndex(header: unknown[], names: string[], fallback: number): number {
  const index = header.findIndex((cell) => {
    return matchesHeaderCell(cell, names);
  });
  return index >= 0 ? index : fallback;
}

const EPISODE_HEADER_NAMES = ["集号", "集數", "episode"];
const TITLE_HEADER_NAMES = ["剧集标题", "劇集標題", "标题", "標題", "title"];
const VIDEO_HEADER_NAMES = ["视频链接", "影片連結", "video", "url", "link"];

export async function parseEpisodeTemplate(file: File, plannedEpisodes: number): Promise<TemplateEpisodeRow[]> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return [];
  const ref = sheet["!ref"];
  if (!ref) return [];
  const range = XLSX.utils.decode_range(ref);

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", blankrows: true });
  const headerRowIndex = rows.findIndex((row) => {
    const episodeColumn = row.findIndex((cell) => matchesHeaderCell(cell, EPISODE_HEADER_NAMES));
    const videoColumn = row.findIndex((cell) => matchesHeaderCell(cell, VIDEO_HEADER_NAMES));
    return episodeColumn >= 0 && videoColumn >= 0 && episodeColumn !== videoColumn;
  });
  const header = headerRowIndex >= 0 ? rows[headerRowIndex] : [];
  const episodeIndex = header.length ? findHeaderIndex(header, EPISODE_HEADER_NAMES, 0) : 0;
  const titleIndex = header.length ? findHeaderIndex(header, TITLE_HEADER_NAMES, 1) : 1;
  const videoIndex = header.length ? findHeaderIndex(header, VIDEO_HEADER_NAMES, 2) : 2;
  const bodyStartIndex = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;
  const bodyRows = rows.slice(bodyStartIndex);

  return bodyRows
    .map((row, offset) => {
      const episodeNo = Number(cellText(row[episodeIndex]));
      const sheetRowIndex = range.s.r + bodyStartIndex + offset;
      const sheetColIndex = range.s.c + videoIndex;
      const videoCell = sheet[XLSX.utils.encode_cell({ r: sheetRowIndex, c: sheetColIndex })] as { l?: { Target?: string } } | undefined;
      const rawVideoUrl = cellText(row[videoIndex]);
      const linkTarget = cellText(videoCell?.l?.Target);
      const videoUrl = /^https?:\/\//i.test(rawVideoUrl) ? rawVideoUrl : (linkTarget || rawVideoUrl);
      if (!Number.isInteger(episodeNo) || episodeNo < 1 || episodeNo > plannedEpisodes || !videoUrl) return null;
      const title = cellText(row[titleIndex]).slice(0, EPISODE_TITLE_LIMIT);
      return {
        episodeNo,
        title: title || undefined,
        videoUrl,
        fileName: fileNameFromUrl(videoUrl) || videoUrl,
      };
    })
    .filter((row): row is TemplateEpisodeRow => row !== null);
}
