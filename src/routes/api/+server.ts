import { json, error } from '@sveltejs/kit';
import { API_KEY } from '$env/static/private';
import axios from 'axios';

export async function POST({ request }) {
	try {
		const { history } = await request.json();
		const apiUrl = 'https://api.openai.com/v1/chat/completions';

		const response = await axios.post(
			apiUrl,
			{
				model: 'gpt-3.5-turbo',
				messages: history,
				n: 1
			},
			{
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${API_KEY}`
				}
			}
		);
		const answer = response.data.choices[0].message.content;

		// Update the conversation history with the AI's response on the client-side
		return json({ answer });
	} catch (e) {
    console.log(e)
		throw error(500, 'An error occured in the query processing server: ' + (e as any)?.message);
	}
}
