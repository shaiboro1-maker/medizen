import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Play, FileText, Share2, ArrowRight, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

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
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "general" });
  const queryClient = useQueryClient();

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

  const uploadMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.Exercise.create({
        ...data,
        therapist_id: user.id,
        therapist_name: user.full_name,
        is_approved: false
      });
    },
    onSuccess: () => {
      toast.success("התרגיל נשלח לאישור!");
      setShowUpload(false);
      setForm({ title: "", description: "", category: "general" });
    },
  });

  const handleShare = (exercise) => {
    const text = `תרגיל: ${exercise.title}\n${exercise.description}\n\nהורד את אפליקציית MediZen לעוד תרגילים מקצועיים:\n${window.location.origin}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#F5F1E8" }}>
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowRight size={24}/>
          </button>
          <h1 className="text-xl font-bold">תרגילים מקצועיים</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <Button 
          onClick={() => setShowUpload(true)}
          className="w-full mb-4 bg-teal-600 hover:bg-teal-700"
        >
          <Upload size={16} className="ml-2"/> שתף תרגיל משלך
        </Button>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
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
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="h-40 bg-gradient-to-bl from-blue-50 to-teal-50 flex items-center justify-center cursor-pointer" onClick={() => setSelectedExercise(ex)}>
                  {ex.thumbnail_url ? (
                    <img src={ex.thumbnail_url} alt={ex.title} className="w-full h-full object-cover"/>
                  ) : (
                    <Play size={40} className="text-teal-300"/>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{ex.title}</h3>
                  <div className="flex gap-2 flex-wrap mb-3">
                    <Badge variant="secondary" className="bg-teal-50 text-teal-700">
                      {CATEGORIES.find(c => c.id === ex.category)?.label || ex.category}
                    </Badge>
                    {ex.difficulty && (
                      <Badge variant="outline">{DIFFICULTY_LABELS[ex.difficulty]}</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setSelectedExercise(ex)}>
                      צפה בפרטים
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleShare(ex)}>
                      <Share2 size={14} className="ml-1"/> שתף
                    </Button>
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

        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>שתף תרגיל</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>כותרת *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  placeholder="שם התרגיל"
                />
              </div>
              <div className="space-y-2">
                <Label>תיאור *</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="איך מבצעים את התרגיל..."
                  className="h-24"
                />
              </div>
              <Button 
                onClick={() => uploadMutation.mutate(form)}
                disabled={!form.title || !form.description || uploadMutation.isPending}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                שלח לאישור
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}