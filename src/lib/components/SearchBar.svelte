<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let {
		size = 'sm',
		currentFind = '',
		currentNear = ''
	}: {
		size?: 'lg' | 'sm';
		currentFind?: string;
		currentNear?: string;
	} = $props();

	let findValue = $derived(currentFind);
	let nearValue = $derived(currentNear);
	let geocoding = $state(false);
	let error = $state('');

	function buildSearchUrl(params: Record<string, string>): string {
		const parts = Object.entries(params)
			.filter(([, v]) => v)
			.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
		return `${page.url.pathname}?${parts.join('&')}`;
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		const near = nearValue.trim();
		const find = findValue.trim();

		const currentLat = page.url.searchParams.get('lat');
		const currentLng = page.url.searchParams.get('lng');
		const currentNearParam = page.url.searchParams.get('near');

		// If near field changed (or no location yet), geocode it
		if (near && near !== currentNearParam) {
			geocoding = true;
			try {
				const res = await fetch(`/api/geocode?q=${encodeURIComponent(near)}`);
				if (!res.ok) {
					error = 'Location not found. Try a different city or address.';
					geocoding = false;
					return;
				}
				const { lat, lng, displayName } = await res.json();
				await goto(
					buildSearchUrl({
						lat: String(lat),
						lng: String(lng),
						near: displayName,
						find
					})
				);
			} catch {
				error = 'Failed to geocode location.';
			} finally {
				geocoding = false;
			}
		} else if (currentLat && currentLng) {
			// Location already set, just update find param
			await goto(
				buildSearchUrl({
					lat: currentLat,
					lng: currentLng,
					near: currentNearParam ?? '',
					find
				})
			);
		} else if (near) {
			// Same near value, no lat/lng yet — re-geocode
			geocoding = true;
			try {
				const res = await fetch(`/api/geocode?q=${encodeURIComponent(near)}`);
				if (!res.ok) {
					error = 'Location not found.';
					geocoding = false;
					return;
				}
				const { lat, lng, displayName } = await res.json();
				await goto(
					buildSearchUrl({
						lat: String(lat),
						lng: String(lng),
						near: displayName,
						find
					})
				);
			} catch {
				error = 'Failed to geocode location.';
			} finally {
				geocoding = false;
			}
		}
	}

	let isLarge = $derived(size === 'lg');
</script>

<form onsubmit={handleSubmit} class="flex {isLarge ? 'flex-col sm:flex-row' : 'flex-row'} gap-2">
	<label class="input {isLarge ? 'input-lg' : ''} input-bordered flex items-center gap-2 flex-1">
		<span class="text-base-content/50 text-sm">Find</span>
		<input type="text" bind:value={findValue} placeholder="tacos, sushi, coffee..." class="grow" />
	</label>
	<label class="input {isLarge ? 'input-lg' : ''} input-bordered flex items-center gap-2 flex-1">
		<span class="text-base-content/50 text-sm">Near</span>
		<input type="text" bind:value={nearValue} placeholder="city, zip, or address..." class="grow" />
	</label>
	<button type="submit" class="btn {isLarge ? 'btn-lg' : ''} btn-primary" disabled={geocoding}>
		{#if geocoding}
			<span class="loading loading-spinner loading-sm"></span>
		{:else}
			Search
		{/if}
	</button>
</form>

{#if error}
	<p class="text-error text-sm mt-2">{error}</p>
{/if}
