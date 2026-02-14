import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingCart, Tag, ArrowRight, Star, Sparkles, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CATEGORIES = [
  { id: "all", label: "הכל" },
  { id: "insoles", label: "מדרסים" },
  { id: "massage_tools", label: "עיסוי" },
  { id: "supplements", label: "תוספים" },
  { id: "formulas", label: "פורמולות" },
  { id: "equipment", label: "מכשור" },
  { id: "oils", label: "שמנים" },
  { id: "cosmetics", label: "קוסמטיקה" },
  { id: "sports_equipment", label: "ציוד ספורט" },
  { id: "therapeutic_jewelry", label: "תכשיטים" },
  { id: "websites", label: "אתרים" },
  { id: "other", label: "אחר" },
];

export default function Shop() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState([]);

  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
      } catch (e) {}
    };
    init();
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => base44.entities.Product.filter({ is_active: true }, "-created_date"),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews"],
    queryFn: () => base44.entities.ProductReview.filter({ is_approved: true }),
  });

  const { data: myOrders = [] } = useQuery({
    queryKey: ["myOrders", user?.email],
    queryFn: () => base44.entities.Order.filter({ client_email: user.email }),
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchQuery = !query || p.name?.includes(query);
      const matchCat = category === "all" || p.category === category;
      return matchQuery && matchCat;
    });
  }, [products, query, category]);

  const getProductRating = (productId) => {
    const productReviews = reviews.filter(r => r.product_id === productId);
    if (productReviews.length === 0) return 0;
    return productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
  };

  const getRecommendedProducts = () => {
    if (!myOrders || myOrders.length === 0) return products.slice(0, 4);
    const purchasedCategories = myOrders.flatMap(o => o.items?.map(i => i.product_id) || []);
    return products.filter(p => !purchasedCategories.includes(p.id)).slice(0, 4);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.sale_price || item.price) * item.qty, 0);

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#F5F1E8" }}>
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}>
              <ArrowRight size={24}/>
            </button>
            <h1 className="text-xl font-bold">חנות</h1>
          </div>
          {cart.length > 0 && (
            <Button variant="outline" className="relative" onClick={() => setSelected({ type: "cart" })}>
              <ShoppingCart size={18}/>
              <span className="absolute -top-2 -left-2 w-5 h-5 bg-teal-600 text-white rounded-full text-xs flex items-center justify-center">
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* AI Recommendations */}
        {user && getRecommendedProducts().length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={20} className="text-purple-600"/>
              <h2 className="font-bold text-[#7C9885]">מומלץ במיוחד עבורך</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {getRecommendedProducts().map(p => (
                <div key={p.id} className="bg-white rounded-xl border border-[#E5DDD3] p-3 min-w-[150px] cursor-pointer" onClick={() => setSelected(p)}>
                  <div className="h-20 bg-gray-50 rounded-lg mb-2 flex items-center justify-center">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover rounded-lg"/>
                    ) : (
                      <Tag size={20} className="text-gray-300"/>
                    )}
                  </div>
                  <p className="text-xs font-medium line-clamp-2 mb-1">{p.name}</p>
                  <p className="text-sm font-bold text-teal-600">₪{p.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
          <div className="relative">
            <Search size={18} className="absolute right-3 top-3 text-gray-400"/>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="חפש מוצר..." className="pr-10"/>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl"/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">לא נמצאו מוצרים</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filtered.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                <div className="h-40 bg-gray-50 flex items-center justify-center cursor-pointer" onClick={() => setSelected(p)}>
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover"/>
                  ) : (
                    <Tag size={32} className="text-gray-200"/>
                  )}
                </div>
              <div className="p-4">
                <h3 className="font-bold text-sm mb-2 line-clamp-2">{p.name}</h3>
                {getProductRating(p.id) > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star size={12} className="text-yellow-500 fill-yellow-500"/>
                    <span className="text-xs text-gray-600">{getProductRating(p.id).toFixed(1)}</span>
                    <span className="text-xs text-gray-400">({reviews.filter(r => r.product_id === p.id).length})</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    {p.sale_price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">₪{p.sale_price}</span>
                        <span className="text-sm line-through text-gray-400">₪{p.price}</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-teal-700">₪{p.price}</span>
                    )}
                  </div>
                  <Button size="sm" onClick={() => addToCart(p)} className="bg-teal-600 hover:bg-teal-700 rounded-xl">
                    <ShoppingCart size={14}/>
                  </Button>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Product / Cart Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected?.type === "cart" ? (
            <>
              <DialogHeader><DialogTitle>סל קניות</DialogTitle></DialogHeader>
              {cart.length === 0 ? (
                <p className="text-center py-8 text-gray-400">הסל ריק</p>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">כמות: {item.qty}</p>
                      </div>
                      <span className="font-bold">₪{((item.sale_price || item.price) * item.qty).toFixed(0)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-4 flex justify-between font-bold text-lg">
                    <span>סה"כ</span>
                    <span>₪{cartTotal.toFixed(0)}</span>
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full bg-teal-600 hover:bg-teal-700">
                      <CreditCard size={16} className="ml-2"/> המשך לתשלום
                    </Button>
                    <p className="text-xs text-center text-gray-500">משלוח חינם מעל ₪300</p>
                  </div>
                </div>
              )}
            </>
          ) : selected ? (
            <>
              <DialogHeader><DialogTitle>{selected.name}</DialogTitle></DialogHeader>
              {selected.image_url && <img src={selected.image_url} alt="" className="w-full h-48 object-cover rounded-xl"/>}
              <p className="text-gray-600 mb-4">{selected.description}</p>
              
              {/* Reviews */}
              <div className="mb-4">
                <h3 className="font-bold mb-2">ביקורות</h3>
                {reviews.filter(r => r.product_id === selected.id).length === 0 ? (
                  <p className="text-sm text-gray-400">אין ביקורות עדיין</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {reviews.filter(r => r.product_id === selected.id).map((review, i) => (
                      <div key={i} className="p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          {Array(5).fill(0).map((_, j) => (
                            <Star key={j} size={12} className={j < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}/>
                          ))}
                          <span className="text-xs text-gray-500">{review.user_name}</span>
                        </div>
                        <p className="text-xs text-gray-600">{review.review_text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className="text-2xl font-bold text-teal-700">₪{selected.sale_price || selected.price}</span>
                <Button onClick={() => { addToCart(selected); setSelected(null); }} className="bg-teal-600 hover:bg-teal-700">
                  <ShoppingCart size={16} className="ml-2"/> הוסף לסל
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}