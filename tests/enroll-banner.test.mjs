import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/app/distribution/pages/EnrollPage.tsx", import.meta.url), "utf8");
const figmaBanner = readFileSync(new URL("../src/imports/发行入驻-欢迎横幅-cn.png", import.meta.url));

test("enrollment banner keeps the exact Figma artwork and desktop geometry", () => {
  assert.match(source, /import welcomeBanner from "\.\.\/\.\.\/\.\.\/imports\/发行入驻-欢迎横幅\.png";/);
  assert.match(source, /import welcomeBannerCn from "\.\.\/\.\.\/\.\.\/imports\/发行入驻-欢迎横幅-cn\.png";/);
  assert.match(source, /import welcomeBannerEn from "\.\.\/\.\.\/\.\.\/imports\/发行入驻-欢迎横幅-en\.png";/);
  assert.match(source, /w-full max-w-\[720px\] mx-auto px-6 py-10/);
  assert.match(source, /-mx-6 -mt-6 mb-2 aspect-\[1544\/500\]/);
  assert.equal(
    createHash("sha256").update(figmaBanner).digest("hex"),
    "7c983d79516e829f61e97b13a9b54f6989a058d3eafcd8a109536095db30feb9",
  );
});

test("simplified Chinese and English use complete banner images", () => {
  assert.match(source, /const directBanner = props\.locale === "zh-CN" \? welcomeBannerCn : props\.locale === "en" \? welcomeBannerEn : null;/);
  assert.match(source, /\{directBanner \? \([\s\S]*?src=\{directBanner\}[\s\S]*?alt=\{t\.bannerTitle\}/);
});

test("Traditional Chinese and Portuguese replace only the Figma copy area", () => {
  assert.match(source, /src=\{welcomeBannerCn\}/);
  assert.match(source, /src=\{welcomeBanner\}[\s\S]*?clipPath: "inset\(16% 23\.575% 53% 42\.746%\)"/);
  assert.match(source, /className="enroll-banner-copy absolute left-\[44\.3%\] top-\[18%\][^"]*"/);
  assert.match(source, /sm:text-\[24px\][\s\S]*?\{t\.bannerTitle\}[\s\S]*?sm:text-\[14px\][\s\S]*?\{t\.bannerSubtitle\}/);
});
