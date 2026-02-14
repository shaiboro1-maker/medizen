import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Tag, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminPromotions() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "both",
    discount_type: "percentage",
    discount_value: 0,
    start_date: "",
    end_date: "",
    max_uses: 100,
    target_audience: "all",
    is_active: true
  });

  const { data: promotions = [] } = useQuery({
    queryKey: ["promotions"],
    queryFn: () => base44.entities.Promotion.list("-created_date"),
  });

  const { data: coupons = [] } = useQuery({
    queryKey: ["coupons"],
    queryFn: () => base44.entities.Coupon.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Promotion.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      setShowDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Promotion.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      setShowDialog(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Promotion.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["promotions"] }),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "both",
      discount_type: "percentage",
      discount_value: 0,
      start_date: "",
      end_date: "",
      max_uses: 100,
      target_audience: "all",
      is_active: true
    });
    setEditingPromotion(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPromotion) {
      updateMutation.mutate({ id: editingPromotion.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData(promotion);
    setShowDialog(true);
  };

  const activePromotions = promotions.filter(p => p.is_active);
  const totalUses = promotions.reduce((sum, p) => sum + (p.current_uses || 0), 0);

  return (
    <div className="p-6 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#7C9885]">🎁 מבצעים והנחות</h1>
          <p className="text-[#A8947D]">ניהול מבצעים, הנחות וקופונים</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-[#B8A393] hover:bg-[#C5B5A4]">
          <Plus size={16} className="ml-2"/> מבצע חדש
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Tag className="text-teal-600"/>}
          label="מבצעים פעילים"
          value={activePromotions.length}
          bg="bg-teal-50"
        />
        <StatCard
          icon={<TrendingUp className="text-green-600"/>}
          label="סה״כ שימושים"
          value={totalUses}
          bg="bg-green-50"
        />
        <StatCard
          icon={<Tag className="text-purple-600"/>}
          label="קופונים פעילים"
          value={coupons.filter(c => c.is_active).length}
          bg="bg-purple-50"
        />
        <StatCard
          icon={<Calendar className="text-blue-600"/>}
          label="מבצעים קרובים"
          value={promotions.filter(p => new Date(p.start_date) > new Date()).length}
          bg="bg-blue-50"
        />
      </div>

      {/* Promotions List */}
      <div className="bg-white rounded-xl border border-[#E5DDD3] overflow-hidden">
        <div className="p-4 bg-[#F5F1E8] border-b border-[#E5DDD3]">
          <h3 className="font-bold text-[#7C9885]">מבצעים פעילים</h3>
        </div>
        <div className="divide-y divide-[#E5DDD3]">
          {promotions.length === 0 ? (
            <p className="text-center text-gray-400 py-12">אין מבצעים</p>
          ) : (
            promotions.map(promo => (
              <div key={promo.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[#7C9885]">{promo.title}</h3>
                      <Badge className={promo.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {promo.is_active ? "פעיל" : "לא פעיל"}
                      </Badge>
                      <Badge variant="outline">{promo.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{promo.description}</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>הנחה: {promo.discount_value}{promo.discount_type === 'percentage' ? '%' : '₪'}</span>
                      <span>תוקף: {new Date(promo.start_date).toLocaleDateString('he-IL')} - {new Date(promo.end_date).toLocaleDateString('he-IL')}</span>
                      <span>שימושים: {promo.current_uses || 0}/{promo.max_uses}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(promo)}>
                      <Edit size={14}/>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteMutation.mutate(promo.id)} className="text-red-600">
                      <Trash2 size={14}/>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPromotion ? "עריכת מבצע" : "מבצע חדש"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>כותרת</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>סוג מבצע</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger>
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">שירותים</SelectItem>
                    <SelectItem value="product">מוצרים</SelectItem>
                    <SelectItem value="both">שניהם</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>סוג הנחה</Label>
                <Select value={formData.discount_type} onValueChange={(v) => setFormData({...formData, discount_type: v})}>
                  <SelectTrigger>
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">אחוזים</SelectItem>
                    <SelectItem value="fixed">סכום קבוע</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>ערך הנחה</Label>
              <Input
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData({...formData, discount_value: parseFloat(e.target.value)})}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>תאריך התחלה</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>תאריך סיום</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>מקסימום שימושים</Label>
                <Input
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) => setFormData({...formData, max_uses: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label>קהל יעד</Label>
                <Select value={formData.target_audience} onValueChange={(v) => setFormData({...formData, target_audience: v})}>
                  <SelectTrigger>
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כולם</SelectItem>
                    <SelectItem value="new_clients">לקוחות חדשים</SelectItem>
                    <SelectItem value="returning_clients">לקוחות חוזרים</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                ביטול
              </Button>
              <Button type="submit" className="bg-[#B8A393] hover:bg-[#C5B5A4]">
                {editingPromotion ? "עדכן" : "צור מבצע"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon, label, value, bg }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5DDD3] p-4">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}