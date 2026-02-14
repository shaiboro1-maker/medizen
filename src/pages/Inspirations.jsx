import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Share2, Upload, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";

export default function Inspirations() {
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ text: "", author: "" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: inspirations = [], isLoading } = useQuery({
    queryKey: ["inspirations"],
    queryFn: () => base44.entities.Inspiration.filter({ is_approved: true }, "-created_date"),
  });

  const uploadMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      return base44.entities.Inspiration.create({
        ...data,
        submitted_by: user.email,
        is_approved: false
      });
    },
    onSuccess: () => {
      toast.success("המשפט נשלח לאישור!");
      setShowUpload(false);
      setForm({ text: "", author: "" });
    },
  });

  const handleShare = (inspiration) => {
    const text = `"${inspiration.text}"\n${inspiration.author ? `- ${inspiration.author}` : ""}\n\nהורד את אפליקציית MediZen לעוד משפטי השראה:\n${window.location.origin}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F1E8" }}>
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowRight size={24}/>
          </button>
          <h1 className="text-xl font-bold">משפטי השראה</h1>
        </div>
      </div>

      <div className="p-4">
        <Button 
          onClick={() => setShowUpload(true)}
          className="w-full mb-4 bg-teal-600 hover:bg-teal-700"
        >
          <Upload size={16} className="ml-2"/> שתף משפט השראה
        </Button>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">טוען...</div>
          ) : inspirations.length === 0 ? (
            <div className="text-center py-8 text-gray-400">אין משפטים</div>
          ) : (
            inspirations.map((item) => (
              <div key={item.id} className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl p-6 shadow-md">
                <p className="text-lg italic text-gray-800 mb-3">"{item.text}"</p>
                {item.author && (
                  <p className="text-sm text-gray-600 mb-4">- {item.author}</p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleShare(item)}>
                    <Share2 size={14} className="ml-1"/> שתף בוואטסאפ
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Heart size={14}/>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>שתף משפט השראה</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>משפט ההשראה *</Label>
              <Textarea
                value={form.text}
                onChange={(e) => setForm({...form, text: e.target.value})}
                placeholder="הזן משפט השראה..."
                className="h-24"
              />
            </div>
            <div className="space-y-2">
              <Label>מחבר (אופציונלי)</Label>
              <Input
                value={form.author}
                onChange={(e) => setForm({...form, author: e.target.value})}
                placeholder="שם המחבר"
              />
            </div>
            <Button 
              onClick={() => uploadMutation.mutate(form)}
              disabled={!form.text || uploadMutation.isPending}
              className="w-full bg-teal-600 hover:bg-teal-700"
            >
              שלח לאישור
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}