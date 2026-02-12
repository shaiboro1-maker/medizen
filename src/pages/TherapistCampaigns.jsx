import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, TrendingUp, Eye, MousePointer, ShoppingCart, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function TherapistCampaigns() {
  const [therapist, setTherapist] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", target_type: "service", budget: 100 });
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: campaigns = [] } = useQuery({
    queryKey: ["myCampaigns", therapist?.id],
    queryFn: () => base44.entities.Campaign.filter({ therapist_id: therapist.id }, "-created_date"),
    enabled: !!therapist,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Campaign.create({
      ...data,
      therapist_id: therapist.id,
      budget: Number(data.budget),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myCampaigns"] });
      setShowForm(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Campaign.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myCampaigns"] }),
  });

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    paused: "bg-orange-100 text-orange-800",
    completed: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">קמפיינים ממומנים</h1>
        <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700">
          <Plus size={16} className="ml-2"/> קמפיין חדש
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-purple-600" size={20}/>
            </div>
            <div>
              <p className="text-sm text-gray-500">סה״כ קמפיינים</p>
              <p className="text-2xl font-bold">{campaigns.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Eye className="text-blue-600" size={20}/>
            </div>
            <div>
              <p className="text-sm text-gray-500">חשיפות</p>
              <p className="text-2xl font-bold">{campaigns.reduce((s, c) => s + (c.impressions || 0), 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <MousePointer className="text-green-600" size={20}/>
            </div>
            <div>
              <p className="text-sm text-gray-500">קליקים</p>
              <p className="text-2xl font-bold">{campaigns.reduce((s, c) => s + (c.clicks || 0), 0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {campaigns.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg">{c.title}</h3>
                  <Badge className={statusColors[c.status]}>{c.status}</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-3">{c.description}</p>
                <div className="flex gap-6 text-sm">
                  <span className="flex items-center gap-1"><Eye size={14}/> {c.impressions || 0} חשיפות</span>
                  <span className="flex items-center gap-1"><MousePointer size={14}/> {c.clicks || 0} קליקים</span>
                  <span className="flex items-center gap-1"><ShoppingCart size={14}/> {c.conversions || 0} המרות</span>
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500">תקציב</p>
                <p className="font-bold text-lg">₪{c.budget}</p>
                <p className="text-xs text-gray-400">הוצא: ₪{c.spent || 0}</p>
                <div className="flex gap-2 mt-3">
                  {c.status === "active" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: c.id, status: "paused" })}>
                      <Pause size={14} className="ml-1"/> השהה
                    </Button>
                  )}
                  {c.status === "paused" && (
                    <Button size="sm" onClick={() => updateStatusMutation.mutate({ id: c.id, status: "active" })} className="bg-green-600 hover:bg-green-700">
                      <Play size={14} className="ml-1"/> הפעל
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>קמפיין חדש</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>שם הקמפיין</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})}/></div>
            <div className="space-y-2"><Label>תיאור</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}/></div>
            <div className="space-y-2">
              <Label>סוג קידום</Label>
              <Select value={form.target_type} onValueChange={v => setForm({...form, target_type: v})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">שירות</SelectItem>
                  <SelectItem value="product">מוצר</SelectItem>
                  <SelectItem value="course">קורס</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>תקציב (₪)</Label><Input type="number" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})}/></div>
            <Button onClick={() => createMutation.mutate(form)} disabled={!form.title || createMutation.isPending} className="w-full bg-teal-600 hover:bg-teal-700">
              צור קמפיין
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}