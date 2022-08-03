import test from 'ava';
import { createDB, createCore, arraysEqual } from './misc/helpers';
import { users } from './misc/data';

type Result = Array<{
	[index: string]: any;
}>;

test('$eq', async (t) => {
	const db = createDB();

	await db.ready();

	await db.initializeIndex('age', createCore());

	let inserted: Result = [];
	let expected: Result = [];
	let found: Result = [];

	// Insert users
	for (const i in users) {
		let id = await db.create(users[i]);

		inserted.push({ id, ...users[i] });
	}

	// Query
	let query = db.find({
		selector: [
			{
				field: 'age',
				method: '$eq',
				value: 28
			}
		]
	});

	for await (const item of query) {
		found.push(item);
	}

	// What should we get?
	expected = inserted.filter((a) => a.age === 28);

	// Finish
	t.assert(arraysEqual(expected, found));
});
