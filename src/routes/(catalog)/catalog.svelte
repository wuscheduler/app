<script lang="ts">
	import { onMount } from 'svelte';
	import { catalogState } from '$lib/catalog.svelte';
	import Loader from './loader.svelte';
	import FilterInputs, { type FilterData } from './filter-inputs.svelte';
	import FilterIcon from '@lucide/svelte/icons/filter';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Drawer from '$lib/components/ui/drawer/index';
	import * as Select from '$lib/components/ui/select/index';
	import * as Item from '$lib/components/ui/item/index';
	import CourseDetails from './course-details.svelte';
	import { cn } from '$lib/utils';
	import { Input } from '$lib/components/ui/input';
	import type { Course } from '$lib/types';

	let filters = $state<FilterData>({
		term: undefined,
		school: undefined,
		department: undefined,
		instructors: [],
		search: ''
	});

	let courses = $derived(
		Array.from(catalogState.courses)
			.sort((a, b) => a.catalogNumber.localeCompare(b.catalogNumber))
			.filter((course) => course.title)
	);

	let selectedCourse = $state<Course | null>(null);

	onMount(async () => {
		await catalogState.loadIndex();

		if (catalogState.index) {
			filters.term = catalogState.index.terms[0];
		}
	});

	$effect(() => {
		if (filters.term && catalogState.term !== filters.term) {
			catalogState.loadTerm(filters.term);
		}
	});
</script>

{#if catalogState.loading}
	<Loader />
{:else if catalogState.error || !catalogState.catalog}
	An error occurred: {catalogState.error}
{:else}
	<div class="lg:flex">
		<!--Filter inputs on desktop-->
		<aside class="hidden lg:block lg:w-64 lg:shrink-0 lg:border-r">
			<div class="sticky top-0 h-screen overflow-y-auto bg-background p-4">
				<FilterInputs bind:filters></FilterInputs>
			</div>
		</aside>

		<!-- Mobile filters in drawer -->
		<Drawer.Root>
			<div class="border-b bg-background p-4 lg:hidden">
				<!--Search, term select, and "filters" button in the top bar-->
				<div class="flex items-center gap-3">
					<Input type="text" placeholder="Search courses" bind:value={filters.search}
					></Input>

					<Select.Root type="single" bind:value={filters.term}>
						<Select.Trigger class="w-[200px]">
							{filters.term}
							<Select.Content>
								{#each catalogState.index?.terms || [] as term (term)}
									<Select.Item value={term}>{term}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Trigger>
					</Select.Root>
					<Drawer.Trigger>
						<Button variant="secondary">
							<FilterIcon class="h-5 w-5" />
							<span class="text-sm font-medium">Filters</span>
						</Button>
					</Drawer.Trigger>
				</div>
			</div>

			<Drawer.Content class="lg:hidden">
				<div class="overflow-y-auto px-4 pb-2">
					<FilterInputs bind:filters mobile></FilterInputs>
				</div>
			</Drawer.Content>
		</Drawer.Root>

		<main class="flex-1">
			<div class="overflow-y-auto">
				{#each courses as course}
					<div class="course px-2 pt-3">
						<Item.Root
							variant="outline"
							class="cursor-pointer hover:bg-muted/50"
							onclick={() => (selectedCourse = course)}
						>
							<Item.Content>
								<Item.Title>{course.catalogNumber}</Item.Title>
								<Item.Description>{course.title}</Item.Description>
								<Item.Description
									>{course.units ?? 'Variable'} Credit{course.units == 1
										? ''
										: 's'} &bull; {course.school}</Item.Description
								>
							</Item.Content>
							<Item.Actions>
								<Button variant="outline">Add Course</Button>
							</Item.Actions>
						</Item.Root>
					</div>
				{/each}
			</div>
		</main>

		<aside
			class={cn(
				!selectedCourse && 'hidden',
				'bg-background p-4 md:p-6',
				'max-lg:fixed max-lg:inset-0 max-lg:z-50',
				'lg:block lg:flex-1 lg:shrink-0 lg:border-l'
			)}
		>
			<div class="lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
				<CourseDetails bind:course={selectedCourse}></CourseDetails>
			</div>
		</aside>
	</div>
{/if}
