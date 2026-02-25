import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent, data }) => {
	const { session, supabase, user } = await parent();
	if (!session) {
		redirect(303, '/');
	}

	const { data: testTable } = await supabase.from('test').select('*');
	return {
		...data,
		testTable,
		user
	};
};
