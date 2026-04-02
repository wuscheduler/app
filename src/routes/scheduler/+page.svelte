<script lang="ts">
	import { onMount } from 'svelte';
	import { catalogState, selectedCourses } from '$lib/catalog.svelte';
	import { schedulerState, DAY_INDEX } from '$lib/scheduler.svelte';
	import type { Course, Section } from '$lib/types';
	import WeekGrid from './week-grid.svelte';
	import type { CalendarEvent } from './week-grid.svelte';
	import SidebarCourse from './sidebar-course.svelte';
	import CalendarIcon from '@lucide/svelte/icons/calendar';

	// ── state ──────────────────────────────────────────────────────────────────

	interface HoveredSection {
		courseId: string;
		section: Section;
		type: 'lecture' | 'lab';
	}
	let hoveredSection = $state<HoveredSection | null>(null);

	// Resolved courses: selectedCourses ∩ catalog, with scheduler display state
	const resolvedCourses = $derived.by(() => {
		const catalog = catalogState.courses;
		if (!catalog.length) return [];
		return [...selectedCourses]
			.map((id) => catalog.find((c) => c.id === id))
			.filter((c): c is Course => c !== undefined);
	});

	// Whenever catalog loads (or selectedCourses changes), initialize missing entries
	$effect(() => {
		for (const course of resolvedCourses) {
			schedulerState.ensureEntry(
				course.id,
				course.sections.lecture[0]?.id ?? null,
				course.sections.lab?.[0]?.id ?? null
			);
		}
	});

	// Build calendar events from resolved courses + scheduler state
	const calendarEvents = $derived.by<CalendarEvent[]>(() => {
		const events: CalendarEvent[] = [];

		function sectionToEvents(
			courseId: string,
			courseName: string,
			section: Section,
			type: 'lecture' | 'lab',
			color: { bg: string; text: string },
			ghost: boolean
		) {
			if (!section.days || !section.time) return;
			const [startMin, endMin] = section.time;
			for (const dayStr of section.days) {
				const day = DAY_INDEX[dayStr];
				if (day === undefined || day > 4) continue;
				events.push({
					courseId,
					courseName,
					sectionType: type,
					sectionNumber: section.number,
					instructor: section.instructor[0] ?? '',
					day,
					startMin,
					endMin,
					color,
					ghost
				});
			}
		}

		// Regular (solid) events
		for (const course of resolvedCourses) {
			const entry = schedulerState.entries.get(course.id);
			if (!entry || entry.hidden) continue;
			const color = schedulerState.colorFor(course.id);

			if (entry.selectedLectureId) {
				const lec = course.sections.lecture.find((s) => s.id === entry.selectedLectureId);
				if (lec) sectionToEvents(course.id, course.catalogNumber, lec, 'lecture', color, false);
			}
			if (entry.selectedLabId && course.sections.lab) {
				const lab = course.sections.lab.find((s) => s.id === entry.selectedLabId);
				if (lab) sectionToEvents(course.id, course.catalogNumber, lab, 'lab', color, false);
			}
		}

		// Ghost event for the hovered (unselected) section
		if (hoveredSection) {
			const { courseId, section, type } = hoveredSection;
			const entry = schedulerState.entries.get(courseId);
			const alreadySelected =
				entry &&
				(type === 'lecture'
					? entry.selectedLectureId === section.id
					: entry.selectedLabId === section.id);
			if (!alreadySelected) {
				const course = resolvedCourses.find((c) => c.id === courseId);
				if (course) {
					const color = schedulerState.colorFor(courseId);
					sectionToEvents(courseId, course.catalogNumber, section, type, color, true);
				}
			}
		}

		return events;
	});

	// Total units
	const totalUnits = $derived(
		resolvedCourses.reduce((sum, c) => sum + (c.units ?? 0), 0)
	);

	// ── persistence ────────────────────────────────────────────────────────────

	onMount(async () => {
		// Restore scheduler display state (colors, sections, hidden)
		const saved = localStorage.getItem('schedulerState');
		if (saved) schedulerState.deserialize(saved);

		// Load catalog if not yet loaded
		await catalogState.loadIndex();
		if (catalogState.index && !catalogState.term) {
			await catalogState.loadTerm(catalogState.index.terms[0]);
		}
	});

	$effect(() => {
		// Persist whenever anything in schedulerState.entries changes.
		// Reading .entries triggers reactivity via SvelteMap.
		const _ = [...schedulerState.entries];
		localStorage.setItem('schedulerState', schedulerState.serialize());
	});

	// ── actions ────────────────────────────────────────────────────────────────

	function removeCourse(courseId: string) {
		selectedCourses.delete(courseId);
		schedulerState.removeEntry(courseId);
	}
