import Hyperbee from 'hyperbee';
import { encode, decode } from 'cbor';
import { ulid } from 'ulid';
import bytewise from 'bytewise';

type Document = {
	[index: string]: any;
};

type Indexes = {
	[index: string]: Hyperbee;
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
		this.documents = new Hyperbee(core, {
			keyEncoding: {
				encode: bytewise.encode,
				decode: bytewise.decode
			},
			valueEncoding: {
				encode: encode,
				decode: decode
			}
		});

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
	 * Get all fields from a document recursively.
	 *
	 * @param document - object to scan.
	 * @returns array of fields.
	 * @public
	 */
	_docFields(document: Document, prefix?: string): Array<string> {
		let fields: Array<string> = Object.keys(document);

		for (const field of fields) {
			if (typeof document[field] === 'object') {
				let inner = this._docFields(document[field], field);

				if (inner.length) {
					fields = [...fields, ...inner];
				}
			}
		}

		if (prefix) {
			fields = fields.map((item) => prefix.concat('.' + item));
		}

		return fields;
	}

	// all(): Array<object> {}
	// search(query: object): Array<object> {}
	// loadIndex(field: string, feed?: any): Promise<boolean> {}
	// buildIndex(field: string, exclude: Array<string>): Promise<boolean> {}
	// _indexDocument(doc: object): Promise<boolean> {}
	// _deIndexDocument(id: string): Promise<boolean> {}
}
