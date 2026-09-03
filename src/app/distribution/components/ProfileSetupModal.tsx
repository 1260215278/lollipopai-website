/**
 * 发行中心强制完善资料弹窗（Figma 16590:1513 ProfileSetupModal）
 * - 资料未完整时不可关闭（无关闭按钮、遮罩不可点关、Esc 无效）
 * - 头像必填 + 英文昵称
 */
import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "../../i18n";
import { completeMemberProfile } from "../../services/member";
import { ALIOSS_UPLOAD_PATH, uploadFile } from "../../services/upload";
import { getOssHeicJpgUrl } from "../../services/heic";
import {
  NICKNAME_MAX,
  isAvatarSet,
  isEnglishNickname,
} from "../profileRules";
import tipIconUrl from "../../../imports/profile-setup-tip-icon.svg";

export interface ProfileSetupResult {
  nickname: string;
  avatar: string;
}

interface Props {
  initialNickname?: string;
  initialAvatar?: string | null;
  onCompleted: (result: ProfileSetupResult) => void;
}

export function ProfileSetupModal({ initialNickname = "", initialAvatar = null, onCompleted }: Props) {
  const { messages } = useI18n();
  const t = messages.distribution.profileSetup;
  const fileRef = useRef<HTMLInputElement>(null);

  const seedNick = isEnglishNickname(initialNickname) ? initialNickname.trim() : "";
  const [nickname, setNickname] = useState(seedNick.slice(0, NICKNAME_MAX));
  const [avatar, setAvatar] = useState(initialAvatar && isAvatarSet(initialAvatar) ? initialAvatar.trim() : "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  /** 仅影响展示（裂图时回退相机图标），不挡提交——OSS 签名 URL / 跨域偶发 onError 不应锁死按钮 */
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [nickTouched, setNickTouched] = useState(false);

  const nickTrimmed = nickname.trim();
  const nickOk = isEnglishNickname(nickname);
  const avatarOk = isAvatarSet(avatar);
  const canSubmit = nickOk && avatarOk && !uploading && !saving;
  const showNickError = nickTouched && nickTrimmed.length > 0 && !nickOk;

  const openFilePicker = () => {
    if (uploading) return;
    fileRef.current?.click();
  };

  const onPickAvatar = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, ALIOSS_UPLOAD_PATH);
      const next = getOssHeicJpgUrl(file, url);
      setAvatar(next);
      setAvatarBroken(false);
    } catch {
      // uploadFile 已 toast
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const explainDisabled = () => {
    if (uploading) {
      toast.error(t.uploading);
      return;
    }
    if (!avatarOk) {
      toast.error(t.avatarRequired);
      return;
    }
    if (!nickTrimmed) {
      toast.error(t.nicknameRequired);
      setNickTouched(true);
      return;
    }
    if (!nickOk) {
      toast.error(t.nicknameEnglishOnly);
      setNickTouched(true);
    }
  };

  const submit = async () => {
    if (!canSubmit) {
      explainDisabled();
      return;
    }
    const nextNick = nickname.trim();
    setSaving(true);
    try {
      const data = await completeMemberProfile({ nickname: nextNick, avatar: avatar.trim() });
      toast.success(t.saveSuccess);
      onCompleted({ nickname: data.nickname, avatar: data.avatar });
    } catch {
      // http 已 toast 后端 i18n msg
    } finally {
      setSaving(false);
    }
  };

  const showAvatarImage = avatarOk && !avatarBroken;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-setup-title"
      onKeyDown={(e) => {
        if (e.key === "Escape") e.preventDefault();
      }}
    >
      <div
        className="relative w-full max-w-[420px] overflow-hidden rounded-[24px] bg-white"
        style={{ boxShadow: "0px 25px 50px -12px rgba(0,0,0,0.25)" }}
      >
        <div
          className="relative h-[112px] w-full"
          style={{ backgroundImage: "linear-gradient(165deg, #111111 0%, #374151 100%)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              background:
                "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.55) 0%, transparent 55%)",
            }}
          />
          <button
            type="button"
            onClick={openFilePicker}
            disabled={uploading}
            className="absolute left-1/2 top-[72px] z-10 flex h-20 w-20 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full border-[3.5px] border-white bg-[#f3f4f6]"
            style={{
              boxShadow:
                "0px 20px 25px -5px rgba(0,0,0,0.1), 0px 8px 10px -6px rgba(0,0,0,0.1)",
            }}
            aria-label={t.avatarHint}
          >
            {showAvatarImage ? (
              <img
                src={avatar}
                alt=""
                className="h-full w-full object-cover"
                onError={() => setAvatarBroken(true)}
                onLoad={() => setAvatarBroken(false)}
              />
            ) : uploading ? (
              <Loader2 className="h-7 w-7 animate-spin text-[#9ca3af]" />
            ) : (
              <Camera className="h-7 w-7 text-[#9ca3af]" strokeWidth={1.75} />
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif"
            className="hidden"
            onChange={(e) => void onPickAvatar(e.target.files?.[0])}
          />
        </div>

        <div className="px-8 pb-8 pt-14">
          <h2
            id="profile-setup-title"
            className="text-center text-[18px] leading-7 tracking-[-0.36px] text-[#101828]"
            style={{ fontWeight: 800 }}
          >
            {t.title}
          </h2>
          <p className="mt-1.5 text-center text-xs leading-[19.5px] text-[#99a1af]">{t.subtitle}</p>

          {/* 设计稿提示条；整条可点，引导上传（与头像圆同逻辑） */}
          <button
            type="button"
            onClick={openFilePicker}
            disabled={uploading}
            className="mt-6 flex w-full items-center gap-2 rounded-[14px] border border-[#fed7aa] bg-[#fff7ed] px-[14px] py-[10px] text-left transition-opacity hover:opacity-90 disabled:opacity-70"
          >
            <img src={tipIconUrl} alt="" className="h-3.5 w-3.5 flex-shrink-0" width={14} height={14} />
            <span className="text-xs leading-4 text-[#ea580c]" style={{ fontWeight: 500 }}>
              {uploading ? t.uploading : t.avatarHint}
            </span>
          </button>

          <div className="mt-4">
            <label className="mb-1.5 block text-xs leading-4 text-[#6a7282]" style={{ fontWeight: 600 }}>
              {t.nicknameLabel} <span className="text-[#fb2c36]">*</span>
            </label>
            <input
              type="text"
              value={nickname}
              maxLength={NICKNAME_MAX}
              autoComplete="nickname"
              placeholder={t.nicknamePlaceholder}
              onChange={(e) => {
                setNickname(e.target.value.slice(0, NICKNAME_MAX));
                setNickTouched(true);
              }}
              onBlur={() => setNickTouched(true)}
              className="h-[45px] w-full rounded-[14px] border px-4 text-sm outline-none focus:border-[#111111]"
              style={{
                fontWeight: 500,
                borderColor: showNickError ? "#fb2c36" : "#e5e7eb",
              }}
            />
            {showNickError ? (
              <p className="mt-1.5 text-[10px] leading-[15px] text-[#fb2c36]">{t.nicknameEnglishOnly}</p>
            ) : (
              <p className="mt-1.5 text-[10px] leading-[15px] text-[#99a1af]">{t.nicknameHelper}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => void submit()}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] text-sm tracking-[-0.14px] transition-colors"
            style={{
              fontWeight: 700,
              background: canSubmit ? "#111111" : "#f3f4f6",
              color: canSubmit ? "#ffffff" : "#9ca3af",
              cursor: canSubmit || saving ? "pointer" : "pointer",
            }}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
