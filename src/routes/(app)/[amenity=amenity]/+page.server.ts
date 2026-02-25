import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { Prisma } from '@prisma/client';
import { AMENITIES } from '$lib/amenities';

export const load = (async ({ params, url }) => {
	const { dbValue, label } = AMENITIES[params.amenity];
	const selectedCity = url.searchParams.get('city') || '';

	const cities = await prisma.$queryRaw<{ city: string }[]>(
		Prisma.sql`SELECT DISTINCT city FROM "public"."Business"
			WHERE amenity = ${dbValue} AND city IS NOT NULL
			ORDER BY city`
	);

	const businesses = selectedCity
		? await prisma.$queryRaw<
				{
					id: number;
					name: string;
					slug: string;
					cuisine: string | null;
					website: string | null;
					streetNumber: string | null;
					street: string | null;
					city: string | null;
					state: string | null;
					postcode: string | null;
					country: string | null;
					hours: string | null;
				}[]
			>(
				Prisma.sql`SELECT id, name, slug, cuisine, website,
				"streetNumber", street, city, state, postcode, country, hours
				FROM "public"."Business"
				WHERE amenity = ${dbValue} AND city = ${selectedCity}
				ORDER BY name`
			)
		: await prisma.$queryRaw<
				{
					id: number;
					name: string;
					slug: string;
					cuisine: string | null;
					website: string | null;
					streetNumber: string | null;
					street: string | null;
					city: string | null;
					state: string | null;
					postcode: string | null;
					country: string | null;
					hours: string | null;
				}[]
			>(
				Prisma.sql`SELECT id, name, slug, cuisine, website,
				"streetNumber", street, city, state, postcode, country, hours
				FROM "public"."Business"
				WHERE amenity = ${dbValue}
				ORDER BY name`
			);

	return {
		businesses,
		cities: cities.map((c) => c.city),
		selectedCity,
		amenityLabel: label,
		amenitySlug: params.amenity
	};
}) satisfies PageServerLoad;
