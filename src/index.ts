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
		if (!document?.id) {
			document.id = ulid();
		}

		let insert = await this.documents.put(document.id, document);

		return document.id;
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
	 * @param document - the new document data.
	 * @returns True on success.
	 * @public
	 */
	async update(id: string, document: Document): Promise<boolean> {
		let updated = await this.documents.put(id, document);

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
		let deleted = await this.documents.del(id);

		return true;
	}

	// all(): Array<object> {}
	// search(query: object): Array<object> {}
	// loadIndex(field: string, feed?: any): Promise<boolean> {}
	// buildIndex(field: string, exclude: Array<string>): Promise<boolean> {}
	// _indexDocument(doc: object): Promise<boolean> {}
	// _deIndexDocument(id: string): Promise<boolean> {}
	// _docFields(doc: object): Array<string> {}
}
