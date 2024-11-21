// types/types.ts
export type Question = {
  id: number;
  text: string;
  isDaily: boolean;
  isActive: boolean;
};

export type JournalEntry = {
  id: number;
  date: string;
  answers: {
    questionId: number;
    answer: string;
  }[];
};
