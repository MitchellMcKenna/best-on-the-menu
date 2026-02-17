<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let user = $derived(data.user);
</script>

<div class="grid h-screen place-items-center">
	<button class="btn btn-primary">import restaurants.pbf</button>
</div>
