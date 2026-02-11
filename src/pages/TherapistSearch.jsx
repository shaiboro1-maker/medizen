import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, Star, MapPin, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  { id: "all", label: "הכל" },
  { id: "acupuncture", label: "דיקור סיני" },
  { id: "physio", label: "פיזיותרפיה" },
  { id: "cosmetics", label: "קוסמטיקה" },
  { id: "nutrition", label: "תזונה" },
  { id: "sports", label: "ספורט" },
  { id: "massage", label: "עיסוי" },
  { id: "body_mind", label: "גוף-נפש" },
  { id: "chiropractic", label: "כירופרקטיקה" },
  { id: "hair", label: "ספרות" },
];

const AREAS = ["מרכז", "צפון", "דרום", "ירושלים", "שרון", "שפלה"];

export default function TherapistSearch() {
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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

        {/* Category Pills */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat.id
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
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
  );
}