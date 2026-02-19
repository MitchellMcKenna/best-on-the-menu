import { fail } from '@sveltejs/kit';
import { importRestaurants } from '$lib/server/osm-read';
import type { Actions } from './$types';

export const actions: Actions = {
	async default() {
		try {
			const { imported, skipped } = await importRestaurants('restaurants.pbf');
			return { imported, skipped };
		} catch (e) {
			console.error('Import failed:', e);
			return fail(500, {
				error: e instanceof Error ? e.message : 'Import failed'
			});
		}
	}
};
