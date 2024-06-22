import { test, expect } from 'vitest';
import { generateAsciiTree } from './generate-ascii-tree';

test('generates a simple tree for a single file', () => {
  const input = ['file1.txt'];
  const expectedOutput = '└── file1.txt';
  expect(generateAsciiTree(input)).toBe(expectedOutput);
});

test('generates a tree for multiple files in the same directory', () => {
  const input = ['file1.txt', 'file2.txt'];
  const expectedOutput = `├── file1.txt
└── file2.txt`;
  expect(generateAsciiTree(input)).toBe(expectedOutput);
});

test('generates a tree for files in nested directories', () => {
  const input = ['dir1/file1.txt', 'dir1/file2.txt', 'dir2/file3.txt'];
  const expectedOutput = `├── dir1
│   ├── file1.txt
│   └── file2.txt
└── dir2
    └── file3.txt`;
  expect(generateAsciiTree(input)).toBe(expectedOutput);
});

test('handles an empty list of file paths', () => {
  const input = [];
  const expectedOutput = '';
  expect(generateAsciiTree(input)).toBe(expectedOutput);
});

test('handles files in deeply nested directories', () => {
  const input = ['dir1/dir2/dir3/file1.txt'];
  const expectedOutput = `└── dir1
    └── dir2
        └── dir3
            └── file1.txt`;
  expect(generateAsciiTree(input)).toBe(expectedOutput);
});

test('handles files with similar prefixes', () => {
  const input = ['dir1/file1.txt', 'dir1file2.txt'];
  const expectedOutput = `├── dir1
│   └── file1.txt
└── dir1file2.txt`;
  expect(generateAsciiTree(input)).toBe(expectedOutput);
});

test('handles invalid input with non-string elements', () => {
  const input = ['file1.txt', 123, null, 'file2.txt'];
  expect(() => generateAsciiTree(input)).toThrow(TypeError);
});
