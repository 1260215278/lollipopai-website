import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Loader2, Film, Play } from "lucide-react";
import { useI18n, type Locale } from "../i18n";
import { Footer } from "../components/Footer";
import { SiteHeader, type SiteNavItem } from "../components/SiteHeader";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { ApiError } from "../services/http";
import {
  getPublisherProfile,
  getPublisherProfileCourses,
  type PublisherProfile,
  type PublisherProfileCourse,
} from "../services/publisher";

/** 公开主页文案（4 语言，仿 i18n.login 独立字典；本页为最简公开页，待 figma 后再细化）。 */
const profileMessages: Record<Locale, { dramas: string; plays: string; empty: string; notFound: string }> = {
  "zh-CN": { dramas: "上架剧目", plays: "累计播放", empty: "暂无上架作品", notFound: "该主页不存在或暂未开放" },
  "zh-TW": { dramas: "上架劇目", plays: "累計播放", empty: "暫無上架作品", notFound: "該主頁不存在或暫未開放" },
  en: { dramas: "Dramas", plays: "Total plays", empty: "No published dramas yet", notFound: "This profile does not exist or is unavailable" },
  pt: { dramas: "Dramas", plays: "Reproduções", empty: "Nenhum drama publicado ainda", notFound: "Este perfil não existe ou está indisponível" },
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/**
 * 出品方公开主页（bug18）—— 最简版（暂无 figma）。
 * 路由 /creator/:userId，免登录展示出品方基础信息 + 已上架剧目网格。
 */
export function CreatorProfilePage() {
  const { locale } = useI18n();
  const t = profileMessages[locale];
  const navigate = useNavigate();
  const { userId = "" } = useParams();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [profile, setProfile] = useState<PublisherProfile | null>(null);
  const [courses, setCourses] = useState<PublisherProfileCourse[]>([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setNotFound(false);
    Promise.all([getPublisherProfile(userId), getPublisherProfileCourses(userId).catch(() => null)])
      .then(([p, page]) => {
        if (!alive) return;
        setProfile(p);
        setCourses(page?.list ?? []);
      })
      .catch((err) => {
        if (!alive) return;
        // 403311 用户不存在 / 403312 非发行方 → 展示「主页不存在」空态
        if (err instanceof ApiError) setNotFound(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [userId]);

  return (
    <ErrorBoundary>
      <div className="w-full bg-black min-h-screen flex flex-col" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        <ProfileHeader />

        <main className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-40 text-white/50">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : notFound || !profile ? (
            <div className="flex flex-col items-center justify-center py-40 gap-3 text-white/50">
              <Film className="w-10 h-10 text-white/20" />
              <p className="text-sm">{t.notFound}</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto px-6 py-12">
              {/* 头部：头像 + 名称 + 统计 */}
              <div className="flex items-center gap-5">
                <img
                  src={profile.avatar}
                  alt={profile.userName}
                  className="w-20 h-20 rounded-full object-cover bg-[#222] border border-white/10"
                />
                <div>
                  <h1 className="text-white" style={{ fontWeight: 700, fontSize: "24px" }}>
                    {profile.userName}
                  </h1>
                  <div className="flex gap-6 mt-2 text-sm text-white/60">
                    <span>
                      <span className="text-white" style={{ fontWeight: 600 }}>
                        {profile.totalDramas}
                      </span>{" "}
                      {t.dramas}
                    </span>
                    <span>
                      <span className="text-white" style={{ fontWeight: 600 }}>
                        {formatCount(profile.totalPlays)}
                      </span>{" "}
                      {t.plays}
                    </span>
                  </div>
                </div>
              </div>

              {/* 剧目网格 */}
              {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-28 gap-3 text-white/40">
                  <Film className="w-10 h-10 text-white/15" />
                  <p className="text-sm">{t.empty}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 mt-10">
                  {courses.map((c) => (
                    <div key={c.courseId} className="group">
                      <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/5">
                        {c.titleImg || c.img ? (
                          <img src={c.titleImg || c.img} alt={c.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-7 h-7 text-white/15" />
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white/90 bg-black/40 rounded px-1.5 py-0.5">
                          <Play className="w-3 h-3" />
                          {formatCount(c.viewCounts)}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-white/85 truncate" title={c.title}>
                        {c.title}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        <Footer onNavigate={() => navigate("/")} />
        {/* common 仅用于潜在空态文案占位，避免未使用告警 */}
        <span className="hidden">{common.loading}</span>
      </div>
    </ErrorBoundary>
  );
}

function ProfileHeader() {
  const { messages } = useI18n();
  const navigate = useNavigate();
  const links = messages.navbar.links;
  const navItems: SiteNavItem[] = [
    { key: "home", label: links.home, onClick: () => navigate("/") },
    { key: "creating", label: links.creating, onClick: () => navigate({ pathname: "/", hash: "#creators" }) },
    { key: "distribution", label: messages.distribution.nav.entry, onClick: () => navigate("/distribution") },
    { key: "download", label: links.download, onClick: () => navigate({ pathname: "/", hash: "#download" }) },
    { key: "contact", label: links.contact, onClick: () => navigate({ pathname: "/", hash: "#contact" }) },
  ];
  return <SiteHeader navItems={navItems} onLogoClick={() => navigate("/")} sticky />;
}
