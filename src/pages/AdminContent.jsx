import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Plus, Upload, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

export default function AdminContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [contentType, setContentType] = useState("exercise");
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    video_url: "",
    thumbnail_url: "",
    audio_url: "",
    image_url: "",
    ingredients: "",
    instructions: "",
    difficulty: "easy",
    duration_minutes: 0,
    prep_time_minutes: 0
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ["adminExercises"],
    queryFn: () => base44.entities.Exercise.list("-created_date"),
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ["adminRecipes"],
    queryFn: () => base44.entities.Recipe.list("-created_date"),
  });

  const { data: music = [] } = useQuery({
    queryKey: ["adminMusic"],
    queryFn: () => base44.entities.Music.list("-created_date"),
  });

  const { data: bulletinPosts = [] } = useQuery({
    queryKey: ["adminBulletin"],
    queryFn: () => base44.entities.BulletinPost.list("-created_date"),
  });

  const { data: webinars = [] } = useQuery({
    queryKey: ["adminWebinars"],
    queryFn: () => base44.entities.Webinar.list("-created_date"),
  });

  const { data: podcasts = [] } = useQuery({
    queryKey: ["adminPodcasts"],
    queryFn: () => base44.entities.Podcast.list("-created_date"),
  });

  const deleteExMutation = useMutation({
    mutationFn: (id) => base44.entities.Exercise.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminExercises"] }),
  });

  const deleteRecMutation = useMutation({
    mutationFn: (id) => base44.entities.Recipe.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminRecipes"] }),
  });

  const deleteMusicMutation = useMutation({
    mutationFn: (id) => base44.entities.Music.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminMusic"] }),
  });

  const deleteBulletinMutation = useMutation({
    mutationFn: (id) => base44.entities.BulletinPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminBulletin"] }),
  });

  const deleteWebinarMutation = useMutation({
    mutationFn: (id) => base44.entities.Webinar.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminWebinars"] }),
  });

  const deletePodcastMutation = useMutation({
    mutationFn: (id) => base44.entities.Podcast.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminPodcasts"] }),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      if (contentType === "exercise") return base44.entities.Exercise.create(data);
      if (contentType === "recipe") return base44.entities.Recipe.create(data);
      if (contentType === "music") return base44.entities.Music.create(data);
      if (contentType === "bulletin") return base44.entities.BulletinPost.create(data);
      if (contentType === "webinar") return base44.entities.Webinar.create(data);
      if (contentType === "podcast") return base44.entities.Podcast.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowDialog(false);
      resetForm();
    },
  });

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, [field]: file_url }));
    } catch (error) {
      alert("שגיאה בהעלאת קובץ");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      video_url: "",
      thumbnail_url: "",
      audio_url: "",
      image_url: "",
      ingredients: "",
      instructions: "",
      difficulty: "easy",
      duration_minutes: 0,
      prep_time_minutes: 0
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData, is_approved: true };
    createMutation.mutate(data);
  };

  return (
    <div className="p-6 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowRight size={20}/>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#7C9885]">ניהול תוכן</h1>
            <p className="text-[#A8947D]">העלאה ומחיקה של כל סוגי התוכן</p>
          </div>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-[#B8A393] hover:bg-[#C5B5A4]">
          <Plus size={16} className="ml-2"/> הוסף תוכן
        </Button>
      </div>

      <Tabs defaultValue="exercises" className="space-y-4">
        <TabsList className="bg-white rounded-xl p-1 border border-[#E5DDD3]">
          <TabsTrigger value="exercises">תרגילים ({exercises.length})</TabsTrigger>
          <TabsTrigger value="recipes">מתכונים ({recipes.length})</TabsTrigger>
          <TabsTrigger value="music">מוזיקה ({music.length})</TabsTrigger>
          <TabsTrigger value="bulletin">לוח מודעות ({bulletinPosts.length})</TabsTrigger>
          <TabsTrigger value="webinars">וובינרים ({webinars.length})</TabsTrigger>
          <TabsTrigger value="podcasts">פודקאסטים ({podcasts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="exercises">
          <div className="space-y-3">
            {exercises.map(ex => (
              <ContentCard
                key={ex.id}
                title={ex.title}
                subtitle={`${ex.category} · ${ex.therapist_name || "מערכת"}`}
                image={ex.thumbnail_url}
                onDelete={() => deleteExMutation.mutate(ex.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recipes">
          <div className="space-y-3">
            {recipes.map(r => (
              <ContentCard
                key={r.id}
                title={r.title}
                subtitle={`${r.category} · ${r.therapist_name || "מערכת"}`}
                image={r.image_url}
                onDelete={() => deleteRecMutation.mutate(r.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="music">
          <div className="space-y-3">
            {music.map(m => (
              <ContentCard
                key={m.id}
                title={m.title}
                subtitle={`${m.category} · ${m.duration_minutes || 0} דק'`}
                image={m.image_url}
                onDelete={() => deleteMusicMutation.mutate(m.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bulletin">
          <div className="space-y-3">
            {bulletinPosts.map(b => (
              <ContentCard
                key={b.id}
                title={b.title}
                subtitle={`${b.category} · ${b.therapist_name || "אנונימי"}`}
                image={b.image_urls?.[0]}
                onDelete={() => deleteBulletinMutation.mutate(b.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webinars">
          <div className="space-y-3">
            {webinars.map(w => (
              <ContentCard
                key={w.id}
                title={w.title}
                subtitle={`${new Date(w.date).toLocaleDateString('he-IL')} · ${w.therapist_name || "מערכת"}`}
                image={w.image_url}
                onDelete={() => deleteWebinarMutation.mutate(w.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="podcasts">
          <div className="space-y-3">
            {podcasts.map(p => (
              <ContentCard
                key={p.id}
                title={p.title}
                subtitle={`${p.category} · ${p.duration_minutes || 0} דק'`}
                image={p.thumbnail_url}
                onDelete={() => deletePodcastMutation.mutate(p.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>הוסף תוכן חדש</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>סוג תוכן</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exercise">תרגיל</SelectItem>
                  <SelectItem value="recipe">מתכון</SelectItem>
                  <SelectItem value="music">מוזיקה</SelectItem>
                  <SelectItem value="bulletin">לוח מודעות</SelectItem>
                  <SelectItem value="webinar">וובינר</SelectItem>
                  <SelectItem value="podcast">פודקאסט</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            <div>
              <Label>קטגוריה</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              />
            </div>

            {(contentType === "exercise" || contentType === "webinar" || contentType === "podcast") && (
              <div>
                <Label>העלאת וידאו</Label>
                <input type="file" accept="video/*" onChange={(e) => handleFileUpload(e, "video_url")} className="block w-full text-sm"/>
                {formData.video_url && <p className="text-xs text-green-600 mt-1">✓ הועלה</p>}
              </div>
            )}

            {(contentType === "exercise" || contentType === "recipe" || contentType === "music" || contentType === "bulletin" || contentType === "webinar" || contentType === "podcast") && (
              <div>
                <Label>העלאת תמונה</Label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, contentType === "exercise" ? "thumbnail_url" : "image_url")} 
                  className="block w-full text-sm"
                />
                {(formData.thumbnail_url || formData.image_url) && <p className="text-xs text-green-600 mt-1">✓ הועלה</p>}
              </div>
            )}

            {contentType === "music" && (
              <div>
                <Label>העלאת קובץ אודיו</Label>
                <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, "audio_url")} className="block w-full text-sm"/>
                {formData.audio_url && <p className="text-xs text-green-600 mt-1">✓ הועלה</p>}
              </div>
            )}

            {contentType === "recipe" && (
              <>
                <div>
                  <Label>מרכיבים</Label>
                  <Textarea
                    value={formData.ingredients}
                    onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                  />
                </div>
                <div>
                  <Label>הוראות הכנה</Label>
                  <Textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)} disabled={uploading}>
                ביטול
              </Button>
              <Button type="submit" className="bg-[#B8A393] hover:bg-[#C5B5A4]" disabled={uploading}>
                {uploading ? "מעלה..." : "צור תוכן"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ContentCard({ title, subtitle, image, onDelete }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5DDD3] p-4 flex items-start gap-4">
      {image && (
        <img src={image} alt="" className="w-16 h-16 rounded-lg object-cover"/>
      )}
      <div className="flex-1">
        <h3 className="font-bold text-[#7C9885]">{title}</h3>
        <p className="text-sm text-[#A8947D]">{subtitle}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-500">
        <Trash2 size={16}/>
      </Button>
    </div>
  );
}