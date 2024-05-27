import { test, expect } from 'vitest';
import { parse } from './parse';

test('parse Angular component', () => {
  const componentString = `
    import { Component, Input } from '@angular/core';

    @Component({
      selector: 'example-component',
      templateUrl: './example.component.html',
      styleUrls: ['./example.component.css']
    })
    export class ExampleComponent {
      @Input() title: string;
      @Input() description: string;
      @Input() options: Option;
      @Input() mode: number;
    }
  `;

  const expected = {
    name: 'ExampleComponent',
    selector: 'example-component',
    inputs: [
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'options', type: 'Option' },
      { name: 'mode', type: 'number' },
    ],
  };

  const result = parse(componentString);
  expect(result).toEqual(expected);
});

test('parse another Angular component', () => {
  const componentString = `
    import { Component, Input } from '@angular/core';

    type Foo = number;

    @Component({
      selector: 'my-component',
    })
    export class MyComponent {
      @Input() num: Foo;
    }
  `;

  const expected = {
    name: 'MyComponent',
    selector: 'my-component',
    inputs: [{ name: 'num', type: 'number' }],
  };

  const result = parse(componentString);
  expect(result).toEqual(expected);
});
