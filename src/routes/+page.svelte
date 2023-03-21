<script lang="ts">
	import { conversationHistory } from '../lib/conversation';

	let iframeBlobUrl = '';
	let searchQuery = '';
	let iframeSrc = '';

	async function handleSearch(event: Event) {
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
				console.log('response', result);
				// Handle the successful response
				conversationHistory.update((history) => [
					...history,
					{ role: 'assistant', content: result.answer }
				]);
				const htmlRegex = /HTML:\n*(```)?([\s\S]*?)(?:```|(?=\n*CSS:))/;
				const cssRegex = /CSS:\n*(```)?([\s\S]*?)(?:```|(?=\n*(?:JavaScript|Javascript):))/;
				const jsRegex = /Javascript|javascript|JavaScript:\n*(```)?([\s\S]*?)(?:```|(?=\n*(?:JavaScript|Javascript):))/;

				const htmlCode = (result.answer.match(htmlRegex) || [])[2] || '';
				console.log('htmlCode', htmlCode);
				const cssCode = (result.answer.match(cssRegex) || [])[2] || '';
				console.log('cssCode', cssCode);
				const jsCode = (result.answer.match(jsRegex) || [])[2] || '';
				console.log('jsCode', jsCode);

				// Generate the Blob URL for the iframe
				const scriptTagEnd = '</scr' + 'ipt>';
				const scriptTagStart = '<scr' + 'ipt>';
				const fullCode = `<!DOCTYPE html>
        <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
          ${scriptTagStart}${jsCode}${scriptTagEnd}
        </body>
        </html>
          `;
				console.log('full code', fullCode);
				const blob = new Blob([fullCode], { type: 'text/html' });
				if (iframeBlobUrl) {
					URL.revokeObjectURL(iframeBlobUrl); // Revoke the old Blob URL
				}
				iframeBlobUrl = URL.createObjectURL(blob);
			}
		}
		// Update the conversation history with the AI's response

		// iframeSrc = `https://example.com/${searchQuery}`;
	}

	function handlePublish() {
		// Replace this with the actual logic to publish the generated web application/site
		console.log('Publishing the generated web application/site');
	}
</script>

<svelte:head>
	<title>AI Editor</title>
	<style>
		* {
			box-sizing: border-box;
			margin: 0;
			padding: 0;
		}

		body {
			font-family: 'Arial', sans-serif;
			background-color: #f3f3f3;
			padding: 2rem;
			display: flex;
			flex-direction: column;
			height: 100vh;
		}

		main {
			max-width: 800px;
			margin: 0 auto;
			background-color: #ffffff;
			border-radius: 8px;
			padding: 2rem;
			box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
			display: flex;
			flex-direction: column;
			flex: 1;
		}

		h1 {
			font-size: 2rem;
			color: #222;
			text-align: center;
			margin-bottom: 1.5rem;
		}

		form {
			display: flex;
			justify-content: center;
			margin-bottom: 1rem;
		}

		textarea {
			flex: 1;
			padding: 0.5rem;
			border: 1px solid #ccc;
			border-radius: 4px;
			font-size: 1rem;
			resize: vertical;
			min-height: 100px;
		}

		button {
			background-color: #3498db;
			color: white;
			font-size: 1rem;
			padding: 0.5rem 1rem;
			margin-left: 0.5rem;
			border: none;
			border-radius: 4px;
			cursor: pointer;
		}

		button:hover {
			background-color: #2980b9;
		}

		button:disabled {
			background-color: #ccc;
			cursor: not-allowed;
		}

		iframe {
			width: 100%;
			flex-grow: 1;
			border: 1px solid #ccc;
			border-radius: 4px;
			margin-top: 1rem;
		}

		p {
			font-size: 1rem;
			color: #777;
			text-align: center;
			margin-top: 1rem;
		}
	</style>
</svelte:head>

<main>
	<h1>Welcome to the AI Editor</h1>
	<form on:submit={handleSearch}>
		<textarea bind:value={searchQuery} placeholder="Enter your search query" />
		<button type="submit">Search</button>
	</form>

	<button on:click={handlePublish}>Publish</button>

	<div>
		{#if iframeBlobUrl}
			<iframe src={iframeBlobUrl} frameborder="0" title="Generated Web Application" />
		{:else}
			<p>
				Please enter a search query and click the "Search" button to see the generated web
				application/site.
			</p>
		{/if}
	</div>
</main>
