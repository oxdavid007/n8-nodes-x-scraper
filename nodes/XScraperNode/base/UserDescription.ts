import type { INodeProperties } from 'n8n-workflow';

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'getUser',
				description: 'Retrieve a user by username',
				action: 'Get user',
			},
			{
				name: 'Get Tweets',
				value: 'getTweets',
				description: "Retrieve a user's tweets",
				action: 'Get user tweets',
			},
			{
				name: 'Get Messages',
				value: 'getMessages',
				description: "Retrieve a user's messages",
				action: 'Get user messages',
			},
		],
		default: 'getMessages',
	},
];

export const userFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                user:getUser                        */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'User',
		name: 'user',
		type: 'resourceLocator',
		default: { mode: 'username', value: '' },
		required: true,
		description: 'The user you want to search',
		displayOptions: {
			show: {
				operation: ['getUser', 'getTweets'],
				resource: ['user'],
			},
		},
		modes: [
			{
				displayName: 'By Username',
				name: 'username',
				type: 'string',
				validation: [],
				placeholder: 'e.g. n8n',
				url: '',
			},
		],
	},

	/* -------------------------------------------------------------------------- */
	/*                                user:getTweets                        */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Limit',
		name: 'limit',
		description: 'Max number of tweets to return',
		type: 'number',
		default: 20,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				operation: ['getTweets'],
				resource: ['user'],
			},
		},
	},

	/* -------------------------------------------------------------------------- */
	/*                                user:getTimeline                        */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'User',
		name: 'user',
		type: 'resourceLocator',
		default: { mode: 'username', value: '' },
		required: true,
		description: 'The user you want to search',
		displayOptions: {
			show: {
				operation: ['getTimeline'],
				resource: ['user'],
			},
		},
		modes: [
			{
				displayName: 'By Username',
				name: 'username',
				type: 'string',
				validation: [],
				placeholder: 'e.g. n8n',
				url: '',
			},
		],
	},
	{
		displayName: 'Limit',
		name: 'limit',
		description: 'Max number of results to return',
		type: 'number',
		// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-limit
		default: 20,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				operation: ['getTimeline'],
				resource: ['user'],
			},
		},
	},
];
