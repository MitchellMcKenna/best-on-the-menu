import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load = (async ({ params }) => {
  const business = await prisma.business.findFirst({ where: { slug: params.slug }});

  if (business) {
    return { business: business };
  }

  throw error(404, 'Not found');
}) satisfies PageServerLoad;