"use client";

import { Button } from "@/components/ui/button";
import { JournalEntry, Question } from "@/types/types";
import { format } from "date-fns";
import { useState } from "react";

type Props = {
  entries: JournalEntry[];
  questions: Question[];
};

export function PastEntries({ entries, questions }: Props) {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const getQuestionText = (id: number) =>
    questions.find((q) => q.id === id)?.text || "Question not found";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Past Entries</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entries
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .map((entry) => (
            <div
              key={entry.id}
              className={`p-4 rounded-lg shadow cursor-pointer transition-colors
              ${
                selectedEntry?.id === entry.id
                  ? "bg-purple-50 border-2 border-purple-500"
                  : "bg-white hover:bg-gray-50"
              }`}
              onClick={() => setSelectedEntry(entry)}
            >
              <p className="font-semibold">
                {format(new Date(entry.date), "MMMM d, yyyy")}
              </p>
              <p className="text-sm text-gray-500">
                {entry.answers.length} answers
              </p>
            </div>
          ))}
      </div>

      {selectedEntry && (
        <div className="bg-white rounded-lg p-6 shadow-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">
              {format(new Date(selectedEntry.date), "MMMM d, yyyy")}
            </h3>
            <Button variant="ghost" onClick={() => setSelectedEntry(null)}>
              Close
            </Button>
          </div>

          {selectedEntry.answers.map(({ questionId, answer }) => (
            <div key={questionId} className="space-y-2">
              <p className="font-medium">{getQuestionText(questionId)}</p>
              <p className="text-gray-700 whitespace-pre-wrap">{answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
