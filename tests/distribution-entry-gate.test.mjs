import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("../src/app/distribution/DistributionLayout.tsx", import.meta.url),
  "utf8",
);

test("distribution entry renders the two-factor gate only for a confirmed 2FA target", () => {
  assert.match(source, /\) : !tokenReady && \(twoFactorChallenge \|\| expectsTwoFactor\) \? \(\s*<TwoFactorGate/);
  assert.doesNotMatch(source, /\) : !tokenReady && isAppAuthed\(\) \? \(\s*<TwoFactorGate/);
  assert.match(source, /challenge: PublisherTwoFactorChallenge \| null;/);
  assert.match(source, /publisherEntryTarget === "CONSOLE_2FA"/);
});

test("distribution entry keeps a neutral loading state while publisher access is unresolved", () => {
  assert.match(
    source,
    /\) : tokenReady && memberReady[\s\S]*?<Outlet[\s\S]*?: \(\s*<div className="h-full flex items-center justify-center">\s*<Loader2/,
  );
});
