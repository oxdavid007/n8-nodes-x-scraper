import type { INodeParameterResourceLocator } from 'n8n-workflow';
import axios from 'axios';

export function returnId(tweetId: INodeParameterResourceLocator) {
	if (tweetId.mode === 'id') {
		return tweetId.value as string;
	}

	//
	else if (tweetId.mode === 'url') {
		const value = tweetId.value as string;
		const tweetIdMatch = value.includes('lists')
			? value.match(/^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/list(s)?\/(\d+)$/)
			: value.match(/^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)$/);

		return tweetIdMatch?.[3] as string;
	}

	//
	else {
		throw new Error(`The mode ${tweetId.mode} is not valid!`);
	}
}

export interface CreateTwitterUserWithCookiesDto {
	username: string;
	guest_id: string;
	kdt: string;
	twid: string;
	ct0: string;
	auth_token: string;
}

export async function convertMediaUrlToBuffer(imageUrl: string) {
	try {
		const response = await axios.get(imageUrl, {
			responseType: 'arraybuffer', // Ensure we get the data as a buffer
		});

		const data = Buffer.from(response.data); // Convert the response data to a Buffer
		const mediaType = response.headers['content-type']; // Get the media type from the response headers

		return {
			data,
			mediaType: mediaType as string,
		};
	} catch (error) {
		console.error('Error fetching the image:', error);
		throw error; // Rethrow the error for further handling
	}
}
