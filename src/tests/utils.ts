import Hydra from '../index';
// @ts-ignore
import ram from 'random-access-memory';
// @ts-ignore
import Hypercore from 'hypercore';

// Check if two arrays are equal (any items order)
export const arraysEqual = (a: Array<any>, b: Array<any>): boolean => {
	if (a === b) {
		return true;
	}

	if (a == null || b == null) {
		return false;
	}

	if (a.length !== b.length) {
		return false;
	}

	for (let i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) {
			return false;
		}
	}

	return true;
};

// Create a database in RAM for testing
export const createDB = (): Hydra => {
	let core = new Hypercore(ram);
	let db = new Hydra(core);

	return db;
};
