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
  { id: "combined", label: "טיפול משולב", emoji: "🔄" },
  { id: "other", label: "אחר", emoji: "➕" },
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
    <div style={{backgroundColor: '#FAF8F3'}} className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{backgroundColor: '#FAF8F3'}}>
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-right max-w-2xl"
          >
            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-5" style={{color: '#5A7A6A'}}>
              <span>Wellness Hub</span>
              <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-[#7C9885] to-[#A8C5B5]">
                הדרך שלך לבריאות מיטבית
              </span>
            </h1>
            <p className="text-base md:text-lg text-gray-700 mb-8 leading-relaxed">
              מצא את המטפל המושלם, קבע תור בקליק, וגלה עולם שלם של תוכן טיפולי ומוצרי בריאות
            </p>
            
            <div className="bg-white rounded-2xl p-2 flex items-center max-w-md border border-gray-200 shadow-sm">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="חפש מטפל, תחום, או אזור..."
                className="border-0 text-sm focus-visible:ring-0 bg-transparent text-right"
              />
              <Button onClick={handleSearch} className="rounded-xl px-4 py-2 text-sm font-medium" style={{backgroundColor: '#D4C4B0', color: '#5A4A3A'}}>
                <Search size={16} className="ml-2"/>
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
      <section className="max-w-6xl mx-auto px-4 py-6 relative z-20">
        <h2 className="text-xl font-bold mb-5 text-right" style={{color: '#5A7A6A'}}>מצא את המטפל המתאים לך</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={createPageUrl(`TherapistSearch?category=${cat.id}`)}
              className="bg-white rounded-xl p-2.5 text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-200"
            >
              <span className="text-lg block mb-0.5">{cat.emoji}</span>
              <span className="text-[9px] leading-tight font-semibold text-gray-700 block">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Health Content Section */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold mb-5 text-right" style={{color: '#5A7A6A'}}>תוכן בריאותי</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5">
          <Link
            to={createPageUrl("Exercises")}
            className="bg-white rounded-xl p-3 border border-gray-200 hover:shadow-md transition-all hover:-translate-y-1 text-center"
          >
            <div className="text-2xl mb-1">💪</div>
            <h3 className="font-bold text-xs text-gray-900">תרגילים</h3>
            <p className="text-[10px] text-gray-600">מקצועי</p>
          </Link>
          <Link
            to={createPageUrl("Recipes")}
            className="bg-white rounded-xl p-3 border border-gray-200 hover:shadow-md transition-all hover:-translate-y-1 text-center"
          >
            <div className="text-2xl mb-1">🥗</div>
            <h3 className="font-bold text-xs text-gray-900">מתכונים</h3>
            <p className="text-[10px] text-gray-600">בריאים</p>
          </Link>
          <Link
            to={createPageUrl("Webinars")}
            className="bg-white rounded-xl p-3 border border-gray-200 hover:shadow-md transition-all hover:-translate-y-1 text-center"
          >
            <div className="text-2xl mb-1">🎥</div>
            <h3 className="font-bold text-xs text-gray-900">וובינרים</h3>
            <p className="text-[10px] text-gray-600">הרצאות</p>
          </Link>
          <Link
            to={createPageUrl("Podcasts")}
            className="bg-white rounded-xl p-3 border border-gray-200 hover:shadow-md transition-all hover:-translate-y-1 text-center"
          >
            <div className="text-2xl mb-1">🎙️</div>
            <h3 className="font-bold text-xs text-gray-900">פודקאסטים</h3>
            <p className="text-[10px] text-gray-600">מעניינים</p>
          </Link>
          <Link
            to={createPageUrl("Music")}
            className="bg-white rounded-xl p-3 border border-gray-200 hover:shadow-md transition-all hover:-translate-y-1 text-center"
          >
            <div className="text-2xl mb-1">🎵</div>
            <h3 className="font-bold text-xs text-gray-900">מוזיקה</h3>
            <p className="text-[10px] text-gray-600">מדיטציות</p>
          </Link>
          <Link
            to={createPageUrl("Diary")}
            className="bg-white rounded-xl p-3 border border-gray-200 hover:shadow-md transition-all hover:-translate-y-1 text-center"
          >
            <div className="text-2xl mb-1">📔</div>
            <h3 className="font-bold text-xs text-gray-900">יומן</h3>
            <p className="text-[10px] text-gray-600">אישי</p>
          </Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickActionCard
            to="TherapistSearch"
            icon={<Calendar size={20} style={{color: '#7C9885'}}/>}
            title="קבע תור"
            desc="בשניות"
            color="bg-[#E6D5C3]"
          />
          <QuickActionCard
            to="Exercises"
            icon={<BookOpen size={20} style={{color: '#7C9885'}}/>}
            title="תרגילים"
            desc="מקצועי"
            color="bg-[#D4E4DB]"
          />
          <QuickActionCard
            to="Shop"
            icon={<ShoppingBag size={20} style={{color: '#7C9885'}}/>}
            title="חנות"
            desc="מוצרים"
            color="bg-[#F2E6D9]"
          />
          <QuickActionCard
            to="Webinars"
            icon={<Sparkles size={20} style={{color: '#7C9885'}}/>}
            title="וובינרים"
            desc="הרצאות"
            color="bg-[#D4C4B0]"
          />
        </div>
      </section>

      {/* Featured Therapists */}
      {featuredTherapists.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold" style={{color: '#5A7A6A'}}>
              מטפלים מומלצים
            </h2>
            <Link to={createPageUrl("TherapistSearch")} className="text-sm font-semibold flex items-center gap-1" style={{color: '#7C9885'}}>
              צפה בכולם <ArrowLeft size={12}/>
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {featuredTherapists.map((t) => (
              <TherapistCard key={t.id} therapist={t}/>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Webinars */}
      {upcomingWebinars.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">וובינרים קרובים</h2>
              <Link to={createPageUrl("Webinars")} className="text-gray-900 font-semibold text-sm flex items-center gap-1">
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
      <section className="py-12 my-8" style={{backgroundColor: '#E8DCC8'}}>
        <div className="max-w-4xl mx-auto px-4 text-right">
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{color: '#5A4A3A'}}>
            אתה מטפל? <span style={{color: '#7C9885'}}>הצטרף אלינו</span>
          </h2>
          <p className="text-sm mb-5 max-w-xl" style={{color: '#6A5A4A'}}>
            קבל עמוד אישי מעוצב, מערכת תורים אוטומטית, חנות, וובינרים ועוד
          </p>
          <Link to={createPageUrl("TherapistRegister")}>
            <Button className="rounded-full px-6 py-2.5 text-sm font-semibold" style={{backgroundColor: '#D4C4B0', color: '#5A4A3A'}}>
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
      className={`group ${color} rounded-xl p-3 border border-gray-200 hover:shadow-md transition-all hover:-translate-y-1 text-center`}
    >
      <div className="mb-2">
        {icon}
      </div>
      <h3 className="font-bold text-sm" style={{color: '#5A4A3A'}}>{title}</h3>
      <p className="text-[10px]" style={{color: '#8A7A6A'}}>{desc}</p>
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