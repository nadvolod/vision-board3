"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  GripHorizontal,
  Upload,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

type Goal = {
  id: number;
  imageUrl: string;
  description: string;
  deadline: string;
  title: string;
};

const VisionBoard = () => {
  const createInitialGoals = () =>
    Array(9)
      .fill(null)
      .map((_, index) => ({
        id: index,
        imageUrl: `/api/placeholder/400/400`,
        description: "Click to edit your goal description",
        deadline: "2024-12-31",
        title: `Goal ${index + 1}`,
      }));

  const [goals, setGoals] = useState<Goal[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("visionBoardGoals");
      return saved ? JSON.parse(saved) : createInitialGoals();
    }
    return createInitialGoals();
  });

  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingForId, setUploadingForId] = useState<number | null>(null);
  const [draggedGoal, setDraggedGoal] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("visionBoardGoals", JSON.stringify(goals));
    }
  }, [goals]);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    goalId: number
  ) => {
    setDraggedGoal(goalId);
    e.dataTransfer.setData("text/plain", goalId.toString());
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggedGoal(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: number) => {
    e.preventDefault();
    const sourceId = parseInt(e.dataTransfer.getData("text/plain"), 10);

    if (sourceId === targetId) return;

    const newGoals = [...goals];
    const sourceIndex = newGoals.findIndex((g) => g.id === sourceId);
    const targetIndex = newGoals.findIndex((g) => g.id === targetId);

    const [movedGoal] = newGoals.splice(sourceIndex, 1);
    newGoals.splice(targetIndex, 0, movedGoal);

    setGoals(newGoals);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || uploadingForId === null) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setGoals(
        goals.map((goal) =>
          goal.id === uploadingForId
            ? { ...goal, imageUrl: base64String }
            : goal
        )
      );
      setUploadingForId(null);

      if (editingGoal && editingGoal.id === uploadingForId) {
        setEditingGoal({ ...editingGoal, imageUrl: base64String });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal({ ...goal });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editingGoal) {
      setGoals(
        goals.map((goal) => (goal.id === editingGoal.id ? editingGoal : goal))
      );
      setIsEditing(false);
      setEditingGoal(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600"
        >
          My Vision Board
        </motion.h1>

        <motion.div
          className="grid grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              draggable
              onDragStart={(e) => handleDragStart(e, goal.id)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, goal.id)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative group rounded-xl overflow-hidden shadow-lg bg-white cursor-move
                ${draggedGoal === goal.id ? "opacity-50" : "opacity-100"}
              `}
            >
              <div
                className="aspect-square relative"
                onClick={() => setSelectedGoal(goal.id)}
              >
                <img
                  src={goal.imageUrl}
                  alt={goal.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-semibold text-white text-lg">
                    {goal.title}
                  </h3>
                  <p className="text-white/80 text-sm">Due: {goal.deadline}</p>
                </div>
              </div>

              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <GripHorizontal className="h-6 w-6 text-white drop-shadow-lg" />
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadingForId(goal.id);
                  document.getElementById("imageUpload")?.click();
                }}
              >
                <Upload className="h-4 w-4 text-white drop-shadow-lg" />
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* Full Screen View Dialog */}
        <Dialog
          open={selectedGoal !== null}
          onOpenChange={() => setSelectedGoal(null)}
        >
          <DialogContent className="max-w-4xl h-[80vh]">
            <AnimatePresence mode="wait">
              {selectedGoal !== null && (
                <motion.div
                  className="relative h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 z-10"
                    onClick={() => setSelectedGoal(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  <div className="h-full flex flex-col">
                    <motion.img
                      key={selectedGoal}
                      src={goals.find((g) => g.id === selectedGoal)?.imageUrl}
                      alt={goals.find((g) => g.id === selectedGoal)?.title}
                      className="w-full h-3/4 object-cover rounded-lg"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div
                      className="p-4 flex-1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="text-2xl font-bold">
                          {goals.find((g) => g.id === selectedGoal)?.title}
                        </h2>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleEdit(
                              goals.find((g) => g.id === selectedGoal)!
                            )
                          }
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-gray-600 mb-2">
                        {goals.find((g) => g.id === selectedGoal)?.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        Deadline:{" "}
                        {goals.find((g) => g.id === selectedGoal)?.deadline}
                      </p>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={() => {
                        if (selectedGoal !== null) {
                          const currentIndex = goals.findIndex(
                            (g) => g.id === selectedGoal
                          );
                          if (currentIndex > 0) {
                            setSelectedGoal(goals[currentIndex - 1].id);
                          }
                        }
                      }}
                      disabled={selectedGoal === goals[0].id}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                      onClick={() => {
                        if (selectedGoal !== null) {
                          const currentIndex = goals.findIndex(
                            (g) => g.id === selectedGoal
                          );
                          if (currentIndex < goals.length - 1) {
                            setSelectedGoal(goals[currentIndex + 1].id);
                          }
                        }
                      }}
                      disabled={selectedGoal === goals[goals.length - 1].id}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold mb-4">Edit Goal</h2>
              {editingGoal && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Title
                    </label>
                    <Input
                      value={editingGoal.title}
                      onChange={(e) =>
                        setEditingGoal({
                          ...editingGoal,
                          title: e.target.value,
                        })
                      }
                      className="focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <Textarea
                      value={editingGoal.description}
                      onChange={(e) =>
                        setEditingGoal({
                          ...editingGoal,
                          description: e.target.value,
                        })
                      }
                      className="focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Deadline
                    </label>
                    <Input
                      type="date"
                      value={editingGoal.deadline}
                      onChange={(e) =>
                        setEditingGoal({
                          ...editingGoal,
                          deadline: e.target.value,
                        })
                      }
                      className="focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </DialogContent>
        </Dialog>

        {/* Hidden file input for image upload */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="imageUpload"
          onChange={handleImageUpload}
        />
      </div>
    </div>
  );
};

export default VisionBoard;
