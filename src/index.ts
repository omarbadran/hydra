import Hyperbee from 'hyperbee';
import CBOR from 'cbor';
import { ulid } from 'ulid';

type Document = {
	[index: string]: any;
};

type Indexes = {
	[index: string]: Hyperbee;
};

const Encoding = {
	encode: CBOR.encode,
	decode: CBOR.decode
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
			keyEncoding: Encoding,
			valueEncoding: Encoding
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
	 * @returns The id of new document
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
	 * Get document by ID.
	 *
	 * @param id - the id of the document you seek.
	 * @returns the matching document
	 * @public
	 */
	async fetch(id: string): Promise<Document> {
		let record = await this.documents.get(id);

		return record.value;
	}

	// update(id: string, document: object): Promise<boolean> {}
	// fetch(id: string): Promise<object | null> {}
	// delete(id: string): Promise<boolean> {}
	// all(): Array<object> {}
	// search(query: object): Array<object> {}
	// loadIndex(field: string, feed?: any): Promise<boolean> {}
	// buildIndex(field: string, exclude: Array<string>): Promise<boolean> {}
	// _indexDocument(doc: object): Promise<boolean> {}
	// _deIndexDocument(id: string): Promise<boolean> {}
	// _docFields(doc: object): Array<string> {}
}
