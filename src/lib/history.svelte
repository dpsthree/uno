<script lang="ts">
	import { writable, derived } from 'svelte/store';
	import type { ConversationEntry } from './conversation';

	export let history: ConversationEntry[] = [];
	let expanded = writable(new Set());
	let selectedIndex = writable(-1);

	let expandedContent = derived(expanded, ($expanded) => {
		return Array.from($expanded.values());
	});

	function toggleCollapse(index) {
		expanded.update(($expanded) => {
			if ($expanded.has(index)) {
				$expanded.delete(index);
			} else {
				$expanded.add(index);
			}
			return new Set($expanded);
		});
	}

	function loadCode(index) {
		selectedIndex.set(index);
		const entry = history[index];
		// Add your logic here to load the code from the selected history entry
	}
</script>

<div class="bg-gray-100 p-4 rounded mt-4">
	{#each history as item, index}
		<div
			class="py-2 text-sm font-semibold mb-2 {item.role === 'user'
				? 'text-blue-600'
				: 'text-pink-600'} {item.role === 'assistant' && $selectedIndex === index
				? 'bg-gray-200'
				: ''}"
		>
			<strong>{item.role}:</strong>
			<span class="cursor-pointer" on:click={() => toggleCollapse(index)}>
				{$expandedContent.includes(index) ? item.content : item.content.slice(0, 50) + '...'}
			</span>
			{#if item.role === 'assistant'}
				<button
					class="ml-2 bg-green-500 text-white text-xs p-1 rounded hover:bg-green-600"
					on:click={() => loadCode(index)}
				>
					Load
				</button>
			{/if}
		</div>
	{/each}
</div>
