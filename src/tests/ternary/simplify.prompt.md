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
  : '71px'
```

should convert to this

```ts
type === 'With Icon' ? '79px' : '71px'
```

Note that these ternaries always use enum values that are exhaustive. For instance, in the above example, the `type` can only be `'Default'` or `'With Icon'` and the `status` can only be `'Default'`, `'Neutral'`, `'Active'`, `'Alert'`, or `'Caution'`, because that is what is used in the ternary. Given that `status` never changes the output, the `type` is the only thing that matters, and `status` can be removed from the ternary completley. Assume this for all ternaries passed, if their values never change the output, they can be removed.

Another examples is this

```ts
foo === 'Yo' && status === 'Default'
  ? 'start'
  : foo === 'Some Value' && status === 'Default'
  ? 'stretch'
  : foo === 'Some Value' && status === 'Neutral'
  ? 'stretch'
  : foo === 'Some Value' && status === 'Active'
  ? 'stretch'
  : foo === 'Some Value' && status === 'Alert'
  ? 'stretch'
  : foo === 'Some Value' && status === 'Caution'
  ? 'stretch'
  : foo === 'Yo' && status === 'Neutral'
  ? 'start'
  : foo === 'Yo' && status === 'Active'
  ? 'start'
  : foo === 'Yo' && status === 'Alert'
  ? 'start'
  : 'start'
```

Should convert to this

```ts
foo === 'With Icon' ? 'stretch' : 'start'
```

In the above case, also notice that `status` never changes the output, so it can be removed completely. Again, assume this for all ternaries passed, if their values never change the output, they can be removed.

And one more example is this:

```ts
type === 'Baseline' && size === '4px' && status === 'Default'
  ? '400'
  : type === 'Baseline' && size === '4px' && status === 'Complete'
  ? undefined
  : type === 'Baseline' && size === '4px' && status === 'Error'
  ? undefined
  : type === 'Baseline' && size === '8px' && status === 'Complete'
  ? undefined
  : type === 'Baseline' && size === '8px' && status === 'Default'
  ? '400'
  : type === 'Baseline' && size === '8px' && status === 'Error'
  ? undefined
  : type === 'Detailed' && size === '8px' && status === 'Complete'
  ? undefined
  : type === 'Detailed' && size === '4px' && status === 'Default'
  ? undefined
  : type === 'Detailed' && size === '4px' && status === 'Complete (alternate)'
  ? undefined
  : type === 'Detailed' && size === '8px' && status === 'Default'
  ? undefined
  : type === 'Detailed' && size === '8px' && status === 'Complete (alternate)'
  ? undefined
  : type === 'Detailed' && size === '4px' && status === 'Complete'
  ? undefined
  : type === 'Detailed' && size === '8px' && status === 'Error'
  ? undefined
  : undefined
```

Should simplify to this:

```ts
type === 'Baseline' && (size === '4px' || size === '8px') && status === 'Default' ? '400' : undefined
```

This should work with any ternary provided in this format, where you have an exhaustive list of values and their results.

You need to find the simplest final output for any ternary like this given.
