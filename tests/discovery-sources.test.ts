import assert from "node:assert/strict";
import test from "node:test";
import { validateDiscoverySource } from "../lib/sources/config.ts";

test("accepts supported source URLs from Notion", () => {
  assert.deepEqual(
    validateDiscoverySource("Luma Tech", "Luma", "https://luma.com/discover/buenos-aires/tech"),
    { name: "Luma Tech", provider: "luma", url: "https://luma.com/discover/buenos-aires/tech" }
  );
  assert.equal(
    validateDiscoverySource("Meetup", "Meetup", "https://www.meetup.com/sysarmy/events/rss/")?.provider,
    "meetup"
  );
  assert.equal(
    validateDiscoverySource("Eventbrite", "Eventbrite", "https://www.eventbrite.com/d/argentina--buenos-aires/tech/")?.provider,
    "eventbrite"
  );
});

test("rejects unknown providers, credentials, insecure or cross-site feeds", () => {
  for (const [name, provider, url] of [
    ["Bad", "Otro", "https://example.org"],
    ["Bad", "Luma", "http://luma.com/buenos-aires"],
    ["Bad", "Luma", "https://luma.com.evil.test/discover"],
    ["Bad", "Luma", "https://a:b@luma.com/discover"],
    ["Bad", "Meetup", "https://www.meetup.com/sysarmy/"],
    ["Bad", "Eventbrite", "not a url"],
  ]) {
    assert.equal(validateDiscoverySource(name, provider, url), null);
  }
});
