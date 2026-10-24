import { describe, expect, it } from 'vitest';
import { stepLabel, stepStates } from './steps';

const keys = ['confirmed', 'picked', 'handling', 'in_transit', 'delivered'] as const;
const steps = (...at: (number | undefined)[]) => keys.map((key, i) => ({ key, at: at[i] }));

describe('stepStates (spec 4.5)', () => {
  it('handling stays current until the truck leaves', () => {
    expect(stepStates(steps(1, 2, 3))).toEqual(['done', 'done', 'current', 'todo', 'todo']);
  });
  it('in transit is current between leaving and delivery', () => {
    expect(stepStates(steps(1, 2, 3, 4))).toEqual(['done', 'done', 'done', 'current', 'todo']);
  });
  it('all done once delivered', () => {
    expect(stepStates(steps(1, 2, 3, 4, 5))).toEqual(['done', 'done', 'done', 'done', 'done']);
  });
});

describe('stepLabel', () => {
  it('third step reads Loading/Loaded or Unloading/Unloaded by direction', () => {
    expect(stepLabel('handling', 'outbound', false)).toBe('Loading');
    expect(stepLabel('handling', 'outbound', true)).toBe('Loaded');
    expect(stepLabel('handling', 'inbound', false)).toBe('Unloading');
  });
});
