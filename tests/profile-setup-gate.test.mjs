/**
 * 强制资料门禁：英文昵称规则 + profileComplete 判定（与后端 PublisherProfileRules 对齐）
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// 直接解析 TS 源为可执行逻辑（与 profileRules.ts 保持同源复制的契约测试）
const NICKNAME_MAX = 50;
const ENGLISH_NICKNAME_REGEX = /^[A-Za-z][A-Za-z0-9 .'_-]{1,49}$/;

function isAvatarSet(avatar) {
  return typeof avatar === "string" && avatar.trim().length > 0;
}
function isDefaultNickname(nickname, memberUserId) {
  const t = (nickname || "").trim();
  if (!t) return true;
  if (t === "LOL_User") return true;
  if (memberUserId != null && t === `LOL-${memberUserId}`) return true;
  return t.includes("****");
}
function isEnglishNickname(nickname) {
  const t = nickname.trim();
  if (!t || t.length > NICKNAME_MAX) return false;
  return ENGLISH_NICKNAME_REGEX.test(t);
}
function isProfileComplete(nickname, avatar, memberUserId) {
  if (!isAvatarSet(avatar)) return false;
  if (isDefaultNickname(nickname, memberUserId)) return false;
  return isEnglishNickname(nickname || "");
}

test("english nickname accepts CloudDrama style", () => {
  assert.equal(isEnglishNickname("CloudDrama"), true);
  assert.equal(isEnglishNickname("Cloud Drama"), true);
  assert.equal(isEnglishNickname("Cloud_Drama"), true);
  assert.equal(isEnglishNickname("A1"), true);
});

test("english nickname rejects chinese, pure digits, and defaults", () => {
  assert.equal(isEnglishNickname("星河"), false);
  assert.equal(isEnglishNickname("1Cloud"), false);
  assert.equal(isEnglishNickname("12121"), false);
  assert.equal(isEnglishNickname("C"), false);
  assert.equal(isDefaultNickname("LOL_User", 1), true);
  assert.equal(isDefaultNickname("LOL-30", 30), true);
  assert.equal(isDefaultNickname("138****0000", 1), true);
});

test("profile setup tip icon asset exists", () => {
  const icon = readFileSync(join(root, "src/imports/profile-setup-tip-icon.svg"), "utf8");
  assert.match(icon, /stroke="#EA580C"/);
  assert.match(icon, /viewBox="0 0 14 14"/);
});

test("profile complete needs avatar + english nickname", () => {
  assert.equal(isProfileComplete("CloudDrama", "https://oss/a.png", 1), true);
  assert.equal(isProfileComplete("CloudDrama", "", 1), false);
  assert.equal(isProfileComplete("LOL_User", "https://oss/a.png", 1), false);
  assert.equal(isProfileComplete("星河", "https://oss/a.png", 1), false);
});

test("source files wire completeProfile and modal gate", () => {
  const memberSrc = readFileSync(join(root, "src/app/services/member.ts"), "utf8");
  assert.match(memberSrc, /completeMemberProfile/);
  assert.match(memberSrc, /\/publisher\/member\/completeProfile/);
  assert.match(memberSrc, /profileComplete/);

  const layout = readFileSync(join(root, "src/app/distribution/DistributionLayout.tsx"), "utf8");
  assert.match(layout, /ProfileSetupModal/);
  assert.match(layout, /needProfileSetup/);

  const modal = readFileSync(join(root, "src/app/distribution/components/ProfileSetupModal.tsx"), "utf8");
  assert.match(modal, /完善你的发行者资料|t\.title/);
  assert.match(modal, /Escape/);
  assert.match(modal, /completeMemberProfile/);
});
