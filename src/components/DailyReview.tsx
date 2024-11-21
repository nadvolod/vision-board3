"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Question } from "@/types/types";
import { useState } from "react";

type Props = {
  questions: Question[];
  onSubmit: (answers: { questionId: number; answer: string }[]) => void;
};

export function DailyReview({ questions, onSubmit }: Props) {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const getTodaysQuestions = () => {
    const dailyQuestions = questions.filter((q) => q.isActive && q.isDaily);
    const randomQuestions = questions.filter((q) => q.isActive && !q.isDaily);
    const randomSelection = randomQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, 2); // Show 2 random questions

    return [...dailyQuestions, ...randomSelection];
  };

  const handleSubmit = () => {
    const formattedAnswers = Object.entries(answers).map(
      ([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer,
      })
    );
    onSubmit(formattedAnswers);
    setAnswers({});
  };

  const todaysQuestions = getTodaysQuestions();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Today's Review</h2>
      {todaysQuestions.map((question) => (
        <div key={question.id} className="space-y-2">
          <p className="font-medium">{question.text}</p>
          <Textarea
            value={answers[question.id] || ""}
            onChange={(e) =>
              setAnswers({
                ...answers,
                [question.id]: e.target.value,
              })
            }
            placeholder="Your answer..."
            className="min-h-[100px]"
          />
        </div>
      ))}
      <Button
        onClick={handleSubmit}
        disabled={todaysQuestions.length === 0}
        className="w-full"
      >
        Save Today's Review
      </Button>
    </div>
  );
}
