import Hydra from '../index';
// @ts-ignore
import ram from 'random-access-memory';
// @ts-ignore
import Hypercore from 'hypercore';

// create a hypercore in memory
export const createCore = (): Hydra => {
	return new Hypercore(ram);
};

// Create a database in memory
export const createDB = (): Hydra => {
	return new Hydra(createCore());
};

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

export const isObjectEqual = (a: { [key: string]: any }, b: { [key: string]: any }): boolean => {
	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);

	if (aKeys.length !== bKeys.length) {
		return false;
	}

	for (const key of aKeys) {
		const aVal = a[key];

		const bVal = b[key];

		const areObjects = isObject(aVal) && isObject(bVal);

		if ((areObjects && !isObjectEqual(aVal, bVal)) || (!areObjects && aVal !== bVal)) {
			return false;
		}
	}

	return true;
};

export const isObject = (object: object): boolean => {
	return object != null && typeof object === 'object';
};
