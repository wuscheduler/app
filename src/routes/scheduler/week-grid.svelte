<script lang="ts">
	import WeekEvent from './week-event.svelte';
	import { formatTime } from '$lib/scheduler.svelte';

	export interface CalendarEvent {
		courseId: string;
		courseName: string;
		sectionType: 'lecture' | 'lab';
		sectionNumber: string;
		instructor: string;
		day: number; // 0=Mon … 4=Fri
		startMin: number;
		endMin: number;
		color: { bg: string; text: string };
		ghost?: boolean;
	}

	interface LayoutEvent extends CalendarEvent {
		col: number;
		totalCols: number;
	}

	interface Props {
		events: CalendarEvent[];
	}

	let { events }: Props = $props();

	const HOUR_HEIGHT = 60; // px per hour = 1px per minute
	const GRID_START = 7 * 60; // 7 AM
	const GRID_END = 22 * 60; // 10 PM
	const GRID_HEIGHT = GRID_END - GRID_START; // 900px
	const HOURS = Array.from({ length: GRID_END / 60 - GRID_START / 60 }, (_, i) => i + GRID_START / 60);
	const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

	function layoutDay(dayEvents: CalendarEvent[]): LayoutEvent[] {
		if (dayEvents.length === 0) return [];
		const sorted = [...dayEvents].sort((a, b) => a.startMin - b.startMin);
		const colEnds: number[] = [];

		const result: LayoutEvent[] = sorted.map((ev) => {
			let col = colEnds.findIndex((t) => t <= ev.startMin);
			if (col === -1) {
				col = colEnds.length;
				colEnds.push(ev.endMin);
			} else {
				colEnds[col] = ev.endMin;
			}
			return { ...ev, col, totalCols: 1 };
		});

		// Compute totalCols = 1 + max column of any overlapping event
		for (const ev of result) {
			let maxCol = ev.col;
			for (const other of result) {
				if (other !== ev && other.startMin < ev.endMin && other.endMin > ev.startMin) {
					maxCol = Math.max(maxCol, other.col);
				}
			}
			ev.totalCols = maxCol + 1;
		}

		return result;
	}

	const byDay = $derived(
		Array.from({ length: 5 }, (_, day) => layoutDay(events.filter((e) => e.day === day)))
	);

	function hourLabel(h: number): string {
		if (h === 12) return '12 PM';
		if (h > 12) return `${h - 12} PM`;
		return `${h} AM`;
	}
</script>

<div class="flex flex-col h-full">
	<!-- Sticky day-name header -->
	<div class="sticky top-0 z-10 flex border-b bg-background shrink-0">
		<!-- Spacer for time sidebar -->
		<div class="w-12 shrink-0 border-r border-transparent"></div>
		{#each DAYS as day}
			<div class="flex-1 py-2 text-center text-xs font-semibold text-muted-foreground tracking-wide uppercase border-l">
				{day}
			</div>
		{/each}
	</div>

	<!-- Scrollable grid body -->
	<div class="flex overflow-y-auto flex-1">
		<!-- Time labels -->
		<div class="w-12 shrink-0 relative" style="height: {GRID_HEIGHT}px">
			{#each HOURS as hour, i}
				<div
					class="absolute w-full"
					style="top: {i * HOUR_HEIGHT}px; height: {HOUR_HEIGHT}px"
				>
					{#if i > 0}
						<span
							class="absolute right-2 text-[10px] text-muted-foreground leading-none"
							style="top: -6px"
						>
							{hourLabel(hour)}
						</span>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Day columns -->
		{#each DAYS as _day, dayIdx}
			<div
				class="flex-1 relative border-l"
				style="height: {GRID_HEIGHT}px; min-width: 0"
			>
				<!-- Hour lines (solid) -->
				{#each HOURS as _hour, i}
					<div
						class="absolute left-0 right-0 border-t border-border/60"
						style="top: {i * HOUR_HEIGHT}px"
					></div>
				{/each}

				<!-- Half-hour lines (lighter) -->
				{#each HOURS as _hour, i}
					<div
						class="absolute left-0 right-0 border-t border-border/25"
						style="top: {i * HOUR_HEIGHT + 30}px"
					></div>
				{/each}

				<!-- Events -->
				{#each byDay[dayIdx] as ev (ev.courseId + ev.sectionType + ev.sectionNumber + ev.day)}
					<WeekEvent
						courseName={ev.courseName}
						sectionType={ev.sectionType}
						sectionNumber={ev.sectionNumber}
						instructor={ev.instructor}
						startMin={ev.startMin}
						endMin={ev.endMin}
						color={ev.color}
						col={ev.col}
						totalCols={ev.totalCols}
						gridStartMin={GRID_START}
						ghost={ev.ghost ?? false}
					/>
				{/each}
			</div>
		{/each}
	</div>
</div>
