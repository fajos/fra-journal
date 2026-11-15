export interface Quote {
  text: string;
  author: string;
}

export const JOURNAL_QUOTES: Record<string, Quote> = {
  yearGoals: {
    text: 'Alone we can do so little; together we can do so much.',
    author: 'Helen Keller',
  },
  goalBreakdown: {
    text: 'Life is ten percent what happens to me and ninety percent how I react to it.',
    author: 'Charles R. Swindoll',
  },
  quarterPlan: {
    text: 'If you want to go fast, go alone. If you want to go far, go together.',
    author: 'African proverb',
  },
  monthPlan: {
    text: 'Nothing will work unless you do.',
    author: 'Maya Angelou',
  },
  weekPlan: {
    text: "It always seems impossible until it's done.",
    author: 'Nelson Mandela',
  },
  monthReview: {
    text: 'A journey of a thousand miles begins with a single step.',
    author: 'Lao Tzu',
  },
};
