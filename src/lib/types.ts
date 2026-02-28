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
	units: number | null;
	sections: {
		lecture: Section[];
		lab?: Section[];
	};
	description: string;
	level: string;
}

export interface Catalog {
	courses: Course[];
	instructors: Record<string, string[]>;
	lastUpdated: number;
}

export interface Index {
	terms: string[];
	schools: Record<string, string[]>;
}
