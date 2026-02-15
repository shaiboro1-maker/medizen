import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Calendar, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CATEGORIES = [
  { id: "all", label: "הכל", emoji: "📌" },
  { id: "real_estate_rent", label: "נדל\"ן להשכרה", emoji: "🏠" },
  { id: "real_estate_sale", label: "נדל\"ן למכירה", emoji: "🏢" },
  { id: "jobs", label: "דרושים", emoji: "💼" },
  { id: "collaboration", label: "שיתופי פעולה", emoji: "🤝" },
  { id: "suppliers", label: "ספקים", emoji: "📦" },
  { id: "courses", label: "קורסים", emoji: "📚" },
  { id: "other", label: "אחר", emoji: "📋" },
];

export default function BulletinBoard() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["bulletinPosts"],
    queryFn: () => base44.entities.BulletinPost.filter({ status: "approved" }, "-created_date"),
  });

  const filtered = useMemo(() => {
    return posts.filter(p => category === "all" || p.category === category);
  }, [posts, category]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft size={16} className="ml-2"/> חזור
      </Button>
      <h1 className="text-3xl font-bold mb-2">לוח מודעות מקצועי</h1>
      <p className="text-gray-500 mb-8">נדל"ן, דרושים, שיתופי פעולה, ספקים וקורסים</p>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              category === cat.id ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl"/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">אין מודעות</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map(post => (
            <div
              key={post.id}
              onClick={() => setSelected(post)}
              className="bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 relative"
            >
              {post.is_promoted && (
                <Badge className="absolute top-4 left-4 bg-amber-400 text-white">⭐ מקודם</Badge>
              )}
              <Badge variant="secondary" className="bg-teal-50 text-teal-700 mb-3">
                {CATEGORIES.find(c => c.id === post.category)?.emoji} {CATEGORIES.find(c => c.id === post.category)?.label}
              </Badge>
              <h3 className="font-bold text-lg mb-2">{post.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4">{post.description}</p>
              <div className="flex gap-4 text-xs text-gray-400">
                {post.area && <span className="flex items-center gap-1"><MapPin size={12}/> {post.area}</span>}
                {post.price > 0 && <span className="font-semibold text-teal-700">₪{post.price}</span>}
                <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(post.created_date).toLocaleDateString("he-IL")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selected?.title}</DialogTitle></DialogHeader>
          <Badge variant="secondary" className="bg-teal-50 text-teal-700 w-fit">
            {CATEGORIES.find(c => c.id === selected?.category)?.label}
          </Badge>
          <p className="text-gray-600 whitespace-pre-line">{selected?.description}</p>
          {selected?.image_urls?.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {selected.image_urls.map((url, i) => <img key={i} src={url} alt="" className="rounded-xl w-full h-32 object-cover"/>)}
            </div>
          )}
          <div className="flex gap-4 text-sm text-gray-500 mt-4">
            {selected?.area && <span><MapPin size={14} className="inline ml-1"/> {selected.area}</span>}
            {selected?.price > 0 && <span className="font-bold text-teal-700">₪{selected.price}</span>}
          </div>
          {selected?.contact_info && (
            <div className="bg-teal-50 rounded-xl p-4 mt-4">
              <p className="text-sm font-medium text-teal-800"><Phone size={14} className="inline ml-1"/> {selected.contact_info}</p>
            </div>
          )}
          <p className="text-xs text-gray-400">פורסם ע"י {selected?.therapist_name}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}