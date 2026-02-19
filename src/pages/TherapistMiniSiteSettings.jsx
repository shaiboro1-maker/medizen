import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { 
  Palette, Type, Layout as LayoutIcon, Save, Eye, ArrowRight, User, Clock, 
  Globe, Image, Phone, Mail, MapPin, Facebook, Instagram, Link as LinkIcon,
  FileText, Upload, Calendar, Download, Share2, QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createPageUrl } from "../utils";
import AppDownload from "../components/AppDownload";

const FONTS = [
  { value: "Heebo", label: "העברי (Heebo)" },
  { value: "Assistant", label: "אסיסטנט (Assistant)" },
  { value: "Rubik", label: "רוביק (Rubik)" },
  { value: "Alef", label: "אלף (Alef)" },
];

const LAYOUTS = [
  { value: "default", label: "ברירת מחדל", desc: "עיצוב מסורתי ונקי" },
  { value: "modern", label: "מודרני", desc: "עיצוב עכשווי עם אנימציות" },
  { value: "minimal", label: "מינימליסטי", desc: "פשוט ונקי" },
];

const DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export default function TherapistMiniSiteSettings() {
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [logoImage, setLogoImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    bio: "",
    therapeutic_approach: "",
    specializations: [],
    area: "",
    city: "",
    address: "",
    website: "",
    social_links: {
      facebook: "",
      instagram: "",
      tiktok: "",
      whatsapp: "",
      google_business: ""
    }
  });

  const [settings, setSettings] = useState({
    primary_color: "#0F766E",
    secondary_color: "#F59E0B",
    font_family: "Heebo",
    layout: "default",
    show_gallery: true,
    show_services: true,
    show_courses: true,
    show_blog: true,
    show_reviews: true,
  });
  
  const queryClient = useQueryClient();

  const { data: availability = [] } = useQuery({
    queryKey: ["availability", therapist?.id],
    queryFn: () => base44.entities.Availability.filter({ therapist_id: therapist.id }),
    enabled: !!therapist,
  });

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) {
        setTherapist(therapists[0]);
        setForm({
          full_name: therapists[0].full_name || "",
          phone: therapists[0].phone || "",
          bio: therapists[0].bio || "",
          therapeutic_approach: therapists[0].therapeutic_approach || "",
          specializations: therapists[0].specializations || [],
          area: therapists[0].area || "",
          city: therapists[0].city || "",
          address: therapists[0].address || "",
          website: therapists[0].website || "",
          social_links: therapists[0].social_links || {
            facebook: "",
            instagram: "",
            tiktok: "",
            whatsapp: "",
            google_business: ""
          }
        });
        if (therapists[0].minisite_settings) {
          setSettings({ ...settings, ...therapists[0].minisite_settings });
        }
      }
    };
    init();
  }, []);

  const updateMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = therapist.profile_image;
      let coverUrl = therapist.cover_image;
      let logoUrl = therapist.logo_url;
      let galleryUrls = therapist.gallery || [];
      
      if (profileImage) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: profileImage });
        imageUrl = file_url;
      }
      if (coverImage) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: coverImage });
        coverUrl = file_url;
      }
      if (logoImage) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: logoImage });
        logoUrl = file_url;
      }
      if (galleryImages.length > 0) {
        for (const img of galleryImages) {
          const { file_url } = await base44.integrations.Core.UploadFile({ file: img });
          galleryUrls.push(file_url);
        }
      }
      
      const updatedData = await base44.entities.Therapist.update(therapist.id, {
        ...form,
        profile_image: imageUrl,
        cover_image: coverUrl,
        logo_url: logoUrl,
        gallery: galleryUrls,
        minisite_settings: settings
      });
      
      return updatedData;
    },
    onSuccess: (updatedData) => {
      setTherapist(updatedData);
      queryClient.invalidateQueries({ queryKey: ["therapist"] });
      queryClient.invalidateQueries({ queryKey: ["adminTherapists"] });
      queryClient.invalidateQueries({ queryKey: ["featuredTherapists"] });
      setProfileImage(null);
      setCoverImage(null);
      setLogoImage(null);
      setGalleryImages([]);
      alert("הפרופיל נשמר בהצלחה! ✨");
    },
  });

  const handlePreview = () => {
    if (therapist?.unique_slug) {
      const url = `${window.location.origin}${createPageUrl(`MiniSite?slug=${therapist.unique_slug}`)}`;
      window.open(url, "_blank");
    } else if (therapist?.id) {
      const url = `${window.location.origin}${createPageUrl(`TherapistProfile?id=${therapist.id}`)}`;
      window.open(url, "_blank");
    } else {
      alert("אין מיני-סייט או פרופיל זמין לתצוגה מקדימה");
    }
  };

  if (!therapist) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">טוען...</p>
      </div>
    );
  }

  const handleDownloadQR = () => {
    if (therapist?.unique_slug) {
      const url = `${window.location.origin}${createPageUrl(`MiniSite?slug=${therapist.unique_slug}`)}`;
      window.open(`https://api.qrserver.com/v1/create-qr-code/?size=800x800&data=${encodeURIComponent(url)}`, '_blank');
    }
  };

  const handleShareLink = () => {
    if (therapist?.unique_slug) {
      const url = `${window.location.origin}${createPageUrl(`MiniSite?slug=${therapist.unique_slug}`)}`;
      navigator.clipboard.writeText(url);
      alert("הקישור הועתק ללוח! 📋");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto" style={{backgroundColor: '#F5F1E8', minHeight: '100vh'}}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} size="icon">
          <ArrowRight size={20}/>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">עריכת פרופיל ומיני-סייט</h1>
          <p className="text-gray-600 text-sm">נהל את כל המידע והעיצוב שלך במקום אחד</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePreview} variant="outline" size="sm" className="gap-2">
            <Eye size={16}/>
            תצוגה מקדימה
          </Button>
        </div>
      </div>

      {/* PWA Download Card */}
      <div className="mb-6 bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
            <Download size={24} className="text-white"/>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">📱 הורד את הדשבורד לטלפון</h3>
            <p className="text-sm text-gray-600 mb-3">
              נהל את העסק שלך בדרכים - תורים, לקוחות, תכנים ועוד
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button onClick={handleShareLink} variant="outline" size="sm" className="bg-white gap-2">
            <Share2 size={16}/>
            שתף קישור למיני-סייט
          </Button>
          <Button onClick={handleDownloadQR} variant="outline" size="sm" className="bg-white gap-2">
            <QrCode size={16}/>
            הורד QR Code
          </Button>
        </div>
        <AppDownload variant="compact"/>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white p-2 rounded-xl">
          <TabsTrigger value="profile" className="gap-2">
            <User size={16}/>
            פרטים אישיים
          </TabsTrigger>
          <TabsTrigger value="images" className="gap-2">
            <Image size={16}/>
            תמונות וגלריה
          </TabsTrigger>
          <TabsTrigger value="hours" className="gap-2">
            <Clock size={16}/>
            שעות עבודה
          </TabsTrigger>
          <TabsTrigger value="design" className="gap-2">
            <Palette size={16}/>
            עיצוב
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <User size={20} className="text-teal-600"/>
              מידע בסיסי
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>שם מלא</Label>
                <Input value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})}/>
              </div>
              <div className="space-y-2">
                <Label>טלפון</Label>
                <Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}/>
              </div>
            </div>

            <div className="space-y-2">
              <Label>אודות</Label>
              <Textarea 
                value={form.bio} 
                onChange={(e) => setForm({...form, bio: e.target.value})}
                rows={4}
                placeholder="ספר על עצמך..."
              />
            </div>

            <div className="space-y-2">
              <Label>הגישה הטיפולית שלי</Label>
              <Textarea 
                value={form.therapeutic_approach} 
                onChange={(e) => setForm({...form, therapeutic_approach: e.target.value})}
                rows={3}
                placeholder="תאר את הגישה הטיפולית שלך..."
              />
            </div>

            <div className="space-y-2">
              <Label>התמחויות (הפרד בפסיקים)</Label>
              <Input 
                value={form.specializations.join(", ")} 
                onChange={(e) => setForm({...form, specializations: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})}
                placeholder="כאבי גב, שיקום פציעות, נשים בהריון"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <MapPin size={20} className="text-teal-600"/>
              מיקום
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>אזור</Label>
                <Input value={form.area} onChange={(e) => setForm({...form, area: e.target.value})}/>
              </div>
              <div className="space-y-2">
                <Label>עיר</Label>
                <Input value={form.city} onChange={(e) => setForm({...form, city: e.target.value})}/>
              </div>
              <div className="space-y-2">
                <Label>כתובת</Label>
                <Input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})}/>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Globe size={20} className="text-teal-600"/>
              קישורים ורשתות חברתיות
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe size={16}/>
                  אתר אינטרנט
                </Label>
                <Input value={form.website} onChange={(e) => setForm({...form, website: e.target.value})}/>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Facebook size={16}/>
                  פייסבוק
                </Label>
                <Input value={form.social_links.facebook} onChange={(e) => setForm({...form, social_links: {...form.social_links, facebook: e.target.value}})}/>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Instagram size={16}/>
                  אינסטגרם
                </Label>
                <Input value={form.social_links.instagram} onChange={(e) => setForm({...form, social_links: {...form.social_links, instagram: e.target.value}})}/>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone size={16}/>
                  ווטסאפ
                </Label>
                <Input value={form.social_links.whatsapp} onChange={(e) => setForm({...form, social_links: {...form.social_links, whatsapp: e.target.value}})}/>
              </div>
              <div className="space-y-2">
                <Label>טיק טוק</Label>
                <Input value={form.social_links.tiktok} onChange={(e) => setForm({...form, social_links: {...form.social_links, tiktok: e.target.value}})}/>
              </div>
              <div className="space-y-2">
                <Label>Google Business</Label>
                <Input value={form.social_links.google_business} onChange={(e) => setForm({...form, social_links: {...form.social_links, google_business: e.target.value}})}/>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Image size={20} className="text-teal-600"/>
              תמונות ראשיות
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>תמונת פרופיל</Label>
                {(profileImage || therapist?.profile_image) && (
                  <img src={profileImage ? URL.createObjectURL(profileImage) : therapist.profile_image} className="w-full aspect-square object-cover rounded-xl mb-2"/>
                )}
                <Input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])}/>
              </div>
              <div className="space-y-2">
                <Label>תמונת כיסוי</Label>
                {(coverImage || therapist?.cover_image) && (
                  <img src={coverImage ? URL.createObjectURL(coverImage) : therapist.cover_image} className="w-full aspect-video object-cover rounded-xl mb-2"/>
                )}
                <Input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])}/>
              </div>
              <div className="space-y-2">
                <Label>לוגו</Label>
                {(logoImage || therapist?.logo_url) && (
                  <img src={logoImage ? URL.createObjectURL(logoImage) : therapist.logo_url} className="w-full h-24 object-contain rounded-xl mb-2"/>
                )}
                <Input type="file" accept="image/*" onChange={(e) => setLogoImage(e.target.files[0])}/>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Image size={20} className="text-teal-600"/>
              גלריית תמונות
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {therapist?.gallery?.map((img, i) => (
                <img key={`existing-${i}`} src={img} className="w-full aspect-[4/3] object-cover rounded-lg"/>
              ))}
              {galleryImages.map((img, i) => (
                <img key={`new-${i}`} src={URL.createObjectURL(img)} className="w-full aspect-[4/3] object-cover rounded-lg"/>
              ))}
              {(therapist?.gallery?.length || 0) + galleryImages.length < 8 && ( // Limit to 8 images total
                <label className="w-full aspect-[4/3] bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed cursor-pointer hover:bg-gray-200">
                  <Upload size={24} className="text-gray-400 mb-2"/>
                  <span className="text-xs text-gray-500">העלה תמונה</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setGalleryImages([...galleryImages, e.target.files[0]])}/>
                </label>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Hours Tab */}
        <TabsContent value="hours" className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2">
                <Clock size={20} className="text-teal-600"/>
                שעות עבודה
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(createPageUrl("TherapistAvailability"))}
              >
                נהל זמינות מתקדמת
              </Button>
            </div>
            <div className="space-y-3">
              {DAYS.map((day, index) => {
                const dayAvail = availability.filter(a => a.day_of_week === index);
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{day}</span>
                    <div className="text-sm text-gray-600">
                      {dayAvail.length === 0 ? (
                        <span className="text-red-500">סגור</span>
                      ) : (
                        dayAvail.map((a, i) => (
                          <span key={i} className="ml-2">{a.start_time.substring(0,5)} - {a.end_time.substring(0,5)}</span>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Palette size={20} className="text-teal-600"/>
            צבעים
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>צבע ראשי</Label>
              <div className="flex gap-3 items-center">
                <Input 
                  type="color" 
                  value={settings.primary_color} 
                  onChange={(e) => setSettings({...settings, primary_color: e.target.value})}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input 
                  value={settings.primary_color} 
                  onChange={(e) => setSettings({...settings, primary_color: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>צבע משני</Label>
              <div className="flex gap-3 items-center">
                <Input 
                  type="color" 
                  value={settings.secondary_color} 
                  onChange={(e) => setSettings({...settings, secondary_color: e.target.value})}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input 
                  value={settings.secondary_color} 
                  onChange={(e) => setSettings({...settings, secondary_color: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Type size={20} className="text-teal-600"/>
            טיפוגרפיה
          </h2>
          <div className="space-y-2">
            <Label>גופן</Label>
            <Select value={settings.font_family} onValueChange={(v) => setSettings({...settings, font_family: v})}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                {FONTS.map(f => (
                  <SelectItem key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Layout */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <LayoutIcon size={20} className="text-teal-600"/>
            סגנון עיצוב
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {LAYOUTS.map(layout => (
              <button
                key={layout.value}
                onClick={() => setSettings({...settings, layout: layout.value})}
                className={`p-4 rounded-xl border-2 text-right transition-all ${
                  settings.layout === layout.value 
                    ? "border-teal-600 bg-teal-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <h3 className="font-semibold mb-1">{layout.label}</h3>
                <p className="text-xs text-gray-500">{layout.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Sections Visibility */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold mb-4">תצוגת מקטעים</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <Label htmlFor="gallery" className="cursor-pointer">גלריית תמונות</Label>
              <Switch 
                id="gallery"
                checked={settings.show_gallery} 
                onCheckedChange={(v) => setSettings({...settings, show_gallery: v})}
              />
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <Label htmlFor="services" className="cursor-pointer">שירותים</Label>
              <Switch 
                id="services"
                checked={settings.show_services} 
                onCheckedChange={(v) => setSettings({...settings, show_services: v})}
              />
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <Label htmlFor="courses" className="cursor-pointer">קורסים</Label>
              <Switch 
                id="courses"
                checked={settings.show_courses} 
                onCheckedChange={(v) => setSettings({...settings, show_courses: v})}
              />
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <Label htmlFor="blog" className="cursor-pointer">בלוג</Label>
              <Switch 
                id="blog"
                checked={settings.show_blog} 
                onCheckedChange={(v) => setSettings({...settings, show_blog: v})}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <Label htmlFor="reviews" className="cursor-pointer">ביקורות</Label>
              <Switch 
                id="reviews"
                checked={settings.show_reviews} 
                onCheckedChange={(v) => setSettings({...settings, show_reviews: v})}
              />
            </div>
          </div>
        </div>

        </TabsContent>
      </Tabs>

      {/* Save Button - Fixed at bottom */}
      <div className="sticky bottom-4 z-10 mt-6">
        <Button 
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
          className="w-full bg-gradient-to-l from-teal-600 to-emerald-600 hover:opacity-90 gap-2 py-6 text-lg font-bold shadow-2xl"
        >
          <Save size={20}/>
          {updateMutation.isPending ? "שומר..." : "שמור את כל השינויים"}
        </Button>
      </div>
    </div>
  );
}