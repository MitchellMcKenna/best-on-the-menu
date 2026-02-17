<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);

	const handleSubmit: SubmitFunction = () => {
		loading = true;
		return async ({ result }) => {
			await applyAction(result);
			loading = false;
		};
	};
</script>

<section class="hero min-h-screen">
	<div class="hero-content flex-col lg">
		{#if form?.error}
			<div class="alert alert-error shadow-lg">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="stroke-current flex-shrink-0 h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/></svg
				>
				<span>{form.error}</span>
			</div>
		{/if}
		{#if form?.message}
			<div class="alert shadow-lg">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="stroke-current flex-shrink-0 w-6 h-6"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					></path></svg
				>
				<span>{form.message}</span>
			</div>
		{/if}
		<div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
			<div class="card-body">
				<form method="post" use:enhance={handleSubmit}>
					<div class="form-control">
						<label for="email" class="label"><span class="label-text">Email</span></label>
						<p>
							<input
								id="email"
								name="email"
								value={form?.values?.email ?? ''}
								class="input input-bordered"
								type="email"
								placeholder="Email"
								required
							/>
						</p>
					</div>
					<div class="form-control">
						<label for="password" class=""><span class="label-text">Password</span></label>
						<p>
							<input
								id="password"
								name="password"
								class="input input-bordered"
								type="password"
								placeholder="Password"
								required
							/>
						</p>
					</div>
					<div class="form-control mt-6">
						<button disabled={loading} class="btn btn-primary">Sign up</button>
					</div>
				</form>
			</div>
		</div>
		<div>
			<p>
				Already have an account? <a href="/" class="link link-primary">Login</a>
			</p>
		</div>
	</div>
</section>
