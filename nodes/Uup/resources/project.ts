import type { INodeProperties } from 'n8n-workflow';
import { listOutput, pageFields } from './shared';

const show = { resource: ['project'] };

export const projectDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many projects',
				description: 'Get the Projects the token reaches',
				routing: {
					request: { method: 'GET', url: '/projects' },
					output: listOutput,
				},
			},
		],
		default: 'getAll',
	},
	...pageFields({ ...show, operation: ['getAll'] }),
];
