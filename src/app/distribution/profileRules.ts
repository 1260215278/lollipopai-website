/**
 * 发行中心强制资料规则（与后端 PublisherProfileRules 对齐）。
 * 昵称：2~50，字母开头，仅 A-Za-z0-9 空格 . _ ' -
 */

export const NICKNAME_MAX = 50;

const ENGLISH_NICKNAME_REGEX = /^[A-Za-z][A-Za-z0-9 .'_-]{1,49}$/;

export function isAvatarSet(avatar: string | null | undefined): boolean {
  return typeof avatar === "string" && avatar.trim().length > 0;
}

export function isDefaultNickname(nickname: string | null | undefined, memberUserId?: number | null): boolean {
  const t = (nickname || "").trim();
  if (!t) return true;
  if (t === "LOL_User") return true;
  if (memberUserId != null && t === `LOL-${memberUserId}`) return true;
  return t.includes("****");
}

export function isEnglishNickname(nickname: string): boolean {
  const t = nickname.trim();
  if (!t || t.length > NICKNAME_MAX) return false;
  return ENGLISH_NICKNAME_REGEX.test(t);
}

export function isProfileComplete(
  nickname: string | null | undefined,
  avatar: string | null | undefined,
  memberUserId?: number | null,
): boolean {
  if (!isAvatarSet(avatar)) return false;
  if (isDefaultNickname(nickname, memberUserId)) return false;
  return isEnglishNickname(nickname || "");
}
