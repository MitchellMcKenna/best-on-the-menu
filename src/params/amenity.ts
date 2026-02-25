import type { ParamMatcher } from '@sveltejs/kit';
import { AMENITIES } from '$lib/amenities';

export const match: ParamMatcher = (param) => {
	return param in AMENITIES;
};
