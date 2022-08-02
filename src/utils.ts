type Doc = {
	[index: string]: any;
};

// Flatten a document

export const flatten = (document: Doc): Doc => {
	let res: Doc = {};

	for (let i in document) {
		let value = document[i];

		if (typeof value == 'object' && !Array.isArray(value)) {
			let flattened = flatten(value);

			for (let x in flattened) {
				res[i + '.' + x] = flattened[x];
			}
		} else {
			res[i] = value;
		}
	}

	return res;
};

// Get all fields from a document recursively

export const getFields = (document: Doc): Array<string> => {
	let res: Array<string> = Object.keys(document);

	for (let i in document) {
		if (typeof document[i] == 'object' && !Array.isArray(document[i])) {
			let fields = getFields(document[i]);

			for (let x of fields) {
				res.push(i + '.' + x);
			}
		}
	}

	return res;
};
