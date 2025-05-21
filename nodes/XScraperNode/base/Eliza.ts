import { Scraper } from 'agent-twitter-client';
import { CreateTwitterUserWithCookiesDto } from './CreateTwitterUserWithCookiesDto';

interface CreateTweetResponse {
	// Add response type properties here
	errors?: Array<{ message: string }>;
}

export class Eliza {
	private scrapers: Map<string, Scraper>;

	constructor() {
		this.scrapers = new Map();
	}

	async createUserWithCookies(data: CreateTwitterUserWithCookiesDto) {
		try {
			let attempts = 10;
			while (attempts > 0) {
				try {
					const scraper = new Scraper({});
					const cookieStrings = [
						`guest_id=${data.guest_id}; Domain=twitter.com; Path=/; Secure; ; SameSite=none`,
						`kdt=${data.kdt}; Domain=twitter.com; Path=/; Secure; HttpOnly; SameSite=Lax`,
						`twid="u=${data.twid}"; Domain=twitter.com; Path=/; Secure; ; SameSite=none`,
						`ct0=${data.ct0}; Domain=twitter.com; Path=/; Secure; ; SameSite=lax`,
						`auth_token=${data.auth_token}; Domain=twitter.com; Path=/; Secure; HttpOnly; SameSite=none`,
						`att=1-j9tVvDhZ8SvRkTJg5vb7g43onTh2hnDxAdGSkIUO; Domain=twitter.com; Path=/; Secure; HttpOnly; SameSite=none`,
					];

					await scraper.setCookies(cookieStrings);

					if (await scraper.isLoggedIn()) {
						this.scrapers.set(data.username, scraper);
						return true;
					}
					await new Promise((resolve) => setTimeout(resolve, 10000));
					attempts--;
				} catch (error) {
					await new Promise((resolve) => setTimeout(resolve, 10000));
					attempts--;
				}
			}

			throw new Error('Failed to login after 10 attempts');
		} catch (error) {
			throw new Error(error as string);
		}
	}

	async post(
		content: string,
		replyToTweetId?: string,
		mediaData?: {
			data: Uint8Array;
			mediaType: string;
		}[],
	): Promise<CreateTweetResponse> {
		if (!content) {
			throw new Error('Content is required');
		}

		const keys = [...this.scrapers.keys()];

		let scraper: Scraper | undefined;

		if (keys.length === 1) {
			scraper = this.scrapers.get(keys[0]);
		} else {
			const randomKey = keys[Math.floor(Math.random() * keys.length)];
			scraper = this.scrapers.get(randomKey);
		}
		if (!scraper) {
			throw new Error('Scraper not found');
		}
		try {
			console.log(
				'🚀 ~ Eliza ~ content, replyToTweetId, mediaData:',
				content,
				replyToTweetId,
				mediaData,
			);

			const rs = await scraper.sendLongTweet(content, replyToTweetId, mediaData);
			console.log('🚀 ~ Eliza ~ rs:', rs);
			const json = await rs.json();

			if (json.errors) {
				throw new Error(json.errors[0].message);
			}
			return json;
		} catch (error) {
			const rs = await scraper.sendTweet(content, replyToTweetId, mediaData);
			const json = await rs.json();

			if (json.errors) {
				throw new Error(json.errors[0].message);
			}
			return json;
		}
	}
}
