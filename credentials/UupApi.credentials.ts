import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class UupApi implements ICredentialType {
	name = 'uupApi';

	displayName = 'You Up? API';

	icon: Icon = { light: 'file:../nodes/Uup/uup.svg', dark: 'file:../nodes/Uup/uup.dark.svg' };

	documentationUrl = 'https://github.com/uupdev/n8n-nodes-uup?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			placeholder: 'uup_api_...',
			description:
				'An API token from the API tokens screen in You Up?. A Read-only token is enough for this node.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.uup.dev/v1',
			url: '/token',
		},
	};
}
