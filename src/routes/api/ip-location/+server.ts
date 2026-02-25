import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLocationFromHeaders, getLocationFromIp } from '$lib/server/ip-location';

export const GET: RequestHandler = async ({ request, getClientAddress }) => {
	const fromHeaders = getLocationFromHeaders(request);
	if (fromHeaders) {
		return json(fromHeaders);
	}

	try {
		const ip = getClientAddress();
		const fromIp = await getLocationFromIp(ip);
		if (fromIp) {
			return json(fromIp);
		}
	} catch {
		// getClientAddress() can throw in some environments
	}

	return json({ error: 'Could not determine location' }, { status: 404 });
};
