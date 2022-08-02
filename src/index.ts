import Hyperbee from 'hyperbee';
import { encode, decode } from 'cbor';
import { ulid } from 'ulid';
import * as charwise from 'charwise';

type Document = {
	[index: string]: any;
};

type Indexes = {
	[index: string]: Hyperbee;
};

let encoding = {
	keyEncoding: 'utf-8',
	valueEncoding: {
		encode: encode,
		decode: decode
	}
};

export default class Hydra {
	documents: Hyperbee;
	indexes: Indexes;

	/**
	 * Create a database.
	 *
	 * @param core - a hypercore instance to store the documents
	 */
	constructor(core: any) {
		this.documents = new Hyperbee(core, { ...encoding });

		this.indexes = {};
	}

	/**
	 * Make sure the the feed is ready.
	 *
	 * @returns a boolean promise.
	 * @public
	 */
	async ready(): Promise<boolean> {
		await this.documents.ready();

		return true;
	}

	/**
	 * Create a new document.
	 *
	 * @param document - optional values with which to initialize the entity.
	 * @returns The id of new document.
	 * @public
	 */
	async create(document: Document): Promise<string> {
		let id: string;

		if (document?.id) {
			id = document.id;
			delete document.id;
		} else {
			id = ulid();
		}

		let exists = await this.documents.get(id);

		if (exists) {
			throw new Error('Document already exists with the same ID');
		}

		if (Object.keys(this.indexes).length) {
			await this._indexDocument(id, document);
		}

		try {
			await this.documents.put(id, document);
		} catch (error) {
			throw error;
		}

		return id;
	}

	/**
	 * Get a document by ID.
	 *
	 * @param id - the id of the document you seek.
	 * @returns The matching document or null.
	 * @public
	 */
	async fetch(id: string): Promise<Document | null> {
		let record = await this.documents.get(id);

		if (!record) {
			return null;
		}

		return record.value;
	}

	/**
	 * Update a document.
	 *
	 * @param id - the id of the document you want to update.
	 * @param changes - a function that returns the new document
	 * @returns True on success.
	 * @public
	 */
	async update(id: string, changes: (document: Document) => Document): Promise<boolean> {
		let exists = await this.documents.get(id);

		if (!exists) {
			throw new Error('No documents exists with this ID');
		}

		let updated = changes(exists.value);

		if (updated?.id) {
			throw new Error("Fields with the key 'id' are not allowed");
		}

		try {
			await this.documents.put(id, updated);
		} catch (error) {
			throw error;
		}

		return true;
	}

	/**
	 * Delete a document by ID.
	 *
	 * @param id - the id of the document you want to delete.
	 * @returns True on success.
	 * @public
	 */
	async delete(id: string): Promise<boolean> {
		let exists = await this.documents.get(id);

		if (!exists) {
			throw new Error('No documents exists with this ID');
		}

		try {
			await this.documents.del(id);
		} catch (error) {
			throw error;
		}

		return true;
	}

	/**
	 * Get all documents.
	 *
	 * @returns iterable stream of documents.
	 * @public
	 */
	async *all(opts = {}): AsyncGenerator<Document> {
		for await (const item of this.documents.createReadStream(opts)) {
			yield { id: item.key, ...item.value };
		}
	}

	/**
	 * Flatten a document.
	 *
	 * @param document - object to flatten.
	 * @returns flattened document.
	 * @public
	 */
	_flatten(document: Document): Document {
		let res: Document = {};

		for (let i in document) {
			let value = document[i];

			if (typeof value == 'object' && !Array.isArray(value)) {
				let flattened = this._flatten(value);

				for (let x in flattened) {
					res[i + '.' + x] = flattened[x];
				}
			} else {
				res[i] = value;
			}
		}

		return res;
	}

	/**
	 * Get all fields from a document recursively.
	 *
	 * @param document - object to scan.
	 * @returns array of fields.
	 * @public
	 */
	_fields(document: Document): Array<string> {
		let res: Array<string> = Object.keys(document);

		for (let i in document) {
			if (typeof document[i] == 'object' && !Array.isArray(document[i])) {
				let fields = this._fields(document[i]);

				for (let x of fields) {
					res.push(i + '.' + x);
				}
			}
		}

		return res;
	}

	/**
	 * Load an index to this database.
	 *
	 * @param field - the name of the field for this index.
	 * @param core - either a hypercore instance or a string to be used a sub bee.
	 * @returns True on success.
	 * @public
	 */
	async initializeIndex(field: string, core?: any): Promise<boolean> {
		if (core) {
			this.indexes[field] = new Hyperbee(core, { ...encoding });
		} else {
			this.indexes[field] = this.documents.sub('index.' + field);
		}

		await this.indexes[field].ready();

		return true;
	}

	/**
	 * Index a document
	 *
	 * @param id - id of the document.
	 * @param document - the document to index.
	 * @returns True on success.
	 * @public
	 */
	async _indexDocument(id: string, document: Document): Promise<boolean> {
		let fields = this._fields(document);
		let indexable = fields.filter((i) => Object.keys(this.indexes).includes(i));

		for (const field of indexable) {
			let value = document[field];

			let keys = this._createIndexKeys(id, value);

			for (let key of keys) {
				await this.indexes[field].put(key, id);
			}
		}

		return true;
	}

	/**
	 * Create sortable keys for indexing
	 *
	 * @param id - id of the document.
	 * @param value - the field value to be indexed.
	 * @returns array of keys.
	 * @public
	 */
	_createIndexKeys(id: string, value: any): Array<string> {
		let keys: Array<string> = [];
		let append = '/' + id;

		// equal & range operations
		keys.push(charwise.encode(value) + append);

		// string array operations
		if (Array.isArray(value) && value.every((a) => typeof a === 'string')) {
			for (const str of value) {
				let key = charwise.encode(str) + append;

				if (!value.includes(key)) {
					keys.push(key);
				}
			}
		}

		return keys;
	}

	// find(query: object): Array<object> {}
	// buildIndex(field: string, exclude: Array<string>): Promise<boolean> {}
	// _indexDocument(doc: object): Promise<boolean> {}
	// _deIndexDocument(id: string): Promise<boolean> {}
	// Search operations:
	// contain, containOneOf
}
