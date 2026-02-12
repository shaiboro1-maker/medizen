import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Play, Pause, Clock, Headphones, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function Podcasts() {
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(null);

  const { data: podcasts = [], isLoading } = useQuery({
    queryKey: ["podcasts"],
    queryFn: () => base44.entities.Podcast.list("-created_date"),
  });

  // Group by series
  const series = podcasts.reduce((acc, p) => {
    const key = p.series_name || "כללי";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft size={16} className="ml-2"/> חזור
      </Button>
      <h1 className="text-3xl font-bold mb-2">פודקאסטים</h1>
      <p className="text-gray-500 mb-8">פרקים והרצאות מהמומחים המובילים</p>

      {isLoading ? (
        <div className="space-y-6">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl"/>)}</div>
      ) : podcasts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">אין פודקאסטים זמינים כרגע</div>
      ) : (
        <div className="space-y-10">
          {Object.entries(series).map(([name, episodes]) => (
            <div key={name}>
              <h2 className="text-xl font-bold mb-4">{name}</h2>
              <div className="space-y-3">
                {episodes.map(ep => (
                  <div key={ep.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-sm transition-all">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-bl from-amber-50 to-teal-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {ep.image_url ? (
                        <img src={ep.image_url} alt="" className="w-full h-full object-cover"/>
                      ) : (
                        <Headphones size={24} className="text-teal-300"/>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate">{ep.title}</h3>
                      {ep.therapist_name && <p className="text-xs text-gray-500">{ep.therapist_name}</p>}
                      <div className="flex gap-3 text-xs text-gray-400 mt-1">
                        {ep.duration_minutes && <span className="flex items-center gap-1"><Clock size={10}/> {ep.duration_minutes} דק'</span>}
                        {ep.play_count > 0 && <span>{ep.play_count} האזנות</span>}
                      </div>
                    </div>
                    {ep.audio_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full w-12 h-12 bg-teal-50 hover:bg-teal-100"
                        onClick={() => setPlaying(playing === ep.id ? null : ep.id)}
                      >
                        {playing === ep.id ? <Pause size={18} className="text-teal-700"/> : <Play size={18} className="text-teal-700"/>}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}