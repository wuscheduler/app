import { SvelteMap } from 'svelte/reactivity';
import type { Catalog, Index } from './types';

const cache = new SvelteMap<string, Catalog>();
const baseUrl = 'https://wuscheduler.github.io/scraper/data/';
let index = $state<Index | null>(null);
let activeTerm = $state<string>('');
let catalog = $state<Catalog | null>(null);
let loading = $state(true);
let error = $state<string | null>(null);

const loadIndex = async () => {
	if (index) return;
	try {
		const res = await fetch(`${baseUrl}index.json`);
		if (!res.ok) throw new Error(`Failed to load index`);
		index = await res.json();
	} catch (e) {
		error = (e as Error).message;
	} finally {
		loading = false;
	}
};

const loadTerm = async (term: string) => {
	if (term === activeTerm && catalog) return;
	loading = true;
	const cached = cache.get(term);
	if (cached) {
		activeTerm = term;
		catalog = cached;
		loading = false;
		error = null;
		return;
	}

	try {
		const res = await fetch(`${baseUrl}${encodeURIComponent(term)}.json`);
		if (!res.ok)
			throw new Error(`Failed to load ${term}: ${res.statusText}<br/>${await res.text()}`);

		const data: Catalog = await res.json();
		cache.set(term, data);
		activeTerm = term;
		catalog = data;
	} catch (e) {
		error = (e as Error).message;
	} finally {
		loading = false;
	}
};

export const catalogState = {
	get index() {
		return index;
	},
	get term() {
		return activeTerm;
	},
	get catalog() {
		return catalog;
	},
	get courses() {
		return catalog?.courses ?? [];
	},
	get loading() {
		return loading;
	},
	get error() {
		return error;
	},
	loadTerm,
	loadIndex
};
