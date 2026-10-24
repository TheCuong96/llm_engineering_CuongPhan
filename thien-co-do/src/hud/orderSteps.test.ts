import { describe, expect, it } from 'vitest';
import type { OrderStepKey } from '../sim/types';
import { stepStates } from './orderSteps';

const keys: OrderStepKey[] = ['accepted', 'inspected', 'handling', 'in_flight', 'delivered'];
const at = (...times: (number | undefined)[]) => keys.map((key, i) => ({ key, at: times[i] }));

describe('stepStates', () => {
  it('waiting at the gate: Kiểm phẩm is current', () => {
    expect(stepStates(at(1))).toEqual(['done', 'current', 'todo', 'todo', 'todo']);
  });
  it('loading 2/8: Bốc/Dỡ is current, not done, even though it has started', () => {
    expect(stepStates(at(1, 2, 3))).toEqual(['done', 'done', 'current', 'todo', 'todo']);
  });
  it('in flight: Ngự không current until delivery', () => {
    expect(stepStates(at(1, 2, 3, 4))).toEqual(['done', 'done', 'done', 'current', 'todo']);
  });
  it('delivered: everything done', () => {
    expect(stepStates(at(1, 2, 3, 4, 5))).toEqual(['done', 'done', 'done', 'done', 'done']);
  });
});
