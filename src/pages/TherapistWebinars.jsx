import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TherapistWebinars() {
  const [therapist, setTherapist] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", price: 0, is_free: true, zoom_link: "", max_participants: 50 });
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: webinars = [] } = useQuery({
    queryKey: ["myWebinars", therapist?.id],
    queryFn: () => base44.entities.Webinar.filter({ therapist_id: therapist.id }, "-date"),
    enabled: !!therapist,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Webinar.create({
      ...data,
      therapist_id: therapist.id,
      therapist_name: therapist.full_name,
      price: Number(data.price),
      max_participants: Number(data.max_participants),
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["myWebinars"] }); setShowForm(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Webinar.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myWebinars"] }),
  });

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">הוובינרים שלי</h1>
        <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700"><Plus size={16} className="ml-2"/> וובינר חדש</Button>
      </div>

      {webinars.length === 0 ? (
        <div className="text-center py-12">
          <Video size={48} className="text-gray-200 mx-auto mb-4"/>
          <p className="text-gray-400">צור את הוובינר הראשון שלך</p>
        </div>
      ) : (
        <div className="space-y-3">
          {webinars.map(w => (
            <div key={w.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold">{w.title}</h3>
                  <Badge className={w.status === "upcoming" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>{w.status}</Badge>
                </div>
                <p className="text-sm text-gray-500">{new Date(w.date).toLocaleDateString("he-IL")} · {w.is_free ? "חינם" : `₪${w.price}`} · {w.current_participants || 0}/{w.max_participants} משתתפים</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(w.id)} className="text-red-500"><Trash2 size={16}/></Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>וובינר חדש</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>כותרת</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})}/></div>
            <div className="space-y-2"><Label>תיאור</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}/></div>
            <div className="space-y-2"><Label>תאריך ושעה</Label><Input type="datetime-local" value={form.date} onChange={e => setForm({...form, date: e.target.value})}/></div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_free} onCheckedChange={v => setForm({...form, is_free: v})}/>
              <Label>חינם</Label>
            </div>
            {!form.is_free && <div className="space-y-2"><Label>מחיר</Label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}/></div>}
            <div className="space-y-2"><Label>לינק זום</Label><Input value={form.zoom_link} onChange={e => setForm({...form, zoom_link: e.target.value})}/></div>
            <div className="space-y-2"><Label>מקסימום משתתפים</Label><Input type="number" value={form.max_participants} onChange={e => setForm({...form, max_participants: e.target.value})}/></div>
            <Button onClick={() => createMutation.mutate(form)} className="w-full bg-teal-600 hover:bg-teal-700">צור וובינר</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}