<script lang="ts">
	import type { PageData } from './$types';
	import { AMENITY_TO_SLUG } from '$lib/amenities';
	import { onMount } from 'svelte';

	let { data }: { data: PageData } = $props();
	let user = $derived(data.user);

	type Business = {
		id: number;
		name: string;
		slug: string;
		amenity: string | null;
		cuisine: string | null;
		website: string | null;
		streetNumber: string | null;
		street: string | null;
		city: string | null;
		state: string | null;
		postcode: string | null;
		country: string | null;
		hours: string | null;
	};

	let businesses = $state<Business[]>([]);
	let loading = $state(true);
	let error = $state('');
	let canRetry = $state(false);

	async function fetchBusinesses(latitude: number, longitude: number) {
		try {
			const res = await fetch(`/api/nearby-businesses?lat=${latitude}&lng=${longitude}`);
			if (!res.ok) throw new Error('Failed to fetch nearby businesses');
			const result = await res.json();
			businesses = result.businesses;
		} catch (e) {
			error = 'Failed to load nearby businesses.';
			canRetry = true;
		} finally {
			loading = false;
		}
	}

	function requestLocation() {
		error = '';
		canRetry = false;
		loading = true;

		if (!navigator.geolocation) {
			error = 'Geolocation is not supported by your browser.';
			loading = false;
			return;
		}

		if (navigator.permissions) {
			navigator.permissions.query({ name: 'geolocation' }).then((status) => {
				if (status.state === 'denied') {
					error =
						'Location access is blocked. Click the lock icon in your address bar to allow location access, then try again.';
					canRetry = true;
					loading = false;
					return;
				}
				callGetCurrentPosition();
			});
		} else {
			callGetCurrentPosition();
		}
	}

	function callGetCurrentPosition() {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				fetchBusinesses(position.coords.latitude, position.coords.longitude);
			},
			(err) => {
				if (err.code === err.PERMISSION_DENIED) {
					error =
						'Location access was denied. Click the lock icon in your address bar to allow location access, then try again.';
				} else {
					error = 'Unable to determine your location. Please try again.';
				}
				canRetry = true;
				loading = false;
			}
		);
	}

	onMount(() => {
		requestLocation();
	});
</script>

<div class="mb-6">
	<p>Logged in as {user?.email}</p>
	{#if loading}
		<p>Finding nearby restaurants<span class="loading loading-dots loading-sm ml-1"></span></p>
	{:else if error}
		<p class="text-error">
			{error}
			{#if canRetry}
				<button class="btn btn-primary btn-sm ml-2" onclick={requestLocation}>Try Again</button>
			{/if}
		</p>
	{:else}
		<p>Nearby restaurants ({businesses.length}):</p>
	{/if}
</div>

{#if !loading && !error}
	{#if businesses.length === 0}
		<p>No restaurants found nearby.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="table table-zebra w-full">
				<thead>
					<tr>
						<th>Name</th>
						<th>Cuisine</th>
						<th>Address</th>
						<th>Website</th>
					</tr>
				</thead>
				<tbody>
					{#each businesses as biz}
						<tr>
							<td><a href="/{biz.amenity ? AMENITY_TO_SLUG[biz.amenity] ?? 'businesses' : 'businesses'}/{biz.slug}" class="link">{biz.name}</a></td>
							<td>{biz.cuisine ?? '—'}</td>
							<td>
								{[biz.streetNumber, biz.street].filter(Boolean).join(' ')}
								{#if biz.city}, {biz.city}{/if}
								{#if biz.state} {biz.state}{/if}
								{#if biz.postcode} {biz.postcode}{/if}
							</td>
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
