import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class GrahaklyApi implements ICredentialType {
	name = 'grahaklyApi';

	displayName = 'Grahakly API';

	documentationUrl = 'https://grahakly.com';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'A Grahakly API key (starts with egk_). Create one in Grahakly under Settings → API Keys, and grant it the scopes for what this node will do (messages:send, contacts:write).',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.grahakly.com',
			required: true,
			description: 'The Grahakly API base URL. Change it only for a self-hosted or staging instance.',
		},
	];

	// The key is sent as a bearer token; the API routes an "egk_" bearer to its API-key scheme.
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	// Any messaging key can read its own phone numbers, so this both proves the key and fails
	// clearly when it lacks messaging scope.
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/v1/phone-numbers',
			method: 'GET',
		},
	};
}
