export interface Section {
	id: string;
	number: string;
	term: string;
	instructor: string[];
	delivery: string;
	days?: string[];
	time: [number, number] | null;
	seats: [number, number] | null;
}

export interface Course {
	id: string;
	school: string;
	department: string;
	title: string;
	catalogNumber: string;
	number: number;
	units: number | null;
	sections: {
		lecture: Section[];
		lab?: Section[];
	};
	description: string;
	level: string;
	attributes: Record<string, string[]>,
	attributesFlat: Set<string>
}

export interface Catalog {
	courses: Course[];
	instructors: Record<string, string[]>;
	schools: Record<string, string[]>;
	lastUpdated: number;
}

export interface Index {
	terms: string[];
}
