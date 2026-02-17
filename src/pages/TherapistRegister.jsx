import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Check, Upload, ArrowLeft, Calendar, MessageCircle, TrendingUp, Globe, Image, ShoppingBag, Facebook, Instagram, Bot, Link as LinkIcon, Palette, Type, Layout as LayoutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
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

const CATEGORIES = [
  { id: "acupuncture", label: "דיקור סיני", emoji: "🪡" },
  { id: "physio", label: "פיזיותרפיה", emoji: "🦴" },
  { id: "cosmetics", label: "קוסמטיקה", emoji: "✨" },
  { id: "nutrition", label: "תזונה", emoji: "🥗" },
  { id: "sports", label: "ספורט", emoji: "🏋️" },
  { id: "massage", label: "עיסוי", emoji: "💆" },
  { id: "body_mind", label: "גוף-נפש", emoji: "🧘" },
  { id: "chiropractic", label: "כירופרקטיקה", emoji: "🔧" },
  { id: "hair", label: "ספרות", emoji: "💇" },
  { id: "pemf", label: "פולסים אלקטרומגנטיים", emoji: "⚡" },
  { id: "insoles", label: "מדרסים", emoji: "👟" },
  { id: "shockwave", label: "גלי הלם", emoji: "〰️" },
  { id: "occupational", label: "ריפוי בעיסוק", emoji: "🤲" },
  { id: "social_work", label: "עובד/ת סוציאלי", emoji: "🤝" },
  { id: "pedicure", label: "פדיקור/מניקור", emoji: "💅" },
  { id: "combined", label: "טיפול משולב", emoji: "🔄" },
  { id: "other", label: "אחר", emoji: "➕" },
];

