import test from 'ava';
import { createDB, arraysEqual } from './utils';

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
		name: 'string',
		address: {
			hello: 'string',
			foo: {
				bar: 'string'
			}
		}
	};

	let expected = ['name', 'address', 'address.hello', 'address.foo', 'address.foo.bar'];

	let fields = db._docFields(document);

	t.assert(arraysEqual(expected, fields));
});
