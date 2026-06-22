import { useI18n } from "../../i18n";

/**
 * 发行者入驻 —— P0 占位，由 P1 按 figma（15237-33700 等）与
 * 发行者入驻-前端接口.md 实现四态状态机与真接口对接。
 */
export function EnrollPage() {
  const { messages } = useI18n();
  const t = messages.distribution.enroll;
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-[#111111]" style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.02em" }}>
          {t.welcomeTitle}
        </h1>
        <p className="text-gray-500 text-sm mt-3 leading-relaxed">{t.welcomeSubtitle}</p>
      </div>
    </div>
  );
}
