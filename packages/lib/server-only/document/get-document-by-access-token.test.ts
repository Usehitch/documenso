import { beforeEach, describe, expect, it, vi } from 'vitest';

import { prisma } from '@documenso/prisma';

import { getDocumentByAccessToken } from './get-document-by-access-token';

vi.mock('@documenso/prisma', () => ({
  prisma: {
    envelope: {
      findFirst: vi.fn(),
    },
  },
}));

const findFirstMock = vi.mocked(prisma.envelope.findFirst);

describe('getDocumentByAccessToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws when no token is provided', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(getDocumentByAccessToken({ token: '' } as any)).rejects.toThrow('Missing token');
  });

  // SECURITY (EPC-112): QR share tokens must never resolve a document.
  it('returns null for a qr_ prefixed token without querying the database', async () => {
    const result = await getDocumentByAccessToken({ token: 'qr_bzthofnczkummszr' });

    expect(result).toBeNull();
    expect(findFirstMock).not.toHaveBeenCalled();
  });

  it('queries the database for a non-qr access token', async () => {
    findFirstMock.mockResolvedValue(null);

    const result = await getDocumentByAccessToken({ token: 'some-recipient-token' });

    expect(result).toBeNull();
    expect(findFirstMock).toHaveBeenCalledTimes(1);
  });
});
