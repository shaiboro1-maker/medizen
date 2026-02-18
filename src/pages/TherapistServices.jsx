import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Plus, Edit, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function TherapistServices() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [therapist, setTherapist] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: "",
    is_active: true,
    home_visit_available: false,
    home_visit_price: "",
    deposit_required: false,
    deposit_amount: "100"
  });

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: services = [] } = useQuery({
    queryKey: ["services", therapist?.id],
    queryFn: () => base44.entities.Service.filter({ therapist_id: therapist.id }),
    enabled: !!therapist,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Service.create({
      therapist_id: therapist.id,
      ...data,
      price: parseFloat(data.price),
      duration_minutes: parseInt(data.duration_minutes),
      home_visit_price: data.home_visit_price ? parseFloat(data.home_visit_price) : null,
      deposit_amount: data.deposit_amount ? parseFloat(data.deposit_amount) : 100
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setShowDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Service.update(editingService.id, {
      ...data,
      price: parseFloat(data.price),
      duration_minutes: parseInt(data.duration_minutes),
      home_visit_price: data.home_visit_price ? parseFloat(data.home_visit_price) : null,
      deposit_amount: data.deposit_amount ? parseFloat(data.deposit_amount) : 100
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setShowDialog(false);
      setEditingService(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
  });

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      duration_minutes: "",
      is_active: true,
      home_visit_available: false,
      home_visit_price: "",
      deposit_required: false,
      deposit_amount: "100"
    });
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description || "",
      price: service.price.toString(),
      duration_minutes: service.duration_minutes.toString(),
      is_active: service.is_active,
      home_visit_available: service.home_visit_available || false,
      home_visit_price: service.home_visit_price?.toString() || "",
      deposit_required: service.deposit_required || false,
      deposit_amount: service.deposit_amount?.toString() || "100"
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (editingService) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="p-4 md:p-8" style={{backgroundColor: '#F5F1E8', minHeight: '100vh'}}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} size="icon">
          <ArrowRight size={20}/>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#7C9885]">ניהול שירותים</h1>
          <p className="text-sm text-gray-600">הגדר את השירותים שאתה מציע</p>
        </div>
        <Button onClick={() => { setEditingService(null); resetForm(); setShowDialog(true); }} className="bg-gradient-to-l from-[#7C9885] to-[#9CB4A4]">
          <Plus size={16} className="ml-2"/> שירות חדש
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {services.map(service => (
          <div key={service.id} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">{service.name}</h3>
                  <Badge className={service.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                    {service.is_active ? "פעיל" : "לא פעיל"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{service.description}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">מחיר:</span>
                <span className="font-bold text-[#7C9885]">₪{service.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">משך:</span>
                <span className="font-medium">{service.duration_minutes} דקות</span>
              </div>
              {service.home_visit_available && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ביקור בית:</span>
                  <span className="font-medium">₪{service.home_visit_price}</span>
                </div>
              )}
              {service.deposit_required && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">דמי רצינות:</span>
                  <span className="font-medium">₪{service.deposit_amount}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(service)} className="flex-1">
                <Edit size={14} className="ml-1"/> עריכה
              </Button>
              <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(service.id)} className="text-red-500">
                <Trash2 size={14} className="ml-1"/> מחק
              </Button>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="col-span-2 text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-400 mb-4">עדיין לא הגדרת שירותים</p>
            <Button onClick={() => { setEditingService(null); resetForm(); setShowDialog(true); }} className="bg-gradient-to-l from-[#7C9885] to-[#9CB4A4]">
              <Plus size={16} className="ml-2"/> הוסף שירות ראשון
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService ? "עריכת שירות" : "שירות חדש"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>שם השירות</Label>
              <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="למשל: טיפול ראשוני"/>
            </div>

            <div className="space-y-2">
              <Label>תיאור</Label>
              <Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="תאר את השירות..." rows={3}/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>מחיר (₪)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} placeholder="200"/>
              </div>
              <div className="space-y-2">
                <Label>משך זמן (דקות)</Label>
                <Input type="number" value={form.duration_minutes} onChange={(e) => setForm({...form, duration_minutes: e.target.value})} placeholder="60"/>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <Label>שירות פעיל</Label>
              <Switch checked={form.is_active} onCheckedChange={(checked) => setForm({...form, is_active: checked})}/>
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <Label>ביקור בית זמין</Label>
                <Switch checked={form.home_visit_available} onCheckedChange={(checked) => setForm({...form, home_visit_available: checked})}/>
              </div>
              {form.home_visit_available && (
                <div className="space-y-2">
                  <Label>מחיר ביקור בית (₪)</Label>
                  <Input type="number" value={form.home_visit_price} onChange={(e) => setForm({...form, home_visit_price: e.target.value})} placeholder="300"/>
                </div>
              )}
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <Label>דרוש תשלום דמי רצינות</Label>
                <Switch checked={form.deposit_required} onCheckedChange={(checked) => setForm({...form, deposit_required: checked})}/>
              </div>
              {form.deposit_required && (
                <div className="space-y-2">
                  <Label>סכום דמי רצינות (₪)</Label>
                  <Input type="number" value={form.deposit_amount} onChange={(e) => setForm({...form, deposit_amount: e.target.value})} placeholder="100"/>
                </div>
              )}
            </div>

            <Button onClick={handleSave} disabled={!form.name || !form.price || !form.duration_minutes} className="w-full bg-gradient-to-l from-[#7C9885] to-[#9CB4A4]">
              {createMutation.isPending || updateMutation.isPending ? "שומר..." : editingService ? "עדכן" : "צור שירות"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}