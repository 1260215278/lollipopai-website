interface BatchVideoFile {
  name: string;
  type: string;
  webkitRelativePath?: string;
}

/** 筛出当前上传白名单内的视频，并按文件名中的数字自然排序。 */
export function prepareBatchVideoFiles<T extends BatchVideoFile>(files: ArrayLike<T>, accept: string): T[] {
  const acceptedTypes = accept
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(files)
    .filter((file) => {
      const path = file.webkitRelativePath || file.name;
      if (path.split("/").some((segment) => segment.startsWith("."))) return false;
      const name = file.name.toLowerCase();
      const type = file.type.toLowerCase();
      return acceptedTypes.some((accepted) => (accepted.startsWith(".") ? name.endsWith(accepted) : type === accepted));
    })
    .sort((left, right) => left.name.localeCompare(right.name, "en", { numeric: true, sensitivity: "base" }));
}

/** 文件夹上传时，用顶层文件夹名 + 视频文件名（不含扩展名）生成剧集标题。 */
export function getFolderEpisodeTitle(file: BatchVideoFile): string | null {
  const path = file.webkitRelativePath || "";
  const segments = path.split("/").filter(Boolean);
  if (segments.length < 2) return null;
  const episodeName = file.name.replace(/\.[^.]+$/, "");
  return episodeName ? `${segments[0]}${episodeName}` : null;
}
