<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let business = $derived(data.business);
</script>

<button class="btn btn-primary mb-6">Add</button>
<div class="mb-6">
	<pre>{JSON.stringify(business, null, 2)}</pre>
</div>
