Write a function called "simplify" that converts a complex and redundant ternary to a simpler one using the typescript parser.

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
  : '71px';
```

should convert to this

```ts
type === 'With Icon' ? '79px' : '71px';
```

Note that these ternaries always use enum values that are exhaustive. For instance, in the above example, the `type` can only be `'Default'` or `'With Icon'` and the `status` can only be `'Default'`, `'Neutral'`, `'Active'`, `'Alert'`, or `'Caution'`, because that is what is used in the ternary.

Another examples is this

```ts
type === 'Default' && status === 'Default'
  ? 'start'
  : type === 'With Icon' && status === 'Default'
  ? 'stretch'
  : type === 'With Icon' && status === 'Neutral'
  ? 'stretch'
  : type === 'With Icon' && status === 'Active'
  ? 'stretch'
  : type === 'With Icon' && status === 'Alert'
  ? 'stretch'
  : type === 'With Icon' && status === 'Caution'
  ? 'stretch'
  : type === 'Default' && status === 'Neutral'
  ? 'start'
  : type === 'Default' && status === 'Active'
  ? 'start'
  : type === 'Default' && status === 'Alert'
  ? 'start'
  : 'start';
```

Should conver to this

```ts
type === 'With Icon' ? 'stretch' : 'start';
```

This should work with any ternary provided in this format, where you have an exhaustive list of values and their results.

You need to find the simplest final output for any ternary like this given.
