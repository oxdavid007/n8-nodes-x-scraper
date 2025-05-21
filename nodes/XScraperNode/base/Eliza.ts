import { Profile, Scraper, Tweet } from 'agent-twitter-client';
import { CreateTwitterUserWithCookiesDto } from './utils';

interface CreateTweetResponse {
	// Add response type properties here
	errors?: Array<{ message: string }>;
}

type DirectMessagesResponse = {
	conversations: Array<{
		conversationId: string;
		messages: Array<{
			id: string;
			text: string;
			senderId: string;
			recipientId: string;
			createdAt: string;
			mediaUrls?: string[];
			senderScreenName?: string;
			recipientScreenName?: string;
		}>;
		participants: Array<{
			id: string;
			screenName: string;
		}>;
	}>;
	users: Array<{
		id: string;
		screenName: string;
		name: string;
		profileImageUrl: string;
		description?: string;
		verified?: boolean;
		protected?: boolean;
		followersCount?: number;
		friendsCount?: number;
	}>;
	cursor?: string;
	lastSeenEventId?: string;
	trustedLastSeenEventId?: string;
	untrustedLastSeenEventId?: string;
	inboxTimelines?: {
		trusted?: {
			status: string;
			minEntryId?: string;
		};
		untrusted?: {
			status: string;
			minEntryId?: string;
		};
	};
	userId: string;
};

export class Eliza {
	private scrapers: Map<string, Scraper>;

	constructor() {
		this.scrapers = new Map();
	}

	private getRandomScraper(): Scraper {
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
		return scraper;
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

		const scraper = this.getRandomScraper();
		try {
			const rs = await scraper.sendLongTweet(content, replyToTweetId, mediaData);
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

	async getMessages(username: string): Promise<DirectMessagesResponse> {
		const scraper = this.getRandomScraper();
		try {
			const user = await scraper.getProfile(username);
			const rs = await scraper.getDirectMessageConversations(user.userId as string);
			return rs;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to get messages: ${error.message}`);
			}
			throw new Error('Failed to get messages: Unknown error');
		}
	}

	async like(tweetId: string): Promise<void> {
		const scraper = this.getRandomScraper();
		try {
			await scraper.likeTweet(tweetId);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to like tweet: ${error.message}`);
			}
			throw new Error('Failed to like tweet: Unknown error');
		}
	}

	async retweet(tweetId: string): Promise<void> {
		const scraper = this.getRandomScraper();
		try {
			await scraper.retweet(tweetId);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to retweet: ${error.message}`);
			}
			throw new Error('Failed to retweet: Unknown error');
		}
	}

	async getUser(username: string): Promise<Profile> {
		const scraper = this.getRandomScraper();
		try {
			const user = await scraper.getProfile(username);
			return user;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to get user: ${error.message}`);
			}
			throw new Error('Failed to get user: Unknown error');
		}
	}

	async getTweetsByUsername(username: string, limit: number = 20): Promise<Tweet[]> {
		const scraper = this.getRandomScraper();
		try {
			const tweetsGenerator = await scraper.getTweets(username, limit);
			const tweets: Tweet[] = [];
			for await (const tweet of tweetsGenerator) {
				tweets.push(tweet);
			}
			return tweets;
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to get tweets: ${error.message}`);
			}
			throw new Error('Failed to get tweets: Unknown error');
		}
	}
}
