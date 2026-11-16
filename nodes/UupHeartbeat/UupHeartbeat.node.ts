import {
	NodeConnectionTypes,
	NodeOperationError,
	sleep,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

/** How long one call waits, and how many times it tries again, as You Up?'s own examples do. */
const DEFAULT_TIMEOUT_SEC = 10;
const DEFAULT_RETRIES = 3;
const USER_AGENT = 'n8n-nodes-uup';

type Outcome =
	| { status: 'sent'; statusCode: number; attempts: number }
	| { status: 'failed'; statusCode: number | null; attempts: number; error: string };

/** A network error, a 429 or a 5xx may pass; anything else will not. */
function worthRetrying(statusCode: number | null): boolean {
	return statusCode === null || statusCode === 429 || statusCode >= 500;
}

export class UupHeartbeat implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'You Up? Heartbeat',
		name: 'uupHeartbeat',
		icon: { light: 'file:uup.svg', dark: 'file:uup.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: 'Send Heartbeat',
		description:
			'Call a You Up? Heartbeat URL so You Up? alerts you when this workflow stops running',
		defaults: {
			name: 'You Up? Heartbeat',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		properties: [
			{
				displayName:
					'Put this node last, so it runs only when every node before it succeeded. It calls the URL once per run, however many items reach it.',
				name: 'notice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Heartbeat URL',
				name: 'url',
				type: 'string',
				typeOptions: { password: true },
				required: true,
				default: '',
				placeholder: 'https://api.uup.dev/hb/...',
				description:
					"The Heartbeat URL on your Heartbeat Monitor's Checks card in You Up?. Anyone who has it can call it, so keep it private.",
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Fail on Error',
						name: 'failOnError',
						type: 'boolean',
						default: false,
						description:
							'Whether to stop the workflow with an error when the call fails. Off, the node reports the failure in its output and the workflow carries on; You Up? alerts you if no call arrives in time.',
					},
					{
						displayName: 'Retries',
						name: 'retries',
						type: 'number',
						typeOptions: { minValue: 0, maxValue: 5 },
						default: DEFAULT_RETRIES,
						description: 'How many more times to try after a network error or a server error',
					},
					{
						displayName: 'Timeout',
						name: 'timeout',
						type: 'number',
						typeOptions: { minValue: 1, maxValue: 60 },
						default: DEFAULT_TIMEOUT_SEC,
						description: 'How many seconds each try waits for an answer',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const url = (this.getNodeParameter('url', 0) as string).trim();
		const options = this.getNodeParameter('options', 0, {}) as {
			failOnError?: boolean;
			retries?: number;
			timeout?: number;
		};
		const retries = Math.max(0, Math.floor(options.retries ?? DEFAULT_RETRIES));
		const timeoutMs = Math.max(1, options.timeout ?? DEFAULT_TIMEOUT_SEC) * 1000;

		if (!/^https?:\/\//i.test(url)) {
			throw new NodeOperationError(this.getNode(), 'The Heartbeat URL must start with https://', {
				description: "Copy it from the Heartbeat Monitor's Checks card in You Up?.",
			});
		}

		let outcome: Outcome = { status: 'failed', statusCode: null, attempts: 0, error: '' };
		for (let attempt = 1; attempt <= retries + 1; attempt++) {
			let statusCode: number | null = null;
			let error = '';
			try {
				const response = await this.helpers.httpRequest({
					method: 'GET',
					url,
					timeout: timeoutMs,
					headers: { 'User-Agent': USER_AGENT },
					returnFullResponse: true,
					ignoreHttpStatusErrors: true,
					json: false,
				});
				statusCode = response.statusCode as number;
				if (statusCode >= 200 && statusCode < 300) {
					outcome = { status: 'sent', statusCode, attempts: attempt };
					break;
				}
				error = `You Up? answered HTTP ${statusCode}`;
			} catch (caught) {
				error = (caught as Error).message || 'The call could not reach You Up?';
			}

			outcome = { status: 'failed', statusCode, attempts: attempt, error };
			if (!worthRetrying(statusCode) || attempt > retries) break;
			await sleep(Math.min(1000 * 2 ** (attempt - 1), 8000));
		}

		if (outcome.status === 'failed' && options.failOnError) {
			throw new NodeOperationError(this.getNode(), 'The Heartbeat was not sent', {
				description: outcome.error,
			});
		}

		return [
			[
				{
					json: { ...outcome, sentAt: new Date().toISOString() },
					pairedItem: this.getInputData().map((_, index) => ({ item: index })),
				},
			],
		];
	}
}
