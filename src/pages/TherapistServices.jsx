import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Home, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TherapistServices() {
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ 
    name: "", 
    description: "", 
    duration_minutes: 60, 
    price: 0,
    deposit_required: false,
    deposit_amount: 100,
    home_visit_available: false,
    home_visit_price: 0,
    treatment_series: []
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: services = [] } = useQuery({
    queryKey: ["therapistServices", therapist?.id],
    queryFn: () => base44.entities.Service.filter({ therapist_id: therapist.id }),
    enabled: !!therapist,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Service.create({ ...data, therapist_id: therapist.id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["therapistServices"] }); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Service.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["therapistServices"] }); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["therapistServices"] }),
  });

  const resetForm = () => {
    setForm({ 
      name: "", 
      description: "", 
      duration_minutes: 60, 
      price: 0,
      deposit_required: false,
      deposit_amount: 100,
      home_visit_available: false,
      home_visit_price: 0,
      treatment_series: []
    });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    const data = { 
      ...form, 
      price: Number(form.price), 
      duration_minutes: Number(form.duration_minutes),
      deposit_amount: Number(form.deposit_amount),
      home_visit_price: Number(form.home_visit_price)
    };
    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowRight size={20}/>
        </Button>
        <h1 className="text-2xl font-bold flex-1">השירותים שלי</h1>
        <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700">
          <Plus size={16} className="ml-2"/> הוסף שירות
        </Button>
      </div>

      {services.length === 0 ? (
        <p className="text-center text-gray-400 py-12">הוסף שירותים כדי שלקוחות יוכלו לקבוע תורים</p>
      ) : (
        <div className="space-y-3">
          {services.map(s => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold">{s.name}</h3>
                <p className="text-sm text-gray-500">{s.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">{s.duration_minutes} דקות</span>
                  <span className="text-sm bg-green-50 text-green-700 px-2 py-1 rounded font-bold">₪{s.price}</span>
                  {s.deposit_required && (
                    <span className="text-sm bg-orange-50 text-orange-700 px-2 py-1 rounded">דמי רצינות: ₪{s.deposit_amount}</span>
                  )}
                  {s.home_visit_available && (
                    <span className="text-sm bg-purple-50 text-purple-700 px-2 py-1 rounded">ביקור בית: ₪{s.home_visit_price}</span>
                  )}
                  {s.treatment_series?.length > 0 && (
                    <span className="text-sm bg-teal-50 text-teal-700 px-2 py-1 rounded">{s.treatment_series.length} סדרות טיפול</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(s); setForm(s); setShowForm(true); }}>
                  <Pencil size={16}/>
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(s.id)} className="text-red-500">
                  <Trash2 size={16}/>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={resetForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "ערוך שירות" : "שירות חדש"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>שם השירות</Label>
              <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}/>
            </div>
            <div className="space-y-2">
              <Label>תיאור</Label>
              <Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>משך (דקות)</Label>
                <Input type="number" value={form.duration_minutes} onChange={(e) => setForm({...form, duration_minutes: e.target.value})}/>
              </div>
              <div className="space-y-2">
                <Label>מחיר (₪)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})}/>
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <DollarSign size={16}/>
                דמי רצינות לאבחון ראשון
              </h4>
              <div className="flex items-center justify-between">
                <Label>דרוש תשלום מקדמה</Label>
                <Switch 
                  checked={form.deposit_required} 
                  onCheckedChange={(checked) => setForm({...form, deposit_required: checked})}
                />
              </div>
              {form.deposit_required && (
                <div className="space-y-2">
                  <Label>סכום דמי רצינות (₪)</Label>
                  <Input 
                    type="number" 
                    value={form.deposit_amount} 
                    onChange={(e) => setForm({...form, deposit_amount: e.target.value})}
                  />
                </div>
              )}
            </div>

            <div className="border-t pt-4 space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Home size={16}/>
                ביקור בית
              </h4>
              <div className="flex items-center justify-between">
                <Label>אפשר ביקורי בית</Label>
                <Switch 
                  checked={form.home_visit_available} 
                  onCheckedChange={(checked) => setForm({...form, home_visit_available: checked})}
                />
              </div>
              {form.home_visit_available && (
                <div className="space-y-2">
                  <Label>מחיר ביקור בית (₪)</Label>
                  <Input 
                    type="number" 
                    value={form.home_visit_price} 
                    onChange={(e) => setForm({...form, home_visit_price: e.target.value})}
                  />
                </div>
              )}
            </div>

            <Button onClick={handleSubmit} className="w-full bg-teal-600 hover:bg-teal-700">
              {editing ? "עדכן שירות" : "צור שירות"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}