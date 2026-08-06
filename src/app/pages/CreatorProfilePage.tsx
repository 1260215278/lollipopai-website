import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Loader2, Film, Play } from "lucide-react";
import { useI18n } from "../i18n";
import type { Locale } from "../i18n-types";
import { applyCustomSeoMeta, setPageSchema, clearPageSchema } from "../i18n.seo";
import { Footer } from "../components/Footer";
import { SiteHeader } from "../components/SiteHeader";
import { useNavItems } from "../components/useNavItems";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { ApiError } from "../services/http";
import {
  getPublisherProfile,
  getPublisherProfileCourses,
  type PublisherProfile,
  type PublisherProfileCourse,
} from "../services/publisher";

/** 公开主页文案（4 语言，仿 i18n.login 独立字典；本页为最简公开页，待 figma 后再细化）。 */
const profileMessages: Record<Locale, { dramas: string; plays: string; empty: string; notFound: string; loadMore: string }> = {
  "zh-CN": { dramas: "上架剧目", plays: "累计播放", empty: "暂无上架作品", notFound: "该主页不存在或暂未开放", loadMore: "加载更多" },
  "zh-TW": { dramas: "上架劇目", plays: "累計播放", empty: "暫無上架作品", notFound: "該主頁不存在或暫未開放", loadMore: "載入更多" },
  en: { dramas: "Dramas", plays: "Total plays", empty: "No published dramas yet", notFound: "This profile does not exist or is unavailable", loadMore: "Load more" },
  pt: { dramas: "Dramas", plays: "Reproduções", empty: "Nenhum drama publicado ainda", notFound: "Este perfil não existe ou está indisponível", loadMore: "Carregar mais" },
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
  const [coursePage, setCoursePage] = useState<{ currPage: number; totalPage: number } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMoreCourses = useCallback(async () => {
    if (!coursePage || coursePage.currPage >= coursePage.totalPage || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await getPublisherProfileCourses(userId, { page: coursePage.currPage + 1, limit: 20 });
      setCourses((prev) => [...prev, ...page.list]);
      setCoursePage({ currPage: page.currPage, totalPage: page.totalPage });
    } catch {
      // http 已 toast；公开主页保留当前已加载列表
    } finally {
      setLoadingMore(false);
    }
  }, [coursePage, loadingMore, userId]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setNotFound(false);
    setCoursePage(null);
    Promise.all([getPublisherProfile(userId), getPublisherProfileCourses(userId).catch(() => null)])
      .then(([p, page]) => {
        if (!alive) return;
        setProfile(p);
        setCourses(page?.list ?? []);
        setCoursePage(page ? { currPage: page.currPage, totalPage: page.totalPage } : null);
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

  // SEO: 动态设置 meta + Person Schema（创作者公开主页可被搜索引擎索引）
  useEffect(() => {
    if (notFound || !profile) {
      clearPageSchema();
      return;
    }

    const canonicalPath = `/creator/${userId}`;
    applyCustomSeoMeta(
      {
        title: `${profile.userName} — Short Drama Creator | Lollipop AI`,
        description: `Explore ${profile.userName}'s short dramas on Lollipop AI. ${profile.totalDramas} published dramas with ${formatCount(profile.totalPlays)} total plays. Watch premium AI and live-action short dramas.`,
      },
      canonicalPath,
    );

    setPageSchema({
      "@context": "https://schema.org",
      "@type": "Person",
      name: profile.userName,
      url: `https://www.lollipop.im/creator/${userId}`,
      image: profile.avatar,
      jobTitle: "Short Drama Creator",
      worksFor: {
        "@type": "Organization",
        name: "Lollipop AI",
        url: "https://www.lollipop.im",
      },
      description: `Short drama creator on Lollipop AI with ${profile.totalDramas} published dramas and ${formatCount(profile.totalPlays)} total plays.`,
      knowsAbout: ["Short Drama", "AI Content Creation", "Video Production"],
    });

    return () => clearPageSchema();
  }, [profile, notFound, userId]);

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
                <>
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
                  {coursePage && coursePage.currPage < coursePage.totalPage && (
                    <div className="mt-10 flex justify-center">
                      <button
                        type="button"
                        onClick={() => void loadMoreCourses()}
                        disabled={loadingMore}
                        className="h-11 px-6 rounded-[10px] border border-white/15 text-white text-sm flex items-center gap-2 hover:bg-white/10 disabled:opacity-60"
                        style={{ fontWeight: 600 }}
                      >
                        {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                        {t.loadMore}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </main>

        <Footer onNavigate={(page) => navigate(page === "home" ? "/" : `/${page}`)} />
      </div>
    </ErrorBoundary>
  );
}

function ProfileHeader() {
  const navigate = useNavigate();
  const navItems = useNavItems();

  return <SiteHeader navItems={navItems} onLogoClick={() => navigate("/")} sticky />;
}
