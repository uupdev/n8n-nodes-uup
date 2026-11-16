import type { IDataObject, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { BASE_URL, PAGE_MAX } from '../resources/shared';

/**
 * Fills the Project pickers from `GET /projects`, following `next` to the last
 * page. A method, not a declarative `loadOptions.routing`: n8n drops the node's
 * `requestDefaults` when it loads routed options for the node used as an AI
 * tool, and the list then fails with "Invalid URL".
 */
export async function getProjects(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const options: INodePropertyOptions[] = [];
	let cursor: string | undefined;
	do {
		const qs: IDataObject = { limit: PAGE_MAX };
		if (cursor) qs.cursor = cursor;
		const page = (await this.helpers.httpRequestWithAuthentication.call(this, 'uupApi', {
			method: 'GET',
			url: `${BASE_URL}/projects`,
			qs,
			headers: { Accept: 'application/json' },
			json: true,
		})) as { data?: Array<{ id: string; name: string }>; next?: string | null };
		for (const project of page.data ?? []) {
			options.push({ name: project.name, value: project.id });
		}
		cursor = page.next ?? undefined;
	} while (cursor);
	return options.sort((a, b) => a.name.localeCompare(b.name));
}
