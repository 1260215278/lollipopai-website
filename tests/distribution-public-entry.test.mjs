import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readSource = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const entrySource = readSource("src/app/distribution/entryNavigation.ts");
const publisherSource = readSource("src/app/services/publisher.ts");
const mainSource = readSource("src/main.tsx");
const publicHeaderSources = [
  "src/app/components/Navbar.tsx",
  "src/app/pages/LoginPage.tsx",
  "src/app/pages/ForgotPasswordPage.tsx",
  "src/app/pages/CreatorProfilePage.tsx",
].map(readSource);
const enrollSource = readSource("src/app/distribution/pages/EnrollPage.tsx");
const layoutSource = readSource("src/app/distribution/DistributionLayout.tsx");

test("public distribution links resolve the destination before navigating", () => {
  for (const source of publicHeaderSources) {
    assert.match(source, /useDistributionEntryNavigation\(\)/);
    assert.match(source, /key: "distribution"[\s\S]*?onClick: enterDistribution/);
    assert.doesNotMatch(source, /navigate\("\/distribution"\)/);
    assert.doesNotMatch(source, /to: "\/distribution"/);
  }
});

test("entry status is prefetched and cached before public navigation", () => {
  assert.match(entrySource, /useEffect\(\(\) => \{[\s\S]*?loadPublisherEntryStatus\(\)/);
  assert.match(entrySource, /ENTRY_STATUS_CACHE_MS = 60_000/);
  assert.match(entrySource, /entryStatusCache\?\.appToken === appToken/);
  assert.match(entrySource, /if \(resolvingRef\.current\) return;/);
  assert.match(entrySource, /resolveDistributionEntry[\s\S]*?\.then\(\(decision\)[\s\S]*?navigate\(decision\.path/);
});

test("entry resolver only calls the new read-only preflight endpoint", () => {
  assert.match(entrySource, /ENTRY_REQUEST_TIMEOUT_MS = 3000/);
  assert.match(entrySource, /window\.setTimeout\(\(\) => controller\.abort\(\), ENTRY_REQUEST_TIMEOUT_MS\)/);
  assert.match(entrySource, /getPublisherEntryStatus\(\{ toastOnError: false, signal \}\)/);
  assert.doesNotMatch(entrySource, /ensurePublisherAccess|getPublisherStatus/);
  assert.match(publisherSource, /"\/app\/publisher\/entryStatus"/);
  assert.match(publisherSource, /"ENROLL"[\s\S]*?"APPLICATION_PENDING"[\s\S]*?"APPLICATION_REJECTED"[\s\S]*?"CONSOLE"[\s\S]*?"CONSOLE_2FA"[\s\S]*?"BLOCKED"/);
});

test("two-factor target is handed to the console without triggering preflight side effects", () => {
  assert.match(entrySource, /state: \{ publisherEntryTarget: "CONSOLE_2FA" \}/);
  assert.match(layoutSource, /publisherEntryTarget === "CONSOLE_2FA"/);
  assert.match(layoutSource, /err\.code === 403398[\s\S]*?t\.twoFactor\.bindPhoneFirst/);
});

test("enrollment page keeps its active distribution item on the current page", () => {
  assert.match(enrollSource, /key: "distribution"[\s\S]*?active: true \}/);
  assert.doesNotMatch(enrollSource, /navigate\("\/distribution"\)/);
});

test("blocked entry messages have one global toaster", () => {
  assert.match(mainSource, /<Toaster position="top-center" richColors \/>/);
  assert.equal((mainSource.match(/<Toaster /g) ?? []).length, 1);
});
