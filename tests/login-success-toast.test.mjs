import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readSource = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("login success toast auto-dismisses in 2s and has a close button", () => {
  const loginSource = readSource("src/app/pages/LoginPage.tsx");
  assert.match(
    loginSource,
    /toast\.success\(\s*isRegister \? t\.registerSuccess : t\.loginSuccess,\s*\{\s*duration:\s*2000,\s*closeButton:\s*true,/
  );
  assert.match(loginSource, /window\.setTimeout\(\(\) => toast\.dismiss\(toastId\), 2000\)/);
});

test("toaster lets nav clicks pass through except the close icon", () => {
  const toasterSource = readSource("src/app/components/ui/sonner.tsx");
  const cssSource = readSource("src/styles/index.css");
  const mainSource = readSource("src/main.tsx");
  assert.match(toasterSource, /closeButton/);
  assert.match(toasterSource, /pointer-events-none/);
  assert.match(toasterSource, /closeButton:\s*"pointer-events-auto"/);
  assert.match(cssSource, /\[data-sonner-toaster\][\s\S]*pointer-events:\s*none;/);
  assert.match(cssSource, /\[data-close-button\]\s*\{\s*pointer-events:\s*auto;/);
  assert.match(mainSource, /<Toaster position="top-center" richColors closeButton offset="80px" mobileOffset="72px" \/>/);
});

test("toast close icon sits at the top-right corner", () => {
  const cssSource = readSource("src/styles/index.css");
  assert.match(cssSource, /--toast-close-button-start:\s*unset;/);
  assert.match(cssSource, /--toast-close-button-end:\s*0;/);
  assert.match(cssSource, /--toast-close-button-transform:\s*translate\(35%,\s*-35%\);/);
  assert.match(
    cssSource,
    /\[data-close-button\]\s*\{[\s\S]*left:\s*unset;[\s\S]*right:\s*0;[\s\S]*transform:\s*translate\(35%,\s*-35%\);/
  );
});
