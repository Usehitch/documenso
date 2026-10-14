import { beforeEach, describe, expect, it, vi } from 'vitest';

const findFirst = vi.fn();

vi.mock('@documenso/prisma', () => ({
  prisma: {
    envelope: {
      findFirst: (...args: unknown[]) => findFirst(...args),
    },
  },
}));

import { getDocumentByAccessToken } from './get-document-by-access-token';

beforeEach(() => {
  findFirst.mockReset().mockResolvedValue(null);
});

describe('a QR share token', () => {
  it('resolves to nothing, so the public share page can no longer serve the PDF', async () => {
    await expect(getDocumentByAccessToken({ token: 'qr_stvfuylxwysraksl' })).resolves.toBeNull();
  });

  it('is refused without the database ever being asked', async () => {
    await getDocumentByAccessToken({ token: 'qr_stvfuylxwysraksl' });

    expect(findFirst).not.toHaveBeenCalled();
  });

  it('is refused even when an envelope still carries that token', async () => {
    findFirst.mockResolvedValue({ id: 'envelope-1', secondaryId: 'document_1' });

    await expect(getDocumentByAccessToken({ token: 'qr_anything' })).resolves.toBeNull();
  });
});

describe('every other access token', () => {
  it('still reaches the database', async () => {
    await getDocumentByAccessToken({ token: 'share_abcdefgh' });

    expect(findFirst).toHaveBeenCalledTimes(1);
    expect(findFirst.mock.calls[0]?.[0]?.where?.qrToken).toBe('share_abcdefgh');
  });

  it('is rejected outright when missing', async () => {
    await expect(getDocumentByAccessToken({ token: '' })).rejects.toThrow('Missing token');
  });
});
