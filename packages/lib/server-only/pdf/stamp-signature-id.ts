import type { PDF } from '@libpdf/core';
import { StandardFonts, rgb } from '@libpdf/core';

const STAMP_MARGIN_X = 36;
const STAMP_OFFSET_FROM_TOP = 26;
const STAMP_FONT_SIZE = 7.5;

type SignatureIdField = {
  inserted: boolean;
  secondaryId?: string | null;
  type?: string | null;
};

/**
 * The id the lender prints on the document and quotes back when asked which signature
 * produced it. It is the secondaryId of a signature field that was actually inserted,
 * so it exists only once every signer is done — which is exactly when sealing runs.
 */
export const envelopeSignatureId = (fields: SignatureIdField[]): string | null => {
  const signed = fields.find(
    (field) =>
      field.inserted &&
      field.secondaryId &&
      (field.type === 'SIGNATURE' || field.type === 'FREE_SIGNATURE'),
  );

  const fallback = fields.find((field) => field.inserted && field.secondaryId);

  return signed?.secondaryId ?? fallback?.secondaryId ?? null;
};

export const signatureIdStampLabel = (signatureId: string) => `Signature ID: ${signatureId}`;

export const drawSignatureIdOnEveryPage = (pdf: PDF, signatureId: string): number => {
  const trimmed = signatureId.trim();

  if (!trimmed) {
    return 0;
  }

  const label = signatureIdStampLabel(trimmed);
  const pageCount = pdf.getPageCount();

  let stamped = 0;

  for (let index = 0; index < pageCount; index++) {
    const page = pdf.getPage(index);

    if (!page) {
      continue;
    }

    stamped += 1;

    page.drawText(label, {
      x: STAMP_MARGIN_X,
      y: page.height - STAMP_OFFSET_FROM_TOP,
      size: STAMP_FONT_SIZE,
      font: StandardFonts.Helvetica,
      color: rgb(0.4, 0.42, 0.47),
    });
  }

  return stamped;
};
