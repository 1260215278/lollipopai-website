import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readSource = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const httpSource = readSource("src/app/services/http.ts");
const contentSource = readSource("src/app/services/content.ts");
const listSource = readSource("src/app/distribution/components/content/DramaListView.tsx");
const pageSource = readSource("src/app/distribution/pages/ContentPage.tsx");
const formSource = readSource("src/app/distribution/components/content/UploadForm.tsx");
const detailSource = readSource("src/app/distribution/components/content/DramaDetailView.tsx");
const episodesSource = readSource("src/app/distribution/components/content/EpisodesView.tsx");
const i18nSource = readSource("src/app/distribution/i18n/content.ts");

test("list/detail/episodes contracts include canEdit and canResubmit", () => {
  assert.match(contentSource, /canEdit: boolean;/);
  assert.match(contentSource, /canResubmit: boolean;/);
  assert.match(contentSource, /removedEpisodeCount: number;/);
  assert.match(contentSource, /resubmitted: boolean;/);
  assert.match(contentSource, /onShelfNow: boolean;/);
  assert.match(contentSource, /publish: DraftPublish;/);
});

test("http layer exposes bizCode for publisher write-error branching", () => {
  assert.match(httpSource, /bizCode\?: string;/);
  assert.match(httpSource, /export function getApiBizCode/);
  assert.match(httpSource, /throw new ApiError\(json\.code, json\.msg, json\.bizCode\)/);
  assert.match(formSource, /getApiBizCode\(err\) === key/);
  assert.match(formSource, /publisher_course_not_editable/);
  assert.match(formSource, /publisher_course_episodes_locked/);
  assert.match(formSource, /publisher_course_title_duplicate/);
  assert.doesNotMatch(formSource, /err\.message\.includes\(key\)/);
});

test("rejected list row shows edit-and-resubmit only when canEdit and canResubmit", () => {
  assert.match(listSource, /t\.actionResubmit/);
  assert.match(listSource, /canUploadCourse && drama\.canEdit === true && drama\.canResubmit === true/);
  assert.match(pageSource, /getUploadTaskByCourseId/);
  assert.match(pageSource, /createUploadTask\(\{[\s\S]*?courseId,[\s\S]*?step: 1/);
  assert.match(detailSource, /detail\.canEdit === true && detail\.canResubmit === true/);
  assert.match(detailSource, /t\.actionResubmit/);
});

test("episode edit buttons follow canEdit from API, not shelfStatus", () => {
  assert.match(episodesSource, /data\?\.canEdit === true/);
  assert.doesNotMatch(episodesSource, /shelfStatus/);
  assert.doesNotMatch(episodesSource, /AuditStatus\.DRAFT/);
});

test("rejected upload form reuses courseId, unlocks planned episodes, and confirms shrinking", () => {
  assert.match(formSource, /auditStatus === AuditStatus\.REJECTED/);
  assert.match(formSource, /plannedLocked = auditStatus === AuditStatus\.DRAFT && courseId !== null/);
  assert.match(formSource, /episodesReduceConfirm/);
  assert.match(formSource, /if \(isRejected\) return;/);
  assert.match(formSource, /onShelfNow: pubConfig\.onShelfNow/);
  assert.match(formSource, /draft\.publish\.publishScope/);
  assert.match(formSource, /res\.resubmitted \? t\.resubmitSuccess : t\.submitSuccess/);
  assert.match(formSource, /isRejected \? t\.resubmitTitle : t\.uploadTitle/);
});

test("rejected-resubmit copy exists in every supported locale", () => {
  assert.equal((i18nSource.match(/actionResubmit:/g) ?? []).length, 7);
  assert.equal((i18nSource.match(/resubmitTitle:/g) ?? []).length, 7);
  assert.equal((i18nSource.match(/submitResubmit:/g) ?? []).length, 7);
  assert.equal((i18nSource.match(/resubmitSuccess:/g) ?? []).length, 7);
  assert.equal((i18nSource.match(/episodesReduceConfirm:/g) ?? []).length, 7);
  assert.equal((i18nSource.match(/episodesUnlockHint:/g) ?? []).length, 7);
  assert.equal((i18nSource.match(/rejectEditHint:/g) ?? []).length, 7);
  assert.match(i18nSource, /actionResubmit: "修改并重新提交"/);
  assert.match(i18nSource, /计划集数将从 \{from\} 集减少为 \{to\} 集/);
});
