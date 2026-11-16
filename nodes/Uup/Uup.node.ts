import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { incidentDescription } from './resources/incident';
import { monitorDescription } from './resources/monitor';
import { projectDescription } from './resources/project';
import { statusDescription } from './resources/status';

export class Uup implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'You Up?',
		name: 'uup',
		icon: { light: 'file:uup.svg', dark: 'file:uup.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Read status, Monitors and Incidents from You Up? uptime monitoring',
		defaults: {
			name: 'You Up?',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'uupApi', required: true }],
		requestDefaults: {
			baseURL: 'https://api.uup.dev/v1',
			headers: {
				Accept: 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Incident', value: 'incident' },
					{ name: 'Monitor', value: 'monitor' },
					{ name: 'Project', value: 'project' },
					{ name: 'Status', value: 'status' },
				],
				default: 'status',
			},
			...statusDescription,
			...projectDescription,
			...monitorDescription,
			...incidentDescription,
		],
	};
}
