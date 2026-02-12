import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Package, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_MAP = {
  pending: { label: "ממתין", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "מאושר", color: "bg-blue-100 text-blue-800" },
  shipped: { label: "נשלח", color: "bg-purple-100 text-purple-800" },
  delivered: { label: "נמסר", color: "bg-green-100 text-green-800" },
  cancelled: { label: "בוטל", color: "bg-red-100 text-red-800" },
};

export default function MyOrders() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: orders = [] } = useQuery({
    queryKey: ["myOrders", user?.email],
    queryFn: () => base44.entities.Order.filter({ client_email: user.email }, "-created_date"),
    enabled: !!user,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft size={16} className="ml-2"/> חזור
      </Button>
      <h1 className="text-3xl font-bold mb-8">ההזמנות שלי</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="text-gray-200 mx-auto mb-4"/>
          <p className="text-gray-400">אין הזמנות עדיין</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-gray-400">הזמנה #{order.id?.slice(-6)}</p>
                  <p className="text-xs text-gray-400">{new Date(order.created_date).toLocaleDateString("he-IL")}</p>
                </div>
                <Badge className={STATUS_MAP[order.status]?.color}>{STATUS_MAP[order.status]?.label}</Badge>
              </div>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.product_name} x{item.quantity}</span>
                    <span>₪{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-3 pt-3 flex justify-between font-bold">
                <span>סה"כ</span>
                <span>₪{order.total?.toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}