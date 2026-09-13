import { describe, expect, it } from "vitest";
import { mapProfileLocation } from "../../src/features/country-flags/country";

describe("country mapping", () => {
  it("maps unambiguous aliases and rejects guesses", () => {
    expect(mapProfileLocation("Berlin, Germany")).toMatchObject({ countryCode: "DE", confidence: "estimated" });
    expect(mapProfileLocation("Istanbul")).toBeUndefined();
    expect(mapProfileLocation("internet")).toBeUndefined();
  });
});
