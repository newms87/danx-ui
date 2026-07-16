import { describe, it, expect } from "vitest";
import { passwordStrength } from "../passwordStrength";

describe("passwordStrength", () => {
  it("returns score 0 / Weak for an empty string", () => {
    expect(passwordStrength("")).toEqual({ score: 0, label: "Weak" });
  });

  it("returns score 0 for a very short single-class password", () => {
    expect(passwordStrength("ab").score).toBe(0);
  });

  it("scores a long single-class password higher than a short one", () => {
    const short = passwordStrength("abc").score;
    const long = passwordStrength("hbdfjlnpqrtvwxz").score;
    expect(long).toBeGreaterThan(short);
  });

  it("awards points for length >= 8", () => {
    const under = passwordStrength("hbdfjln").score;
    const over = passwordStrength("hbdfjlnp").score;
    expect(over).toBeGreaterThan(under);
  });

  it("awards points for length >= 12", () => {
    const under = passwordStrength("hbdfjlnp1!").score;
    const over = passwordStrength("hbdfjlnp1!hb").score;
    expect(over).toBeGreaterThan(under);
  });

  it("awards points for 3+ character classes", () => {
    const oneClass = passwordStrength("hbdfjlnp").score;
    const threeClasses = passwordStrength("hbdfJlnp1").score;
    expect(threeClasses).toBeGreaterThan(oneClass);
  });

  it("awards additional point for all 4 character classes", () => {
    const threeClasses = passwordStrength("hbdfJlnp1").score;
    const fourClasses = passwordStrength("hbdfJlnp1!").score;
    expect(fourClasses).toBeGreaterThan(threeClasses);
  });

  it("scores a long, varied password as Strong", () => {
    const result = passwordStrength("Xk9$mQp2#vRt7!zL");
    expect(result.score).toBe(4);
    expect(result.label).toBe("Strong");
  });

  it("penalizes common passwords even when length/variety look fine", () => {
    const common = passwordStrength("password1").score;
    const uncommon = passwordStrength("xqzjkvpl1").score;
    expect(common).toBeLessThan(uncommon);
  });

  it("penalizes common passwords matched case-insensitively", () => {
    expect(passwordStrength("Password1").score).toBeLessThan(passwordStrength("Xqzjkvpl1").score);
  });

  it("penalizes ascending sequential runs", () => {
    const sequential = passwordStrength("abcdefgh1!").score;
    const nonSequential = passwordStrength("hbdfjlnp1!").score;
    expect(sequential).toBeLessThan(nonSequential);
  });

  it("penalizes descending sequential runs", () => {
    const sequential = passwordStrength("hgfedcba1!").score;
    const nonSequential = passwordStrength("hbdfjlnp1!").score;
    expect(sequential).toBeLessThan(nonSequential);
  });

  it("penalizes repeated character runs", () => {
    const repeated = passwordStrength("aaaaEfg1!").score;
    const varied = passwordStrength("abcdEfg1!").score;
    expect(repeated).toBeLessThan(varied);
  });

  it("never returns a score below 0", () => {
    expect(passwordStrength("password").score).toBeGreaterThanOrEqual(0);
  });

  it("never returns a score above 4", () => {
    expect(passwordStrength("Xk9$mQp2#vRt7!zL").score).toBeLessThanOrEqual(4);
  });

  it.each([
    [0, ""],
    [1, "abcdefgh1!"],
    [2, "abcdEfg1!"],
    [3, "abcdEfg1!zyx"],
    [4, "Xk9$mQp2#vRt7!zL"],
  ])("maps score %i to its label", (score, input) => {
    const labels = ["Weak", "Weak", "Fair", "Good", "Strong"];
    const result = passwordStrength(input);
    expect(result.score).toBe(score);
    expect(result.label).toBe(labels[score]);
  });
});
