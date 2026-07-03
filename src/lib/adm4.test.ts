import { describe, it, expect } from "vitest";
import { isValidAdm4 } from "./adm4";

describe("isValidAdm4", () => {
  it("returns true for valid Jakarta adm4", () => {
    expect(isValidAdm4("31.71.03.1001")).toBe(true);
  });

  it("returns true for valid Bandung adm4", () => {
    expect(isValidAdm4("32.73.01.1001")).toBe(true);
  });

  it("returns false for adm4 with letters", () => {
    expect(isValidAdm4("31.71.0a.1001")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidAdm4("")).toBe(false);
  });

  it("returns false for too short code", () => {
    expect(isValidAdm4("31.71.03")).toBe(false);
  });

  it("returns false for too long code", () => {
    expect(isValidAdm4("31.71.03.10011")).toBe(false);
  });

  it("returns false for missing dots", () => {
    expect(isValidAdm4("3171031001")).toBe(false);
  });

  it("returns false for null-like input (empty after trim)", () => {
    expect(isValidAdm4("   ")).toBe(false);
  });
});
