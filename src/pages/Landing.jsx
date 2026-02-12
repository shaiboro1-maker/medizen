import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, Calendar, ArrowLeft, Sparkles, Heart, ShoppingBag, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import AppDownload from "../components/AppDownload";

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
];

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: featuredTherapists = [] } = useQuery({
    queryKey: ["featuredTherapists"],
    queryFn: () => base44.entities.Therapist.filter({ status: "approved", is_featured: true }, "-rating", 6),
  });

  const { data: upcomingWebinars = [] } = useQuery({
    queryKey: ["upcomingWebinars"],
    queryFn: () => base44.entities.Webinar.filter({ status: "upcoming" }, "-created_date", 3),
  });

  const handleSearch = () => {
    window.location.href = createPageUrl(`TherapistSearch?q=${searchQuery}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-bl from-teal-700 via-teal-600 to-emerald-500 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-white/20 blur-3xl"/>
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-amber-300/20 blur-3xl"/>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              הדרך שלך <span className="text-amber-300">לבריאות</span> טובה יותר
            </h1>
            <p className="text-lg md:text-xl text-teal-50 mb-10 leading-relaxed">
              מצא את המטפל המושלם, קבע תור בקליק, וגלה עולם שלם של תוכן טיפולי ומוצרי בריאות
            </p>
            
            <div className="bg-white rounded-2xl p-2 flex items-center max-w-xl mx-auto shadow-xl">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="חפש מטפל, תחום, או אזור..."
                className="border-0 text-base focus-visible:ring-0 bg-transparent"
              />
              <Button onClick={handleSearch} className="bg-teal-600 hover:bg-teal-700 rounded-xl px-6">
                <Search size={18} className="ml-2"/>
                חיפוש
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-3 md:grid-cols-9 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={createPageUrl(`TherapistSearch?category=${cat.id}`)}
              className="bg-white rounded-2xl p-4 text-center shadow-md hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-50"
            >
              <span className="text-2xl block mb-1">{cat.emoji}</span>
              <span className="text-xs font-medium text-gray-700">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6">
          <QuickActionCard
            to="TherapistSearch"
            icon={<Calendar className="text-teal-600" size={28}/>}
            title="קבע תור"
            desc="מצא מטפל וקבע תור בשניות"
            color="bg-teal-50"
          />
          <QuickActionCard
            to="Exercises"
            icon={<BookOpen className="text-blue-600" size={28}/>}
            title="תרגילים"
            desc="מאגר תרגילים מקצועי"
            color="bg-blue-50"
          />
          <QuickActionCard
            to="Shop"
            icon={<ShoppingBag className="text-amber-600" size={28}/>}
            title="חנות"
            desc="מוצרי בריאות וטיפול"
            color="bg-amber-50"
          />
          <QuickActionCard
            to="Webinars"
            icon={<Sparkles className="text-purple-600" size={28}/>}
            title="וובינרים"
            desc="סדנאות והרצאות אונליין"
            color="bg-purple-50"
          />
        </div>
      </section>

      {/* Featured Therapists */}
      {featuredTherapists.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">מטפלים מובילים</h2>
            <Link to={createPageUrl("TherapistSearch")} className="text-teal-600 hover:text-teal-700 text-sm flex items-center gap-1">
              צפה בכולם <ArrowLeft size={14}/>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredTherapists.map((t) => (
              <TherapistCard key={t.id} therapist={t}/>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Webinars */}
      {upcomingWebinars.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">וובינרים קרובים</h2>
              <Link to={createPageUrl("Webinars")} className="text-teal-600 text-sm flex items-center gap-1">
                צפה בכולם <ArrowLeft size={14}/>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {upcomingWebinars.map((w) => (
                <div key={w.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  {w.image_url && <img src={w.image_url} alt={w.title} className="w-full h-40 object-cover"/>}
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2">{w.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{w.therapist_name}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-teal-600 font-semibold">{w.is_free ? "חינם" : `₪${w.price}`}</span>
                      <span className="text-xs text-gray-400">{new Date(w.date).toLocaleDateString("he-IL")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA for Therapists */}
      <section className="py-20 bg-gradient-to-l from-amber-50 to-amber-100/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            אתה מטפל? <span className="text-amber-600">הצטרף אלינו</span>
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            קבל עמוד אישי, מערכת תורים מתקדמת, חנות, וובינרים, פודקאסטים ועוד
          </p>
          <Link to={createPageUrl("TherapistRegister")}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-full px-8 py-6 text-lg">
              הרשמה כמטפל
            </Button>
          </Link>
        </div>
      </section>

      {/* App Download */}
      <AppDownload/>
    </div>
  );
}

function QuickActionCard({ to, icon, title, desc, color }) {
  return (
    <Link
      to={createPageUrl(to)}
      className="group bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1"
    >
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="font-bold text-lg text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </Link>
  );
}

function TherapistCard({ therapist }) {
  return (
    <Link
      to={createPageUrl(`TherapistProfile?id=${therapist.id}`)}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1"
    >
      <div className="h-48 bg-gradient-to-bl from-teal-100 to-emerald-50 flex items-center justify-center">
        {therapist.profile_image ? (
          <img src={therapist.profile_image} alt={therapist.full_name} className="w-full h-full object-cover"/>
        ) : (
          <div className="w-24 h-24 rounded-full bg-teal-200 flex items-center justify-center text-4xl text-teal-700 font-bold">
            {therapist.full_name?.[0]}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900">{therapist.full_name}</h3>
        <p className="text-sm text-gray-500 mb-3">{therapist.specializations?.join(", ")}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={14} className="text-amber-400 fill-amber-400"/>
            <span className="text-sm font-medium">{therapist.rating?.toFixed(1) || "חדש"}</span>
          </div>
          <span className="text-xs text-gray-400">{therapist.city}</span>
        </div>
      </div>
    </Link>
  );
}