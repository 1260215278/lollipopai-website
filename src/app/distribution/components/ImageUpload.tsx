import React, { useRef, useState } from "react";
import { UploadCloud, Loader2, X } from "lucide-react";
import { uploadFile, ALIOSS_UPLOAD_PATH } from "../../services/upload";
import { getOssHeicJpgUrl } from "../../services/heic";
import { cn } from "../../components/ui/utils";

/**
 * 通用图片上传组件（证照/封面等）。
 * - 选择/拖拽文件后内部调用统一上传服务 uploadFile() → 拿到 URL → onChange(url)
 * - 纯展示 + 上传逻辑，所有文案由调用方通过 props 传入（各功能自有 i18n）
 * - variant: 发行入驻页为 dark；后台仪表盘为 light
 */
export interface ImageUploadProps {
  label: string;
  required?: boolean;
  value?: string | null;
  onChange: (url: string | null) => void;
  error?: string;
  /** 区域内提示文案，如「点击或拖拽上传」 */
  promptText: string;
  /** 格式提示，如「支持 JPG、PNG 格式」 */
  formatText: string;
  /** 已上传后悬浮的「点击替换」文案 */
  replaceText: string;
  /** 上传失败兜底文案（service 层已 toast，本地用于无 toast 场景） */
  uploadFailedText: string;
  accept?: string;
  variant?: "light" | "dark";
  className?: string;
  /** 上传区域高度类，默认 h-[132px] */
  zoneClassName?: string;
}

const TONES = {
  light: {
    label: "#374151",
    idleBg: "#FAFAFA",
    idleBorder: "#E5E7EB",
    dragBorder: "#111111",
    errorBorder: "#fca5a5",
    errorBg: "#fef2f2",
    iconBox: "bg-white border-gray-200",
    icon: "#9CA3AF",
    prompt: "#6B7280",
    format: "#9CA3AF",
  },
  dark: {
    label: "#ffffff",
    idleBg: "rgba(51,51,51,0.3)",
    idleBorder: "rgba(255,255,255,0.12)",
    dragBorder: "rgba(255,255,255,0.45)",
    errorBorder: "#fb2c36",
    errorBg: "rgba(231,0,11,0.08)",
    iconBox: "bg-[rgba(51,51,51,0.6)] border-white/10",
    icon: "#99a1af",
    prompt: "#d1d5dc",
    format: "#717182",
  },
} as const;

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  required,
  value,
  onChange,
  error,
  promptText,
  formatText,
  replaceText,
  uploadFailedText,
  // bug9：放开苹果 HEIC/HEIF 拍照格式（需后端/OSS 同步支持，见后端反馈文档）
  accept = "image/jpeg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif",
  variant = "light",
  className,
  zoneClassName,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const tone = TONES[variant];

  const doUpload = async (file: File) => {
    setUploading(true);
    try {
      // bug9：HEIC 上传原文件，保存 OSS 动态转 JPG URL；入驻证照走 /alioss/upload（入驻文档 §2.3）
      const url = await uploadFile(file, ALIOSS_UPLOAD_PATH);
      onChange(getOssHeicJpgUrl(file, url));
    } catch {
      // uploadFile 已 toast；保持当前值不变
    } finally {
      setUploading(false);
    }
  };

  const onPick = (files: FileList | null) => {
    const f = files?.[0];
    if (f) void doUpload(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (uploading) return;
    onPick(e.dataTransfer.files);
  };

  return (
    <div className={className}>
      <label className="block text-sm mb-2" style={{ fontWeight: 500, color: tone.label }}>
        {label}
        {required && <span className="text-[#fb2c36] ml-0.5">*</span>}
      </label>

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "relative cursor-pointer rounded-[10px] border-2 border-dashed flex items-center justify-center overflow-hidden transition-all group",
          zoneClassName ?? "h-[132px]",
        )}
        style={{
          borderColor: error ? tone.errorBorder : dragging ? tone.dragBorder : tone.idleBorder,
          background: error ? tone.errorBg : tone.idleBg,
        }}
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: tone.icon }} />
        ) : value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="text-white text-sm" style={{ fontWeight: 500 }}>
                {replaceText}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="absolute top-2 right-2 p-1 rounded-full bg-black/60 hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <div className={cn("w-10 h-10 rounded-xl border flex items-center justify-center", tone.iconBox)}>
              <UploadCloud className="w-5 h-5" style={{ color: tone.icon }} />
            </div>
            <p className="text-sm" style={{ fontWeight: 500, color: tone.prompt }}>
              {promptText}
            </p>
            <p className="text-xs" style={{ color: tone.format }}>
              {formatText}
            </p>
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => onPick(e.target.files)} />
      {error && <p className="text-xs text-[#fb2c36] mt-1.5">{error}</p>}
    </div>
  );
};
