<script module lang="ts">
	export interface FilterData {
		term: string | undefined;
		school: string | undefined;
		department: string | undefined;
		instructors: string[];
		attributes: string[];
		level: 'Graduate' | 'Undergraduate' | undefined;
		search: string;
		credits: [number, number] | undefined;
	}
</script>

<script lang="ts">
	import { catalogState } from '$lib/catalog.svelte';
	import FilterCombobox from '$lib/components/filter-combobox.svelte';
	import MultiCombobox from '$lib/components/multi-combobox.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Slider } from '$lib/components/ui/slider';
	import { getRelativeTimeString } from '$lib/utils';

	interface Props {
		filters?: FilterData;
		mobile?: boolean;
		catalogLastUpdated: number | Date;
	}

	let {
		filters = $bindable({
			term: undefined,
			school: undefined,
			department: undefined,
			instructors: [],
			attributes: [],
			level: undefined,
			search: '',
			credits: undefined
		}),

		mobile = undefined,
		catalogLastUpdated
	}: Props = $props();

	let instructors = $derived(
		Object.keys(catalogState.catalog?.instructors || {})
			.filter((x) => x !== '')
			.sort()
	);
	let schools = $derived(Object.keys(catalogState.catalog?.schools || {}));
	let departments = $derived(
		filters.school ? catalogState.catalog?.schools[filters.school] : undefined
	);
	let allAttributes = $derived(
		[...new Set(catalogState.courses.flatMap((c) => [...(c.attributesFlat ?? [])]))].sort()
	);
	let maxCredits = $derived(
		Math.max(...catalogState.courses.map((c) => c.units ?? 0).filter((u) => u > 0), 6)
	);

	let creditSliderValue = $state<[number, number]>([0, 6]);
	let creditSliderInitialized = $state(false);

	$effect(() => {
		// Initialize slider to full range once catalog is loaded
		if (!creditSliderInitialized && maxCredits > 0) {
			creditSliderValue = [0, maxCredits];
			creditSliderInitialized = true;
		}
	});

	$effect(() => {
		const [lo, hi] = creditSliderValue;
		if (lo === 0 && hi === maxCredits) {
			filters.credits = undefined;
		} else {
			filters.credits = [lo, hi];
		}
	});

	$effect(() => {
		if (filters.department && (!departments || !departments.includes(filters.department))) {
			filters.department = undefined;
		}
	});
</script>

<h2 class="mb-3 text-lg font-semibold">Filters</h2>

{#if !mobile}
	<Input type="text" placeholder="Search courses" class="mb-6" bind:value={filters.search}
	></Input>
	<FilterCombobox
		label="Semester"
		items={catalogState.index?.terms ?? []}
		bind:value={filters.term}
	></FilterCombobox>
{/if}

<FilterCombobox
	label="School"
	placeholder="Select a school..."
	items={schools}
	bind:value={filters.school}
	clearable={true}
></FilterCombobox>

<FilterCombobox
	label="Department"
	placeholder="Select a department..."
	items={departments || []}
	bind:value={filters.department}
	clearable={true}
	disabled={!departments || departments.length === 0}
></FilterCombobox>

<FilterCombobox
	label="Level"
	placeholder="Select a level..."
	items={['Undergraduate', 'Graduate']}
	bind:value={filters.level}
	clearable={true}
></FilterCombobox>

<MultiCombobox
	label="Instructors"
	placeholder="Select instructors..."
	items={instructors || []}
	bind:value={filters.instructors}
></MultiCombobox>

<MultiCombobox
	label="Attributes"
	placeholder="Select attributes..."
	items={allAttributes}
	bind:value={filters.attributes}
></MultiCombobox>

<div class="mb-4">
	<div class="mb-2 flex items-center justify-between">
		<span class="text-sm font-medium">Credits</span>
		{#if creditSliderValue && (creditSliderValue[0] !== 0 || creditSliderValue[1] !== maxCredits)}
			<span class="text-sm text-muted-foreground"
				>{creditSliderValue[0]}-{creditSliderValue[1]}</span
			>
		{:else}
			<span class="text-sm text-muted-foreground">Any</span>
		{/if}
	</div>
	<Slider type="multiple" min={0} max={maxCredits} step={1} bind:value={creditSliderValue} />
</div>

<p class="text-sm text-muted-foreground">
	Last updated {getRelativeTimeString(catalogLastUpdated)}
</p>
