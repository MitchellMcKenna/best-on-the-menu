type Location = { lat: number; lng: number; city: string; region: string };

export function getLocationFromHeaders(request: Request): Location | null {
	// Vercel geo headers
	const vercelLat = request.headers.get('x-vercel-ip-latitude');
	const vercelLng = request.headers.get('x-vercel-ip-longitude');
	const vercelCity = request.headers.get('x-vercel-ip-city');
	const vercelRegion = request.headers.get('x-vercel-ip-country-region');

	if (vercelLat && vercelLng) {
		return {
			lat: parseFloat(vercelLat),
			lng: parseFloat(vercelLng),
			city: vercelCity ? decodeURIComponent(vercelCity) : '',
			region: vercelRegion ?? ''
		};
	}

	// Cloudflare geo headers
	const cfLat = request.headers.get('cf-iplatitude');
	const cfLng = request.headers.get('cf-iplongitude');
	const cfCity = request.headers.get('cf-ipcity');
	const cfRegion = request.headers.get('cf-region');

	if (cfLat && cfLng) {
		return {
			lat: parseFloat(cfLat),
			lng: parseFloat(cfLng),
			city: cfCity ?? '',
			region: cfRegion ?? ''
		};
	}

	return null;
}

export async function getLocationFromIp(ip: string): Promise<Location | null> {
	if (
		!ip ||
		ip === '127.0.0.1' ||
		ip === '::1' ||
		ip.startsWith('192.168.') ||
		ip.startsWith('10.')
	) {
		return null;
	}

	try {
		const res = await fetch(`http://ip-api.com/json/${ip}?fields=lat,lon,city,regionName,status`);
		if (!res.ok) return null;

		const data = await res.json();
		if (data.status !== 'success') return null;

		return {
			lat: data.lat,
			lng: data.lon,
			city: data.city ?? '',
			region: data.regionName ?? ''
		};
	} catch {
		return null;
	}
}
