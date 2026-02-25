import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/prisma';
import { Prisma } from '@prisma/client';

export const GET: RequestHandler = async ({ url }) => {
	const lat = parseFloat(url.searchParams.get('lat') ?? '');
	const lng = parseFloat(url.searchParams.get('lng') ?? '');
	const find = url.searchParams.get('find')?.trim() || '';

	if (isNaN(lat) || isNaN(lng)) {
		return json({ error: 'Missing or invalid lat/lng parameters' }, { status: 400 });
	}

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
				WHERE ST_DWithin(location::geography, ST_MakePoint(${lng}, ${lat})::geography, 6000)
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
				WHERE ST_DWithin(location::geography, ST_MakePoint(${lng}, ${lat})::geography, 6000)
				ORDER BY "distanceMeters"
				LIMIT 50`
			);

	return json({ businesses });
};
