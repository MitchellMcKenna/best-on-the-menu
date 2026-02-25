import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { Prisma } from "@prisma/client";

export const load = (async () => {
  // TODO:: search based on user's actual lat/long
  const businesses = await prisma.$queryRaw<{
    id: number;
    name: string;
    slug: string;
    amenity: string | null;
    cuisine: string | null;
    website: string | null;
    streetNumber: string | null;
    street: string | null;
    city: string | null;
    state: string | null;
    postcode: string | null;
    country: string | null;
    hours: string | null;
  }[]>(
    Prisma.sql`SELECT id, name, slug, amenity, cuisine, website,
        "streetNumber", street, city, state, postcode, country, hours
        FROM "public"."Business"
        WHERE ST_DWithin(location::geography, ST_MakePoint(-121.155967, 38.7593143)::geography, 6000)
        ORDER BY name
        LIMIT 50`
  );

  return { businesses };
}) satisfies PageServerLoad;
