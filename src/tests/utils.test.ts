import test from 'ava';
import { arraysEqual, isObjectEqual } from './misc/helpers';
import { flatten, getFields } from '../utils';

test('Get document fields', async (t) => {
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

	let fields = getFields(document);

	t.assert(arraysEqual(fields, expected));
});

test('Flatten a document', async (t) => {
	let document = {
		a: 'string',
		b: {
			c: 'string',
			d: {
				e: ['string']
			}
		}
	};

	let flattened = flatten(document);

	let expected = {
		a: 'string',
		'b.c': 'string',
		'b.d.e': ['string']
	};

	t.assert(isObjectEqual(flattened, expected));
});
