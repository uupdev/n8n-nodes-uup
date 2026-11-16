import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['status'] };

export const statusDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get what is not ok now',
				description:
					'Get, for each Project, the Monitors that are not ok, the open Incidents and the open Regional outages',
				routing: {
					request: { method: 'GET', url: '/status' },
					output: {
						postReceive: [{ type: 'rootProperty', properties: { property: 'projects' } }],
					},
				},
			},
		],
		default: 'get',
	},
	{
		displayName: 'Project Name or ID',
		name: 'projectId',
		type: 'options',
		default: '',
		description:
			'Only this Project. Leave empty for every Project the token reaches. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: { ...show, operation: ['get'] } },
		typeOptions: {
			loadOptions: {
				routing: {
					request: { method: 'GET', url: '/projects', qs: { limit: 200 } },
					output: {
						postReceive: [
							{ type: 'rootProperty', properties: { property: 'data' } },
							{
								type: 'setKeyValue',
								properties: {
									name: '={{ $responseItem.name }}',
									value: '={{ $responseItem.id }}',
								},
							},
							{ type: 'sort', properties: { key: 'name' } },
						],
					},
				},
			},
		},
		routing: {
			send: { type: 'query', property: 'project', value: '={{ $value || undefined }}' },
		},
	},
];