export default function TherapistRegister() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    bio: "",
    specializations: "",
    categories: [],
    area: "",
    city: "",
    address: "",
    years_experience: "",
    certifications: "",
    website: "",
    social_links: {
      facebook: "",
      instagram: "",
      tiktok: "",
      whatsapp: ""
    },
    minisite_settings: {
      primary_color: "#0F766E",
      secondary_color: "#F59E0B",
      font_family: "Heebo",
      layout: "default",
      show_gallery: true,
      show_services: true,
      show_courses: true,
      show_blog: true,
      show_reviews: true,
    }
  });
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [logoImage, setLogoImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    base44.auth.me().then(async (u) => {
      setUser(u);
      setForm(prev => ({ ...prev, full_name: u.full_name || "" }));
      
      // Check if therapist already exists
      const existingTherapists = await base44.entities.Therapist.filter({ user_email: u.email });
      if (existingTherapists.length > 0) {
        alert("נרשמת כבר למערכת!");
        navigate(createPageUrl("TherapistDashboard"));
      }
    }).catch(() => base44.auth.redirectToLogin());
  }, [navigate]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      let imageUrl = "";
      let coverUrl = "";
      let logoUrl = "";
      let galleryUrls = [];
      
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
      
      return base44.entities.Therapist.create({
        full_name: data.full_name,
        phone: data.phone,
        bio: data.bio,
        specializations: data.specializations.split(",").map(s => s.trim()).filter(Boolean),
        categories: data.categories,
        area: data.area,
        city: data.city,
        address: data.address,
        years_experience: data.years_experience ? Number(data.years_experience) : undefined,
        website: data.website,
        social_links: data.social_links,
        minisite_settings: data.minisite_settings,
        user_email: user.email,
        profile_image: imageUrl,
        cover_image: coverUrl,
        logo_url: logoUrl,
        gallery: galleryUrls,
        status: "pending",
        subscription_type: "free",
        unique_slug: data.full_name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
      });
    },
    onSuccess: async (createdTherapist) => {
      try {
        // Get all admin users
        const allUsers = await base44.entities.User.list();
        const adminUsers = allUsers.filter(u => u.role === 'admin');
        
        // Send notification to each admin
        for (const admin of adminUsers) {
          await base44.entities.Notification.create({
            recipient_email: admin.email,
            user_email: admin.email,
            title: "בקשת הרשמה חדשה ממטפל ⭐",
            message: `${createdTherapist.full_name} ביקש להצטרף כמטפל. נא לבדוק ולאשר בלוח הבקרה.`,
            type: "therapist",
            link_url: createPageUrl("AdminTherapists")
          });
        }
      } catch (error) {
        console.log("Failed to send admin notifications:", error);
      }
      
      // Navigate to thank you page
      window.location.href = createPageUrl("ThankYou");
    },
    onError: (error) => {
      console.error("Registration error:", error);
      alert("אירעה שגיאה בהרשמה. אנא נסה שוב.");
    }
  });

  const toggleCategory = (id) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter(c => c !== id)
        : [...prev.categories, id]
    }));
    setErrors({...errors, categories: false});
  };





  return (
    <div className="min-h-screen bg-[#F5F1E8] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-4">
          <ArrowLeft size={16} className="ml-2"/> חזור
        </Button>
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-black text-gray-900 mb-3">הצטרף למטפלים המובילים 🌿</h1>
          <p className="text-lg text-gray-600">קבל מיני-סייט מעוצב, דשבורד לניהול תורים, חנות מוצרים ועוד</p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Calendar size={24}/>, title: "ניהול תורים", desc: "מערכת תורים חכמה", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=200&fit=crop" },
            { icon: <MessageCircle size={24}/>, title: "בוט ווטסאפ", desc: "שיחות אוטומטיות עם לקוחות", img: "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=400&h=200&fit=crop" },
            { icon: <Globe size={24}/>, title: "מיני-סייט", desc: "אתר אישי מעוצב", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop" },
            { icon: <ShoppingBag size={24}/>, title: "חנות מוצרים", desc: "מכור מוצרים לקליניקה", img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop" },
            { icon: <TrendingUp size={24}/>, title: "לוח מודעות", desc: "פרסם אירועים וקורסים", img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=200&fit=crop" },
            { icon: <Image size={24}/>, title: "תרגילים ומדיטציות", desc: "העלה תוכן ללקוחות", img: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=200&fit=crop" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative overflow-hidden rounded-2xl shadow-md group"
            >
              <img src={feature.img} alt={feature.title} className="w-full h-32 object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              <div className="absolute bottom-0 right-0 left-0 p-4 text-white text-right">
                <div className="flex items-center gap-2 mb-1">
                  {feature.icon}
                  <h3 className="font-bold">{feature.title}</h3>
                </div>
                <p className="text-xs opacity-90">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>



        {/* Registration Form */}
        <div className="bg-white rounded-2xl border border-[#E5DDD3] p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-right">תמונות ולוגו</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>תמונת פרופיל</Label>
              <div className="w-full aspect-square rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#7C9885] transition">
                {profileImage ? (
                  <img src={URL.createObjectURL(profileImage)} alt="" className="w-full h-full object-cover"/>
                ) : (
                  <div className="text-center">
                    <Upload size={24} className="text-gray-400 mx-auto mb-1"/>
                    <span className="text-xs text-gray-500">1080x1080</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} className="hidden"/>
              </div>
              <label className="block">
                <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} className="text-xs w-full"/>
              </label>
            </div>

            <div className="space-y-2">
              <Label>תמונת כיסוי</Label>
              <div className="w-full aspect-square rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                {coverImage ? (
                  <img src={URL.createObjectURL(coverImage)} alt="" className="w-full h-full object-cover"/>
                ) : (
                  <div className="text-center">
                    <Upload size={24} className="text-gray-400 mx-auto mb-1"/>
                    <span className="text-xs text-gray-500">1080x1080</span>
                  </div>
                )}
              </div>
              <label className="block">
                <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} className="text-xs w-full"/>
              </label>
            </div>

            <div className="space-y-2">
              <Label>לוגו</Label>
              <div className="w-full aspect-square rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                {logoImage ? (
                  <img src={URL.createObjectURL(logoImage)} alt="" className="w-full h-full object-cover"/>
                ) : (
                  <div className="text-center">
                    <Upload size={24} className="text-gray-400 mx-auto mb-1"/>
                    <span className="text-xs text-gray-500">1080x1080</span>
                  </div>
                )}
              </div>
              <label className="block">
                <input type="file" accept="image/*" onChange={(e) => setLogoImage(e.target.files[0])} className="text-xs w-full"/>
              </label>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label>גלריית תמונות (עד 6) - תמונות עומדות</Label>
            <div className="grid grid-cols-3 gap-3">
              {galleryImages.map((img, i) => (
                <div key={i} className="w-full aspect-[9/16] rounded-lg overflow-hidden border border-gray-200">
                  <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover"/>
                </div>
              ))}
              {galleryImages.length < 6 && (
                <label className="w-full aspect-[9/16] rounded-lg bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:border-[#7C9885] transition">
                  <Upload size={20} className="text-gray-400 mb-1"/>
                  <span className="text-xs text-gray-500">9:16</span>
                  <input type="file" accept="image/*" onChange={(e) => setGalleryImages([...galleryImages, e.target.files[0]])} className="hidden"/>
                </label>
              )}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-right">פרטים אישיים</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={errors.full_name ? "text-red-600" : ""}>שם מלא *</Label>
              <Input 
                value={form.full_name} 
                onChange={(e) => {
                  setForm({...form, full_name: e.target.value});
                  setErrors({...errors, full_name: false});
                }} 
                placeholder="שם מלא"
                className={errors.full_name ? "border-red-500 focus:ring-red-500" : ""}
              />
              {errors.full_name && <p className="text-xs text-red-600">⚠️ שדה חובה</p>}
            </div>
            <div className="space-y-2">
              <Label className={errors.phone ? "text-red-600" : ""}>טלפון *</Label>
              <Input 
                value={form.phone} 
                onChange={(e) => {
                  setForm({...form, phone: e.target.value});
                  setErrors({...errors, phone: false});
                }} 
                placeholder="050-1234567"
                className={errors.phone ? "border-red-500 focus:ring-red-500" : ""}
              />
              {errors.phone && <p className="text-xs text-red-600">⚠️ שדה חובה</p>}
            </div>
          </div>
        </div>

        <div>
          <h2 className={`text-xl font-bold mb-4 text-right ${errors.categories ? "text-red-600" : "text-gray-900"}`}>תחומי טיפול *</h2>
          {errors.categories && <p className="text-sm text-red-600 mb-2">⚠️ בחר לפחות תחום אחד</p>}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`p-3 rounded-xl text-sm transition-all border-2 ${
                  form.categories.includes(cat.id) 
                    ? "bg-[#7C9885] text-white border-[#7C9885]" 
                    : "bg-white text-gray-700 border-gray-200 hover:border-[#B8A393]"
                }`}
              >
                <div className="text-2xl mb-1">{cat.emoji}</div>
                <div className="font-semibold text-xs">{cat.label}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right">בחר לפחות תחום אחד</p>
        </div>

        <div className="space-y-2">
          <Label className={errors.specializations ? "text-red-600" : ""}>התמחויות *</Label>
          <Textarea
            value={form.specializations}
            onChange={(e) => {
              setForm({...form, specializations: e.target.value});
              setErrors({...errors, specializations: false});
            }}
            placeholder="דוגמה: טיפול בכאבי גב וצוואר, שיקום פציעות ספורט, טיפול בנשים בהריון"
            className={`h-20 ${errors.specializations ? "border-red-500 focus:ring-red-500" : ""}`}
          />
          {errors.specializations ? 
            <p className="text-xs text-red-600">⚠️ שדה חובה</p> : 
            <p className="text-xs text-gray-500 text-right">פרט את התמחויותיך (לא צריך פסיקים)</p>
          }
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-right">מיקום</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className={errors.area ? "text-red-600" : ""}>אזור *</Label>
              <Select 
                value={form.area} 
                onValueChange={(v) => {
                  setForm({...form, area: v});
                  setErrors({...errors, area: false});
                }}
              >
                <SelectTrigger className={errors.area ? "border-red-500 focus:ring-red-500" : ""}>
                  <SelectValue placeholder="בחר אזור"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="מרכז">מרכז</SelectItem>
                  <SelectItem value="צפון">צפון</SelectItem>
                  <SelectItem value="דרום">דרום</SelectItem>
                  <SelectItem value="ירושלים והסביבה">ירושלים והסביבה</SelectItem>
                  <SelectItem value="שרון">שרון</SelectItem>
                  <SelectItem value="שפלה">שפלה</SelectItem>
                </SelectContent>
              </Select>
              {errors.area && <p className="text-xs text-red-600">⚠️ שדה חובה</p>}
            </div>
            <div className="space-y-2">
              <Label className={errors.city ? "text-red-600" : ""}>עיר *</Label>
              <Input 
                value={form.city} 
                onChange={(e) => {
                  setForm({...form, city: e.target.value});
                  setErrors({...errors, city: false});
                }} 
                placeholder="תל אביב"
                className={errors.city ? "border-red-500 focus:ring-red-500" : ""}
              />
              {errors.city && <p className="text-xs text-red-600">⚠️ שדה חובה</p>}
            </div>
            <div className="space-y-2">
              <Label>כתובת</Label>
              <Input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} placeholder="רחוב 10"/>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-right">ניסיון מקצועי</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>שנות ניסיון</Label>
              <Input type="number" value={form.years_experience} onChange={(e) => setForm({...form, years_experience: e.target.value})} placeholder="5"/>
            </div>
            <div className="space-y-2">
              <Label>הסמכות</Label>
              <Input value={form.certifications} onChange={(e) => setForm({...form, certifications: e.target.value})} placeholder="תעודות והסמכות"/>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>אודותיי</Label>
          <Textarea 
            value={form.bio} 
            onChange={(e) => setForm({...form, bio: e.target.value})} 
            placeholder="ספר על עצמך, הגישה הטיפולית שלך, והניסיון המקצועי שלך..."
            className="h-32"
          />
        </div>

        {/* Mini-Site Customization Section */}
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border-2 border-teal-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Globe size={24} className="text-teal-600"/>
            עיצוב המיני-סייט שלך 🎨
          </h2>
          <p className="text-gray-600 mb-6">התאם אישית את כרטיס הביקור הדיגיטלי שלך</p>

          {/* Colors */}
          <div className="bg-white rounded-xl p-5 mb-4">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-lg">
              <Palette size={20} className="text-teal-600"/>
              צבעי העיצוב
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>צבע ראשי</Label>
                <div className="flex gap-3 items-center">
                  <Input 
                    type="color" 
                    value={form.minisite_settings.primary_color} 
                    onChange={(e) => setForm({...form, minisite_settings: {...form.minisite_settings, primary_color: e.target.value}})}
                    className="w-20 h-12 cursor-pointer"
                  />
                  <Input 
                    value={form.minisite_settings.primary_color} 
                    onChange={(e) => setForm({...form, minisite_settings: {...form.minisite_settings, primary_color: e.target.value}})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>צבע משני</Label>
                <div className="flex gap-3 items-center">
                  <Input 
                    type="color" 
                    value={form.minisite_settings.secondary_color} 
                    onChange={(e) => setForm({...form, minisite_settings: {...form.minisite_settings, secondary_color: e.target.value}})}
                    className="w-20 h-12 cursor-pointer"
                  />
                  <Input 
                    value={form.minisite_settings.secondary_color} 
                    onChange={(e) => setForm({...form, minisite_settings: {...form.minisite_settings, secondary_color: e.target.value}})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography & Layout */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-xl p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Type size={18} className="text-teal-600"/>
                גופן
              </h3>
              <Select 
                value={form.minisite_settings.font_family} 
                onValueChange={(v) => setForm({...form, minisite_settings: {...form.minisite_settings, font_family: v}})}
              >
                <SelectTrigger>
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

            <div className="bg-white rounded-xl p-5">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <LayoutIcon size={18} className="text-teal-600"/>
                סגנון עיצוב
              </h3>
              <Select 
                value={form.minisite_settings.layout} 
                onValueChange={(v) => setForm({...form, minisite_settings: {...form.minisite_settings, layout: v}})}
              >
                <SelectTrigger>
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent>
                  {LAYOUTS.map(l => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section Visibility */}
          <div className="bg-white rounded-xl p-5">
            <h3 className="font-bold mb-3">איזה מקטעים להציג?</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <Label>גלריית תמונות</Label>
                <Switch 
                  checked={form.minisite_settings.show_gallery} 
                  onCheckedChange={(v) => setForm({...form, minisite_settings: {...form.minisite_settings, show_gallery: v}})}
                />
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <Label>שירותים</Label>
                <Switch 
                  checked={form.minisite_settings.show_services} 
                  onCheckedChange={(v) => setForm({...form, minisite_settings: {...form.minisite_settings, show_services: v}})}
                />
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <Label>קורסים</Label>
                <Switch 
                  checked={form.minisite_settings.show_courses} 
                  onCheckedChange={(v) => setForm({...form, minisite_settings: {...form.minisite_settings, show_courses: v}})}
                />
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <Label>בלוג</Label>
                <Switch 
                  checked={form.minisite_settings.show_blog} 
                  onCheckedChange={(v) => setForm({...form, minisite_settings: {...form.minisite_settings, show_blog: v}})}
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <Label>ביקורות</Label>
                <Switch 
                  checked={form.minisite_settings.show_reviews} 
                  onCheckedChange={(v) => setForm({...form, minisite_settings: {...form.minisite_settings, show_reviews: v}})}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-right flex items-center gap-2">
            <Globe size={20}/>
            קישורים ורשתות חברתיות
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe size={16}/>
                אתר אינטרנט
              </Label>
              <Input 
                value={form.website} 
                onChange={(e) => setForm({...form, website: e.target.value})} 
                placeholder="https://yoursite.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Facebook size={16}/>
                פייסבוק
              </Label>
              <Input 
                value={form.social_links.facebook} 
                onChange={(e) => setForm({...form, social_links: {...form.social_links, facebook: e.target.value}})} 
                placeholder="קישור לעמוד פייסבוק"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Instagram size={16}/>
                אינסטגרם
              </Label>
              <Input 
                value={form.social_links.instagram} 
                onChange={(e) => setForm({...form, social_links: {...form.social_links, instagram: e.target.value}})} 
                placeholder="@username"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <LinkIcon size={16}/>
                טיק טוק
              </Label>
              <Input 
                value={form.social_links.tiktok} 
                onChange={(e) => setForm({...form, social_links: {...form.social_links, tiktok: e.target.value}})} 
                placeholder="@username"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageCircle size={16}/>
                ווטסאפ
              </Label>
              <Input 
                value={form.social_links.whatsapp} 
                onChange={(e) => setForm({...form, social_links: {...form.social_links, whatsapp: e.target.value}})} 
                placeholder="972501234567"
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#E8DCC8] to-[#F5F1E8] rounded-2xl p-6 border border-[#E5DDD3]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
              <Bot size={24} className="text-[#7C9885]"/>
            </div>
            <div className="flex-1 text-right">
              <h3 className="font-bold text-lg mb-2 text-gray-900">בוט ווטסאפ חכם 🤖</h3>
              <p className="text-sm text-gray-600 mb-3">
                לאחר האישור תוכל להגדיר בוט אוטומטי שישיב ללקוחות, יקבע תורים, וינהל שיחות בשבילך 24/7
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-white text-gray-700">מענה אוטומטי</Badge>
                <Badge className="bg-white text-gray-700">קביעת תורים</Badge>
                <Badge className="bg-white text-gray-700">מידע על שירותים</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={() => {
              const newErrors = {};
              
              if (!form.full_name) newErrors.full_name = true;
              if (!form.phone) newErrors.phone = true;
              if (form.categories.length === 0) newErrors.categories = true;
              if (!form.specializations) newErrors.specializations = true;
              if (!form.area) newErrors.area = true;
              if (!form.city) newErrors.city = true;
              
              if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                window.scrollTo({ top: 200, behavior: 'smooth' });
                alert("אנא מלא את כל השדות המסומנים באדום ⚠️");
                return;
              }
              
              createMutation.mutate(form);
            }}
            disabled={createMutation.isPending}
            className="w-full bg-gradient-to-l from-[#7C9885] to-[#B8A393] hover:opacity-90 py-6 text-lg font-bold text-white disabled:opacity-50"
          >
            {createMutation.isPending ? "שולח..." : "סיום הרישום ושליחה לאישור ✅"}
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          לאחר האישור תקבל גישה לדשבורד מלא, מיני-סייט אישי, ואפליקציה ייעודית
        </p>
        </div>
      </div>
    </div>
  );
}