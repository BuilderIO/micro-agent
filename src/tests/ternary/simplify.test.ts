import { expect, test } from 'vitest';
import { simplify } from './simplify';

test.skip('simplifies ternaries correctly', () => {
  expect(
    simplify(`
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
  `)
  ).toBe(`type === 'With Icon' ? '79px' : '71px'`);

  expect(
    simplify(`
    type === "Default" && status === "Default"
              ? "start"
              : type === "Has Label" && status === "Default"
              ? "stretch"
              : type === "Has Label" && status === "Neutral"
              ? "stretch"
              : type === "Has Label" && status === "Active"
              ? "stretch"
              : type === "Has Label" && status === "Alert"
              ? "stretch"
              : type === "Has Label" && status === "Caution"
              ? "stretch"
              : type === "Default" && status === "Neutral"
              ? "start"
              : type === "Default" && status === "Active"
              ? "start"
              : type === "Default" && status === "Alert"
              ? "start"
              : "start"
  `)
  ).toBe(`type === 'With Icon' ? 'stretch' : 'start'`);
  expect(
    simplify(`
    type === "Baseline" && size === "4px" && status === "Default"
            ? "400"
            : type === "Baseline" && size === "4px" && status === "Complete"
            ? undefined
            : type === "Baseline" && size === "4px" && status === "Error"
            ? undefined
            : type === "Baseline" && size === "8px" && status === "Complete"
            ? undefined
            : type === "Baseline" && size === "8px" && status === "Default"
            ? "400"
            : type === "Baseline" && size === "8px" && status === "Error"
            ? undefined
            : type === "Detailed" && size === "8px" && status === "Complete"
            ? undefined
            : type === "Detailed" && size === "4px" && status === "Default"
            ? undefined
            : type === "Detailed" &&
              size === "4px" &&
              status === "Complete (alternate)"
            ? undefined
            : type === "Detailed" && size === "8px" && status === "Default"
            ? undefined
            : type === "Detailed" &&
              size === "8px" &&
              status === "Complete (alternate)"
            ? undefined
            : type === "Detailed" && size === "4px" && status === "Complete"
            ? undefined
            : type === "Detailed" && size === "8px" && status === "Error"
            ? undefined
            : undefined
  `)
  ).toBe(
    `type === 'Baseline' && ((size === '4px' || size === '8px') && status === 'Default') ? '400' : undefined`
  );
});
