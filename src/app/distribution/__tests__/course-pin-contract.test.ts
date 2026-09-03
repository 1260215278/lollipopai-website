import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(__dirname, "../../../..");

function read(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}

describe("publisher center course pin contract", () => {
  it("content service exposes setCoursePin to /publisher/course/pin", () => {
    const source = read("src/app/services/content.ts");
    expect(source).toContain("setCoursePin");
    expect(source).toContain("/publisher/course/pin");
    expect(source).toContain("publisherPin");
  });

  it("DramaListView wires pin/unpin menu actions", () => {
    const source = read("src/app/distribution/components/content/DramaListView.tsx");
    expect(source).toContain("onTogglePin");
    expect(source).toContain("actionPin");
    expect(source).toContain("actionUnpin");
    expect(source).toContain("publisherPin === 1");
  });

  it("ContentPage handles pin toggle", () => {
    const source = read("src/app/distribution/pages/ContentPage.tsx");
    expect(source).toContain("handleTogglePin");
    expect(source).toContain("setCoursePin");
    expect(source).toContain("onTogglePin={handleTogglePin}");
  });

  it("i18n provides pin labels for zh/en", () => {
    const source = read("src/app/distribution/i18n/content.ts");
    expect(source).toContain("actionPin: string");
    expect(source).toContain('actionPin: "置顶"');
    expect(source).toContain('actionPin: "Pin to Top"');
  });
});
