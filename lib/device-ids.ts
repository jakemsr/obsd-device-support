
export function normalizeDeviceId(value: string): string {
  if (!/^(?:[0-9a-fA-F]{4}|0x[0-9a-fA-F]{4})$/.test(value)) {
    throw new Error(`Invalid device ID: ${value}`);
  }

  return value.startsWith("0x")
    ? value.toLowerCase()
    : `0x${value.toLowerCase()}`;
}
