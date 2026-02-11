import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, Play, FileText, Heart, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CATEGORIES = [
  { id: "all", label: "הכל" },
  { id: "back", label: "גב" },
  { id: "neck", label: "צוואר" },
  { id: "shoulder", label: "כתף" },
  { id: "knee", label: "ברך" },
  { id: "heel", label: "דורבן/כף רגל" },
  { id: "hip", label: "ירך" },
  { id: "wrist", label: "שורש כף יד" },
  { id: "stretching", label: "מתיחות" },
  { id: "strengthening", label: "חיזוק" },
  { id: "general", label: "כללי" },
];

const DIFFICULTY_LABELS = { easy: "קל", medium: "בינוני", hard: "מתקדם" };

export default function Exercises() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedExercise, setSelectedExercise] = useState(null);

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => base44.entities.Exercise.filter({ is_approved: true }, "-created_date"),
  });

  const filtered = useMemo(() => {
    return exercises.filter(e => {
      const matchQuery = !query || e.title?.includes(query) || e.description?.includes(query);
      const matchCategory = category === "all" || e.category === category;
      return matchQuery && matchCategory;
    });
  }, [exercises, query, category]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">מאגר תרגילים</h1>
      <p className="text-gray-500 mb-8">תרגילים מקצועיים לפי תחום ורמת קושי</p>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-8 shadow-sm">
        <div className="relative">
          <Search size={18} className="absolute right-3 top-3 text-gray-400"/>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפש תרגיל..."
            className="pr-10"
          />
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat.id ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">לא נמצאו תרגילים</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map(ex => (
            <div
              key={ex.id}
              onClick={() => setSelectedExercise(ex)}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="h-40 bg-gradient-to-bl from-blue-50 to-teal-50 flex items-center justify-center">
                {ex.thumbnail_url ? (
                  <img src={ex.thumbnail_url} alt={ex.title} className="w-full h-full object-cover"/>
                ) : (
                  <Play size={40} className="text-teal-300"/>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{ex.title}</h3>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className="bg-teal-50 text-teal-700">
                    {CATEGORIES.find(c => c.id === ex.category)?.label || ex.category}
                  </Badge>
                  {ex.difficulty && (
                    <Badge variant="outline">{DIFFICULTY_LABELS[ex.difficulty]}</Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exercise Detail Dialog */}
      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedExercise?.title}</DialogTitle>
          </DialogHeader>
          {selectedExercise?.video_url && (
            <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
              <video src={selectedExercise.video_url} controls className="w-full h-full"/>
            </div>
          )}
          <p className="text-gray-600 leading-relaxed">{selectedExercise?.description}</p>
          <div className="flex gap-2 mt-4">
            {selectedExercise?.pdf_url && (
              <a href={selectedExercise.pdf_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-teal-600 text-sm">
                <FileText size={14}/> הורד PDF
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}