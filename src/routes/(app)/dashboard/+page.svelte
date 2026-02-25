<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { AMENITY_TO_SLUG } from '$lib/amenities';
	import { formatDistance } from '$lib/distance';
	import SearchBar from '$lib/components/SearchBar.svelte';

	let { data }: { data: PageData } = $props();
	let user = $derived(data.user);
	let businesses = $derived(data.businesses ?? []);
	let hasLocation = $derived(data.hasLocation);
	let nearQuery = $derived(data.nearQuery ?? '');
	let findQuery = $derived(data.findQuery ?? '');

	let locating = $state(false);
	let locationError = $state('');

	async function useCurrentLocation() {
		locationError = '';
		locating = true;

		if (!navigator.geolocation) {
			locationError = 'Geolocation is not supported by your browser.';
			locating = false;
			return;
		}

		if (navigator.permissions) {
			try {
				const status = await navigator.permissions.query({ name: 'geolocation' });
				if (status.state === 'denied') {
					locationError =
						'Location access is blocked. Click the lock icon in your address bar to allow it.';
					locating = false;
					return;
				}
			} catch {
				// permissions API not available, proceed anyway
			}
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const lat = position.coords.latitude;
				const lng = position.coords.longitude;
				goto(`/dashboard?lat=${lat}&lng=${lng}&near=${encodeURIComponent('Current Location')}`);
				locating = false;
			},
			async () => {
				// Geolocation failed — try IP fallback
				try {
					const res = await fetch('/api/ip-location');
					if (res.ok) {
						const { lat, lng, city, region } = await res.json();
						const near = [city, region].filter(Boolean).join(', ');
						let qs = `/dashboard?lat=${lat}&lng=${lng}`;
						if (near) qs += `&near=${encodeURIComponent(near)}`;
						goto(qs);
					} else {
						locationError = 'Could not determine your location. Please search manually.';
					}
				} catch {
					locationError = 'Could not determine your location. Please search manually.';
				}
				locating = false;
			}
		);
	}

	$effect(() => {
		// On mount: if no location in URL, try to auto-detect
		if (!page.url.searchParams.get('lat')) {
			useCurrentLocation();
		}
	});
</script>

{#if !hasLocation}
	<!-- Hero search state -->
	<div class="flex flex-col items-center justify-center py-20 gap-8">
		<h1 class="text-4xl font-bold text-center">Best On The Menu</h1>

		<div class="w-full max-w-2xl">
			<SearchBar size="lg" currentFind={findQuery} currentNear={nearQuery} />
		</div>

		<div class="divider w-full max-w-xs">OR</div>

		<button class="btn btn-outline" onclick={useCurrentLocation} disabled={locating}>
			{#if locating}
				<span class="loading loading-spinner loading-sm"></span>
				Finding your location...
			{:else}
				Use my current location
			{/if}
		</button>

		{#if locationError}
			<p class="text-error text-sm">{locationError}</p>
		{/if}
	</div>
{:else}
	<!-- Results state -->
	<div class="mb-6 flex flex-col gap-4">
		{#if user}
			<p class="text-sm text-base-content/60">Logged in as {user.email}</p>
		{/if}

		<SearchBar currentFind={findQuery} currentNear={nearQuery} />

		<h2 class="text-xl font-bold">Results ({businesses.length})</h2>
	</div>

	{#if businesses.length === 0}
		<p class="text-base-content/60">
			No businesses found nearby{findQuery ? ` matching "${findQuery}"` : ''}.
		</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="table table-zebra w-full">
				<thead>
					<tr>
						<th>Name</th>
						<th>Cuisine</th>
						<th>Address</th>
						<th>Distance</th>
						<th>Website</th>
					</tr>
				</thead>
				<tbody>
					{#each businesses as biz (biz.id)}
						<tr>
							<td>
								<a
									href="/{biz.amenity
										? (AMENITY_TO_SLUG[biz.amenity] ?? 'businesses')
										: 'businesses'}/{biz.slug}"
									class="link"
								>
									{biz.name}
								</a>
							</td>
							<td>{biz.cuisine ?? '—'}</td>
							<td>
								{[biz.streetNumber, biz.street].filter(Boolean).join(' ')}
								{#if biz.city}, {biz.city}{/if}
								{#if biz.state}
									{biz.state}{/if}
								{#if biz.postcode}
									{biz.postcode}{/if}
							</td>
							<td>{formatDistance(biz.distanceMeters)}</td>
							<td>
								{#if biz.website}
									<a href={biz.website} target="_blank" rel="noopener" class="link">Visit</a>
								{:else}
									—
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
{/if}
