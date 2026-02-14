import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MyFavorites() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: favorites = [] } = useQuery({
    queryKey: ["myFavorites", user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user,
  });

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#F5F1E8" }}>
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24}/>
          </button>
          <h1 className="text-xl font-bold">💚 מועדפים</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-6">
      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={48} className="text-gray-200 mx-auto mb-4"/>
          <p className="text-gray-400">עדיין לא שמרת מועדפים</p>
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.map(fav => (
            <div key={fav.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="font-medium">{fav.item_type} - {fav.item_id}</p>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}