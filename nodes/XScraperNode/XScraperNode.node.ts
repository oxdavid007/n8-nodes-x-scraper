import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeParameterResourceLocator,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { tweetFields, tweetOperations } from './base/TweetDescription';
import { userFields, userOperations } from './base/UserDescription';
import { Eliza } from './base/Eliza';
import { convertMediaUrlToBuffer, CreateTwitterUserWithCookiesDto, returnId } from './base/utils';

export class XScraperNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'X Scraper by Lab3',
		name: 'xScraper',
		group: ['transform'],
		icon: 'file:twitter.svg',
		version: 1,
		description: 'Scrape X Data with Lab3',
		defaults: {
			name: 'X Scraper by Lab3',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'xScraperCredentialsApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Tweet',
						value: 'tweet',
						description: 'Interact with tweets',
					},
					{
						name: 'User',
						value: 'user',
						description: 'Search users',
					},
				],
				default: 'tweet',
			},
			// TWEET
			...tweetOperations,
			...tweetFields,
			// USER
			...userOperations,
			...userFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const length = items.length;
		const returnData: INodeExecutionData[] = [];

		let responseData;

		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		// Get credentials and log them
		const credentials = await this.getCredentials('xScraperCredentialsApi');

		if (!credentials) {
			throw new NodeOperationError(this.getNode(), 'No credentials found');
		}

		// Validate required credentials
		const requiredFields = ['guest_id', 'kdt', 'twid', 'ct0', 'auth_token'];
		const missingFields = requiredFields.filter((field) => !credentials[field]);

		if (missingFields.length > 0) {
			throw new NodeOperationError(
				this.getNode(),
				`Missing required credentials: ${missingFields.join(', ')}`,
			);
		}

		// Initialize Eliza with credentials
		const eliza = new Eliza();
		const userData: CreateTwitterUserWithCookiesDto = {
			username: credentials.username as string, // You might want to make this configurable
			guest_id: credentials.guest_id as string,
			kdt: credentials.kdt as string,
			twid: credentials.twid as string,
			ct0: credentials.ct0 as string,
			auth_token: credentials.auth_token as string,
		};

		try {
			// Initialize the scraper
			await eliza.createUserWithCookies(userData);

			console.log('🚀 ~ XScraperNode ~ resource ~', resource);
			console.log('🚀 ~ XScraperNode ~ operation ~', operation);

			for (let i = 0; i < length; i++) {
				try {
					if (resource === 'tweet') {
						if (operation === 'create') {
							const text = this.getNodeParameter('text', i) as string;

							const { mediaUrl, inReplyToStatusId } = this.getNodeParameter(
								'additionalFields',
								i,
								{},
							) as {
								mediaUrl: string;
								inReplyToStatusId: INodeParameterResourceLocator;
							};
							let mediaData: { data: Buffer; mediaType: string }[] | undefined;
							let replyToTweetId: string | undefined;

							if (inReplyToStatusId) {
								replyToTweetId = returnId(inReplyToStatusId);
							}

							if (mediaUrl) {
								// Convert mediaId to Uint8Array and set mediaType
								const mediaItem = await convertMediaUrlToBuffer(mediaUrl);
								mediaData = [mediaItem];
							}
							responseData = await eliza.post(text, replyToTweetId, mediaData);
						}
						if (operation === 'like') {
							const tweetRLC = this.getNodeParameter(
								'tweetId',
								i,
								'',
								{},
							) as INodeParameterResourceLocator;

							const tweetId = returnId(tweetRLC);

							await eliza.like(tweetId);
							responseData = 'Tweet has been successfully liked';
						}

						if (operation === 'retweet') {
							const tweetRLC = this.getNodeParameter(
								'tweetId',
								i,
								'',
								{},
							) as INodeParameterResourceLocator;

							const tweetId = returnId(tweetRLC);

							await eliza.retweet(tweetId);
							responseData = 'Tweet has been successfully retweeted';
						}

						if (operation === 'quoteTweet') {
							const tweetRLC = this.getNodeParameter(
								'tweetId',
								i,
								'',
								{},
							) as INodeParameterResourceLocator;
							const quoteText = this.getNodeParameter('quoteText', i) as string;

							const { mediaUrl } = this.getNodeParameter('additionalFields', i, {}) as {
								mediaUrl: string;
							};
							let mediaData: { data: Buffer; mediaType: string }[] | undefined;

							if (mediaUrl) {
								// Convert mediaId to Uint8Array and set mediaType
								const mediaItem = await convertMediaUrlToBuffer(mediaUrl);
								mediaData = [mediaItem];
							}
							const tweetId = returnId(tweetRLC);
							responseData = await eliza.quoteTweet(tweetId, quoteText, mediaData);
						}
					}

					if (resource === 'user') {
						if (operation === 'getUser') {
							const username = this.getNodeParameter(
								'user',
								i,
								'',
								{},
							) as INodeParameterResourceLocator;
							responseData = await eliza.getUser(username.value as string);
						}

						if (operation === 'getTweets') {
							const username = this.getNodeParameter(
								'user',
								i,
								'',
								{},
							) as INodeParameterResourceLocator;
							const limit = this.getNodeParameter('limit', i) as number;
							responseData = await eliza.getTweetsByUsername(username.value as string, limit);
						}

						if (operation === 'getTimeline') {
							responseData = 'Timeline operation not implemented yet';
						}

						if (operation === 'getMessages') {
							responseData = await eliza.getMessages(userData.username);
						}

						if (operation === 'getPendingMessages') {
							const numberFollower = this.getNodeParameter('numberFollower', i) as number;
							responseData = await eliza.getPendingMessages(userData.username, numberFollower);
						}
					}

					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray(responseData as unknown as IDataObject[]),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
				} catch (error) {
					if (this.continueOnFail()) {
						const executionErrorData = {
							json: {
								error: (error as JsonObject).message,
							},
						};
						returnData.push(executionErrorData);
						continue;
					}
					throw error;
				}
			}
		} catch (error) {
			throw new NodeOperationError(
				this.getNode(),
				`Failed to initialize scraper: ${(error as Error).message}`,
			);
		}

		return [returnData];
	}
}
