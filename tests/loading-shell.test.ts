import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("workspace route loading keeps the existing app shell instead of nesting a second shell", () => {
  const loading = read("app/(workspace)/loading.tsx");
  assert.equal(loading.includes("RouteSkeleton"), true);
  assert.equal(loading.includes("FullAppSkeleton"), false);
});

test("bootstrap skeleton mirrors the real persisted sidebar width", () => {
  const skeleton = read("components/skeletons/page-skeleton.tsx");
  assert.equal(skeleton.includes("useSidebarState"), true);
  assert.equal(skeleton.includes("compactDesktop"), true);
  assert.equal(skeleton.includes("effectiveCollapsed"), true);
  assert.equal(skeleton.includes('effectiveCollapsed ? "md:mr-[64px]" : "md:mr-64"'), true);
  assert.equal(skeleton.includes('effectiveCollapsed ? "w-[64px]" : "w-64"'), true);
});
