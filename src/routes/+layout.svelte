<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/navbar.svelte';
	import { onMount } from 'svelte';
	import { selectedCourses } from '$lib/catalog.svelte';
	import { SvelteMap } from 'svelte/reactivity';

	let { children } = $props();

	onMount(() => {
		const saved = localStorage.getItem("selectedCourses");
		if(saved) {
			const ids = JSON.parse(saved) as string[];
			selectedCourses.clear();
			for(const id of ids) {
				selectedCourses.add(id);
			}
		}
	})

	$effect(() => {
		const ids = [...selectedCourses];
		localStorage.setItem("selectedCourses", JSON.stringify(ids));
	})
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="page">
	<Navbar></Navbar>
	<div class="content">
		{@render children()}
	</div>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	.content {
		flex: 1;
		overflow: auto;
	}
</style>
