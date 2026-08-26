import test from "node:test";
import assert from "node:assert/strict";
import {
  LOCAL_DATA_BLOCKED_CODE,
  LOCAL_DATA_TIMEOUT_CODE,
  LOCAL_DATA_VERSION_CHANGE_CODE,
  classifyLocalDataIssue,
} from "../lib/local-data-issues.ts";

test("local data failures choose safe retry versus reload actions", () => {
  assert.deepEqual(classifyLocalDataIssue(new Error(LOCAL_DATA_TIMEOUT_CODE)).action, "retry");
  assert.deepEqual(classifyLocalDataIssue(new Error(LOCAL_DATA_BLOCKED_CODE)).kind, "blocked");
  assert.deepEqual(classifyLocalDataIssue(new Error(LOCAL_DATA_VERSION_CHANGE_CODE)).action, "reload");
});

test("browser VersionError is treated as an outdated app tab", () => {
  const error = new Error("database version is newer");
  error.name = "VersionError";
  const issue = classifyLocalDataIssue(error);
  assert.equal(issue.kind, "outdated");
  assert.equal(issue.action, "reload");
  assert.match(issue.message ?? "", /تازه‌سازی/);
});
