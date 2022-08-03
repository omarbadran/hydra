import test from 'ava';
import { createDB } from './misc/helpers';

test('Create, read, update & delete a document', async (t) => {
	const db = createDB();

	await db.ready();

	// Create
	let id = await db.create({
		name: 'omar'
	});

	// Read
	let document = await db.one(id);

	t.assert(document?.name === 'omar');

	// Update
	await db.update(id, (doc) => {
		doc.name = 'carl';

		return doc;
	});

	let updated = await db.one(id);

	t.assert(updated?.name === 'carl');

	// Delete
	await db.delete(id);

	let isDeleted = await db.one(id);

	t.assert(isDeleted == null);
});
