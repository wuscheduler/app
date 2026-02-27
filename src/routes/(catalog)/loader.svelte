<script lang="ts">
	import { Spinner } from '$lib/components/ui/spinner';
</script>

<div class="loader">
	<Spinner class="size-12" />
	<p>Loading</p>
</div>

<style>
	.loader {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		/* gap: 0.75rem; */
	}
</style>
