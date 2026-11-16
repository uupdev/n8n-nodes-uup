import type { INodeProperties } from 'n8n-workflow';
import { listOutput, pageFields, projectField } from './shared';

const show = { resource: ['monitor'] };

export const monitorDescription: INodeProperties[] = [
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
				action: 'Get a monitor',
				description: 'Get one Monitor and its Checks, each with its status and open Incident',
				routing: {
					request: {
						method: 'GET',
						url: '=/projects/{{ toPathSegment($parameter.projectId) }}/monitors/{{ toPathSegment($parameter.monitorId) }}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many monitors',
				description: "Get a Project's Monitors, each with its Checks",
				routing: {
					request: {
						method: 'GET',
						url: '=/projects/{{ toPathSegment($parameter.projectId) }}/monitors',
					},
					output: listOutput,
				},
			},
		],
		default: 'getAll',
	},
	projectField(show),
	{
		displayName: 'Monitor ID',
		name: 'monitorId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'mon_...',
		description: 'The ID of the Monitor, as Get Many returns it',
		displayOptions: { show: { ...show, operation: ['get'] } },
	},
	...pageFields({ ...show, operation: ['getAll'] }),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { ...show, operation: ['getAll'] } },
		options: [
			{
				displayName: 'Search',
				name: 'q',
				type: 'string',
				default: '',
				description: 'Only Monitors whose name or target contains these words, in any case',
				routing: { send: { type: 'query', property: 'q', value: '={{ $value || undefined }}' } },
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				default: 'active',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Paused', value: 'paused' },
					{ name: 'Suspended', value: 'suspended' },
				],
				description: 'Only Monitors in this state',
				routing: { send: { type: 'query', property: 'state' } },
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				default: 'http',
				options: [
					{ name: 'Heartbeat', value: 'heartbeat' },
					{ name: 'HTTP', value: 'http' },
					{ name: 'Ping', value: 'ping' },
					{ name: 'TCP', value: 'tcp' },
				],
				description: 'Only Monitors of this type',
				routing: { send: { type: 'query', property: 'type' } },
			},
		],
	},
];
