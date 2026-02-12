import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Palette, Type, Layout as LayoutIcon, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createPageUrl } from "../utils";

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

export default function TherapistMiniSiteSettings() {
  const [therapist, setTherapist] = useState(null);
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

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) {
        setTherapist(therapists[0]);
        if (therapists[0].minisite_settings) {
          setSettings({ ...settings, ...therapists[0].minisite_settings });
        }
      }
    };
    init();
  }, []);

  const updateMutation = useMutation({
    mutationFn: () => base44.entities.Therapist.update(therapist.id, {
      minisite_settings: settings
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapist"] });
      alert("ההגדרות נשמרו בהצלחה! ✨");
    },
  });

  const handlePreview = () => {
    if (therapist?.unique_slug) {
      window.open(createPageUrl(`MiniSite?slug=${therapist.unique_slug}`), "_blank");
    }
  };

  if (!therapist) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">טוען...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">התאמה אישית של המיני-סייט</h1>
          <p className="text-gray-600">עצב את העמוד האישי שלך בצורה ייחודית</p>
        </div>
        <Button onClick={handlePreview} variant="outline" className="gap-2">
          <Eye size={18}/>
          תצוגה מקדימה
        </Button>
      </div>

      <div className="space-y-6">
        {/* Colors */}
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

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="bg-teal-600 hover:bg-teal-700 gap-2"
            size="lg"
          >
            <Save size={18}/>
            {updateMutation.isPending ? "שומר..." : "שמור שינויים"}
          </Button>
        </div>
      </div>
    </div>
  );
}