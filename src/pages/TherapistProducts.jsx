import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ArrowRight, Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CATS = ["insoles", "massage_tools", "supplements", "cosmetics", "sports_equipment", "therapeutic_jewelry", "other"];

export default function TherapistProducts() {
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "other", price: 0, stock: 0, image_url: "" });
  const [imageFile, setImageFile] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: products = [] } = useQuery({
    queryKey: ["myProducts", therapist?.id],
    queryFn: () => base44.entities.Product.filter({ therapist_id: therapist.id }),
    enabled: !!therapist,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      let imageUrl = data.image_url;
      if (imageFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
        imageUrl = file_url;
      }
      return base44.entities.Product.create({ 
        ...data, 
        therapist_id: therapist.id, 
        price: Number(data.price), 
        stock: Number(data.stock),
        image_url: imageUrl
      });
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["myProducts"] }); 
      setShowForm(false);
      setImageFile(null);
      setForm({ name: "", description: "", category: "other", price: 0, stock: 0, image_url: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["myProducts"] }),
  });

  return (
    <div className="p-4 md:p-8" style={{backgroundColor: '#F5F1E8', minHeight: '100vh'}}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} size="icon">
          <ArrowRight size={20}/>
        </Button>
        <h1 className="text-2xl font-bold flex-1">החנות שלי</h1>
        <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700"><Plus size={16} className="ml-2"/> מוצר חדש</Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl">
          <Image size={48} className="mx-auto mb-4 text-gray-300"/>
          <p className="text-gray-400">הוסף מוצרים לחנות שלך</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {p.image_url && (
                <img src={p.image_url} alt={p.name} className="w-full h-48 object-cover"/>
              )}
              <div className="p-5">
                <h3 className="font-bold mb-1">{p.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{p.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-teal-700 text-lg">₪{p.price}</span>
                  <span className="text-xs text-gray-400">מלאי: {p.stock}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(p.id)} className="text-red-500 mt-2 w-full"><Trash2 size={14} className="ml-1"/> מחק</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>מוצר חדש</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>תמונה</Label>
              <div className="flex items-center gap-3">
                <label className="flex-1 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={24} className="text-gray-400"/>
                    <span className="text-sm text-gray-500">
                      {imageFile ? imageFile.name : "העלה תמונה"}
                    </span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden"
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </label>
                {imageFile && (
                  <img 
                    src={URL.createObjectURL(imageFile)} 
                    alt="Preview" 
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
              </div>
            </div>
            <div className="space-y-2"><Label>שם המוצר</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="שם המוצר"/></div>
            <div className="space-y-2"><Label>תיאור</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="תאר את המוצר" rows={3}/></div>
            <div className="space-y-2">
              <Label>קטגוריה</Label>
              <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{CATS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>מחיר (₪)</Label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}/></div>
              <div className="space-y-2"><Label>מלאי</Label><Input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}/></div>
            </div>
            <Button 
              onClick={() => createMutation.mutate(form)} 
              disabled={createMutation.isPending || !form.name}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              {createMutation.isPending ? "יוצר..." : "צור מוצר"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}