export async function geocode(
	query: string
): Promise<{ lat: number; lng: number; displayName: string } | null> {
	const url = new URL('https://nominatim.openstreetmap.org/search');
	url.searchParams.set('q', query);
	url.searchParams.set('format', 'json');
	url.searchParams.set('limit', '1');
	url.searchParams.set('countrycodes', 'us');

	const res = await fetch(url, {
		headers: { 'User-Agent': 'BestOnTheMenu/1.0' }
	});

	if (!res.ok) return null;

	const results = await res.json();
	if (!results.length) return null;

	const { lat, lon, display_name } = results[0];
	return { lat: parseFloat(lat), lng: parseFloat(lon), displayName: display_name };
}
