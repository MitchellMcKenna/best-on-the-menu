<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let user = $derived(data.user);
	let loading = $state(false);

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			await applyAction(result);
			loading = false;
		};
	};
</script>

<div class="grid h-screen place-items-center">
	<div class="flex flex-col items-center gap-4">
		{#if form?.error}
			<div class="alert alert-error shadow-lg">
				<span>{form.error}</span>
			</div>
		{/if}
		{#if form?.imported != null}
			<div class="alert alert-success shadow-lg">
				<span>Imported {form.imported} restaurants, skipped {form.skipped}.</span>
			</div>
		{/if}
		<form method="POST" use:enhance={handleSubmit}>
			<button disabled={loading} class="btn btn-primary">
				{#if loading}
					Importing...
				{:else}
					import restaurants.pbf
				{/if}
			</button>
		</form>
	</div>
</div>
