<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import { AMENITIES } from '$lib/amenities';

	let { children }: { children: Snippet } = $props();

	let loading = $state(false);

	const handleLogout: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			if (result.type === 'redirect') {
				await invalidate('supabase:auth');
			} else {
				await applyAction(result);
			}
			loading = false;
		};
	};

	let locationParams = $derived.by(() => {
		const lat = page.url.searchParams.get('lat');
		const lng = page.url.searchParams.get('lng');
		const near = page.url.searchParams.get('near');
		if (!lat || !lng) return '';
		let qs = `?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;
		if (near) qs += `&near=${encodeURIComponent(near)}`;
		return qs;
	});
</script>

<svelte:head>
	<title>Best On The Menu</title>
</svelte:head>

<main class="container is-max-desktop">
	<div class="navbar bg-base-100">
		<div class="flex-1">
			<a href="/" class="btn btn-ghost normal-case text-xl">Best On The Menu</a>
		</div>
		<div class="flex-none">
			<ul class="menu menu-horizontal px-1">
				<li><a href="/businesses{locationParams}">All</a></li>
				{#each Object.entries(AMENITIES) as [slug, { label }] (slug)}
					<li><a href="/{slug}{locationParams}">{label}</a></li>
				{/each}
				<li>
					{#if page.data.session}
						<form action="/logout" method="post" use:enhance={handleLogout}>
							<button disabled={loading} type="submit">Sign out</button>
						</form>
					{/if}
				</li>
			</ul>
		</div>
	</div>

	{@render children()}
</main>
