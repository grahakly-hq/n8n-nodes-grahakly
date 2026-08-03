import {
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class Grahakly implements INodeType {
	methods = {
		loadOptions: {
			// The tenant's WhatsApp business numbers, for the "From Number" dropdown.
			async getPhoneNumbers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const rows = (await this.helpers.httpRequestWithAuthentication.call(this, 'grahaklyApi', {
					method: 'GET',
					url: '={{$credentials.baseUrl}}/api/v1/phone-numbers',
					json: true,
				})) as Array<{ id: string; displayPhoneNumber: string; verifiedName?: string }>;
				return rows.map((r) => ({
					name: `${r.verifiedName || r.displayPhoneNumber} (${r.displayPhoneNumber})`,
					value: r.id,
				}));
			},

			// Approved templates, for the "Template" dropdown. The list endpoint is paged: { items: [] }.
			async getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const res = (await this.helpers.httpRequestWithAuthentication.call(this, 'grahaklyApi', {
					method: 'GET',
					url: '={{$credentials.baseUrl}}/api/v1/templates',
					qs: { status: 'APPROVED', limit: 100 },
					json: true,
				})) as { items?: Array<{ name: string; language: string }> };
				return (res.items ?? []).map((t) => ({
					name: `${t.name} (${t.language})`,
					value: t.name,
				}));
			},
		},
	};

	description: INodeTypeDescription = {
		displayName: 'Grahakly',
		name: 'grahakly',
		icon: 'file:grahakly.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Send WhatsApp messages and templates and create contacts through Grahakly',
		defaults: { name: 'Grahakly' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'grahaklyApi', required: true }],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: { 'Content-Type': 'application/json' },
		},
		properties: [
			// ---- Resource ----
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Message', value: 'message' },
					{ name: 'Contact', value: 'contact' },
				],
				default: 'message',
			},

			// ---- Message operations ----
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['message'] } },
				options: [
					{
						name: 'Send Text',
						value: 'sendText',
						action: 'Send a text message',
						description: 'Send a free-form text message (only inside the 24-hour customer window)',
						routing: { request: { method: 'POST', url: '/api/v1/messages' } },
					},
					{
						name: 'Send Template',
						value: 'sendTemplate',
						action: 'Send a template message',
						description: 'Send an approved WhatsApp template — the only way to open a new conversation',
						routing: { request: { method: 'POST', url: '/api/v1/messages' } },
					},
				],
				default: 'sendText',
			},

			// ---- Contact operations ----
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['contact'] } },
				options: [
					{
						name: 'Create',
						value: 'create',
						action: 'Create a contact',
						description: 'Create a contact from a phone number',
						routing: { request: { method: 'POST', url: '/api/v1/contacts' } },
					},
				],
				default: 'create',
			},

			// ---- Shared: which business number to send FROM (required by the API) ----
			{
				displayName: 'From Number Name or ID',
				name: 'phoneNumberId',
				type: 'options',
				required: true,
				default: '',
				description:
					'The WhatsApp business number to send from. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				displayOptions: { show: { resource: ['message'] } },
				typeOptions: { loadOptionsMethod: 'getPhoneNumbers' },
				routing: { send: { type: 'body', property: 'phoneNumberId' } },
			},

			// ---- Shared: recipient (both message operations) ----
			{
				displayName: 'To (Phone Number)',
				name: 'toNumber',
				type: 'string',
				required: true,
				default: '',
				placeholder: '+919876543210',
				description: 'Recipient in international E.164 format, e.g. +919876543210',
				displayOptions: { show: { resource: ['message'] } },
				routing: { send: { type: 'body', property: 'toNumber' } },
			},

			// Send Text — the type discriminator and the body text
			{
				displayName: 'Message Text',
				name: 'text',
				type: 'string',
				required: true,
				default: '',
				typeOptions: { rows: 3 },
				displayOptions: { show: { resource: ['message'], operation: ['sendText'] } },
				routing: {
					send: {
						type: 'body',
						property: 'text.body',
					},
				},
			},
			{
				displayName: 'Type',
				name: 'textType',
				type: 'hidden',
				default: 'text',
				displayOptions: { show: { resource: ['message'], operation: ['sendText'] } },
				routing: { send: { type: 'body', property: 'type' } },
			},

			// Send Template — name, language, optional components JSON
			{
				displayName: 'Type',
				name: 'templateType',
				type: 'hidden',
				default: 'template',
				displayOptions: { show: { resource: ['message'], operation: ['sendTemplate'] } },
				routing: { send: { type: 'body', property: 'type' } },
			},
			{
				displayName: 'Template Name or ID',
				name: 'templateName',
				type: 'options',
				required: true,
				default: '',
				description:
					'An approved template in this account. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				displayOptions: { show: { resource: ['message'], operation: ['sendTemplate'] } },
				typeOptions: { loadOptionsMethod: 'getTemplates' },
				routing: { send: { type: 'body', property: 'template.name' } },
			},
			{
				displayName: 'Template Language',
				name: 'templateLanguage',
				type: 'string',
				required: true,
				default: 'en',
				description: 'The template language code, e.g. en, en_US, hi',
				displayOptions: { show: { resource: ['message'], operation: ['sendTemplate'] } },
				routing: { send: { type: 'body', property: 'template.language' } },
			},
			{
				displayName: 'Components JSON',
				name: 'templateComponents',
				type: 'string',
				default: '',
				typeOptions: { rows: 4 },
				description:
					'Optional. The template component parameters as a JSON string, matching the WhatsApp template components format. Leave empty for a template with no variables.',
				displayOptions: { show: { resource: ['message'], operation: ['sendTemplate'] } },
				routing: { send: { type: 'body', property: 'template.componentsJson' } },
			},

			// ---- Contact: create fields ----
			{
				displayName: 'Phone Number',
				name: 'phoneE164',
				type: 'string',
				required: true,
				default: '',
				placeholder: '+919876543210',
				description: 'Contact phone in international E.164 format',
				displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
				routing: { send: { type: 'body', property: 'phoneE164' } },
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['contact'], operation: ['create'] } },
				options: [
					{
						displayName: 'Display Name',
						name: 'displayName',
						type: 'string',
						default: '',
						routing: { send: { type: 'body', property: 'displayName' } },
					},
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						placeholder: 'name@example.com',
						default: '',
						routing: { send: { type: 'body', property: 'email' } },
					},
					{
						displayName: 'External ID',
						name: 'externalId',
						type: 'string',
						default: '',
						description: 'Your own identifier for this contact, for keeping systems in sync',
						routing: { send: { type: 'body', property: 'externalId' } },
					},
					{
						displayName: 'First Name',
						name: 'firstName',
						type: 'string',
						default: '',
						routing: { send: { type: 'body', property: 'firstName' } },
					},
					{
						displayName: 'Last Name',
						name: 'lastName',
						type: 'string',
						default: '',
						routing: { send: { type: 'body', property: 'lastName' } },
					},
				],
			},
		],
	};
}
