<script lang="ts">
	import type { Course, Section } from '$lib/types';
	import type { ScheduleColor } from '$lib/scheduler.svelte';
	import { formatTime, formatDays } from '$lib/scheduler.svelte';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';
	import XIcon from '@lucide/svelte/icons/x';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	interface Props {
		course: Course;
		color: ScheduleColor;
		hidden: boolean;
		selectedLectureId: string | null;
		selectedLabId: string | null;
		highlightedCourseId: string | null;
		onSetLecture: (id: string | null) => void;
		onSetLab: (id: string | null) => void;
		onToggleHidden: () => void;
		onRemove: () => void;
		onMouseEnter: () => void;
		onMouseLeave: () => void;
	}

	let {
		course,
		color,
		hidden,
		selectedLectureId,
		selectedLabId,
		highlightedCourseId,
		onSetLecture,
		onSetLab,
		onToggleHidden,
		onRemove,
		onMouseEnter,
		onMouseLeave
	}: Props = $props();

	let expanded = $state(false);

	function sectionLabel(section: Section): string {
		const parts: string[] = [];
		if (section.days && section.days.length > 0) parts.push(formatDays(section.days));
		if (section.time) parts.push(`${formatTime(section.time[0])}–${formatTime(section.time[1])}`);
		if (section.instructor.length > 0) parts.push(section.instructor[0]);
		return parts.join(' · ');
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="group"
	onmouseenter={onMouseEnter}
	onmouseleave={onMouseLeave}
	role="listitem"
>
	<!-- Course card header -->
	<div
		class="flex items-stretch rounded-md overflow-hidden border bg-card transition-colors"
		class:opacity-50={hidden}
	>
		<!-- Color strip -->
		<div class="w-1 shrink-0" style="background-color: {color.bg}"></div>

		<!-- Main content -->
		<div class="flex-1 min-w-0 px-3 py-2">
			<div class="flex items-center justify-between gap-1">
				<div class="min-w-0">
					<div class="font-semibold text-sm leading-tight truncate">{course.catalogNumber}</div>
					<div class="text-xs text-muted-foreground truncate">{course.title}</div>
				</div>

				<!-- Actions -->
				<div class="flex items-center gap-0.5 shrink-0">
					<button
						type="button"
						onclick={onToggleHidden}
						class="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
						title={hidden ? 'Show on schedule' : 'Hide from schedule'}
					>
						{#if hidden}
							<EyeOffIcon class="h-3.5 w-3.5" />
						{:else}
							<EyeIcon class="h-3.5 w-3.5" />
						{/if}
					</button>
					<button
						type="button"
						onclick={onRemove}
						class="p-1 rounded-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
						title="Remove course"
					>
						<XIcon class="h-3.5 w-3.5" />
					</button>
					<button
						type="button"
						onclick={() => (expanded = !expanded)}
						class="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
						title={expanded ? 'Collapse sections' : 'Expand sections'}
					>
						{#if expanded}
							<ChevronDownIcon class="h-3.5 w-3.5" />
						{:else}
							<ChevronRightIcon class="h-3.5 w-3.5" />
						{/if}
					</button>
				</div>
			</div>

			<!-- Collapsed summary -->
			{#if !expanded}
				<div class="mt-1 text-[10px] text-muted-foreground space-y-0.5">
					{#if selectedLectureId}
						{@const lec = course.sections.lecture.find((s) => s.id === selectedLectureId)}
						{#if lec}
							<div class="truncate">
								Lec {lec.number}{lec.days ? ' · ' + formatDays(lec.days) : ''}
								{lec.time ? ' · ' + formatTime(lec.time[0]) : ''}
							</div>
						{/if}
					{/if}
					{#if selectedLabId && course.sections.lab}
						{@const lab = course.sections.lab.find((s) => s.id === selectedLabId)}
						{#if lab}
							<div class="truncate">
								Lab {lab.number}{lab.days ? ' · ' + formatDays(lab.days) : ''}
								{lab.time ? ' · ' + formatTime(lab.time[0]) : ''}
							</div>
						{/if}
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<!-- Expanded section picker -->
	{#if expanded}
		<div class="mt-1 ml-1 pl-3 border-l-2 space-y-3 pb-1" style="border-color: {color.bg}40">

			<!-- Lecture sections -->
			{#if course.sections.lecture.length > 0}
				<div>
					<div class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
						Lecture
					</div>
					<div class="space-y-0.5">
						{#each course.sections.lecture as section (section.id)}
							{@const selected = selectedLectureId === section.id}
							<button
								type="button"
								onclick={() => onSetLecture(selected ? null : section.id)}
								class="w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-sm text-xs transition-colors hover:bg-muted/70"
								class:bg-muted={selected}
							>
								<!-- Radio dot -->
								<div
									class="mt-0.5 w-3 h-3 rounded-full border-2 shrink-0 flex items-center justify-center"
									style="border-color: {color.bg}"
								>
									{#if selected}
										<div class="w-1.5 h-1.5 rounded-full" style="background-color: {color.bg}"></div>
									{/if}
								</div>
								<div class="min-w-0">
									<span class="font-medium">{section.number}</span>
									{#if section.days || section.time || section.instructor.length}
										<div class="text-[10px] text-muted-foreground truncate">
											{sectionLabel(section)}
										</div>
									{/if}
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Lab sections -->
			{#if course.sections.lab && course.sections.lab.length > 0}
				<div>
					<div class="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
						Lab
					</div>
					<div class="space-y-0.5">
						{#each course.sections.lab as section (section.id)}
							{@const selected = selectedLabId === section.id}
							<button
								type="button"
								onclick={() => onSetLab(selected ? null : section.id)}
								class="w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-sm text-xs transition-colors hover:bg-muted/70"
								class:bg-muted={selected}
							>
								<div
									class="mt-0.5 w-3 h-3 rounded-full border-2 shrink-0 flex items-center justify-center"
									style="border-color: {color.bg}"
								>
									{#if selected}
										<div class="w-1.5 h-1.5 rounded-full" style="background-color: {color.bg}"></div>
									{/if}
								</div>
								<div class="min-w-0">
									<span class="font-medium">{section.number}</span>
									{#if section.days || section.time || section.instructor.length}
										<div class="text-[10px] text-muted-foreground truncate">
											{sectionLabel(section)}
										</div>
									{/if}
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
