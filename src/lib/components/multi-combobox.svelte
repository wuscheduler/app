<script lang="ts">
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import XIcon from '@lucide/svelte/icons/x';

	interface Props {
		label: string;
		value: string[];
		items: string[];
		placeholder?: string;
		searchPlaceholder?: string;
		emptyMessage?: string;
		disabled?: boolean;
	}

	let {
		label,
		value = $bindable([]),
		items,
		placeholder = 'Select...',
		searchPlaceholder = 'Search...',
		emptyMessage = 'No results found.',
		disabled = false
	}: Props = $props();

	let popoverOpen = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);

	function toggleItem(item: string) {
		if (value.includes(item)) {
			value = value.filter((i) => i !== item);
		} else {
			value = [...value, item];
		}
	}

	function removeItem(item: string) {
		value = value.filter((i) => i !== item);
	}
</script>

<div class="mb-6">
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label class="mb-2 block text-sm font-medium">{label}</label>

	<Popover.Root bind:open={popoverOpen}>
		<Popover.Trigger bind:ref={triggerRef}>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="outline"
					class="w-full justify-between"
					role="combobox"
					aria-expanded={popoverOpen}
					{disabled}
				>
					<span class="truncate">
						{value.length > 0 ? `${value.length} selected` : placeholder}
					</span>
					<ChevronsUpDownIcon class="ml-2 h-4 w-4 opacity-50" />
				</Button>
			{/snippet}
		</Popover.Trigger>

		<Popover.Content class="w-[240px] p-0">
			<Command.Root>
				<Command.Input placeholder={searchPlaceholder} />
				<Command.List>
					<Command.Empty>{emptyMessage}</Command.Empty>
					<Command.Group>
						{#each items as item (item)}
							<Command.Item value={item} onSelect={() => toggleItem(item)}>
								<CheckIcon
									class={cn(
										'mr-2 h-4 w-4',
										!value.includes(item) && 'text-transparent'
									)}
								/>
								{item}
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>

	{#if value.length > 0}
		<div class="mt-2 flex flex-wrap gap-1">
			{#each value as item (item)}
				<span
					class="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs"
				>
					{item}
					<button
						type="button"
						onclick={() => removeItem(item)}
						class="rounded-sm hover:bg-secondary-foreground/20"
						aria-label={`Remove ${item}`}
					>
						<XIcon class="h-3 w-3" />
					</button>
				</span>
			{/each}
		</div>
	{/if}
</div>
