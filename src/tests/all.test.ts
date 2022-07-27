import test from 'ava';
import Hydra from '../index';
// @ts-ignore
import ram from 'random-access-memory';
// @ts-ignore
import Hypercore from 'hypercore';

let core = () => {
	return new Hypercore(ram);
};

test('Create, fetch, update & delete a document', async (t) => {
	const db = new Hydra(core());

	await db.ready();

	// Create
	let id = await db.create({
		name: 'omar'
	});

	// Read
	let document = await db.fetch(id);

	t.assert(document?.name === 'omar');

	// Update
	await db.update(id, {
		name: 'carl'
	});

	let updated = await db.fetch(id);

	t.assert(updated?.name === 'carl');

	// Delete
	await db.delete(id);

	let isDeleted = await db.fetch(id);

	t.assert(isDeleted == null);
});
