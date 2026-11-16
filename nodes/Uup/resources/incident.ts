import type { INodeProperties } from 'n8n-workflow';
import { listOutput, pageFields, projectField } from './shared';

const show = { resource: ['incident'] };

export const incidentDescription: INodeProperties[] = [
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
				action: 'Get an incident',
				description: 'Get one Incident, with who acknowledged it and who ended it',
				routing: {
					request: {
						method: 'GET',
						url: '=/projects/{{ toPathSegment($parameter.projectId) }}/incidents/{{ toPathSegment($parameter.incidentId) }}',
					},
				},
			},
			{
				name: 'Get Evidence',
				value: 'getEvidence',
				action: 'Get the evidence of an incident',
				description:
					'Get where an Incident stopped, in plain words, and what each location saw when it opened',
				routing: {
					request: {
						method: 'GET',
						url: '=/projects/{{ toPathSegment($parameter.projectId) }}/incidents/{{ toPathSegment($parameter.incidentId) }}/evidence',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get many incidents',
				description: "Get a Project's Incidents, newest first",
				routing: {
					request: {
						method: 'GET',
						url: '=/projects/{{ toPathSegment($parameter.projectId) }}/incidents',
					},
					output: listOutput,
				},
			},
		],
		default: 'getAll',
	},
	projectField(show),
	{
		displayName: 'Incident ID',
		name: 'incidentId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'inc_...',
		description: 'The ID of the Incident, as Get Many returns it',
		displayOptions: { show: { ...show, operation: ['get', 'getEvidence'] } },
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
				displayName: 'Monitor ID',
				name: 'monitor',
				type: 'string',
				default: '',
				placeholder: 'mon_...',
				description: 'Only Incidents on this Monitor',
				routing: {
					send: { type: 'query', property: 'monitor', value: '={{ $value || undefined }}' },
				},
			},
			{
				displayName: 'State',
				name: 'open',
				type: 'options',
				default: 'true',
				options: [
					{ name: 'Open', value: 'true' },
					{ name: 'Ended', value: 'false' },
				],
				description: 'Only open Incidents, or only ended ones',
				routing: { send: { type: 'query', property: 'open' } },
			},
		],
	},
];
