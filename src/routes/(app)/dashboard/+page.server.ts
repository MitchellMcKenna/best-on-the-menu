import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { Business, Prisma } from "@prisma/client";

export const load = (async ({ params }) => {
  // TODO:: DO search based on lat/long from businesses
  // TODO:: Replace this boilerplate for a single business with multiple businesses found.

  // @ts-ignore
  const fields = prisma.business.fields;

  const fieldNames = Object.keys(fields);

  const fieldNamesList = fieldNames.join("', '");
  //const fieldNamesList = 'id, slug, name';

  console.log(fieldNamesList);

  //const business = await prisma.business.findFirst({ where: { slug: params.slug }});
  const businesses = await prisma.$queryRaw<Business[]>(
    Prisma.sql`SELECT '${fieldNamesList}'
        FROM "public"."Business"
        WHERE ST_DWithin( "Business".location, ST_MakePoint(-121.155967,38.7593143)::geography, 6000 )
        `
  );

  console.log(JSON.stringify(businesses));

  return {};

  // if (business) {
  //   return { business: business };
  // }

  throw error(404, 'Not found');
}) satisfies PageServerLoad;