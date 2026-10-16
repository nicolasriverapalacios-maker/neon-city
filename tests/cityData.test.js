import test from "node:test";
import assert from "node:assert/strict";
import { DISTRICTS, restoreSignals, tuneSignal } from "../src/cityData.js";

const signalIds = DISTRICTS.filter((district) => district.marker).map(
  (district) => district.id,
);

test("the three signals have unique identifiers and complete district metadata", () => {
  assert.equal(DISTRICTS.length, 4);
  assert.equal(signalIds.length, 3);
  assert.equal(
    new Set(DISTRICTS.map((district) => district.id)).size,
    DISTRICTS.length,
  );
  for (const district of DISTRICTS) {
    assert.equal(district.position.length, 3);
    assert.equal(district.target.length, 3);
    assert.ok(district.name && district.subtitle);
    if (district.marker)
      assert.ok(district.frequency && district.story && district.fragment);
  }
});

test("restoreSignals ignores malformed storage and non-array values", () => {
  for (const raw of [
    undefined,
    null,
    "",
    "{",
    "null",
    "{}",
    "true",
    "42",
    '"core"',
  ]) {
    assert.deepEqual(restoreSignals(raw), []);
  }
});

test("restoreSignals removes duplicates and unknown or non-signal identifiers", () => {
  const raw = JSON.stringify([
    "core",
    "missing",
    "overview",
    null,
    42,
    {},
    "core",
    "harbor",
  ]);
  assert.deepEqual(restoreSignals(raw), ["core", "harbor"]);
});

test("tuneSignal adds once without changing the original collection", () => {
  const original = Object.freeze([]);
  const result = tuneSignal(original, signalIds[0]);
  assert.deepEqual(original, []);
  assert.deepEqual(result, [signalIds[0]]);
  assert.equal(tuneSignal(result, signalIds[0]), result);
});

test("tuneSignal ignores invalid identifiers and the overview", () => {
  const original = Object.freeze(["core"]);
  for (const id of ["missing", "overview", "", null, undefined, 42, {}]) {
    assert.equal(tuneSignal(original, id), original);
  }
});

test("all signals can be collected, persisted, restored and remain complete", () => {
  const collection = signalIds.reduce(tuneSignal, []);
  assert.equal(collection.length, 3);
  assert.deepEqual(collection, signalIds);
  const restored = restoreSignals(JSON.stringify(collection));
  assert.deepEqual(restored, collection);
  for (const id of signalIds) assert.equal(tuneSignal(restored, id), restored);
});
