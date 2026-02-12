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
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Right Side - Text Content */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-right order-2 md:order-1"
            >
              <div className="mb-6 text-sm text-gray-600 flex items-center justify-end gap-2">
                <span>✨ הבית החדש של המטפלים והמטופלים בישראל</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                <span className="text-gray-900">ניהול קליניקה</span>
                <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-600 to-emerald-600">
                  חכם ויעיל
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                מערכת ניהול חכמה למטפלים ומרפאות: CRM מתקדם, בוט AI, תשלומים אוטומטיים,
                ניהול תורים ועוד. הכל במקום אחד.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  onClick={() => window.location.href = createPageUrl("TherapistRegister")}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl px-8 py-6 text-lg font-semibold shadow-lg"
                >
                  <Calendar size={20} className="ml-2"/>
                  הרשמה כמטפל
                </Button>
                <Button 
                  onClick={handleSearch}
                  variant="outline"
                  className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 rounded-2xl px-8 py-6 text-lg font-semibold"
                >
                  מצא מטפל
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-teal-500 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-cyan-500 border-2 border-white"></div>
                  </div>
                  <span>+500 מטפלים</span>
                </div>
              </div>
            </motion.div>

            {/* Left Side - Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative order-1 md:order-2"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80" 
                  alt="Wellness" 
                  className="w-full h-[400px] md:h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              </div>
              
              {/* Floating Card */}
              <div className="hidden md:block absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center">
                    <Calendar className="text-white" size={24}/>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">תור הבא שלך</p>
                    <p className="font-bold text-sm">היום 10:30 - טיפול דיקור סיני</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* App Download */}
      <section className="max-w-7xl mx-auto px-4 mb-8">
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