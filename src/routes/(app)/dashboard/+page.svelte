<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
	$: ({ testTable, user } = data);
</script>

<div class="mb-6">
    <p>Protected content for {user.email}</p>
    <p>server-side fetched data with RLS:</p>
    <pre>{JSON.stringify(testTable, null, 2)}</pre>
</div>
<div class="mb-6">
    <p>user:</p>
    <pre class="language-js"><code class="language-js">{JSON.stringify(user, null, 2)}</code></pre>
</div>
