import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class XScraperCredentialsApi implements ICredentialType {
	name = 'xScraperCredentialsApi';
	displayName = 'X Scraper Credentials API';

	documentationUrl = 'https://developer.x.com/en/portal/dashboard';

	properties: INodeProperties[] = [
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			required: true,
			default: '',
			description: 'The username for X authentication',
		},
		{
			displayName: 'Guest ID',
			name: 'guest_id',
			type: 'string',
			required: true,
			default: '',
			description: 'The guest ID for X authentication',
		},
		{
			displayName: 'KDT',
			name: 'kdt',
			type: 'string',
			required: true,
			default: '',
			description: 'The KDT token for X authentication',
		},
		{
			displayName: 'TWID',
			name: 'twid',
			type: 'string',
			required: true,
			default: '',
			description: 'The TWID token for X authentication',
		},
		{
			displayName: 'CT0',
			name: 'ct0',
			type: 'string',
			required: true,
			default: '',
			description: 'The CT0 token for X authentication',
		},
		{
			displayName: 'Auth Token',
			name: 'auth_token',
			type: 'string',
			required: true,
			default: '',
			description: 'The authentication token for X',
		},
	];
}
