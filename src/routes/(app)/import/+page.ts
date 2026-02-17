import type { PageLoad } from './$types';
// import { createOSMStream } from 'osm-pbf-parser-node';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent }) => {
	const { session, supabase } = await parent();
	if (!session) {
		throw redirect(303, '/');
	}

	// TODO:: Move this to another function, not page load.
	// for await (const item of createOSMStream('restaurants.pbf'))
	// 	console.log(item);

	return {
		user: session.user
	};
};
