<script lang="ts">
	import { conversationHistory } from '../lib/conversation';
	import History from '../lib/history.svelte';

	let iframeBlobUrl = '';
	let searchQuery = '';

	function updateIframe(result) {
		const htmlRegex = /HTML:\n*(```)?([\s\S]*?)(?:```|(?=\n*CSS:))/;
		const cssRegex = /CSS:\n*(```)?([\s\S]*?)(?:```|(?=\n*(?:JavaScript|Javascript):))/;
		const jsRegex =
			/Javascript|javascript|JavaScript:\n*(```)?([\s\S]*?)(?:```|(?=\n*(?:JavaScript|Javascript):))/;

		const htmlCode = (result.answer.match(htmlRegex) || [])[2] || '';
		const cssCode = (result.answer.match(cssRegex) || [])[2] || '';
		const jsCode = (result.answer.match(jsRegex) || [])[2] || '';

		// Generate the Blob URL for the iframe
		const scriptTagEnd = '</scr' + 'ipt>';
		const scriptTagStart = '<scr' + 'ipt>';
		const styleTagStart = '<st' + 'yle>';
		const styleTagEnd = '</st' + 'yle>';
		const fullCode = `<!DOCTYPE html>
  <html>
  <head>
    ${styleTagStart}${cssCode}${styleTagEnd}
  </head>
  <body>
    ${htmlCode}
    ${scriptTagStart}${jsCode}${scriptTagEnd}
  </body>
  </html>
    `;
		const blob = new Blob([fullCode], { type: 'text/html' });
		if (iframeBlobUrl) {
			URL.revokeObjectURL(iframeBlobUrl); // Revoke the old Blob URL
		}
		iframeBlobUrl = URL.createObjectURL(blob);
	}

	async function handleSearch() {
		// Update the conversation history with the user's message
		conversationHistory.update((history) => [...history, { role: 'user', content: searchQuery }]);

		const response = await fetch('/api', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				history: $conversationHistory
			})
		});
		if (response.status === 500) {
			console.error('An error occurred:', response.statusText);
			// Display an error message to the user
		} else {
			if (response.status === 200) {
				// Update the conversation history with the AI's response
				const result = await response.json();
				// Handle the successful response
				conversationHistory.update((history) => [
					...history,
					{ role: 'assistant', content: result.answer }
				]);
				updateIframe(result);
			}
		}
	}
	function handleLoadCode(event) {
		const { entry } = event.detail;
		updateIframe({ answer: entry.content });
	}

	function handlePublish() {
		// Replace this with the actual logic to publish the generated web application/site
		console.log('Publishing the generated web application/site');
	}
</script>

<svelte:head>
	<title>AI Editor</title>
</svelte:head>

<main
	class="mx-auto bg-white rounded p-8 shadow flex flex-col md:flex-row max-w-md md:max-w-5xl h-screen"
>
	<div class="flex flex-col flex-grow">
		<h1 class="text-2xl text-gray-800 text-center mb-6">Welcome to the AI Editor</h1>
		<form on:submit={handleSearch} class="flex justify-center mb-4">
			<textarea
				bind:value={searchQuery}
				placeholder="Enter your search query"
				class="flex-grow p-2 border border-gray-300 rounded text-base resize-y min-h-[100px]"
			/>
			<button
				type="submit"
				class="bg-blue-600 text-white text-base p-2 ml-2 rounded cursor-pointer hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
			>
				Search
			</button>
		</form>

		<button
			on:click={handlePublish}
			class="bg-blue-600 text-white text-base p-2 ml-2 rounded cursor-pointer hover:bg-blue-700"
		>
			Publish
		</button>
		<div class="mt-4 flex-grow border border-gray-300 rounded">
			{#if iframeBlobUrl}
				<iframe
					src={iframeBlobUrl}
					frameborder="0"
					title="Generated Web Application"
					class="w-full h-full"
				/>
			{:else}
				<p class="text-base text-gray-600 text-center mt-4">
					Please enter a search query and click the "Search" button to see the generated web
					application/site.
				</p>
			{/if}
		</div>
	</div>
	<div class="flex-grow md:ml-8">
		<History history={$conversationHistory} on:loadcode={handleLoadCode} />
	</div>
</main>
