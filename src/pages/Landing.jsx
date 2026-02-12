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
  { id: "pemf", label: "פולסים אלקטרומגנטיים", emoji: "⚡" },
  { id: "insoles", label: "מדרסים", emoji: "👟" },
  { id: "shockwave", label: "גלי הלם", emoji: "〰️" },
  { id: "occupational", label: "ריפוי בעיסוק", emoji: "🤲" },
  { id: "social_work", label: "עובד/ת סוציאלי", emoji: "🤝" },
  { id: "pedicure", label: "פדיקור/מניקור", emoji: "💅" },
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
    <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-600 via-emerald-500 to-cyan-500 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-white/20 blur-3xl"/>
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-[#F59E0B]/20 blur-3xl"/>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="mb-4">
              <span className="text-6xl md:text-7xl">🌿</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
              <span className="text-cyan-100">Wellness Hub</span>
              <br/>
              הדרך שלך לבריאות מיטבית
            </h1>
            <p className="text-lg md:text-xl text-teal-50 mb-10 leading-relaxed">
              מצא את המטפל המושלם, קבע תור בקליק, וגלה עולם שלם של תוכן טיפולי ומוצרי בריאות
            </p>
            
            <div className="bg-white rounded-2xl p-2 flex items-center max-w-xl mx-auto shadow-2xl">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="חפש מטפל, תחום, או אזור..."
                className="border-0 text-base focus-visible:ring-0 bg-transparent"
              />
              <Button onClick={handleSearch} className="bg-[#0F766E] hover:bg-[#0d5c56] rounded-2xl px-6 font-semibold">
                <Search size={18} className="ml-2"/>
                חיפוש
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* App Download */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 mb-8 relative z-20">
        <AppDownload/>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-8 relative z-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">מצא את המטפל המתאים לך</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={createPageUrl(`TherapistSearch?category=${cat.id}`)}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-teal-100/50 hover:border-teal-300"
            >
              <span className="text-xl block mb-1">{cat.emoji}</span>
              <span className="text-[10px] leading-tight font-medium text-gray-700 block">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionCard
            to="TherapistSearch"
            icon={<Calendar className="text-teal-600" size={24}/>}
            title="קבע תור"
            desc="בשניות"
            color="bg-gradient-to-br from-teal-50 to-emerald-50"
          />
          <QuickActionCard
            to="Exercises"
            icon={<BookOpen className="text-blue-600" size={24}/>}
            title="תרגילים"
            desc="מקצועי"
            color="bg-gradient-to-br from-blue-50 to-sky-50"
          />
          <QuickActionCard
            to="Shop"
            icon={<ShoppingBag className="text-amber-600" size={24}/>}
            title="חנות"
            desc="מוצרים"
            color="bg-gradient-to-br from-amber-50 to-orange-50"
          />
          <QuickActionCard
            to="Webinars"
            icon={<Sparkles className="text-emerald-600" size={24}/>}
            title="וובינרים"
            desc="הרצאות"
            color="bg-gradient-to-br from-emerald-50 to-green-50"
          />
        </div>
      </section>

      {/* Featured Therapists */}
      {featuredTherapists.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={28} className="text-[#F59E0B]"/> מטפלים מומלצים
            </h2>
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
      <section className="py-16 bg-gradient-to-br from-teal-100 via-emerald-100 to-cyan-100 mx-4 rounded-3xl my-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="text-5xl mb-4">👨‍⚕️</div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            אתה מטפל? <span className="text-teal-600">הצטרף אלינו</span>
          </h2>
          <p className="text-gray-700 text-base mb-6 max-w-2xl mx-auto">
            קבל עמוד אישי מעוצב, מערכת תורים אוטומטית, חנות, וובינרים ועוד
          </p>
          <Link to={createPageUrl("TherapistRegister")}>
            <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg">
              הרשמה כמטפל
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function QuickActionCard({ to, icon, title, desc, color }) {
  return (
    <Link
      to={createPageUrl(to)}
      className={`group ${color} rounded-2xl p-4 border border-white/50 hover:shadow-lg transition-all hover:-translate-y-1 backdrop-blur-sm`}
    >
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm">
        {icon}
      </div>
      <h3 className="font-bold text-base text-gray-900">{title}</h3>
      <p className="text-xs text-gray-600">{desc}</p>
    </Link>
  );
}

function TherapistCard({ therapist }) {
  const bgPatterns = [
    "bg-gradient-to-br from-teal-400 via-emerald-400 to-cyan-400",
    "bg-gradient-to-br from-blue-400 via-sky-400 to-cyan-400",
    "bg-gradient-to-br from-violet-400 via-purple-400 to-fuchsia-400",
    "bg-gradient-to-br from-rose-400 via-pink-400 to-fuchsia-400",
    "bg-gradient-to-br from-amber-400 via-orange-400 to-red-400",
    "bg-gradient-to-br from-lime-400 via-green-400 to-emerald-400"
  ];
  
  const selectedBg = therapist.card_background_style || bgPatterns[parseInt(therapist.id.slice(-1), 16) % bgPatterns.length];
  
  return (
    <Link
      to={createPageUrl(`TherapistProfile?id=${therapist.id}`)}
      className="bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden border border-teal-100/50 hover:shadow-2xl transition-all hover:-translate-y-2 hover:border-teal-300"
    >
      <div className={`h-40 ${selectedBg} flex items-center justify-center relative overflow-hidden`}>
        {therapist.profile_image ? (
          <img src={therapist.profile_image} alt={therapist.full_name} className="w-full h-full object-cover"/>
        ) : (
          <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-3xl text-white font-bold shadow-lg">
            {therapist.full_name?.[0]}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-base text-gray-900 mb-1">{therapist.full_name}</h3>
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{therapist.specializations?.join(", ")}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={13} className="text-amber-400 fill-amber-400"/>
            <span className="text-xs font-semibold">{therapist.rating?.toFixed(1) || "חדש"}</span>
          </div>
          <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{therapist.city}</span>
        </div>
      </div>
    </Link>
  );
}