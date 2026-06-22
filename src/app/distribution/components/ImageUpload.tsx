import React, { useRef, useState } from "react";
import { UploadCloud, Loader2, X, CheckCircle2 } from "lucide-react";
import { uploadFile } from "../../services/upload";
import { cn } from "../../components/ui/utils";

/**
 * 通用图片上传组件（证照/封面等）。
 * - 选择/拖拽文件后内部调用统一上传服务 uploadFile() → 拿到 URL → onChange(url)
 * - 纯展示 + 上传逻辑，所有文案由调用方通过 props 传入（各功能自有 i18n）
 */
export interface ImageUploadProps {
  label: string;
  required?: boolean;
  value?: string | null;
  onChange: (url: string | null) => void;
  error?: string;
  /** 区域内提示文案，如「点击或拖拽上传营业执照上传」 */
  promptText: string;
  /** 格式提示，如「支持 JPG、PNG 格式」 */
  formatText: string;
  /** 已上传后悬浮的「点击替换」文案 */
  replaceText: string;
  /** 上传失败 toast 文案（由 service 层 toast，此处用于本地兜底显示） */
  uploadFailedText: string;
  accept?: string;
  className?: string;
  /** 上传区域高度类，默认 h-[132px] */
  zoneClassName?: string;
}

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
  accept = "image/png,image/jpeg",
  className,
  zoneClassName,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const doUpload = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch {
      // uploadFile 已 toast，这里保持当前值不变
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
      <label className="block text-sm mb-2 text-[#374151]" style={{ fontWeight: 500 }}>
        {label}
        {required && <span className="text-[#E8192C] ml-0.5">*</span>}
      </label>

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "relative cursor-pointer rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all",
          zoneClassName ?? "h-[132px]",
        )}
        style={{
          borderColor: error ? "#fca5a5" : dragging ? "#111111" : "#E5E7EB",
          background: error ? "#fef2f2" : dragging ? "#F9F9F9" : "#FAFAFA",
        }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/45 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="text-white text-sm" style={{ fontWeight: 500 }}>
                {replaceText}
              </span>
            </div>
            <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-emerald-500 bg-white rounded-full" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="absolute top-2 left-2 p-1 rounded-lg bg-white/90 hover:bg-white shadow-sm"
            >
              <X className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
              <UploadCloud className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600" style={{ fontWeight: 500 }}>
              {promptText}
            </p>
            <p className="text-xs text-gray-400">{formatText}</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onPick(e.target.files)}
      />
      {error && <p className="text-xs text-[#E8192C] mt-1.5">{error}</p>}
    </div>
  );
};
