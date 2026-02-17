<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	$: ({ user } = data);

</script>

<div class="grid h-screen place-items-center">
    <button class="btn btn-primary">import restaurants.pbf</button>
</div>
