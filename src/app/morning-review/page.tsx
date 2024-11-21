// src/app/morning-review/page.tsx
"use client";

import { DailyReview } from "@/components/DailyReview";
import { PastEntries } from "@/components/PastEntries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { JournalEntry, Question } from "@/types/types";
import { useEffect, useState } from "react";

export default function MorningReview() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [isDaily, setIsDaily] = useState(false);

  useEffect(() => {
    const savedQuestions = localStorage.getItem("morningQuestions");
    const savedEntries = localStorage.getItem("journalEntries");

    if (savedQuestions) setQuestions(JSON.parse(savedQuestions));
    if (savedEntries) setEntries(JSON.parse(savedEntries));
  }, []);

  useEffect(() => {
    localStorage.setItem("morningQuestions", JSON.stringify(questions));
    localStorage.setItem("journalEntries", JSON.stringify(entries));
  }, [questions, entries]);

  const addQuestion = () => {
    if (!newQuestion.trim()) return;

    setQuestions([
      ...questions,
      {
        id: Date.now(),
        text: newQuestion,
        isDaily,
        isActive: true,
      },
    ]);
    setNewQuestion("");
    setIsDaily(false);
  };

  const toggleQuestionStatus = (id: number) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, isActive: !q.isActive } : q))
    );
  };

  const handleSubmitEntry = (
    answers: { questionId: number; answer: string }[]
  ) => {
    setEntries([
      ...entries,
      {
        id: Date.now(),
        date: new Date().toISOString(),
        answers,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
          Morning Review
        </h1>

        {/* Add Question Form */}
        <div className="flex gap-4 items-center">
          <Input
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Add a new question..."
            className="flex-1"
          />
          <div className="flex items-center gap-2">
            <Switch checked={isDaily} onCheckedChange={setIsDaily} />
            <span>Daily</span>
          </div>
          <Button onClick={addQuestion}>Add</Button>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Questions</h2>
          {questions.map((question) => (
            <div
              key={question.id}
              className="flex items-center gap-4 p-4 bg-white rounded-lg shadow"
            >
              <p className="flex-1">{question.text}</p>
              <span
                className={`px-2 py-1 rounded text-sm ${
                  question.isDaily ? "bg-blue-100 text-blue-800" : "bg-gray-100"
                }`}
              >
                {question.isDaily ? "Daily" : "Random"}
              </span>
              <Switch
                checked={question.isActive}
                onCheckedChange={() => toggleQuestionStatus(question.id)}
              />
            </div>
          ))}
        </div>

        {/* Today's Review */}
        <DailyReview questions={questions} onSubmit={handleSubmitEntry} />

        {/* Past Entries */}
        <PastEntries entries={entries} questions={questions} />
      </div>
    </div>
  );
}
