<script lang="ts">
	import { formatTime } from '$lib/scheduler.svelte';

	interface Props {
		courseName: string;
		sectionType: 'lecture' | 'lab';
		sectionNumber: string;
		instructor: string;
		startMin: number;
		endMin: number;
		color: { bg: string; text: string };
		col: number;
		totalCols: number;
		gridStartMin: number;
		highlighted: boolean;
	}

	let {
		courseName,
		sectionType,
		sectionNumber,
		instructor,
		startMin,
		endMin,
		color,
		col,
		totalCols,
		gridStartMin,
		highlighted
	}: Props = $props();

	const PIXELS_PER_MIN = 1; // 60px/hr → 1px/min

	const top = $derived((startMin - gridStartMin) * PIXELS_PER_MIN);
	const height = $derived(Math.max((endMin - startMin) * PIXELS_PER_MIN, 18));
	const opacity = $derived(highlighted ? 1 : 0.88);
</script>

<div
	class="absolute overflow-hidden rounded-[3px] cursor-default select-none transition-opacity"
	style="
		top: {top}px;
		height: {height}px;
		left: calc(3px + (100% - 6px - {totalCols - 1} * 3px) / {totalCols} * {col} + 3px * {col});
		width: calc((100% - 6px - {totalCols - 1} * 3px) / {totalCols});
		background-color: {color.bg};
		color: {color.text};
		opacity: {opacity};
	"
>
	<div class="px-1.5 py-0.5 h-full flex flex-col overflow-hidden leading-tight">
		<span class="font-semibold text-[11px] truncate">{courseName}</span>
		{#if height > 28}
			<span class="text-[10px] opacity-90 truncate capitalize">{sectionType} {sectionNumber}</span>
		{/if}
		{#if height > 44 && instructor}
			<span class="text-[10px] opacity-80 truncate">{instructor}</span>
		{/if}
		{#if height > 58}
			<span class="text-[10px] opacity-80 truncate mt-auto">
				{formatTime(startMin)} – {formatTime(endMin)}
			</span>
		{/if}
	</div>
</div>
