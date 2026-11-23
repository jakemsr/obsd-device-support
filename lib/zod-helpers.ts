import { z } from 'zod';
import { normalizeDeviceId } from './device-ids';

export function formatFieldName(path: PropertyKey[]): string {
  const key = String(path[path.length - 1] ?? "Field");
  return key
    .replace(/([A-Z])/g, " $1")      // split camelCase
    .replace(/[_-]+/g, " ")          // split snake_case / kebab-case
    .replace(/\b[a-z]/g, (char) => char.toUpperCase())
    .trim();
}

export const requiredString = z.string()
  .refine(value => value.trim().length > 0, 'Required');

export const deviceIdSchema = z.string().transform((value, ctx) => {
  try {
    return normalizeDeviceId(value);
  } catch (error) {
    const message = (error instanceof Error) ? error.message : String(error);
    ctx.addIssue({ code: 'custom', message: message });
    return z.NEVER;
  }
});

export const countSchema = z.string()
  .regex(/^(0|[1-9]\d*)$/, 'Expected a non-negative integer')
  .transform(Number)
  .refine(Number.isSafeInteger, 'Count is too large');

