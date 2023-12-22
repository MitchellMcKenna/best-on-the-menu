<script lang="ts">
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { page } from '$app/stores';

	let loading = false;

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
			<a class="btn btn-ghost normal-case text-xl">Best On The Menu</a>
		</div>
		<div class="flex-none">
			<ul class="menu menu-horizontal px-1">
				<li><a>Item 1</a></li>
				<li tabindex="0">
					<a>
						Parent
						<svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/></svg>
					</a>
					<ul class="p-2 bg-base-100">
						<li><a>Submenu 1</a></li>
						<li><a>Submenu 2</a></li>
					</ul>
				</li>
				<li>
					{#if $page.data.session}
						<form action="/logout" method="post" use:enhance={handleLogout}>
							<button disabled={loading} type="submit">Sign out</button>
						</form>
					{/if}
				</li>
			</ul>
		</div>
	</div>

	<slot />
</main>
