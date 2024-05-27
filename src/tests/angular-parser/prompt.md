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
