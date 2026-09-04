/**
 * 收益明细「会员相关」tab 契约（看剧会员 P4 订阅池分账，2026-09-04）。
 * 不依赖 TS 加载器：对源码做文本断言 + 复刻纯函数验证格式化规则。
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (rel) => readFileSync(new URL("../" + rel, import.meta.url), "utf8");

test("service: vipPool 三接口走 /publisher/vipPool/*，接口未上线时静默降级", () => {
  const src = read("src/app/services/settlement.ts");
  for (const path of ['"/publisher/vipPool/months"', '"/publisher/vipPool/courses"', '"/publisher/vipPool/current"']) {
    assert.ok(src.includes(path), `settlement.ts should call ${path}`);
  }
  const vipSection = src.slice(src.indexOf("会员相关（订阅池分账"), src.indexOf("结算记录（列表 + 申请结算"));
  assert.equal((vipSection.match(/toastOnError: false/g) || []).length, 3, "all three vipPool calls must not toast on error");
  assert.ok(/export async function getVipPoolMonths/.test(src) && /export async function getVipPoolCourses/.test(src) && /export async function getVipPoolCurrent/.test(src));
  assert.ok(/status: 0 \| 1;/.test(vipSection), "status must be typed 0 预估 / 1 已入账");
});

test("page: 收益详情有 剧相关/会员相关 切换，会员相关消费三接口并支持每剧明细展开", () => {
  const src = read("src/app/distribution/pages/EarningsPage.tsx");
  assert.ok(/useState<"drama" \| "vip">\("drama"\)/.test(src), "default tab must stay 剧相关");
  for (const fn of ["getVipPoolMonths", "getVipPoolCourses", "getVipPoolCurrent"]) {
    assert.ok(new RegExp(`\\b${fn}\\(`).test(src), `EarningsPage should call ${fn}`);
  }
  assert.ok(/detailTab === "drama" \? t\.updatedDaily : t\.vipHint/.test(src), "hint text must switch with the tab");
  assert.ok(/detailTab === "drama" \? \(/.test(src) && /\) : \(\s*vipSection\s*\)/.test(src), "drama block and vip block must be mutually exclusive");
  assert.ok(/toggleMonth\(row\.periodMonth\)/.test(src) && /expandedMonth === row\.periodMonth/.test(src), "month rows expand to per-drama detail");
  assert.ok(/t\.vipEmpty/.test(src) && /t\.vipDetailEmpty/.test(src), "both empty states must be rendered");
});

test("i18n: 会员相关文案 6 语言齐全", () => {
  const src = read("src/app/distribution/i18n/earnings.ts");
  const keys = [
    "tabDrama", "tabVip", "vipHint", "vipCurrentTitle", "vipCurrentEffective", "vipCurrentShare", "vipCurrentEstimate",
    "vipCurrentRefreshed", "colMonth", "colMemberCount", "colEffectiveDuration", "colVipIncome", "colMom", "colPoolStatus",
    "colAction", "statusEstimated", "statusPosted", "actionDetail", "actionCollapse", "vipDetailTitle", "colCourse", "colTier",
    "colPlatformShare", "durationHm", "vipEmpty", "vipDetailEmpty", "colPayout",
  ];
  for (const key of keys) {
    const declared = new RegExp(`^  ${key}: string;`, "m").test(src);
    const count = (src.match(new RegExp(`^    ${key}: "`, "gm")) || []).length;
    assert.ok(declared, `${key} must be declared in EarningsMessages`);
    assert.equal(count, 6, `${key} must exist in all 6 locales, got ${count}`);
  }
  assert.ok(/durationHm: "\{h\}小时\{m\}分"/.test(src) && /durationHm: "\{h\}h \{m\}m"/.test(src), "duration templates must carry {h}/{m}");
});

// 与 EarningsPage 内纯函数保持一致的复刻，锁定格式化规则
function formatDuration(seconds, template) {
  const total = Math.max(0, Math.floor(seconds ?? 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return template.replace("{h}", String(h)).replace("{m}", String(m));
}
const formatMom = (n) => (n == null ? "--" : `${Number(n) > 0 ? "+" : ""}${Number(n).toFixed(1)}%`);
const tierLabel = (ratio) => {
  if (ratio == null) return "--";
  const pct = Number(ratio) <= 1 ? Number(ratio) * 100 : Number(ratio);
  return `${Math.round(pct * 100) / 100}%`;
};

test("format: 时长/环比/档位", () => {
  const page = read("src/app/distribution/pages/EarningsPage.tsx");
  assert.ok(page.includes('template.replace("{h}", String(h)).replace("{m}", String(m))'), "page formatDuration must match replica");
  assert.equal(formatDuration(3661, "{h}小时{m}分"), "1小时1分");
  assert.equal(formatDuration(null, "{h}h {m}m"), "0h 0m");
  assert.equal(formatMom(12.34), "+12.3%");
  assert.equal(formatMom(-5), "-5.0%");
  assert.equal(formatMom(null), "--");
  assert.equal(tierLabel(0.7), "70%", "0–1 ratio is a fraction");
  assert.equal(tierLabel(70), "70%", ">1 ratio is already a percentage");
  assert.equal(tierLabel(null), "--");
});
