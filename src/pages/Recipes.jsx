import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CATEGORIES = [
  { id: "all", label: "הכל" },
  { id: "anti_inflammatory", label: "אנטי דלקתי" },
  { id: "energy", label: "אנרגיה" },
  { id: "sleep", label: "שינה" },
  { id: "weight_loss", label: "ירידה במשקל" },
  { id: "muscle", label: "בניית שריר" },
  { id: "skin", label: "עור" },
  { id: "immunity", label: "חיסון" },
  { id: "general", label: "כללי" },
];

export default function Recipes() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState(null);

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ["recipes"],
    queryFn: () => base44.entities.Recipe.filter({ is_approved: true }, "-created_date"),
  });

  const filtered = useMemo(() => {
    return recipes.filter(r => {
      const matchQuery = !query || r.title?.includes(query);
      const matchCat = category === "all" || r.category === category;
      return matchQuery && matchCat;
    });
  }, [recipes, query, category]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">מתכונים בריאותיים</h1>
      <p className="text-gray-500 mb-8">מתכונים לפי מטרה בריאותית</p>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-8 shadow-sm">
        <div className="relative">
          <Search size={18} className="absolute right-3 top-3 text-gray-400"/>
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="חפש מתכון..." className="pr-10"/>
        </div>
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat.id ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-6">{Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl"/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">לא נמצאו מתכונים</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map(r => (
            <div
              key={r.id}
              onClick={() => setSelected(r)}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div className="h-40 bg-gradient-to-bl from-green-50 to-amber-50 flex items-center justify-center">
                {r.image_url ? (
                  <img src={r.image_url} alt={r.title} className="w-full h-full object-cover"/>
                ) : (
                  <span className="text-4xl">🥗</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{r.title}</h3>
                <div className="flex gap-2 items-center">
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    {CATEGORIES.find(c => c.id === r.category)?.label || r.category}
                  </Badge>
                  {r.prep_time_minutes && (
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> {r.prep_time_minutes} דק'</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
          </DialogHeader>
          {selected?.image_url && <img src={selected.image_url} alt="" className="w-full h-48 object-cover rounded-xl"/>}
          {selected?.description && <p className="text-gray-600">{selected.description}</p>}
          {selected?.ingredients && (
            <div>
              <h3 className="font-bold mb-2">מרכיבים</h3>
              <p className="text-gray-600 whitespace-pre-line">{selected.ingredients}</p>
            </div>
          )}
          {selected?.instructions && (
            <div>
              <h3 className="font-bold mb-2">הוראות הכנה</h3>
              <p className="text-gray-600 whitespace-pre-line">{selected.instructions}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}