import React from "react";
import { Smartphone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppDownload({ variant = "default" }) {
  if (variant === "compact") {
    return (
      <div className="bg-gradient-to-l from-teal-600 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Smartphone size={24}/>
          </div>
          <div className="flex-1">
            <h3 className="font-bold mb-1">הורד את האפליקציה</h3>
            <p className="text-sm text-teal-50">גישה מהירה מהנייד</p>
          </div>
          <Button variant="secondary" className="bg-white text-teal-700 hover:bg-teal-50 rounded-xl">
            <Download size={16} className="ml-2"/> הורד
          </Button>
        </div>
      </div>
    );
  }

  return (
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
          <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 rounded-full px-8 py-6 text-lg font-semibold shadow-lg">
            <Download size={20} className="ml-2"/>
            הורד ל-iOS
          </Button>
          <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 rounded-full px-8 py-6 text-lg font-semibold shadow-lg">
            <Download size={20} className="ml-2"/>
            הורד ל-Android
          </Button>
        </div>
        <p className="text-sm text-teal-100 mt-6">זמין בחינם ב-App Store וב-Google Play</p>
      </div>
    </section>
  );
}