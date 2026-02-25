<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let business = $derived(data.business);
	let amenityLabel = $derived(data.amenityLabel);
	let amenitySlug = $derived(data.amenitySlug);
</script>

<div class="mb-4">
	<a href="/{amenitySlug}" class="btn btn-ghost btn-sm">&larr; All {amenityLabel}</a>
</div>

<div class="card bg-base-200 shadow-sm max-w-2xl">
	<div class="card-body">
		<h1 class="card-title text-2xl">{business.name}</h1>

		{#if business.cuisine}
			<div class="flex flex-wrap gap-1">
				<span class="badge badge-primary badge-outline">{business.cuisine}</span>
			</div>
		{/if}

		<div class="divider"></div>

		<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
			{#if business.streetNumber || business.street || business.city}
				<dt class="font-semibold">Address</dt>
				<dd>
					{[business.streetNumber, business.street].filter(Boolean).join(' ')}
					{#if business.city}, {business.city}{/if}
					{#if business.state} {business.state}{/if}
					{#if business.postcode} {business.postcode}{/if}
					{#if business.country}, {business.country}{/if}
				</dd>
			{/if}

			{#if business.hours}
				<dt class="font-semibold">Hours</dt>
				<dd>{business.hours}</dd>
			{/if}

			{#if business.website}
				<dt class="font-semibold">Website</dt>
				<dd>
					<a href={business.website} target="_blank" rel="noopener" class="link">
						{business.website}
					</a>
				</dd>
			{/if}

			{#if business.cuisine}
				<dt class="font-semibold">Cuisine</dt>
				<dd>{business.cuisine}</dd>
			{/if}
		</dl>
	</div>
</div>
