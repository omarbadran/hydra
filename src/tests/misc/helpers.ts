import Hydra from '../../index';
// @ts-ignore
import ram from 'random-access-memory';
// @ts-ignore
import Hypercore from 'hypercore';

// Create a hypercore in memory
export const createCore = (): Hydra => {
	return new Hypercore(ram);
};

// Create a database in memory
export const createDB = (): Hydra => {
	return new Hydra(createCore());
};

// Check if two arrays are equal
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
		if (isObject(a[i]) && isObject(b[i])) {
			return isObjectEqual(a[i], b[i]);
		}

		if (a[i] !== b[i]) {
			return false;
		}
	}

	return true;
};

// Check if two objects have the same elements
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

// Check if variable is an object
export const isObject = (object: object): boolean => {
	return object != null && typeof object === 'object';
};
