import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Upload, Image as ImageIcon, Video, Globe, 
  Palette, MessageSquare, Star, TrendingUp,
  Save, ArrowRight, Instagram, Facebook, Chrome, 
  Twitter, ExternalLink, Trash2
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function TherapistMiniSiteManager() {
  const [therapist, setTherapist] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: me.email });
      if (therapists.length > 0) {
        setTherapist(therapists[0]);
        setFormData({
          bio: therapists[0].bio || "",
          therapeutic_approach: therapists[0].therapeutic_approach || "",
          website: therapists[0].website || "",
          social_links: therapists[0].social_links || {},
          review_integrations: therapists[0].review_integrations || {},
          minisite_settings: therapists[0].minisite_settings || {},
          lead_bot_settings: therapists[0].lead_bot_settings || {
            enabled: false,
            bot_name: "עוזר וירטואלי",
            welcome_message: "שלום! איך אוכל לעזור לך היום?",
            training_data: "",
            auto_response_delay: 2
          }
        });
      }
    };
    init();
  }, []);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Therapist.update(therapist.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["therapist"]);
      toast.success("השינויים נשמרו בהצלחה!");
    },
  });

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (field === "gallery") {
        const updatedGallery = [...(therapist.gallery || []), file_url];
        await updateMutation.mutateAsync({ gallery: updatedGallery });
        setTherapist({ ...therapist, gallery: updatedGallery });
      } else {
        await updateMutation.mutateAsync({ [field]: file_url });
        setTherapist({ ...therapist, [field]: file_url });
      }
    } catch (error) {
      toast.error("שגיאה בהעלאת התמונה");
    }
    setUploadingImage(false);
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await updateMutation.mutateAsync({ video_intro_url: file_url });
      setTherapist({ ...therapist, video_intro_url: file_url });
      toast.success("הסרטון הועלה בהצלחה!");
    } catch (error) {
      toast.error("שגיאה בהעלאת הסרטון");
    }
    setUploadingVideo(false);
  };

  const handleRemoveFromGallery = async (index) => {
    const updatedGallery = therapist.gallery.filter((_, i) => i !== index);
    await updateMutation.mutateAsync({ gallery: updatedGallery });
    setTherapist({ ...therapist, gallery: updatedGallery });
  };

  const handleSave = async (section) => {
    await updateMutation.mutateAsync(formData);
  };

  if (!therapist) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">טוען...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-br from-teal-600 to-emerald-600 text-white px-6 py-8">
        <button onClick={() => navigate(-1)} className="mb-4">
          <ArrowRight size={24}/>
        </button>
        <h1 className="text-2xl font-bold mb-2">ניהול מיני-סייט</h1>
        <p className="text-teal-100">עדכן את כרטיס הביקור הדיגיטלי שלך</p>
      </div>

      <div className="px-4 -mt-6">
        <Card className="mb-4">
          <CardContent className="pt-6">
            <Button 
              onClick={() => window.open(`${window.location.origin}${createPageUrl("MiniSite")}?slug=${therapist.unique_slug}`, '_blank')}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
            >
              <Globe className="ml-2" size={18}/>
              צפה במיני-סייט שלי
              <ExternalLink className="mr-2" size={16}/>
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="media" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="media">מדיה</TabsTrigger>
            <TabsTrigger value="content">תוכן</TabsTrigger>
            <TabsTrigger value="social">רשתות</TabsTrigger>
            <TabsTrigger value="bot">בוט</TabsTrigger>
            <TabsTrigger value="design">עיצוב</TabsTrigger>
          </TabsList>

          {/* מדיה */}
          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon size={20}/>
                  תמונת כיסוי
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {therapist.cover_image && (
                  <img src={therapist.cover_image} alt="Cover" className="w-full h-48 object-cover rounded-lg"/>
                )}
                <label className="block">
                  <div className="border-2 border-dashed border-[#A8947D] rounded-lg p-6 text-center cursor-pointer hover:border-[#7C9885] transition-colors bg-[#F5F1E8]/30">
                    <Upload className="mx-auto mb-2 text-[#7C9885]" size={32}/>
                    <p className="text-sm text-gray-600">לחץ להעלאת תמונת כיסוי</p>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "cover_image")} disabled={uploadingImage}/>
                  </div>
                </label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video size={20}/>
                  סרטון היכרות
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {therapist.video_intro_url && (
                  <video src={therapist.video_intro_url} controls className="w-full rounded-lg"/>
                )}
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-teal-500 transition-colors">
                    <Video className="mx-auto mb-2 text-gray-400" size={32}/>
                    <p className="text-sm text-gray-600">
                      {uploadingVideo ? "מעלה סרטון..." : "לחץ להעלאת סרטון היכרות"}
                    </p>
                    <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={uploadingVideo}/>
                  </div>
                </label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon size={20}/>
                  גלריית תמונות ({therapist.gallery?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {therapist.gallery?.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt={`Gallery ${i}`} className="w-full h-24 object-cover rounded-lg"/>
                      <button
                        onClick={() => handleRemoveFromGallery(i)}
                        className="absolute top-1 left-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  ))}
                </div>
                <label className="block">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-teal-500 transition-colors">
                    <Upload className="mx-auto mb-2 text-gray-400" size={24}/>
                    <p className="text-xs text-gray-600">הוסף תמונה לגלריה</p>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, "gallery")}/>
                  </div>
                </label>
              </CardContent>
            </Card>
          </TabsContent>

          {/* תוכן */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">תיאור אישי</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>אודותיי</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={5}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>הגישה הטיפולית שלי</Label>
                  <Textarea
                    value={formData.therapeutic_approach}
                    onChange={(e) => setFormData({ ...formData, therapeutic_approach: e.target.value })}
                    rows={4}
                    className="mt-2"
                  />
                </div>
                <Button onClick={() => handleSave("content")} className="w-full bg-[#7C9885] hover:bg-[#9CB4A4] rounded-full">
                  <Save size={18} className="ml-2"/>
                  שמור שינויים
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* רשתות חברתיות */}
          <TabsContent value="social" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">קישורים לרשתות חברתיות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Instagram size={18}/>
                    אינסטגרם
                  </Label>
                  <Input
                    value={formData.social_links?.instagram || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, instagram: e.target.value }
                    })}
                    placeholder="https://instagram.com/username"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Facebook size={18}/>
                    פייסבוק
                  </Label>
                  <Input
                    value={formData.social_links?.facebook || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, facebook: e.target.value }
                    })}
                    placeholder="https://facebook.com/page"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Twitter size={18}/>
                    טיקטוק
                  </Label>
                  <Input
                    value={formData.social_links?.tiktok || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_links: { ...formData.social_links, tiktok: e.target.value }
                    })}
                    placeholder="https://tiktok.com/@username"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Chrome size={18}/>
                    אתר אישי
                  </Label>
                  <Input
                    value={formData.website || ""}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://mywebsite.com"
                    className="mt-2"
                  />
                </div>
                <Button onClick={() => handleSave("social")} className="w-full bg-teal-600">
                  <Save size={18} className="ml-2"/>
                  שמור שינויים
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star size={20}/>
                  חיבורים לביקורות
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>ביקורות מפייסבוק</Label>
                  <Switch
                    checked={formData.review_integrations?.facebook_enabled}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      review_integrations: { ...formData.review_integrations, facebook_enabled: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>ביקורות מגוגל</Label>
                  <Switch
                    checked={formData.review_integrations?.google_enabled}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      review_integrations: { ...formData.review_integrations, google_enabled: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>ביקורות מאינסטגרם</Label>
                  <Switch
                    checked={formData.review_integrations?.instagram_enabled}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      review_integrations: { ...formData.review_integrations, instagram_enabled: checked }
                    })}
                  />
                </div>
                <Button onClick={() => handleSave("reviews")} className="w-full bg-teal-600">
                  <Save size={18} className="ml-2"/>
                  שמור הגדרות
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* בוט לידים */}
          <TabsContent value="bot" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare size={20}/>
                  בוט חימום לידים
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>הפעל בוט</Label>
                  <Switch
                    checked={formData.lead_bot_settings?.enabled}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      lead_bot_settings: { ...formData.lead_bot_settings, enabled: checked }
                    })}
                  />
                </div>
                <div>
                  <Label>שם הבוט</Label>
                  <Input
                    value={formData.lead_bot_settings?.bot_name || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      lead_bot_settings: { ...formData.lead_bot_settings, bot_name: e.target.value }
                    })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>הודעת פתיחה</Label>
                  <Textarea
                    value={formData.lead_bot_settings?.welcome_message || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      lead_bot_settings: { ...formData.lead_bot_settings, welcome_message: e.target.value }
                    })}
                    rows={3}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>אימון הבוט - מידע על השירותים שלך</Label>
                  <Textarea
                    value={formData.lead_bot_settings?.training_data || ""}
                    onChange={(e) => setFormData({
                      ...formData,
                      lead_bot_settings: { ...formData.lead_bot_settings, training_data: e.target.value }
                    })}
                    rows={8}
                    placeholder="ספר לבוט על השירותים שלך, המחירים, זמינות, התמחויות וכו'...
