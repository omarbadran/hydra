import test from 'ava';
import { createDB, createCore, arraysEqual } from './misc/helpers';
import { users } from './misc/data';

type Result = Array<{
	[index: string]: any;
}>;

test('$eq, $gt, $lt, $lte, $gte', async (t) => {
	const db = createDB();

	await db.ready();

	await db.initializeIndex('age', createCore());

	let inserted: Result = [];
	let targets = [-100, -1, 0, 1, 28, 45, 50, 5000];

	let ops = {
		$eq: (a: number, b: number) => a === b,
		$gt: (a: number, b: number) => a > b,
		$lt: (a: number, b: number) => a < b,
		$gte: (a: number, b: number) => a >= b,
		$lte: (a: number, b: number) => a <= b
	};

	// Insert users
	for (const i in users) {
		let id = await db.create(users[i]);

		inserted.push({ id, ...users[i] });
	}

	// Test all ops
	for (const op in ops) {
		for (const value of targets) {
			let found: Result = [];

			// Query
			let query = db.find({
				selector: [
					{
						field: 'age',
						//@ts-ignore
						method: op,
						value
					}
				]
			});

			for await (const item of query) {
				found.push(item);
			}

			// What should we get?
			let expected: Result = inserted
				//@ts-ignore our mock data doesn't have types
				.filter((a) => ops[op](a.age, value))
				.sort((a, b) => a.age - b.age);

			// Finish
			t.assert(arraysEqual(expected, found));
		}
	}
});
