import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { geocode } from '$lib/server/geocode';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim();

	if (!q) {
		return json({ error: 'Missing q parameter' }, { status: 400 });
	}

	const result = await geocode(q);

	if (!result) {
		return json({ error: 'Location not found' }, { status: 404 });
	}

	return json(result);
};
