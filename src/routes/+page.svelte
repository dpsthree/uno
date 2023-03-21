<script lang="ts">
	let searchQuery = '';
	let iframeSrc = '';

	async function handleSearch(event: Event) {
    const response = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchQuery,
      }),
    });
    console.log('response', await response.json());

		// iframeSrc = `https://example.com/${searchQuery}`;
	}

	function handlePublish() {
		// Replace this with the actual logic to publish the generated web application/site
		console.log('Publishing the generated web application/site');
	}
</script>

<svelte:head>
	<title>AI Editor</title>
</svelte:head>

<main>
	<h1>Welcome to the AI Editor</h1>
	<form on:submit={handleSearch}>
		<input type="text" bind:value={searchQuery} placeholder="Enter your search query" />
		<button type="submit">Search</button>
	</form>

	<button on:click={handlePublish}>Publish</button>

	<div>
		{#if iframeSrc}
			<iframe src={iframeSrc} frameborder="0" title="Generated Web Application" />
		{:else}
			<p>
				Please enter a search query and click the "Search" button to see the generated web
				application/site.
			</p>
		{/if}
	</div>
</main>
