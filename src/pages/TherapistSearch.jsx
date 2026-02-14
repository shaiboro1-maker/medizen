import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Star, MapPin, Filter, X, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import PullToRefresh from "../components/PullToRefresh";

const CATEGORIES = [
  { id: "all", label: "הכל" },
  { id: "acupuncture", label: "דיקור סיני" },
  { id: "physio", label: "פיזיותרפיה" },
  { id: "cosmetics", label: "קוסמטיקה" },
  { id: "nutrition", label: "תזונה" },
  { id: "naturopathy", label: "נטרופתיה" },
  { id: "tuina", label: "טווינה" },
  { id: "shiatsu", label: "שיאצו" },
  { id: "reflexology", label: "רפלקסולוגיה" },
  { id: "osteopathy", label: "אוסטאופתיה" },
  { id: "sports", label: "ספורט" },
  { id: "massage", label: "עיסוי" },
  { id: "body_mind", label: "גוף-נפש" },
  { id: "chiropractic", label: "כירופרקטיקה" },
  { id: "hair", label: "ספרות" },
  { id: "pemf", label: "פולסים אלקטרומגנטיים" },
  { id: "insoles", label: "מדרסים" },
  { id: "shockwave", label: "גלי הלם" },
  { id: "occupational", label: "ריפוי בעיסוק" },
  { id: "social_work", label: "עובד/ת סוציאלי" },
  { id: "pedicure", label: "פדיקור/מניקור" },
  { id: "combined", label: "טיפול משולב" },
  { id: "other", label: "אחר" },
];

const AREAS = ["מרכז", "צפון", "דרום", "ירושלים", "שרון", "שפלה"];

function getCategoryImage(categoryId) {
  const images = {
    all: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop",
    acupuncture: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop",
    physio: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop",
    cosmetics: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop",
    nutrition: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop",
    naturopathy: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=300&fit=crop",
    tuina: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop",
    shiatsu: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=400&h=300&fit=crop",
    reflexology: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&h=300&fit=crop",
    osteopathy: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    sports: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop",
    massage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop",
    body_mind: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop",
    chiropractic: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
    hair: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=300&fit=crop",
    pemf: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=300&fit=crop",
    insoles: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=300&fit=crop",
    shockwave: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop",
    occupational: "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=400&h=300&fit=crop",
    social_work: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop",
    pedicure: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=400&h=300&fit=crop",
    combined: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    other: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop"
  };
  return images[categoryId] || images.other;
}

export default function TherapistSearch() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const [query, setQuery] = useState(urlParams.get("q") || "");
  const [category, setCategory] = useState(urlParams.get("category") || "all");
  const [area, setArea] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: therapists = [], isLoading } = useQuery({
    queryKey: ["therapists"],
    queryFn: () => base44.entities.Therapist.filter({ status: "approved" }, "-rating"),
  });

  const filtered = useMemo(() => {
    return therapists.filter((t) => {
      const matchQuery = !query || 
        t.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        t.specializations?.some(s => s.includes(query)) ||
        t.city?.includes(query);
      const matchCategory = category === "all" || t.categories?.includes(category);
      const matchArea = area === "all" || t.area === area;
      return matchQuery && matchCategory && matchArea;
    });
  }, [therapists, query, category, area]);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['therapists'] });
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="max-w-7xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft size={16} className="ml-2"/> חזור
      </Button>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">מצא מטפל</h1>
      <p className="text-gray-500 mb-8">חפש מטפל לפי תחום, אזור או שם</p>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-8 shadow-sm">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute right-3 top-3 text-gray-400"/>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="שם מטפל, תחום, עיר..."
              className="pr-10"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
            <Filter size={16}/> סינון
          </Button>
        </div>
        
        {showFilters && (
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="אזור"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל האזורים</SelectItem>
                {AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

      </div>

      {/* Category Grid */}
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all h-32"
            >
              <img 
                src={getCategoryImage(cat.id)} 
                alt={cat.label}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 ${category === cat.id ? 'bg-teal-600/70' : 'bg-black/50'} flex items-center justify-center transition-all`}>
                <p className="text-white text-base font-bold text-center px-2">{cat.label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-6">{filtered.length} מטפלים נמצאו</p>

      {/* Results */}
      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl"/>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">לא נמצאו מטפלים</p>
          <p className="text-gray-400 text-sm mt-2">נסה לשנות את החיפוש או הסינון</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <Link
              key={t.id}
              to={createPageUrl(`TherapistProfile?id=${t.id}`)}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="h-48 bg-gradient-to-bl from-teal-50 to-emerald-50 flex items-center justify-center relative">
                {t.profile_image ? (
                  <img src={t.profile_image} alt={t.full_name} className="w-full h-full object-cover"/>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-teal-200 flex items-center justify-center text-4xl text-teal-700 font-bold">
                    {t.full_name?.[0]}
                  </div>
                )}
                {t.is_featured && (
                  <Badge className="absolute top-3 left-3 bg-amber-400 text-white">⭐ מומלץ</Badge>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1">{t.full_name}</h3>
                <p className="text-sm text-gray-500 mb-3">{t.specializations?.slice(0, 3).join(" · ")}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-400 fill-amber-400"/>
                    <span className="text-sm font-medium">{t.rating?.toFixed(1) || "חדש"}</span>
                    <span className="text-xs text-gray-400">({t.review_count || 0})</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <MapPin size={12}/>
                    <span className="text-xs">{t.city || t.area}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
    </PullToRefresh>
  );
}