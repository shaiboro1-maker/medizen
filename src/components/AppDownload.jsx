import React, { useState } from "react";
import { Smartphone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";

export default function AppDownload({ variant = "default" }) {
  const [showForm, setShowForm] = useState(false);
  const [platform, setPlatform] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleDownload = (selectedPlatform) => {
    setPlatform(selectedPlatform);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    await base44.integrations.Core.SendEmail({
      to: form.email,
      subject: `קישור להורדת אפליקציית Meridian Wellness ל-${platform}`,
      body: `שלום ${form.name},\n\nתודה על ההתעניינות! בקרוב נשלח אליך קישור להורדת האפליקציה.\n\nטלפון: ${form.phone}\nפלטפורמה: ${platform}\n\nצוות Meridian Wellness`,
    });
    setSubmitted(true);
  };
  if (variant === "compact") {
    return (
      <>
        <div className="bg-gradient-to-l from-teal-600 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Smartphone size={24}/>
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-1">הורד את האפליקציה</h3>
              <p className="text-sm text-teal-50">גישה מהירה מהנייד</p>
            </div>
            <Button onClick={() => handleDownload("Mobile")} variant="secondary" className="bg-white text-teal-700 hover:bg-teal-50 rounded-xl">
              <Download size={16} className="ml-2"/> הורד
            </Button>
          </div>
        </div>
        <DownloadDialog showForm={showForm} setShowForm={setShowForm} form={form} setForm={setForm} handleSubmit={handleSubmit} submitted={submitted} setSubmitted={setSubmitted} platform={platform}/>
      </>
    );
  }

  return (
    <>
      <section className="bg-gradient-to-bl from-teal-700 via-emerald-600 to-teal-600 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center text-white">
          <Smartphone size={64} className="mx-auto mb-6 opacity-90"/>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            הורד את האפליקציה שלנו
          </h2>
          <p className="text-lg md:text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
            גישה מהירה ונוחה לכל השירותים מהטלפון הנייד שלך - קביעת תורים, תרגילים, מתכונים ועוד
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => handleDownload("iOS")} size="lg" className="bg-white text-teal-700 hover:bg-teal-50 rounded-full px-8 py-6 text-lg font-semibold shadow-lg">
              <Download size={20} className="ml-2"/>
              הורד ל-iOS
            </Button>
            <Button onClick={() => handleDownload("Android")} size="lg" className="bg-white text-teal-700 hover:bg-teal-50 rounded-full px-8 py-6 text-lg font-semibold shadow-lg">
              <Download size={20} className="ml-2"/>
              הורד ל-Android
            </Button>
          </div>
          <p className="text-sm text-teal-100 mt-6">זמין בחינם ב-App Store וב-Google Play</p>
        </div>
      </section>
      <DownloadDialog showForm={showForm} setShowForm={setShowForm} form={form} setForm={setForm} handleSubmit={handleSubmit} submitted={submitted} setSubmitted={setSubmitted} platform={platform}/>
    </>
  );
}

function DownloadDialog({ showForm, setShowForm, form, setForm, handleSubmit, submitted, setSubmitted, platform }) {
  return (
    <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setSubmitted(false); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>הורדת האפליקציה - {platform}</DialogTitle>
        </DialogHeader>
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="text-green-600" size={32}/>
            </div>
            <h3 className="font-bold text-lg mb-2">תודה!</h3>
            <p className="text-gray-500">בקרוב נשלח אליך קישור להורדה למייל</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>שם מלא</Label>
              <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="הכנס שם"/>
            </div>
            <div className="space-y-2">
              <Label>אימייל</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="email@example.com"/>
            </div>
            <div className="space-y-2">
              <Label>טלפון</Label>
              <Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="050-1234567"/>
            </div>
            <Button onClick={handleSubmit} disabled={!form.name || !form.email || !form.phone} className="w-full bg-teal-600 hover:bg-teal-700">
              שלח
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}