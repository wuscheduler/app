<script module lang="ts">
	export interface FilterData {
		term: string | undefined;
		school: string | undefined;
		department: string | undefined;
		instructors: string[];
		search: string;
	}
</script>

<script lang="ts">
	import { catalogState } from '$lib/catalog.svelte';
	import FilterCombobox from '$lib/components/filter-combobox.svelte';
	import MultiCombobox from '$lib/components/multi-combobox.svelte';
	import Input from '$lib/components/ui/input/input.svelte';

	interface Props {
		filters?: FilterData;
		mobile?: boolean;
	}

	let {
		filters = $bindable({
			term: undefined,
			school: undefined,
			department: undefined,
			instructors: [],
			search: ''
		}),

		mobile = undefined
	}: Props = $props();

	let instructors = $derived(catalogState.catalog?.instructors.filter((x) => x !== ''));
	let schools = $derived(Object.keys(catalogState.index?.schools || {}));
	let departments = $derived(
		filters.school ? catalogState.index?.schools[filters.school] : undefined
	);

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

<MultiCombobox
	label="Instructors"
	placeholder="Select instructors..."
	items={instructors || []}
	bind:value={filters.instructors}
></MultiCombobox>
