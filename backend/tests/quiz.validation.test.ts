import { describe, it, expect } from 'vitest';
import { quizSubmitSchema } from '../src/validators/quiz.schema';

describe('quizSubmitSchema', () => {
  it('allows a normal submission', () => {
    const out = quizSubmitSchema.parse({
      answers: [
        { questionId: 'q1', selectedIndex: 2 },
        { questionId: 'q2', selectedIndex: 0 },
      ],
    });
    expect(out.answers).toHaveLength(2);
  });

  it('rejects absurd selectedIndex', () => {
    expect(() =>
      quizSubmitSchema.parse({
        answers: [{ questionId: 'q1', selectedIndex: 42 }],
      }),
    ).toThrow();
  });

  it('bounds answer count', () => {
    const tooMany = Array.from({ length: 51 }, (_, i) => ({
      questionId: `q${i}`,
      selectedIndex: 0,
    }));
    expect(() => quizSubmitSchema.parse({ answers: tooMany })).toThrow();
  });
});
