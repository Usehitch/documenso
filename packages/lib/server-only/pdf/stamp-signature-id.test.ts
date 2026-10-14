import { describe, expect, it } from 'vitest';

import { envelopeSignatureId, signatureIdStampLabel } from './stamp-signature-id';

const field = (over: Record<string, unknown> = {}) => ({
  inserted: true,
  secondaryId: 'CMT7K4X3A05KSMTFC6G06TGF6',
  type: 'SIGNATURE',
  ...over,
});

describe('the id printed on every page', () => {
  it('comes from a signature the signer actually placed', () => {
    expect(envelopeSignatureId([field()])).toBe('CMT7K4X3A05KSMTFC6G06TGF6');
  });

  it('ignores a signature field nobody filled in', () => {
    expect(envelopeSignatureId([field({ inserted: false })])).toBeNull();
  });

  it('prefers the signature over any other filled field', () => {
    const id = envelopeSignatureId([
      field({ type: 'TEXT', secondaryId: 'a-text-field' }),
      field({ type: 'SIGNATURE', secondaryId: 'the-signature' }),
    ]);

    expect(id).toBe('the-signature');
  });

  it('accepts a drawn free signature just the same', () => {
    expect(envelopeSignatureId([field({ type: 'FREE_SIGNATURE' })])).toBe(
      'CMT7K4X3A05KSMTFC6G06TGF6',
    );
  });

  it('falls back to another filled field when no signature carries an id', () => {
    const id = envelopeSignatureId([
      field({ type: 'SIGNATURE', secondaryId: null }),
      field({ type: 'DATE', secondaryId: 'the-date-field' }),
    ]);

    expect(id).toBe('the-date-field');
  });

  it('says there is no id rather than inventing one', () => {
    expect(envelopeSignatureId([])).toBeNull();
    expect(envelopeSignatureId([field({ secondaryId: null })])).toBeNull();
  });

  it('is printed in the form the lender quotes back', () => {
    expect(signatureIdStampLabel('CMT7K4X3A05KSMTFC6G06TGF6')).toBe(
      'Signature ID: CMT7K4X3A05KSMTFC6G06TGF6',
    );
  });
});
