import { redirect } from 'react-router';

import { NEXT_PUBLIC_WEBAPP_URL } from '@documenso/lib/constants/app';

import type { Route } from './+types/share.$slug';

export function meta({ params: { slug } }: Route.MetaArgs) {
  if (slug.startsWith('qr_')) {
    return undefined;
  }

  return [
    { title: 'Documenso - Share' },
    { description: 'I just signed a document in style with Documenso!' },
    {
      property: 'og:title',
      content: 'Documenso - Join the open source signing revolution',
    },
    {
      property: 'og:description',
      content: 'I just signed with Documenso!',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:image',
      content: `${NEXT_PUBLIC_WEBAPP_URL()}/share/${slug}/opengraph`,
    },
    {
      name: 'twitter:site',
      content: '@documenso',
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:image',
      content: `${NEXT_PUBLIC_WEBAPP_URL()}/share/${slug}/opengraph`,
    },
    {
      name: 'twitter:description',
      content: 'I just signed with Documenso!',
    },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  // SECURITY (EPC-112): The public QR share page served signed-document PII with no auth.
  // qr_ slugs are deprecated and now fall through to the redirect below.
  const userAgent = request.headers.get('User-Agent') ?? '';

  if (/bot|facebookexternalhit|WhatsApp|google|bing|duckduckbot|MetaInspector/i.test(userAgent)) {
    return {};
  }

  // Is hardcoded because this whole meta is hardcoded anyway for Documenso.
  throw redirect('https://documenso.com');
};

export default function SharePage() {
  return <div></div>;
}
