import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Music as MusicIcon, Play, Pause, ArrowRight, Share2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

const CATEGORIES = [
  { id: "all", label: "הכל", emoji: "🎵" },
  { id: "meditation", label: "מדיטציה", emoji: "🧘" },
  { id: "reversing", label: "ריברסינג", emoji: "🌊" },
  { id: "calming", label: "מוזיקה מרגיעה", emoji: "😌" },
  { id: "chill", label: "צ'יל", emoji: "☁️" },
  { id: "yoga", label: "יוגה", emoji: "🕉️" },
  { id: "body_mind", label: "גוף ונפש", emoji: "🌿" },
  { id: "brain_healing", label: "תדרים לריפוי המוח", emoji: "🧠" },
  { id: "alpha_waves", label: "גלי אלפא", emoji: "✨" },
  { id: "sleep", label: "שינה רגועה", emoji: "😴" },
  { id: "breathing", label: "תרגילי נשימה", emoji: "🫁" },
  { id: "life_stories", label: "סיפורים לחיים", emoji: "📖" },
  { id: "jokes", label: "בדיחות מצחיקות", emoji: "😄" },
];

export default function Music() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category') || 'all';
  const [category, setCategory] = useState(initialCategory);
  const [playing, setPlaying] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "meditation" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ["music"],
    queryFn: () => base44.entities.Music.list("-created_date"),
  });

  const filtered = useMemo(() => {
    return tracks.filter(t => category === "all" || t.category === category);
  }, [tracks, category]);

  const handlePlay = (trackId) => {
    if (playing === trackId) {
      setPlaying(null);
    } else {
      setPlaying(trackId);
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.Music.create({
        ...data,
        therapist_id: user.id,
        is_featured: false
      });
    },
    onSuccess: () => {
      toast.success("השיר נשלח לאישור!");
      setShowUpload(false);
      setForm({ title: "", description: "", category: "meditation" });
    },
  });

  const handleShare = (track) => {
    const text = `🎵 ${track.title}\n${track.description}\n\nהורד את אפליקציית MediZen לעוד מוזיקה מרגיעה:\n${window.location.origin}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen pb-24" style={{backgroundColor: '#F5F1E8'}}>
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)}>
            <ArrowRight size={24}/>
          </button>
          <h1 className="text-xl font-bold">🎵 מוזיקה ומדיטציות</h1>
        </div>
        <p className="text-sm text-gray-600 text-right">תדרים לריפוי, מוזיקה מרגיעה ומדיטציות</p>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-4">
        <Button 
          onClick={() => setShowUpload(true)}
          className="w-full mb-4 bg-teal-600 hover:bg-teal-700"
        >
          <Upload size={16} className="ml-2"/> שתף מוזיקה משלך
        </Button>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              category === cat.id ? "bg-[#7C9885] text-white shadow-md" : "bg-white text-[#A8947D] hover:bg-[#E5DDD3]"
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">אין מוזיקה זמינה</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map(track => (
            <div
              key={track.id}
              className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all"
            >
              <div className="aspect-video overflow-hidden">
                {track.image_url ? (
                  <img 
                    src={track.image_url} 
                    alt={track.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#7C9885] to-[#9CB4A4] flex items-center justify-center">
                    <MusicIcon className="text-white" size={48}/>
                  </div>
                )}
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-[#7C9885]/80 text-white text-xs">
                    {CATEGORIES.find(c => c.id === track.category)?.emoji} {CATEGORIES.find(c => c.id === track.category)?.label}
                  </Badge>
                  {track.duration_minutes && (
                    <span className="text-xs opacity-80">{track.duration_minutes} דקות</span>
                  )}
                  {track.is_featured && (
                    <Badge className="bg-amber-500/80 text-white text-xs">⭐ מומלץ</Badge>
                  )}
                </div>
                
                <h3 className="font-bold text-xl mb-1">{track.title}</h3>
                {track.description && (
                  <p className="text-sm opacity-90 line-clamp-2 mb-3">{track.description}</p>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePlay(track.id)}
                    className="w-12 h-12 rounded-full bg-white/90 hover:bg-white text-[#7C9885] flex items-center justify-center transition-all hover:scale-110"
                  >
                    {playing === track.id ? <Pause size={20}/> : <Play size={20}/>}
                  </button>
                  <button
                    onClick={() => handleShare(track)}
                    className="w-12 h-12 rounded-full bg-white/90 hover:bg-white text-[#7C9885] flex items-center justify-center transition-all hover:scale-110"
                  >
                    <Share2 size={16}/>
                  </button>
                </div>
              </div>

              {playing === track.id && track.audio_url && (
                <div className="absolute top-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-sm">
                  <audio
                    src={track.audio_url}
                    controls
                    autoPlay
                    className="w-full"
                    onEnded={() => setPlaying(null)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>שתף מוזיקה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>כותרת *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="שם השיר"
              />
            </div>
            <div className="space-y-2">
              <Label>תיאור</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="תיאור המוזיקה..."
                className="h-20"
              />
            </div>
            <Button 
              onClick={() => uploadMutation.mutate(form)}
              disabled={!form.title || uploadMutation.isPending}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              שלח לאישור
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}