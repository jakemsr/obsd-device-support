import { beforeAll, beforeEach, describe, expect, jest, test } from '@jest/globals';

const mockGetUserId = jest.fn<() => Promise<string | null>>();
const mockReportCreate = jest.fn<(args: unknown) => Promise<{ id: bigint }>>();
const mockSourceCreate = jest.fn<(args: unknown) => Promise<{ id: bigint }>>();
const mockFormCreate = jest.fn<(args: unknown) => Promise<{ id: bigint }>>();
const mockDeviceCreate = jest.fn<(args: unknown) => Promise<{ id: bigint }>>();
const mockIssueCreate = jest.fn<(args: unknown) => Promise<{ id: bigint }>>();
const mockNameCreate = jest.fn<(args: unknown) => Promise<{ id: bigint }>>();

jest.mock('@/lib/check-user-auth', () => ({ getUserId: mockGetUserId }));
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    reports: { create: mockReportCreate },
    report_sources: { create: mockSourceCreate },
    form_reports: { create: mockFormCreate },
    reported_devices: { create: mockDeviceCreate },
    reported_issues: { create: mockIssueCreate },
    reported_other_device_names: { create: mockNameCreate },
  },
}));

let reportSubmission: typeof import('./actions').reportSubmission;

beforeAll(async () => {
  ({ reportSubmission } = await import('./actions'));
});

function validForm() {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    user_id: 'user',
    reason: 'New device',
    bus: 'USB',
    vendor_id: '0BDA',
    product_id: '0xF179',
    reported_vendor: '',
    reported_product: '',
    reported_driver: 'urtwn',
    support_status: 'supported',
    source_name: '',
    source_type: 'observation',
    numIssues: '1',
    issue0: 'Connection drops',
    numOtherNames: '1',
    otherNameVendor0: '',
    otherNameProduct0: 'Alternate name',
  })) form.set(key, value);
  return form;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUserId.mockResolvedValue('user');
  for (const mock of [mockReportCreate, mockSourceCreate, mockFormCreate, mockDeviceCreate, mockIssueCreate, mockNameCreate]) {
    mock.mockResolvedValue({ id: BigInt(1) });
  }
});

describe('reportSubmission validation', () => {
  test('accepts valid form fields and normalizes device IDs', async () => {
    expect((await reportSubmission(validForm())).success).toBe(true);
    expect(mockDeviceCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ vendor_id: '0x0bda', product_id: '0xf179' }),
    }));
    expect(mockSourceCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ url: null }),
    }));
    expect(mockIssueCreate).toHaveBeenCalledTimes(1);
    expect(mockNameCreate).toHaveBeenCalledTimes(1);
  });

  test.each([
    ['vendor_id', '123'],
    ['bus', 'invalid'],
    ['support_status', 'invalid'],
    ['source_type', 'invalid'],
    ['numIssues', '1garbage'],
    ['numOtherNames', '999999999999999999999999'],
  ])('rejects invalid %s before writing', async (key, value) => {
    const form = validForm();
    form.set(key, value);
    expect((await reportSubmission(form)).success).toBe(false);
    expect(mockReportCreate).not.toHaveBeenCalled();
  });

  test('rejects missing indexed fields and file values', async () => {
    const form = validForm();
    form.delete('otherNameProduct0');
    expect((await reportSubmission(form)).success).toBe(false);
    form.set('otherNameProduct0', 'Alternate name');
    form.set('issue0', new Blob(['not a string']));
    expect((await reportSubmission(form)).success).toBe(false);
    expect(mockReportCreate).not.toHaveBeenCalled();
  });

  test('rejects a user who is not authenticated as the submitted user', async () => {
    mockGetUserId.mockResolvedValue('someone else');
    expect((await reportSubmission(validForm())).error).toBe('Unauthorized');
    expect(mockReportCreate).not.toHaveBeenCalled();
  });
});
