<script lang="ts">
	import { writable, derived } from 'svelte/store';
	import { createEventDispatcher } from 'svelte';

	import type { ConversationEntry } from './conversation';

	export let history: ConversationEntry[] = [];

	let expanded = writable(new Set());
	let selectedIndex = writable(-1);
	const dispatch = createEventDispatcher();

	let expandedContent = derived(expanded, ($expanded) => {
		return Array.from($expanded.values());
	});

	function containsCode(content: string) {
		const htmlRegex = /HTML:\n*(```)?([\s\S]*?)(?:```|(?=\n*CSS:))/;
		const cssRegex = /CSS:\n*(```)?([\s\S]*?)(?:```|(?=\n*(?:JavaScript|Javascript):))/;
		const jsRegex =
			/Javascript|javascript|JavaScript:\n*(```)?([\s\S]*?)(?:```|(?=\n*(?:JavaScript|Javascript):))/;

		const hasHtml = htmlRegex.test(content);
		const hasCss = cssRegex.test(content);
		const hasJs = jsRegex.test(content);

		return hasHtml && hasCss && hasJs;
	}

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
		dispatch('loadcode', { index, entry });
	}
</script>

<div class="bg-gray-100 p-4 rounded mt-4">
	{#each history as item, index}
		<div class="py-2 text-sm font-semibold mb-2 text-blue-600">
			<strong>User:</strong>
			<span class="cursor-pointer" on:click={() => toggleCollapse(index)}>
				{$expandedContent.includes(index)
					? item.user.content
					: item.user.content.slice(0, 50) + '...'}
			</span>
		</div>
		<div
			class="py-2 text-sm font-semibold mb-2 text-pink-600 {$selectedIndex === index
				? 'bg-gray-200'
				: ''}"
		>
			<strong>Assistant:</strong>
			<span class="cursor-pointer" on:click={() => toggleCollapse(index)}>
				{$expandedContent.includes(index)
					? item.assistant.content
					: item.assistant.content.slice(0, 50) + '...'}
			</span>
			{#if containsCode(item.assistant.content)}
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