לדוגמה:
- אני מציע טיפולי פיזיותרפיה
- מחיר טיפול: 250 ₪
- זמינות: ימים א-ה 9:00-18:00
- התמחות בכאבי גב ופציעות ספורט"
                    className="mt-2 font-mono text-sm"
                  />
                </div>
                <Button onClick={() => handleSave("bot")} className="w-full bg-teal-600">
                  <Save size={18} className="ml-2"/>
                  שמור הגדרות בוט
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* עיצוב */}
          <TabsContent value="design" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette size={20}/>
                  עיצוב המיני-סייט
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>צבע ראשי</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="color"
                      value={formData.minisite_settings?.primary_color || "#0F766E"}
                      onChange={(e) => setFormData({
                        ...formData,
                        minisite_settings: { ...formData.minisite_settings, primary_color: e.target.value }
                      })}
                      className="w-20"
                    />
                    <Input
                      value={formData.minisite_settings?.primary_color || "#0F766E"}
                      onChange={(e) => setFormData({
                        ...formData,
                        minisite_settings: { ...formData.minisite_settings, primary_color: e.target.value }
                      })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>תצוגת תכנים</Label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">הצג גלריה</span>
                    <Switch
                      checked={formData.minisite_settings?.show_gallery}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        minisite_settings: { ...formData.minisite_settings, show_gallery: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">הצג שירותים</span>
                    <Switch
                      checked={formData.minisite_settings?.show_services}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        minisite_settings: { ...formData.minisite_settings, show_services: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">הצג קורסים</span>
                    <Switch
                      checked={formData.minisite_settings?.show_courses}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        minisite_settings: { ...formData.minisite_settings, show_courses: checked }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">הצג ביקורות</span>
                    <Switch
                      checked={formData.minisite_settings?.show_reviews}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        minisite_settings: { ...formData.minisite_settings, show_reviews: checked }
                      })}
                    />
                  </div>
                </div>
                <Button onClick={() => handleSave("design")} className="w-full bg-teal-600">
                  <Save size={18} className="ml-2"/>
                  שמור עיצוב
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}