import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { Prisma } from '@prisma/client';

export const load = (async ({ url }) => {
	const lat = parseFloat(url.searchParams.get('lat') ?? '');
	const lng = parseFloat(url.searchParams.get('lng') ?? '');
	const find = url.searchParams.get('find')?.trim() || '';
	const near = url.searchParams.get('near') || '';
	const selectedCity = url.searchParams.get('city') || '';

	const hasLocation = !isNaN(lat) && !isNaN(lng);

	if (hasLocation) {
		const pattern = find ? `%${find}%` : '';

		const businesses = find
			? await prisma.$queryRaw<
					{
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
						distanceMeters: number;
					}[]
				>(
					Prisma.sql`SELECT id, name, slug, amenity, cuisine, website,
					"streetNumber", street, city, state, postcode, country, hours,
					ST_Distance(location::geography, ST_MakePoint(${lng}, ${lat})::geography) AS "distanceMeters"
					FROM "public"."Business"
					WHERE ST_DWithin(location::geography, ST_MakePoint(${lng}, ${lat})::geography, 16000)
					AND (name ILIKE ${pattern} OR cuisine ILIKE ${pattern})
					ORDER BY "distanceMeters"
					LIMIT 50`
				)
			: await prisma.$queryRaw<
					{
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
						distanceMeters: number;
					}[]
				>(
					Prisma.sql`SELECT id, name, slug, amenity, cuisine, website,
					"streetNumber", street, city, state, postcode, country, hours,
					ST_Distance(location::geography, ST_MakePoint(${lng}, ${lat})::geography) AS "distanceMeters"
					FROM "public"."Business"
					WHERE ST_DWithin(location::geography, ST_MakePoint(${lng}, ${lat})::geography, 16000)
					ORDER BY "distanceMeters"
					LIMIT 50`
				);

		return {
			businesses,
			cities: [] as string[],
			selectedCity: '',
			hasLocation: true,
			nearQuery: near,
			findQuery: find
		};
	}

	// No location — fall back to existing city filter behavior
	const cities = await prisma.$queryRaw<{ city: string }[]>(
		Prisma.sql`SELECT DISTINCT city FROM "public"."Business" WHERE city IS NOT NULL ORDER BY city`
	);

	const businesses = selectedCity
		? await prisma.$queryRaw<
				{
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
				}[]
			>(
				Prisma.sql`SELECT id, name, slug, amenity, cuisine, website,
				"streetNumber", street, city, state, postcode, country, hours
				FROM "public"."Business"
				WHERE city = ${selectedCity}
				ORDER BY name`
			)
		: await prisma.$queryRaw<
				{
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
				}[]
			>(
				Prisma.sql`SELECT id, name, slug, amenity, cuisine, website,
				"streetNumber", street, city, state, postcode, country, hours
				FROM "public"."Business"
				ORDER BY name`
			);

	return {
		businesses,
		cities: cities.map((c) => c.city),
		selectedCity,
		hasLocation: false,
		nearQuery: near,
		findQuery: find
	};
}) satisfies PageServerLoad;
