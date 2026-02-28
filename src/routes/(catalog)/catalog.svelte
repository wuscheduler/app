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

	import SvelteVirtualList from '@humanspeak/svelte-virtual-list';

	let filters = $state<FilterData>({
		term: undefined,
		school: undefined,
		department: undefined,
		instructors: [],
		search: ''
	});

	let catalogLastUpdated = $derived(catalogState.catalog?.lastUpdated || 0);
	let selectedCourse = $state<Course | null>(null);

	// Chained derived's reduce redundant calculations
	let baseCourses = $derived(catalogState.courses);
	let coursesFilteredSchool = $derived(
		filters.school ? baseCourses.filter((c) => c.school === filters.school) : baseCourses
	);
	let coursesFilteredDept = $derived(
		filters.department
			? coursesFilteredSchool.filter((c) => c.department === filters.department)
			: coursesFilteredSchool
	);
	let coursesFilteredInstructors = $derived.by(() => {
		const courses = coursesFilteredDept;
		if (!filters.instructors || filters.instructors.length === 0) return courses;
		const ids = new Set(
			filters.instructors.flatMap((i) => catalogState.catalog?.instructors[i] || '')
		);
		return courses.filter((c) => ids.has(c.id));
	});
	let courses = $derived(coursesFilteredInstructors);

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
	<div class="flex h-full flex-col lg:flex-row">
		<!--Filter inputs on desktop-->
		<aside class="hidden lg:block lg:w-64 lg:shrink-0 lg:border-r">
			<div class="h-full overflow-y-auto bg-background p-4">
				<FilterInputs bind:filters {catalogLastUpdated}></FilterInputs>
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
					<FilterInputs bind:filters mobile {catalogLastUpdated}></FilterInputs>
				</div>
			</Drawer.Content>
		</Drawer.Root>

		<!--Course list-->
		<main class="flex min-h-0 flex-1 flex-col">
			<p class="px-2 pt-2 text-sm text-muted-foreground">Showing {courses.length} courses</p>
			<div class="min-h-0 flex-1">
				<SvelteVirtualList items={courses}>
					{#snippet renderItem(item)}
						{@const course = item}
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
					{/snippet}
				</SvelteVirtualList>
			</div>
		</main>

		<!--Detail panel as sidebar on lg and overlay on md/sm-->
		<aside
			class={cn(
				!selectedCourse && 'hidden',
				'bg-background p-4 md:p-6',
				'max-lg:fixed max-lg:inset-0 max-lg:z-50',
				'lg:block lg:flex-1 lg:shrink-0 lg:border-l'
			)}
		>
			<div class="lg:h-full lg:overflow-y-auto">
				<CourseDetails bind:course={selectedCourse}></CourseDetails>
			</div>
		</aside>
	</div>
{/if}
