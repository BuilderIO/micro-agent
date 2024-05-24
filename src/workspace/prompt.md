Write a function called "simplify" that converts a complex and redundant ternary to a simpler one.

It takes code as a string and converts it to new code as a string.

For example, this

```ts
type === 'Default' && status === 'Default'
  ? '71px'
  : type === 'With Icon' && status === 'Default'
  ? '79px'
  : type === 'With Icon' && status === 'Neutral'
  ? '79px'
  : type === 'With Icon' && status === 'Active'
  ? '79px'
  : type === 'With Icon' && status === 'Alert'
  ? '79px'
  : type === 'With Icon' && status === 'Caution'
  ? '79px'
  : type === 'Default' && status === 'Neutral'
  ? '71px'
  : type === 'Default' && status === 'Active'
  ? '71px'
  : type === 'Default' && status === 'Alert'
  ? '71px'
  : '71px'
```

should convert to this

```ts
type === 'With Icon' ? '79px' : '71px'
```

You can use typescript for parsing.

This should work with any ternary provided, not just the one in the example. You need to find the simplest final output for any ternary given and return that. Remove all redundancies in them.
