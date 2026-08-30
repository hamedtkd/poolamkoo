import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("product tour uses a real transparent spotlight instead of dimming its target", () => {
  const component = read("components/app/product-tour.tsx");
  assert.equal(component.includes('data-tour-shade="top"'), true);
  assert.equal(component.includes('data-tour-shade="bottom"'), true);
  assert.equal(component.includes('data-tour-shade="left"'), true);
  assert.equal(component.includes('data-tour-shade="right"'), true);
  assert.equal(component.includes('data-tour-spotlight="true"'), true);
  assert.equal(component.includes("9999px"), false);
  assert.equal(component.includes("boxShadow"), false);
});

test("every guide card names the page area currently being highlighted", () => {
  const hook = read("hooks/use-product-tour.ts");
  const component = read("components/app/product-tour.tsx");
  assert.equal(hook.includes("location: string"), true);
  assert.equal(component.includes("در حال نمایش: {tour.step.location}"), true);
  assert.equal(component.includes("این بخش · {tour.step.location}"), true);
});

test("desktop search and all mobile tour steps point at controls that remain visible", () => {
  const topbar = read("components/app/app-topbar.tsx");
  const hook = read("hooks/use-product-tour.ts");
  assert.equal(topbar.includes('data-tour="global-search"'), true);
  assert.equal(hook.includes('{ target: \'[data-tour="reports"]\''), false);
  assert.equal(hook.includes('title: "جست‌وجو همیشه در دسترس است"'), true);
});
