import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

export default function AdminProducts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "other",
    price: 0,
    sale_price: 0,
    stock: 0,
    image_url: "",
    is_active: true
  });

  const { data: products = [] } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: () => base44.entities.Product.list("-created_date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminProducts"] }),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      setShowDialog(false);
      resetForm();
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
    } catch (error) {
      alert("שגיאה בהעלאת תמונה");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "other",
      price: 0,
      sale_price: 0,
      stock: 0,
      image_url: "",
      is_active: true
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="p-6 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowRight size={20}/>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#7C9885]">ניהול מוצרים</h1>
            <p className="text-[#A8947D]">הוספה ומחיקה של מוצרים</p>
          </div>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-[#B8A393] hover:bg-[#C5B5A4]">
          <Plus size={16} className="ml-2"/> הוסף מוצר
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E5DDD3] p-12 text-center">
          <p className="text-[#A8947D]">אין מוצרים</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E5DDD3] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F1E8]">
              <tr>
                <th className="text-right p-3 font-medium text-[#7C9885]">תמונה</th>
                <th className="text-right p-3 font-medium text-[#7C9885]">שם</th>
                <th className="text-right p-3 font-medium text-[#7C9885]">קטגוריה</th>
                <th className="text-right p-3 font-medium text-[#7C9885]">מחיר</th>
                <th className="text-right p-3 font-medium text-[#7C9885]">מלאי</th>
                <th className="text-right p-3 font-medium text-[#7C9885]">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t border-[#E5DDD3]">
                  <td className="p-3">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover"/>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg"/>
                    )}
                  </td>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3"><Badge variant="secondary">{p.category}</Badge></td>
                  <td className="p-3">₪{p.price}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)} className="text-red-500">
                      <Trash2 size={14}/>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>הוסף מוצר חדש</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>שם המוצר</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div>
              <Label>תיאור</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <Label>קטגוריה</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                <SelectTrigger>
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insoles">מדרסים</SelectItem>
                  <SelectItem value="massage_tools">עיסוי</SelectItem>
                  <SelectItem value="supplements">תוספים</SelectItem>
                  <SelectItem value="formulas">פורמולות</SelectItem>
                  <SelectItem value="equipment">מכשור</SelectItem>
                  <SelectItem value="oils">שמנים</SelectItem>
                  <SelectItem value="cosmetics">קוסמטיקה</SelectItem>
                  <SelectItem value="sports_equipment">ציוד ספורט</SelectItem>
                  <SelectItem value="therapeutic_jewelry">תכשיטים</SelectItem>
                  <SelectItem value="websites">אתרים</SelectItem>
                  <SelectItem value="other">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>מחיר (₪)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div>
                <Label>מחיר מבצע (₪)</Label>
                <Input
                  type="number"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({...formData, sale_price: parseFloat(e.target.value)})}
                />
              </div>
            </div>

            <div>
              <Label>מלאי</Label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <Label>תמונת מוצר</Label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="block w-full text-sm"
              />
              {formData.image_url && (
                <img src={formData.image_url} alt="תצוגה מקדימה" className="mt-2 w-32 h-32 object-cover rounded-lg"/>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)} disabled={uploading}>
                ביטול
              </Button>
              <Button type="submit" className="bg-[#B8A393] hover:bg-[#C5B5A4]" disabled={uploading}>
                {uploading ? "מעלה..." : "צור מוצר"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}