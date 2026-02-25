export function formatDistance(meters: number): string {
	const miles = meters / 1609.344;
	if (miles < 0.1) {
		const feet = Math.round(meters * 3.28084);
		return `${feet} ft`;
	}
	return `${miles.toFixed(1)} mi`;
}
