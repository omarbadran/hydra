import test from 'ava';
import { createDB, createCore, arraysEqual } from './misc/helpers';
import { users, posts } from './misc/data';

type Result = Array<{
	[index: string]: any;
}>;

test('$eq, $gt, $lt, $lte, $gte', async (t) => {
	const db = createDB();

	await db.ready();

	await db.initializeIndex('age', createCore());

	let inserted: Result = [];
	let targets = [-100, -31.00245062, -1, 0, 1, 28, 28.0014, 45, 50, 50.140404, 5000];

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

	// Test all operations
	for (const op in ops) {
		for (const value of targets) {
			let found: Result = [];

			// Query
			let query = db.find({
				selector: [
					{
						field: 'age',
						//@ts-ignore
						operation: op,
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

test('$between, $betweenInclusive', async (t) => {
	const db = createDB();

	await db.ready();

	await db.initializeIndex('age', createCore());

	let inserted: Result = [];
	let targets = [
		[0, 0],
		[-10, 99],
		[50, 0],
		[49, 49.00000495049913],
		[-8.42352345, 10000]
	];

	let ops = {
		$between: (a: number, range: number[]) => a > range[0] && a < range[1],
		$betweenInclusive: (a: number, range: number[]) => a >= range[0] && a <= range[1]
	};

	// Insert users
	for (const i in users) {
		let id = await db.create(users[i]);

		inserted.push({ id, ...users[i] });
	}

	// Test all operations
	for (const op in ops) {
		for (const value of targets) {
			let found: Result = [];

			// Query
			let query = db.find({
				selector: [
					{
						field: 'age',
						//@ts-ignore
						operation: op,
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

test('$containAny', async (t) => {
	const db = createDB();

	await db.ready();

	await db.initializeIndex('tags', createCore());

	let inserted: Result = [];
	let target = ['english'];

	// Insert posts
	for (const i in posts) {
		let id = await db.create(posts[i]);

		inserted.push({ id, ...posts[i] });
	}

	let found: Result = [];

	// Query
	let query = db.find({
		selector: [
			{
				field: 'tags',
				operation: '$containAny',
				value: target
			}
		]
	});

	for await (const item of query) {
		found.push(item);
	}

	// What should we get?
	let expected: Result = inserted
		//@ts-ignore our mock data doesn't have types
		.filter((a) => a.tags.includes(target[0]));

	// Finish
	t.assert(arraysEqual(expected, found));
});

test('$containAll', async (t) => {
	const db = createDB();

	await db.ready();

	await db.initializeIndex('tags', createCore());

	let inserted: Result = [];
	let target = ['magical', 'crime'];

	// Insert posts
	for (const i in posts) {
		let id = await db.create(posts[i]);

		inserted.push({ id, ...posts[i] });
	}

	let found: Result = [];

	// Query
	let query = db.find({
		selector: [
			{
				field: 'tags',
				operation: '$containAll',
				value: target
			}
		]
	});

	for await (const item of query) {
		found.push(item);
	}

	// What should we get?
	let expected: Result = inserted
		//@ts-ignore our mock data doesn't have types
		.filter((a) => target.every((b) => a.tags.includes(b)));

	// Finish
	t.assert(arraysEqual(expected, found));
});
