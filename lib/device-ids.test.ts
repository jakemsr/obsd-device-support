import { describe, test, expect } from '@jest/globals';

import { normalizeDeviceId } from "./device-ids";

describe('normalizeDeviceId', () => {

  describe("Invalid device IDs", () => {
    test.each([
      "bda",
      "00bda",
      "0xbda",
      "0x00bda",
      "zzzz",
      "",
    ])("rejects invalid device ID %s", (input) => {
      expect(() => normalizeDeviceId(input)).toThrow();
    });
  });

  describe("Valid device IDs", () => {
    test.each([
      ["0bda", "0x0bda"],
      ["0BDA", "0x0bda"],
      ["0x0bda", "0x0bda"],
      ["0x0BDA", "0x0bda"],
    ])("normalizes %s to %s", (input, expected) => {
      expect(normalizeDeviceId(input)).toBe(expected);
    });
  });

});
