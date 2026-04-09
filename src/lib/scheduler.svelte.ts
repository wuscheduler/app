import { SvelteMap } from 'svelte/reactivity';

export const SCHEDULE_COLORS = [
	{ key: 'blue', bg: '#3b82f6', text: '#ffffff' },
	{ key: 'emerald', bg: '#10b981', text: '#ffffff' },
	{ key: 'violet', bg: '#8b5cf6', text: '#ffffff' },
	{ key: 'orange', bg: '#f97316', text: '#ffffff' },
	{ key: 'rose', bg: '#f43f5e', text: '#ffffff' },
	{ key: 'sky', bg: '#0ea5e9', text: '#ffffff' },
	{ key: 'teal', bg: '#14b8a6', text: '#ffffff' }
] as const;

export type ScheduleColor = (typeof SCHEDULE_COLORS)[number];

export interface CourseEntry {
	colorIndex: number; // Not used, but retained for backward compat with old version.
	hidden: boolean;
	selectedLectureId: string | null;
	selectedLabId: string | null;
}

const entries = new SvelteMap<string, CourseEntry>();

function nextColorIndex(): number {
	const used = new Set([...entries.values()].map((e) => e.colorIndex));
	for (let i = 0; i < SCHEDULE_COLORS.length; i++) {
		if (!used.has(i)) return i;
	}
	// All colors in use — pick the least-used one
	const counts = new Array(SCHEDULE_COLORS.length).fill(0);
	for (const e of entries.values()) counts[e.colorIndex]++;
	return counts.indexOf(Math.min(...counts));
}

export const schedulerState = {
	get entries() {
		return entries;
	},

	colorFor(courseId: string): ScheduleColor {
		const e = entries.get(courseId);
		return SCHEDULE_COLORS[(e?.colorIndex ?? 0) % SCHEDULE_COLORS.length];
	},

	ensureEntry(courseId: string, defaultLectureId: string | null, defaultLabId: string | null) {
		if (!entries.has(courseId)) {
			entries.set(courseId, {
				colorIndex: nextColorIndex(),
				hidden: false,
				selectedLectureId: defaultLectureId,
				selectedLabId: defaultLabId
			});
		}
	},

	removeEntry(courseId: string) {
		entries.delete(courseId);
	},

	setLecture(courseId: string, id: string | null) {
		const e = entries.get(courseId);
		if (e) entries.set(courseId, { ...e, selectedLectureId: id });
	},

	setLab(courseId: string, id: string | null) {
		const e = entries.get(courseId);
		if (e) entries.set(courseId, { ...e, selectedLabId: id });
	},

	toggleHidden(courseId: string) {
		const e = entries.get(courseId);
		if (e) entries.set(courseId, { ...e, hidden: !e.hidden });
	},

	serialize(): string {
		return JSON.stringify({ entries: Object.fromEntries(entries) });
	},

	deserialize(raw: string) {
		try {
			const data = JSON.parse(raw);
			entries.clear();
			for (const [id, entry] of Object.entries(data.entries ?? {})) {
				entries.set(id, entry as CourseEntry);
			}
		} catch {
			// ignore
		}
	}
};

// Day string → Monday-based index (0=Mon … 4=Fri, 5=Sat, 6=Sun)
export const DAY_INDEX: Record<string, number> = {
	M: 0,
	Mon: 0,
	Monday: 0,
	T: 1,
	Tu: 1,
	Tue: 1,
	Tuesday: 1,
	W: 2,
	Wed: 2,
	Wednesday: 2,
	Th: 3,
	Thu: 3,
	Thursday: 3,
	R: 3,
	F: 4,
	Fri: 4,
	Friday: 4,
	Sa: 5,
	Sat: 5,
	Saturday: 5,
	Su: 6,
	Sun: 6,
	Sunday: 6
};

export function formatTime(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	const period = h >= 12 ? 'PM' : 'AM';
	const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
	return m === 0 ? `${h12} ${period}` : `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatDays(days: string[]): string {
	const abbrev: Record<string, string> = {
		M: 'M',
		Mon: 'M',
		Monday: 'M',
		T: 'T',
		Tu: 'T',
		Tue: 'T',
		Tuesday: 'T',
		W: 'W',
		Wed: 'W',
		Wednesday: 'W',
		Th: 'Th',
		Thu: 'Th',
		Thursday: 'Th',
		R: 'Th',
		F: 'F',
		Fri: 'F',
		Friday: 'F',
		Sa: 'Sa',
		Sat: 'Sa',
		Saturday: 'Sa',
		Su: 'Su',
		Sun: 'Su',
		Sunday: 'Su'
	};
	return days.map((d) => abbrev[d] ?? d).join('');
}
