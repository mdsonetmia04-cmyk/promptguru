import { describe, it, expect } from "vitest";
import {
  validateTitle,
  validateKeywords,
  validateFilename,
  scoreMetadata,
  buildAdobeCsv,
  parseKeywordInput,
  ADOBE_CATEGORIES,
  categoryName,
  TITLE_MAX,
  KEYWORD_MAX,
} from "@/lib/adobe";

describe("Adobe categories", () => {
  it("has 21 categories with sequential ids", () => {
    expect(ADOBE_CATEGORIES).toHaveLength(21);
    expect(ADOBE_CATEGORIES.map((c) => c.id)).toEqual(
      Array.from({ length: 21 }, (_, i) => i + 1)
    );
  });

  it("resolves category names", () => {
    expect(categoryName(11)).toBe("Landscape");
    expect(categoryName(99)).toBe("Unknown");
  });
});

describe("validateTitle", () => {
  it("fails on empty title", () => {
    expect(validateTitle("").some((c) => c.level === "fail")).toBe(true);
  });

  it("fails over 200 chars", () => {
    const checks = validateTitle("a".repeat(TITLE_MAX + 1));
    expect(checks.some((c) => c.level === "fail")).toBe(true);
  });

  it("warns over ~70 chars but passes the hard limit", () => {
    const checks = validateTitle("a".repeat(120));
    expect(checks.some((c) => c.level === "fail")).toBe(false);
    expect(checks.some((c) => c.level === "warn")).toBe(true);
  });

  it("passes a good title", () => {
    const checks = validateTitle("Red fox running through fresh snow at sunrise");
    expect(checks.some((c) => c.level === "fail")).toBe(false);
  });

  it("flags keyword-list titles", () => {
    const checks = validateTitle("fox, red, snow, winter, animal, wild, nature, cute");
    expect(checks.some((c) => c.level === "fail")).toBe(true);
  });
});

describe("validateKeywords", () => {
  it("fails on empty list", () => {
    expect(validateKeywords([]).some((c) => c.level === "fail")).toBe(true);
  });

  it("fails over 49 keywords", () => {
    const kws = Array.from({ length: KEYWORD_MAX + 1 }, (_, i) => `keyword${i}`);
    expect(validateKeywords(kws).some((c) => c.level === "fail")).toBe(true);
  });

  it("fails on duplicates (case-insensitive)", () => {
    const checks = validateKeywords(["Fox", "fox", "snow"]);
    expect(checks.some((c) => c.level === "fail" && c.message.includes("Duplicate"))).toBe(true);
  });

  it("warns on camera specs", () => {
    const checks = validateKeywords(["fox", "snow", "50mm", "wildlife"]);
    expect(checks.some((c) => c.level === "warn")).toBe(true);
  });

  it("passes a clean ideal set", () => {
    const kws = ["fox", "red fox", "wildlife", "snow", "winter", "sunrise", "animal", "mammal",
      "nature", "forest", "cold", "morning", "running", "motion", "fur", "orange", "white",
      "landscape", "outdoors", "wild"];
    const checks = validateKeywords(kws);
    expect(checks.some((c) => c.level === "fail")).toBe(false);
  });
});

describe("validateFilename", () => {
  it("fails over 30 chars", () => {
    expect(validateFilename("a".repeat(31) + ".jpg").some((c) => c.level === "fail")).toBe(true);
  });

  it("passes a normal filename", () => {
    expect(validateFilename("red-fox-snow.jpg").some((c) => c.level === "fail")).toBe(false);
  });
});

describe("scoreMetadata", () => {
  it("scores a perfect asset at 100", () => {
    const kws = ["fox", "red fox", "wildlife", "snow", "winter", "sunrise", "animal", "mammal",
      "nature", "forest", "cold", "morning", "running", "motion", "fur", "orange", "white",
      "landscape", "outdoors", "wild"];
    const { score } = scoreMetadata("Red fox running through fresh snow at sunrise", kws);
    expect(score).toBe(100);
  });

  it("penalizes failures heavily", () => {
    const { score } = scoreMetadata("", []);
    expect(score).toBeLessThan(75);
  });
});

describe("buildAdobeCsv", () => {
  it("uses Adobe's exact headers and column order", () => {
    const csv = buildAdobeCsv([
      { filename: "fox.jpg", title: "Red fox in snow", keywords: ["fox", "snow"], categoryId: 1 },
    ]);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("Filename,Title,Keywords,Category,Releases");
    expect(lines[1]).toBe('"fox.jpg","Red fox in snow","fox, snow",1,');
  });

  it("strips commas from titles for CSV safety", () => {
    const csv = buildAdobeCsv([
      { filename: "a.jpg", title: "Fox, red, snow", keywords: ["fox"], categoryId: 1 },
    ]);
    expect(csv).not.toContain('"Fox, red, snow"');
  });
});

describe("parseKeywordInput", () => {
  it("splits on commas and newlines", () => {
    expect(parseKeywordInput("fox, snow\nwinter,  forest")).toEqual([
      "fox",
      "snow",
      "winter",
      "forest",
    ]);
  });
});
