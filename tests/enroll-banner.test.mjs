import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/app/distribution/pages/EnrollPage.tsx", import.meta.url), "utf8");

test("enrollment banner uses artwork only for simplified Chinese and English", () => {
  assert.match(source, /import welcomeBanner from "\.\.\/\.\.\/\.\.\/imports\/发行入驻-欢迎横幅\.png";/);
  assert.match(source, /import welcomeBannerCn from "\.\.\/\.\.\/\.\.\/imports\/发行入驻-欢迎横幅-cn\.png";/);
  assert.match(source, /import welcomeBannerEn from "\.\.\/\.\.\/\.\.\/imports\/发行入驻-欢迎横幅-en\.png";/);
  assert.match(source, /const directBanner = props\.locale === "zh-CN" \? welcomeBannerCn : props\.locale === "en" \? welcomeBannerEn : null;/);
  assert.match(source, /\{directBanner \? \([\s\S]*?src=\{directBanner\}[\s\S]*?\) : \([\s\S]*?src=\{welcomeBanner\}[\s\S]*?className="enroll-banner-copy[^"]*"[\s\S]*?\{t\.bannerTitle\}[\s\S]*?\{t\.bannerSubtitle\}/);
});
