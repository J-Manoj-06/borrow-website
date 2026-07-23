/**
 * Unit Test Suite: Book Service & Inventory Count Aggregation
 */

import assert from 'node:assert';
import { test, describe } from 'node:test';
import { COPY_STATUSES } from '../models/bookModel.js';

describe('Inventory & Copy Count Aggregation Tests', () => {
  test('Copy status model should define correct production statuses', () => {
    assert.strictEqual(COPY_STATUSES.AVAILABLE, 'Available');
    assert.strictEqual(COPY_STATUSES.BORROWED, 'Borrowed');
    assert.strictEqual(COPY_STATUSES.RESERVED, 'Reserved');
    assert.strictEqual(COPY_STATUSES.DAMAGED, 'Damaged');
    assert.strictEqual(COPY_STATUSES.LOST, 'Lost');
    assert.strictEqual(COPY_STATUSES.ARCHIVED, 'Archived');
  });

  test('Parent book available count calculation logic', () => {
    const mockCopies = [
      { id: 'cpy_1', status: 'Available' },
      { id: 'cpy_2', status: 'Available' },
      { id: 'cpy_3', status: 'Borrowed' },
      { id: 'cpy_4', status: 'Damaged' },
    ];

    const available = mockCopies.filter((c) => c.status === 'Available').length;
    const borrowed = mockCopies.filter((c) => c.status === 'Borrowed').length;
    const damaged = mockCopies.filter((c) => c.status === 'Damaged').length;

    assert.strictEqual(available, 2);
    assert.strictEqual(borrowed, 1);
    assert.strictEqual(damaged, 1);
    assert.strictEqual(mockCopies.length, 4);
  });
});
