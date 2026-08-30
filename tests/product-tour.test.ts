import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("product tour uses one masked overlay with a real transparent cutout", () => {
  const component = read("components/app/product-tour.tsx");
  assert.equal(component.includes('data-tour-overlay="masked"'), true);
  assert.equal(component.includes('data-tour-cutout="true"'), true);
  assert.equal(component.includes('data-tour-dimmer="true"'), true);
  assert.equal(component.includes('data-tour-spotlight="true"'), true);
  assert.equal(component.includes('data-tour-target={targetName}'), true);
  assert.equal(component.includes('fill="black"'), true);
  assert.equal(component.includes('maskType: "luminance"'), true);
  assert.equal(component.includes('mask={`url(#${MASK_ID})`}'), true);
  assert.equal(component.includes('data-tour-shade="top"'), false);
  assert.equal(component.includes("9999px"), false);
  assert.equal(component.includes("boxShadow"), false);
});

test("product tour resolves a target across layout frames and keeps measuring the real element", () => {
  const hook = read("hooks/use-product-tour.ts");
  assert.equal(hook.includes("attempts < 18"), true);
  assert.equal(hook.includes("requestAnimationFrame(resolveTarget)"), true);
  assert.equal(hook.includes("requestAnimationFrame(() => { measure(); })"), true);
  assert.equal(hook.includes("useEffect(() => { measure();"), false);
  assert.equal(hook.includes("scrollIntoView"), true);
  assert.equal(hook.includes("new ResizeObserver"), true);
  assert.equal(hook.includes("observer.observe(targetElement)"), true);
  assert.equal(hook.includes("if (!target) return false"), true);
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
