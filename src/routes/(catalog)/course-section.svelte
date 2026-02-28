<script lang="ts">
	import type { Section } from '$lib/types';

	const { section, type }: { section: Section; type: string } = $props();
	const formatTime = (minutes: number): string => {
		const hrs = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return new Date(0, 0, 0, hrs, mins).toLocaleTimeString([], {
			hour: 'numeric',
			minute: '2-digit'
		});
	};
</script>

<div class="rounded-md border bg-muted/50 p-4">
	<div class="mb-2 flex items-start justify-between">
		<div>
			<span class="font-medium">{type} {section.number}</span>
			<span class="ml-2 text-sm text-muted-foreground">• {section.term}</span>
		</div>
		{#if section.seats}
			<span
				class="text-sm"
				class:text-destructive={section.seats[0] >= section.seats[1]}
				class:text-green-600={section.seats[0] < section.seats[1]}
			>
				{section.seats[0]}/{section.seats[1]} seats taken
			</span>
		{/if}
	</div>

	<div class="space-y-1 text-sm">
		{#if section.instructor.length > 0}
			<div>
				<span class="font-medium">Instructor:</span>
				<span class="ml-2 text-muted-foreground">
					{section.instructor.join(', ')}
				</span>
			</div>
		{/if}

		{#if section.days && section.days.length > 0}
			<div>
				<span class="font-medium">Days:</span>
				<span class="ml-2 text-muted-foreground">
					{section.days.join(', ')}
				</span>
			</div>
		{/if}

		{#if section.time}
			<div>
				<span class="font-medium">Time:</span>
				<span class="ml-2 text-muted-foreground">
					{formatTime(section.time[0])} - {formatTime(section.time[1])}
				</span>
			</div>
		{/if}

		<div>
			<span class="font-medium">Delivery:</span>
			<span class="ml-2 text-muted-foreground">{section.delivery}</span>
		</div>
	</div>
</div>
