<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';

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
				<li><a href="/">Item 1</a></li>
				<li>
					<details>
						<summary>
							Parent
						</summary>
						<ul class="p-2 bg-base-100">
							<li><a href="/">Submenu 1</a></li>
							<li><a href="/">Submenu 2</a></li>
						</ul>
					</details>
				</li>
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
