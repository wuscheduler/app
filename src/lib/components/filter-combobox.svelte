<script lang="ts">
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import XIcon from '@lucide/svelte/icons/x';
	import SvelteVirtualList from '@humanspeak/svelte-virtual-list';

	interface Props {
		label: string | undefined;
		value: string | undefined;
		items: string[];
		placeholder?: string;
		searchPlaceholder?: string;
		emptyMessage?: string;
		clearable?: boolean;
		disabled?: boolean;
	}

	let {
		label = undefined,
		value = $bindable(undefined),
		items,
		placeholder = 'Select...',
		searchPlaceholder = 'Search...',
		emptyMessage = 'No results found.',
		clearable = false,
		disabled = false
	}: Props = $props();

	let popoverOpen = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);
	let searchValue = $state('');

	let filteredItems = $derived(
		searchValue
			? items.filter((item) => item.toLowerCase().includes(searchValue.toLowerCase()))
			: items
	);

	function closePopover() {
		popoverOpen = false;
		searchValue = '';
		tick().then(() => triggerRef?.focus());
	}

	function handleSelect(selectedValue: string) {
		value = selectedValue;
		closePopover();
	}

	function handleClear(e: Event) {
		e.stopPropagation();
		value = undefined;
	}
</script>

<div class="mb-6">
	{#if label}
		<label class="mb-2 block text-sm font-medium" for="combobox">{label}</label>
	{/if}
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
						{value || placeholder}
					</span>
					{#if clearable && value}
						<button
							type="button"
							onclick={handleClear}
							class="ml-2 rounded-sm opacity-50 hover:opacity-100"
						>
							<XIcon class="h-4 w-4" />
						</button>
					{:else}
						<ChevronsUpDownIcon class="ml-2 h-4 w-4 opacity-50" />
					{/if}
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-[240px] p-0">
			<Command.Root shouldFilter={false}>
				<Command.Input placeholder={searchPlaceholder} bind:value={searchValue} />
				<Command.List class="h-[200px] overflow-hidden">
					{#if filteredItems.length === 0}
						<Command.Empty>{emptyMessage}</Command.Empty>
					{:else}
						<SvelteVirtualList items={filteredItems}>
							{#snippet renderItem(item)}
								<Command.Item value={item} onSelect={() => handleSelect(item)}>
									<CheckIcon
										class={cn('mr-2 h-4 w-4', value !== item && 'text-transparent')}
									/>
									{item}
								</Command.Item>
							{/snippet}
						</SvelteVirtualList>
					{/if}
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
</div>
