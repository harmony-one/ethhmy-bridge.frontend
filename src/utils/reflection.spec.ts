import { P } from './reflection';

describe('reflection', () => {
  interface TestInterface {
    field1: number;
    field2: number;
  }

  it('field1', () => {
    const result = P<TestInterface>(p => p.field1);
    expect(result).toBe('field1');
  });

  it('field2', () => {
    const result = P<TestInterface>(m => m.field2);
    expect(result).toBe('field2');
  });
});
