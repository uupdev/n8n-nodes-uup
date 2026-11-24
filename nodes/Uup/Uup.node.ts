import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { getProjects } from './methods/loadOptions';
import { heartbeatDescription, sendHeartbeat } from './resources/heartbeat';
import { incidentDescription } from './resources/incident';
import { monitorDescription } from './resources/monitor';
import { projectDescription } from './resources/project';
import { BASE_URL } from './resources/shared';
import { statusDescription } from './resources/status';

export class Uup implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'You Up?',
		name: 'uup',
		icon: { light: 'file:uup.svg', dark: 'file:uup.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Send a Heartbeat when a workflow succeeds, and read status, Monitors and Incidents from You Up? uptime monitoring',
		defaults: {
			name: 'You Up?',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		// Heartbeat needs no token, and never gets one: its URL is typed by hand.
		credentials: [
			{
				name: 'uupApi',
				required: true,
				displayOptions: { hide: { resource: ['heartbeat'] } },
			},
		],
		requestDefaults: {
			baseURL: BASE_URL,
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
					{ name: 'Heartbeat', value: 'heartbeat' },
					{ name: 'Incident', value: 'incident' },
					{ name: 'Monitor', value: 'monitor' },
					{ name: 'Project', value: 'project' },
					{ name: 'Status', value: 'status' },
				],
				default: 'heartbeat',
			},
			...heartbeatDescription,
			...statusDescription,
			...projectDescription,
			...monitorDescription,
			...incidentDescription,
		],
	};

	methods = {
		loadOptions: { getProjects },
	};

	/** Every other operation is declarative routing. */
	customOperations = {
		heartbeat: { send: sendHeartbeat },
	};
}
