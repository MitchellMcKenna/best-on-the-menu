<!-- src/routes/+layout.svelte -->
<script lang="ts">
    import '../app.postcss';
    import { invalidate } from '$app/navigation';
    import { onMount } from 'svelte';
    import type { LayoutData } from './$types';

    export let data: LayoutData;

    $: ({ supabase } = data);

    onMount(() => {
        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange(() => {
            invalidate('supabase:auth');
        });

        return () => subscription.unsubscribe();
    });
</script>

<svelte:head>
    <title>Best on the Menu</title>
</svelte:head>

<slot />
