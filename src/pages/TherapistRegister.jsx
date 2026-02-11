import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Check, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

const CATEGORIES = [
  { id: "acupuncture", label: "דיקור סיני" },
  { id: "physio", label: "פיזיותרפיה" },
  { id: "cosmetics", label: "קוסמטיקה" },
  { id: "nutrition", label: "תזונה" },
  { id: "sports", label: "ספורט" },
  { id: "massage", label: "עיסוי" },
  { id: "body_mind", label: "גוף-נפש" },
  { id: "chiropractic", label: "כירופרקטיקה" },
  { id: "hair", label: "ספרות" },
  { id: "other", label: "אחר" },
];

export default function TherapistRegister() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    bio: "",
    specializations: [],
    categories: [],
    area: "",
    city: "",
    years_experience: "",
    certifications: "",
  });
  const [success, setSuccess] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm(prev => ({ ...prev, full_name: u.full_name || "" }));
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      let imageUrl = "";
      if (profileImage) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: profileImage });
        imageUrl = file_url;
      }
      return base44.entities.Therapist.create({
        ...data,
        user_email: user.email,
        profile_image: imageUrl,
        years_experience: data.years_experience ? Number(data.years_experience) : undefined,
        status: "pending",
      });
    },
    onSuccess: () => setSuccess(true),
  });

  const toggleCategory = (id) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter(c => c !== id)
        : [...prev.categories, id]
    }));
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-green-600"/>
        </motion.div>
        <h1 className="text-2xl font-bold mb-3">הבקשה נשלחה!</h1>
        <p className="text-gray-500">נחזור אליך בהקדם לאחר אישור הפרופיל</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">הרשמה כמטפל</h1>
      <p className="text-gray-500 mb-8">מלא את הפרטים ונחזור אליך לאחר אישור</p>

      <div className="space-y-6 bg-white rounded-2xl border border-gray-100 p-6">
        <div className="space-y-2">
          <Label>תמונת פרופיל</Label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
              {profileImage ? (
                <img src={URL.createObjectURL(profileImage)} alt="" className="w-full h-full object-cover"/>
              ) : (
                <Upload size={24} className="text-gray-300"/>
              )}
            </div>
            <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} className="text-sm"/>
          </div>
        </div>

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
          <Label>תחומי טיפול</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`px-3 py-2 rounded-full text-sm transition-colors ${
                  form.categories.includes(cat.id) ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>התמחויות (מופרד בפסיקים)</Label>
          <Input
            value={form.specializations.join(", ")}
            onChange={(e) => setForm({...form, specializations: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})}
            placeholder="כאבי גב, שיקום, ספורט..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>אזור</Label>
            <Input value={form.area} onChange={(e) => setForm({...form, area: e.target.value})} placeholder="מרכז / צפון / דרום"/>
          </div>
          <div className="space-y-2">
            <Label>עיר</Label>
            <Input value={form.city} onChange={(e) => setForm({...form, city: e.target.value})}/>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>שנות ניסיון</Label>
            <Input type="number" value={form.years_experience} onChange={(e) => setForm({...form, years_experience: e.target.value})}/>
          </div>
          <div className="space-y-2">
            <Label>הסמכות</Label>
            <Input value={form.certifications} onChange={(e) => setForm({...form, certifications: e.target.value})}/>
          </div>
        </div>

        <div className="space-y-2">
          <Label>אודותיי</Label>
          <Textarea value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} placeholder="ספר על עצמך ועל הגישה הטיפולית שלך..." className="h-32"/>
        </div>

        <Button
          onClick={() => createMutation.mutate(form)}
          disabled={!form.full_name || form.categories.length === 0 || createMutation.isPending}
          className="w-full bg-teal-600 hover:bg-teal-700 py-6 text-lg"
        >
          {createMutation.isPending ? "שולח..." : "שלח בקשת הרשמה"}
        </Button>
      </div>
    </div>
  );
}