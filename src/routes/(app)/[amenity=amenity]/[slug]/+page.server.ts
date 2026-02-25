import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { AMENITIES } from '$lib/amenities';

export const load = (async ({ params }) => {
	const { label } = AMENITIES[params.amenity];
	const business = await prisma.business.findFirst({ where: { slug: params.slug } });

	if (business) {
		return { business, amenityLabel: label, amenitySlug: params.amenity };
	}

	error(404, 'Not found');
}) satisfies PageServerLoad;
