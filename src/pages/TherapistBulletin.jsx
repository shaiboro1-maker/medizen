import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CATS = [
  { id: "collaboration", label: "שיתופי פעולה" },
  { id: "equipment_sale", label: "ציוד למכירה" },
  { id: "clinic_rental", label: "חדרים להשכרה" },
  { id: "jobs", label: "דרושים" },
  { id: "other", label: "אחר" },
];

const STATUS_MAP = {
  pending: { label: "ממתין לאישור", color: "bg-yellow-100 text-yellow-800" },
  approved: { label: "פעיל", color: "bg-green-100 text-green-800" },
  expired: { label: "פג תוקף", color: "bg-gray-100 text-gray-800" },
  rejected: { label: "נדחה", color: "bg-red-100 text-red-800" },
};

export default function TherapistBulletin() {
  const [therapist, setTherapist] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "collaboration", price: 0, area: "", contact_info: "" });
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: posts = [] } = useQuery({
    queryKey: ["myBulletinPosts", therapist?.id],
    queryFn: () => base44.entities.BulletinPost.filter({ therapist_id: therapist.id }, "-created_date"),
    enabled: !!therapist,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.BulletinPost.create({
      ...data,
      therapist_id: therapist.id,
      therapist_name: therapist.full_name,
      price: Number(data.price) || 0,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["myBulletinPosts"] }); setShowForm(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BulletinPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myBulletinPosts"] }),
  });

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">לוח המודעות שלי</h1>
        <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700"><Plus size={16} className="ml-2"/> מודעה חדשה</Button>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-gray-400 py-12">פרסם מודעה ראשונה</p>
      ) : (
        <div className="space-y-3">
          {posts.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold">{p.title}</h3>
                  <Badge className={STATUS_MAP[p.status]?.color}>{STATUS_MAP[p.status]?.label}</Badge>
                </div>
                <p className="text-sm text-gray-500">{p.description?.slice(0, 100)}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)} className="text-red-500"><Trash2 size={16}/></Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>מודעה חדשה</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>כותרת</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})}/></div>
            <div className="space-y-2"><Label>תיאור</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}/></div>
            <div className="space-y-2">
              <Label>קטגוריה</Label>
              <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{CATS.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>מחיר</Label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}/></div>
              <div className="space-y-2"><Label>אזור</Label><Input value={form.area} onChange={e => setForm({...form, area: e.target.value})}/></div>
            </div>
            <div className="space-y-2"><Label>פרטי קשר</Label><Input value={form.contact_info} onChange={e => setForm({...form, contact_info: e.target.value})}/></div>
            <Button onClick={() => createMutation.mutate(form)} className="w-full bg-teal-600 hover:bg-teal-700">פרסם מודעה</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}