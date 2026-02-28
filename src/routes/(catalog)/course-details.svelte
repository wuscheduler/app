<script lang="ts">
	import type { Course, Section } from '$lib/types';
	import XIcon from '@lucide/svelte/icons/x';
	import CourseSection from './course-section.svelte';

	interface Props {
		course: Course | null;
	}

	let { course = $bindable() }: Props = $props();
</script>

{#if course}
	<div class="mb-4 flex items-start justify-between">
		<div class="flex-1">
			<h2 class="text-2xl font-semibold">{course.title}</h2>
			<p class="mt-1 text-sm text-muted-foreground">
				{course.catalogNumber} • {course.level}
			</p>
		</div>
		<button
			type="button"
			onclick={() => {
				course = null;
			}}
			class="rounded-sm p-1 hover:bg-secondary"
			aria-label="Close details"
		>
			<XIcon class="h-5 w-5" />
		</button>
	</div>

	<div class="space-y-6">
		<!-- Course Information -->
		<div class="space-y-2">
			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<span class="font-medium">School:</span>
					<span class="ml-2 text-muted-foreground">{course.school}</span>
				</div>
				<div>
					<span class="font-medium">Department:</span>
					<span class="ml-2 text-muted-foreground">{course.department}</span>
				</div>
				{#if course.units}
					<div>
						<span class="font-medium">Units:</span>
						<span class="ml-2 text-muted-foreground">{course.units}</span>
					</div>
				{:else}
					<div>
						<span class="font-medium">Units:</span>
						<span class="ml-2 text-muted-foreground">Variable</span>
					</div>
				{/if}
				<div>
					<span class="font-medium">Course ID:</span>
					<span class="ml-2 text-muted-foreground">{course.id}</span>
				</div>
			</div>

			{#if course.description}
				<div class="pt-2">
					<p class="font-medium">Description:</p>
					<p class="mt-1 text-sm text-muted-foreground">{course.description}</p>
				</div>
			{/if}
		</div>

		<!-- Sections -->
		<div>
			<h3 class="mb-3 text-lg font-semibold">
				Sections ({course.sections.lecture.length + (course.sections.lab?.length || 0)})
			</h3>

			<div class="space-y-3">
				{#each course.sections.lecture as section (section.id)}
					<CourseSection {section} type="Lecture"></CourseSection>
				{/each}
				{#if course.sections.lab}
					{#each course.sections.lab as section (section.id)}
						<CourseSection {section} type="Lab"></CourseSection>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{:else}
	<!-- Empty state when no course selected -->
	<div class="flex h-full items-center justify-center p-8">
		<div class="text-center">
			<h2 class="text-xl font-semibold text-muted-foreground">No course selected</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Select a course from the list to view details
			</p>
		</div>
	</div>
{/if}
