<script lang="ts">
	import { conversationHistory, type ConversationEntry } from '../lib/conversation';
	import History from '../lib/history.svelte';

	let iframeBlobUrl = '';
	let searchQuery = '';

	function updateIframe(text: string) {
		const htmlRegex = /HTML:\n*(```)?([\s\S]*?)(?:```|(?=\n*CSS:))/;
		const cssRegex = /CSS:\n*(```)?([\s\S]*?)(?:```|(?=\n*(?:JavaScript|Javascript):))/;
		const jsRegex =
			/Javascript|javascript|JavaScript:\n*(```)?([\s\S]*?)(?:```|(?=\n*(?:JavaScript|Javascript):))/;

		const htmlCode = (text.match(htmlRegex) || [])[2] || '';
		const cssCode = (text.match(cssRegex) || [])[2] || '';
		const jsCode = (text.match(jsRegex) || [])[2] || '';

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
  function createLinearHistory(history: ConversationEntry[]){
    let linearHistory = [];
    for(let i = 0; i < history.length; i++){
      linearHistory.push(history[i].user);
      linearHistory.push(history[i].assistant);
    }
    return linearHistory;
  }

	async function handleSearch() {
		let conversation: ConversationEntry = {
			user: { role: 'user', content: searchQuery },
			assistant: { role: 'assistant', content: '' }
		};

		const response = await fetch('/api', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				history: [...createLinearHistory($conversationHistory), conversation.user],
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
				conversation.assistant = { role: 'assistant', content: result.answer };
				conversationHistory.update((history) => [...history, conversation]);
				updateIframe(result.answer);
			}
		}
	}
	function handleLoadCode(event) {
		const { entry } = event.detail;
		updateIframe(entry.assistant.content);
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
