Parse an angular component as a string and return metadata about its name and inputs.

For example, this

```ts
type Option = 'a' | 'b' | 'c';

@Component({
  selector: 'example-component',
  template: `
    <div>
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </div>
  `,
})
export class ExampleComponent {
  @Input() title: string;
  @Input() description: string;
  @Input() options: Option;
  @Input() mode: number;
}
```

should return this

```ts
{
  name: 'ExampleComponent',
  selector: 'example-component',
  inputs: [
    { name: 'title', type: 'string' },
    { name: 'description', type: 'string' },
    { name: 'options', type: 'string', enum: ['a', 'b', 'c'] },
    { name: 'mode', type: 'number' },
  ],
}
```

also this

```ts
import { Component, Input } from '@angular/core';

type Foo = number;

@Component({
  selector: 'my-component',
})
export class MyComponent {
  @Input() num: Foo;
}
```

should return this

```ts
{
  name: 'MyComponent',
  selector: 'my-component',
  inputs: [{ name: 'num', type: 'number' }],
}
```

Do not hard code anything for this one test, it should take any Angular component and output its inputs and types as shown above.

Note: do not use `node.decorators` in typecript, it is deprecated. Decorators has been removed from Node and merged with modifiers on the Node subtypes that support them. Use ts.canHaveDecorators() to test whether a Node can have decorators. Use ts.getDecorators() to get the decorators of a Node.
