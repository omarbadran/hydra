import test from 'ava';
import Hydra from '../index';
// @ts-ignore
import ram from 'random-access-memory';
// @ts-ignore
import Hypercore from 'hypercore';

let core = () => {
	return new Hypercore(ram);
};

test('Create & fetch a document', async (t) => {
	const db = new Hydra(core());

	await db.ready();

	let id = await db.create({
		name: 'omar'
	});

	let document = await db.fetch(id);

	t.assert(document.name === 'omar');
});
