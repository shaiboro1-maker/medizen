import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Music as MusicIcon, Play, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  { id: "all", label: "הכל", emoji: "🎵" },
  { id: "meditation", label: "מדיטציה", emoji: "🧘" },
  { id: "reversing", label: "ריברסינג", emoji: "🌊" },
  { id: "calming", label: "מוזיקה מרגיעה", emoji: "😌" },
  { id: "chill", label: "צ'יל", emoji: "☁️" },
  { id: "yoga", label: "יוגה", emoji: "🕉️" },
];

export default function Music() {
  const [category, setCategory] = useState("all");
  const [playing, setPlaying] = useState(null);

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">🎵 מוזיקה ומדיטציות</h1>
        <p className="text-gray-500">מוזיקה מרגיעה, מדיטציות מודרכות ועוד</p>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              category === cat.id ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
        <div className="space-y-4">
          {filtered.map(track => (
            <div
              key={track.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center flex-shrink-0 overflow-hidden"
                >
                  {track.image_url ? (
                    <img src={track.image_url} alt={track.title} className="w-full h-full object-cover"/>
                  ) : (
                    <MusicIcon className="text-white" size={28}/>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-1">{track.title}</h3>
                  {track.description && (
                    <p className="text-gray-500 text-sm line-clamp-1">{track.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant="secondary" className="bg-teal-50 text-teal-700">
                      {CATEGORIES.find(c => c.id === track.category)?.emoji} {CATEGORIES.find(c => c.id === track.category)?.label}
                    </Badge>
                    {track.duration_minutes && (
                      <span className="text-xs text-gray-400">{track.duration_minutes} דקות</span>
                    )}
                    {track.is_featured && (
                      <Badge className="bg-amber-400 text-white">⭐ מומלץ</Badge>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handlePlay(track.id)}
                  className="w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
                >
                  {playing === track.id ? <Pause size={24}/> : <Play size={24}/>}
                </button>
              </div>

              {playing === track.id && track.audio_url && (
                <div className="mt-4 pt-4 border-t">
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
    </div>
  );
}