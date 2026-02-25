<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let businesses = $derived(data.businesses ?? []);
	let cities = $derived(data.cities ?? []);
	let selectedCity = $derived(data.selectedCity ?? '');
	let amenityLabel = $derived(data.amenityLabel);
	let amenitySlug = $derived(data.amenitySlug);
</script>

<div class="mb-6 flex items-center justify-between">
	<h1 class="text-2xl font-bold">{amenityLabel} ({businesses.length})</h1>

	<form method="get" class="flex items-center gap-2">
		<select name="city" class="select select-bordered" onchange={(e) => e.currentTarget.form?.submit()}>
			<option value="">All Cities</option>
			{#each cities as city}
				<option value={city} selected={city === selectedCity}>{city}</option>
			{/each}
		</select>
		{#if selectedCity}
			<a href="/{amenitySlug}" class="btn btn-ghost btn-sm">Clear</a>
		{/if}
	</form>
</div>

{#if businesses.length === 0}
	<p class="text-base-content/60">No {amenityLabel.toLowerCase()} found{selectedCity ? ` in ${selectedCity}` : ''}.</p>
{:else}
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each businesses as biz}
			<div class="card bg-base-200 shadow-sm">
				<div class="card-body">
					<h2 class="card-title">
						<a href="/{amenitySlug}/{biz.slug}" class="link">{biz.name}</a>
					</h2>

					{#if biz.cuisine}
						<div class="flex flex-wrap gap-1">
							<span class="badge badge-primary badge-outline">{biz.cuisine}</span>
						</div>
					{/if}

					<p class="text-sm">
						{[biz.streetNumber, biz.street].filter(Boolean).join(' ')}
						{#if biz.city}, {biz.city}{/if}
						{#if biz.state} {biz.state}{/if}
						{#if biz.postcode} {biz.postcode}{/if}
					</p>

					{#if biz.hours}
						<p class="text-sm text-base-content/60">{biz.hours}</p>
					{/if}

					{#if biz.website}
						<div class="card-actions justify-end">
							<a href={biz.website} target="_blank" rel="noopener" class="btn btn-xs btn-outline">
								Website
							</a>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}
