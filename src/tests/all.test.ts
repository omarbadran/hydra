import test from 'ava';
import { createDB, arraysEqual, isObjectEqual, createCore } from './utils';

test('Create, fetch, update & delete a document', async (t) => {
	const db = createDB();

	await db.ready();

	// Create
	let id = await db.create({
		name: 'omar'
	});

	// Read
	let document = await db.fetch(id);

	t.assert(document?.name === 'omar');

	// Update
	await db.update(id, (doc) => {
		doc.name = 'carl';

		return doc;
	});

	let updated = await db.fetch(id);

	t.assert(updated?.name === 'carl');

	// Delete
	await db.delete(id);

	let isDeleted = await db.fetch(id);

	t.assert(isDeleted == null);
});

test('Get document fields', async (t) => {
	const db = createDB();

	await db.ready();

	let document = {
		a: 'string',
		b: {
			c: 'string',
			d: {
				e: ['string', 1],
				f: {
					g: true
				}
			}
		}
	};

	let expected = ['a', 'b', 'b.c', 'b.d', 'b.d.e', 'b.d.f', 'b.d.f.g'];

	let fields = db._fields(document);

	t.assert(arraysEqual(fields, expected));
});

test('Flatten a document', async (t) => {
	const db = createDB();

	await db.ready();

	let document = {
		a: 'string',
		b: {
			c: 'string',
			d: {
				e: ['string']
			}
		}
	};

	let flattened = db._flatten(document);

	let expected = {
		a: 'string',
		'b.c': 'string',
		'b.d.e': ['string']
	};

	t.assert(isObjectEqual(flattened, expected));
});

test('Load an index', async (t) => {
	const db = createDB();

	await db.ready();

	await db.initializeIndex('age');

	t.assert(db.indexes['age'] && typeof db.indexes['age'] === 'object');
});

test('Indexing and de-indexing documents', async (t) => {
	const db = createDB();

	await db.ready();

	// initialize indexes
	await db.initializeIndex('age', createCore());
	await db.initializeIndex('tags', createCore());

	// Add some documents
	let firstUser = await db.create({
		name: 'omar',
		age: 21,
		tags: ['one', 'two', 'three']
	});

	let secondUser = await db.create({
		name: 'carl',
		age: 19,
		tags: ['four', 'five']
	});

	let ageIndex: { [key: string]: string } = {};
	let tagsIndex: { [key: string]: string } = {};

	// age index
	for await (const item of db.indexes['age'].createReadStream({})) {
		ageIndex[item.key] = item.value;
	}

	// tags index
	for await (const item of db.indexes['tags'].createReadStream({})) {
		tagsIndex[item.key] = item.value;
	}

	t.assert(Object.keys(ageIndex).length === 2);
	t.assert(Object.keys(tagsIndex).length === 7);
});
