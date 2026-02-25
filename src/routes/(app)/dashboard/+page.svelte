<script lang="ts">
	import type { PageData } from './$types';
	import { AMENITY_TO_SLUG } from '$lib/amenities';

	let { data }: { data: PageData } = $props();
	let businesses = $derived(data.businesses ?? []);
	let user = $derived(data.user);
</script>

<div class="mb-6">
	<p>Logged in as {user?.email}</p>
	<p>Nearby restaurants ({businesses.length}):</p>
</div>

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
