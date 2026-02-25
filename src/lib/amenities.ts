export const AMENITIES: Record<string, { dbValue: string; label: string }> = {
	restaurants: { dbValue: 'restaurant', label: 'Restaurants' },
	'fast-food': { dbValue: 'fast_food', label: 'Fast Food' },
	cafes: { dbValue: 'cafe', label: 'Cafes' },
	pubs: { dbValue: 'pub', label: 'Pubs' },
	bars: { dbValue: 'bar', label: 'Bars' }
};

/** Reverse lookup: DB amenity value -> URL slug */
export const AMENITY_TO_SLUG: Record<string, string> = Object.fromEntries(
	Object.entries(AMENITIES).map(([slug, { dbValue }]) => [dbValue, slug])
);
