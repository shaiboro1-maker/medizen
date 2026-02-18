import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Plus, Edit, Trash2, CheckCircle, Clock, XCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const CONTENT_TYPES = [
  { id: "exercise", label: "תרגיל", emoji: "💪" },
  { id: "recipe", label: "מתכון", emoji: "🥗" },
  { id: "inspiration", label: "משפט השראה", emoji: "✨" },
  { id: "story", label: "סיפור", emoji: "📖" },
  { id: "joke", label: "בדיחה", emoji: "😂" },
  { id: "tip", label: "טיפ בריאותי", emoji: "⭐" }
];

export default function TherapistContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [therapist, setTherapist] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [form, setForm] = useState({
    content_type: "",
    title: "",
    description: "",
    content: "",
    image_url: "",
    video_url: ""
  });

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: myContent = [] } = useQuery({
    queryKey: ["therapistContent", therapist?.id],
    queryFn: async () => {
      const user = await base44.auth.me();
      return await base44.entities.UserContent.filter({ user_email: user.email });
    },
    enabled: !!therapist,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      let imageUrl = data.image_url;
      if (imageFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
        imageUrl = file_url;
      }
      return base44.entities.UserContent.create({
        ...data,
        user_email: user.email,
        image_url: imageUrl
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapistContent"] });
      setShowDialog(false);
      setEditingContent(null);
      setImageFile(null);
      setForm({ content_type: "", title: "", description: "", content: "", image_url: "", video_url: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      let imageUrl = data.image_url;
      if (imageFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
        imageUrl = file_url;
      }
      return base44.entities.UserContent.update(editingContent.id, {
        ...data,
        image_url: imageUrl
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapistContent"] });
      setShowDialog(false);
      setEditingContent(null);
      setImageFile(null);
      setForm({ content_type: "", title: "", description: "", content: "", image_url: "", video_url: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.UserContent.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["therapistContent"] }),
  });

  const handleEdit = (content) => {
    setEditingContent(content);
    setForm({
      content_type: content.content_type,
      title: content.title,
      description: content.description || "",
      content: content.content,
      image_url: content.image_url || "",
      video_url: content.video_url || ""
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (editingContent) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  const pending = myContent.filter(c => c.status === "pending");
  const approved = myContent.filter(c => c.status === "approved");
  const rejected = myContent.filter(c => c.status === "rejected");

  return (
    <div className="p-4 md:p-8" style={{backgroundColor: '#F5F1E8', minHeight: '100vh'}}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} size="icon">
          <ArrowRight size={20}/>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#7C9885]">התוכן שלי</h1>
          <p className="text-sm text-gray-600">נהל את כל התכנים שהגשת</p>
        </div>
        <Button onClick={() => { setEditingContent(null); setShowDialog(true); }} className="bg-gradient-to-l from-[#7C9885] to-[#9CB4A4]">
          <Plus size={16} className="ml-2"/> תוכן חדש
        </Button>
      </div>

      <Tabs defaultValue="approved" className="space-y-4">
        <TabsList className="grid grid-cols-3 gap-2 bg-white p-2 rounded-xl">
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle size={16}/>
            מאושר ({approved.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock size={16}/>
            ממתין ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle size={16}/>
            נדחה ({rejected.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approved">
          <ContentList items={approved} onEdit={handleEdit} onDelete={deleteMutation.mutate}/>
        </TabsContent>

        <TabsContent value="pending">
          <ContentList items={pending} onEdit={handleEdit} onDelete={deleteMutation.mutate}/>
        </TabsContent>

        <TabsContent value="rejected">
          <ContentList items={rejected} onEdit={handleEdit} onDelete={deleteMutation.mutate}/>
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingContent ? "עריכת תוכן" : "תוכן חדש"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>סוג התוכן</Label>
              <Select value={form.content_type} onValueChange={(v) => setForm({...form, content_type: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר סוג תוכן"/>
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.emoji} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>כותרת</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="כותרת מושכת"
              />
            </div>

            <div className="space-y-2">
              <Label>תיאור קצר</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="תיאור בקצרה"
              />
            </div>

            <div className="space-y-2">
              <Label>תוכן מלא</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({...form, content: e.target.value})}
                placeholder="כתוב את התוכן המלא כאן..."
                rows={8}
              />
            </div>

            <div className="space-y-2">
              <Label>תמונה (אופציונלי)</Label>
              <div className="flex items-center gap-3">
                <label className="flex-1 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={20} className="text-gray-400"/>
                    <span className="text-sm text-gray-500">
                      {imageFile ? imageFile.name : "העלה תמונה"}
                    </span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files[0])}/>
                </label>
                {(imageFile || form.image_url) && (
                  <img 
                    src={imageFile ? URL.createObjectURL(imageFile) : form.image_url} 
                    alt="Preview" 
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>קישור לסרטון (אופציונלי)</Label>
              <Input
                value={form.video_url}
                onChange={(e) => setForm({...form, video_url: e.target.value})}
                placeholder="https://youtube.com/..."
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending || !form.content_type || !form.title || !form.content}
              className="w-full bg-gradient-to-l from-[#7C9885] to-[#9CB4A4]"
            >
              {createMutation.isPending || updateMutation.isPending ? "שומר..." : editingContent ? "עדכן" : "שלח לאישור"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ContentList({ items, onEdit, onDelete }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl">
        <p className="text-gray-400">אין תוכן להצגה</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {items.map(item => {
        const type = CONTENT_TYPES.find(t => t.id === item.content_type);
        return (
          <div key={item.id} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{type?.emoji}</span>
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-xs text-gray-500">{type?.label}</p>
                </div>
              </div>
              <StatusBadge status={item.status}/>
            </div>
            {item.image_url && (
              <img src={item.image_url} alt={item.title} className="w-full h-32 object-cover rounded-lg mb-3"/>
            )}
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.description || item.content}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(item)} className="flex-1">
                <Edit size={14} className="ml-1"/> עריכה
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} className="text-red-500">
                <Trash2 size={14} className="ml-1"/> מחק
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    approved: { label: "מאושר", className: "bg-green-100 text-green-700" },
    pending: { label: "ממתין", className: "bg-amber-100 text-amber-700" },
    rejected: { label: "נדחה", className: "bg-red-100 text-red-700" }
  };
  const { label, className } = config[status] || config.pending;
  return <Badge className={className}>{label}</Badge>;
}