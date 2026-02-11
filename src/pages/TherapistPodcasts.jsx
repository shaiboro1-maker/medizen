import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TherapistPodcasts() {
  const [therapist, setTherapist] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", series_name: "", episode_number: 1, duration_minutes: 30 });
  const [audioFile, setAudioFile] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: podcasts = [] } = useQuery({
    queryKey: ["myPodcasts", therapist?.id],
    queryFn: () => base44.entities.Podcast.filter({ therapist_id: therapist.id }, "-created_date"),
    enabled: !!therapist,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      let audioUrl = "";
      if (audioFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: audioFile });
        audioUrl = file_url;
      }
      return base44.entities.Podcast.create({
        ...data,
        therapist_id: therapist.id,
        therapist_name: therapist.full_name,
        audio_url: audioUrl,
        episode_number: Number(data.episode_number),
        duration_minutes: Number(data.duration_minutes),
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["myPodcasts"] }); setShowForm(false); setAudioFile(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Podcast.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myPodcasts"] }),
  });

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">הפודקאסט שלי</h1>
        <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700"><Plus size={16} className="ml-2"/> פרק חדש</Button>
      </div>

      {podcasts.length === 0 ? (
        <div className="text-center py-12">
          <Mic size={48} className="text-gray-200 mx-auto mb-4"/>
          <p className="text-gray-400">צור את הפרק הראשון שלך</p>
        </div>
      ) : (
        <div className="space-y-3">
          {podcasts.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold">{p.title}</h3>
                <p className="text-sm text-gray-500">{p.series_name} · פרק {p.episode_number} · {p.duration_minutes} דק'</p>
                <p className="text-xs text-gray-400">{p.play_count || 0} האזנות</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)} className="text-red-500"><Trash2 size={16}/></Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>פרק חדש</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>כותרת</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})}/></div>
            <div className="space-y-2"><Label>שם הסדרה</Label><Input value={form.series_name} onChange={e => setForm({...form, series_name: e.target.value})}/></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>מספר פרק</Label><Input type="number" value={form.episode_number} onChange={e => setForm({...form, episode_number: e.target.value})}/></div>
              <div className="space-y-2"><Label>משך (דק')</Label><Input type="number" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: e.target.value})}/></div>
            </div>
            <div className="space-y-2"><Label>תיאור</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}/></div>
            <div className="space-y-2">
              <Label>קובץ אודיו</Label>
              <input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files[0])} className="text-sm"/>
            </div>
            <Button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} className="w-full bg-teal-600 hover:bg-teal-700">
              {createMutation.isPending ? "מעלה..." : "צור פרק"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}