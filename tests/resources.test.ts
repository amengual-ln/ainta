import test from "node:test";
import assert from "node:assert/strict";
import {
  resourceCategoryOrder,
  resources,
} from "../lib/resources.ts";

test("el catálogo no repite URLs", () => {
  assert.equal(
    new Set(resources.map((resource) => resource.url)).size,
    resources.length,
  );
});

test("cada categoría tiene exactamente un recurso destacado", () => {
  for (const category of resourceCategoryOrder) {
    assert.equal(
      resources.filter((resource) => resource.category === category && resource.featured).length,
      1,
      category,
    );
  }
});
