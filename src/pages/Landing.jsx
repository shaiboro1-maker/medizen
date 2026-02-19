import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
    <div style={{ backgroundColor: "#F5F1E8" }} className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#F5F1E8" }}>
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
              <span className="text-gray-900">MediZen</span>
              <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-green-600 to-teal-600">
                הדרך שלך לבריאות מיטבית
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed font-medium">
              מצא את המטפל המושלם, קבע תור בקליק, וגלה עולם שלם של תוכן טיפולי ומוצרי בריאות
            </p>
            
            <div className="bg-gray-100 rounded-2xl p-2 flex items-center max-w-xl mx-auto border border-gray-200">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="חפש מטפל, תחום, או אזור..."
                className="border-0 text-base focus-visible:ring-0 bg-transparent"
              />
              <Button onClick={handleSearch} className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl px-6 font-semibold">
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
      <section className="max-w-7xl mx-auto px-4 py-8 relative z-20 bg-[#F5F1E8]">
        <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">מצא את המטפל המתאים לך</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={createPageUrl(`TherapistSearch?category=${cat.id}`)}
              className="bg-white rounded-xl p-3 text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-200"
            >
              <span className="text-xl block mb-1">{cat.emoji}</span>
              <span className="text-[10px] leading-tight font-semibold text-gray-700 block">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Health Content Section */}
      <section className="max-w-7xl mx-auto px-4 py-8 bg-[#F5F1E8]">
        <h2 className="text-2xl font-black text-gray-900 mb-6 text-right">תוכן בריאותי</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <Link
            to={createPageUrl("Exercises")}
            className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <img 
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop" 
              alt="תרגילים"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 right-0 left-0 p-4 text-white text-right">
              <h3 className="font-black text-xl mb-1">תרגילים</h3>
              <p className="text-sm opacity-90">תרגילים מקצועיים</p>
            </div>
          </Link>
          
          <Link
            to={createPageUrl("Recipes")}
            className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <img 
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop" 
              alt="מתכונים"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 right-0 left-0 p-4 text-white text-right">
              <h3 className="font-black text-xl mb-1">מתכונים</h3>
              <p className="text-sm opacity-90">מתכונים בריאים</p>
            </div>
          </Link>

          <Link
            to={createPageUrl("Music")}
            className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <img 
              src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=300&fit=crop" 
              alt="מוזיקה"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 right-0 left-0 p-4 text-white text-right">
              <h3 className="font-black text-xl mb-1">מוזיקה</h3>
              <p className="text-sm opacity-90">מוזיקה מרגיעה</p>
            </div>
          </Link>
          
          <Link
            to={createPageUrl("Diary")}
            className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <img 
              src="https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=300&fit=crop" 
              alt="יומן"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 right-0 left-0 p-4 text-white text-right">
              <h3 className="font-black text-xl mb-1">יומן אישי</h3>
              <p className="text-sm opacity-90">עקוב אחר ההתקדמות</p>
            </div>
          </Link>

          <Link
            to={createPageUrl("Music?category=body_mind")}
            className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <img 
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop" 
              alt="גוף ונפש"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 right-0 left-0 p-4 text-white text-right">
              <h3 className="font-black text-xl mb-1">גוף ונפש</h3>
              <p className="text-sm opacity-90">תדרים וריפוי</p>
            </div>
          </Link>

          <Link
            to={createPageUrl("Music?category=sleep")}
            className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <img 
              src="https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=300&fit=crop" 
              alt="שינה"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 right-0 left-0 p-4 text-white text-right">
              <h3 className="font-black text-xl mb-1">שינה רגועה</h3>
              <p className="text-sm opacity-90">תדרים לשינה עמוקה</p>
            </div>
          </Link>

          <Link
            to={createPageUrl("Music?category=breathing")}
            className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <img 
              src="https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=400&h=300&fit=crop" 
              alt="נשימה"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 right-0 left-0 p-4 text-white text-right">
              <h3 className="font-black text-xl mb-1">תרגילי נשימה</h3>
              <p className="text-sm opacity-90">טכניקות הרגעה</p>
            </div>
          </Link>

          <Link
            to={createPageUrl("Music?category=life_stories")}
            className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <img 
              src="https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=400&h=300&fit=crop" 
              alt="סיפורים"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 right-0 left-0 p-4 text-white text-right">
              <h3 className="font-black text-xl mb-1">סיפורים לחיים</h3>
              <p className="text-sm opacity-90">השראה וחוכמה</p>
            </div>
          </Link>

          <Link
            to={createPageUrl("Music?category=jokes")}
            className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <img 
              src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&h=300&fit=crop" 
              alt="בדיחות לנפש"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 right-0 left-0 p-4 text-white text-right">
              <h3 className="font-black text-xl mb-1">בדיחות לנפש</h3>
              <p className="text-sm opacity-90">העלאת מצב רוח</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-7xl mx-auto px-4 py-12 bg-[#F5F1E8]">
        <h2 className="text-2xl font-black text-gray-900 mb-6 text-right">פעולות מהירות</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Link to={createPageUrl("TherapistSearch")} className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
            <img 
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop" 
              alt="מצא מטפל"
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 right-0 left-0 p-4 text-white text-right">
              <h3 className="font-black text-xl mb-1">מצא מטפל</h3>
              <p className="text-sm opacity-90">בשניות</p>
            </div>
          </Link>
          
          <Link to={createPageUrl("TherapistSearch")} className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
            <img 
              src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop" 
              alt="קבע תור"
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 right-0 left-0 p-4 text-white text-right">
              <h3 className="font-black text-xl mb-1">קבע תור</h3>
              <p className="text-sm opacity-90">תור מהיר</p>
            </div>
          </Link>

          <Link to={createPageUrl("Exercises")} className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
            <img 
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop" 
              alt="תרגילים"
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 right-0 left-0 p-4 text-white text-right">
              <h3 className="font-black text-xl mb-1">תרגילים</h3>
              <p className="text-sm opacity-90">מקצועיים</p>
            </div>
          </Link>

          <Link to={createPageUrl("Shop")} className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
            <img 
              src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&h=300&fit=crop" 
              alt="חנות"
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 right-0 left-0 p-4 text-white text-right">
              <h3 className="font-black text-xl mb-1">חנות</h3>
              <p className="text-sm opacity-90">מוצרים</p>
            </div>
          </Link>

          <Link to={createPageUrl("Webinars")} className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
            <img 
              src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop" 
              alt="וובינרים"
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 right-0 left-0 p-4 text-white text-right">
              <h3 className="font-black text-xl mb-1">וובינרים</h3>
              <p className="text-sm opacity-90">הרצאות</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Therapists */}
      {featuredTherapists.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16 bg-[#F5F1E8]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">
              מטפלים מומלצים
            </h2>
            <Link to={createPageUrl("TherapistSearch")} className="text-gray-900 hover:text-gray-700 text-sm font-semibold flex items-center gap-1">
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
        <section className="bg-[#F5F1E8] py-16">
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
      <section className="py-16 bg-[#E8DCC8] my-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            אתה מטפל? <span className="text-teal-600">הצטרף אלינו</span>
          </h2>
          <p className="text-gray-700 text-base mb-6 max-w-2xl mx-auto">
            קבל עמוד אישי מעוצב, מערכת תורים אוטומטית, חנות, וובינרים ועוד
          </p>
          <Button 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => navigate(createPageUrl("TherapistRegister")), 300);
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-8 py-6 text-base font-semibold"
          >
            הרשמה כמטפל
          </Button>
        </div>
      </section>
    </div>
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
        {therapist.cover_image ? (
          <img src={therapist.cover_image} alt={therapist.full_name} className="w-full h-full object-cover"/>
        ) : therapist.profile_image ? (
          <img src={therapist.profile_image} alt={therapist.full_name} className="w-full h-full object-cover"/>
        ) : (
          <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-3xl text-white font-bold shadow-lg">
            {therapist.full_name?.[0]}
          </div>
        )}
        {therapist.logo_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img src={therapist.logo_url} alt="לוגו" className="w-20 h-20 object-contain bg-white/90 rounded-2xl p-2 shadow-lg"/>
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