</script>

<div class="flex h-full overflow-hidden">
	<!-- ── Sidebar ── -->
	<aside class="w-72 shrink-0 flex flex-col border-r bg-sidebar overflow-y-auto">
		<!-- Sidebar header -->
		<div class="px-4 py-3 border-b bg-sidebar-primary/5">
			<div class="flex items-center justify-between">
				<h2 class="font-semibold text-sm">My Schedule</h2>
				{#if resolvedCourses.length > 0}
					<span class="text-xs text-muted-foreground">
						{resolvedCourses.length}
						{resolvedCourses.length === 1 ? 'course' : 'courses'}
						{#if totalUnits > 0}
							· {totalUnits} units
						{/if}
					</span>
				{/if}
			</div>
			{#if catalogState.term}
				<p class="text-xs text-muted-foreground mt-0.5">{catalogState.term}</p>
			{/if}
		</div>

		<!-- Course list -->
		<div class="flex-1 px-3 py-3 space-y-2">
			{#if resolvedCourses.length === 0}
				<div class="flex flex-col items-center justify-center h-full text-center py-12 gap-3">
					<CalendarIcon class="h-10 w-10 text-muted-foreground/40" />
					<div>
						<p class="text-sm font-medium text-muted-foreground">No courses added</p>
						<p class="text-xs text-muted-foreground/70 mt-1">
							Add courses from the <a href="/" class="underline underline-offset-2 hover:text-foreground">Catalog</a>
						</p>
					</div>
				</div>
			{:else}
				{#each resolvedCourses as course (course.id)}
					{@const entry = schedulerState.entries.get(course.id)}
					{#if entry}
						<SidebarCourse
							{course}
							color={schedulerState.colorFor(course.id)}
							hidden={entry.hidden}
							selectedLectureId={entry.selectedLectureId}
							selectedLabId={entry.selectedLabId}
							onSetLecture={(id) => schedulerState.setLecture(course.id, id)}
							onSetLab={(id) => schedulerState.setLab(course.id, id)}
							onToggleHidden={() => schedulerState.toggleHidden(course.id)}
							onRemove={() => removeCourse(course.id)}
							onSectionHover={(section, type) => (hoveredSection = { courseId: course.id, section, type })}
							onSectionLeave={() => (hoveredSection = null)}
						/>
					{/if}
				{/each}
			{/if}
		</div>
	</aside>

	<!-- ── Week Grid ── -->
	<main class="flex-1 overflow-auto min-w-0">
		{#if calendarEvents.length === 0 && resolvedCourses.length === 0}
			<!-- Empty state (no courses at all) -->
			<div class="h-full flex items-center justify-center text-center p-8">
				<div class="max-w-xs">
					<CalendarIcon class="h-16 w-16 mx-auto text-muted-foreground/25 mb-4" />
					<h2 class="text-xl font-semibold text-muted-foreground">Your schedule is empty</h2>
					<p class="mt-2 text-sm text-muted-foreground">
						Head to the <a href="/" class="underline underline-offset-2 hover:text-foreground">Catalog</a>
						and click "Add Course" to get started.
					</p>
				</div>
			</div>
		{:else}
			<WeekGrid events={calendarEvents} />
		{/if}
	</main>
</div>
