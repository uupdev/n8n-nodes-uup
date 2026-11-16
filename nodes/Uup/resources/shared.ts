import type { IDataObject, INodeProperties } from 'n8n-workflow';

/** Where `/v1` lives; also the node's `requestDefaults.baseURL`. */
export const BASE_URL = 'https://api.uup.dev/v1';

/** The largest page `/v1` answers. */
export const PAGE_MAX = 200;

/** Every list answers `{ data, next }`; the items are under `data`. */
export const listOutput = {
	postReceive: [{ type: 'rootProperty' as const, properties: { property: 'data' } }],
};

/**
 * Follows `next` until the last page, when Return All is on. n8n merges this
 * request over the operation's options key by key, and a `qs` here would
 * replace the whole query, filters and all. So the cursor goes on the URL,
 * and only from the second page on.
 */
export const cursorPagination = {
	type: 'generic' as const,
	properties: {
		continue: '={{ !!$response.body.next }}',
		request: {
			url: '={{ $response.body && $response.body.next ? $request.url + "?cursor=" + encodeURIComponent($response.body.next) : $request.url }}',
		},
	},
};

/** The Project picker, filled from `GET /projects`. */
export function projectField(show: IDataObject, required = true): INodeProperties {
	return {
		displayName: 'Project Name or ID',
		name: 'projectId',
		type: 'options',
		required,
		default: '',
		description:
			'The Project to read. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: show as { [key: string]: Array<string> } },
		typeOptions: { loadOptionsMethod: 'getProjects' },
	};
}

/** Return All and Limit for a list operation. */
export function pageFields(show: { resource: string[]; operation: string[] }): INodeProperties[] {
	return [
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			displayOptions: { show },
			default: false,
			description: 'Whether to return all results or only up to a given limit',
			routing: {
				send: {
					paginate: '={{ $value }}',
					type: 'query',
					property: 'limit',
					value: `={{ $value ? ${PAGE_MAX} : $parameter.limit }}`,
				},
				operations: {
					pagination: cursorPagination,
				},
			},
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			displayOptions: { show: { ...show, returnAll: [false] } },
			typeOptions: { minValue: 1, maxValue: PAGE_MAX },
			default: 50,
			description: 'Max number of results to return',
			routing: {
				output: { maxResults: '={{ $value }}' },
			},
		},
	];
}
