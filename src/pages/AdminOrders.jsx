import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: orders = [] } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: () => base44.entities.Order.list("-created_date"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminOrders"] }),
  });

  return (
    <div className="p-6 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowRight size={20}/>
        </Button>
        <h1 className="text-2xl font-bold text-[#7C9885]">ניהול הזמנות</h1>
      </div>
      {orders.length === 0 ? (
        <p className="text-center text-gray-400 py-12">אין הזמנות</p>
      ) : (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold">{o.client_name || o.client_email}</p>
                  <p className="text-xs text-gray-400">#{o.id?.slice(-6)} · {new Date(o.created_date).toLocaleDateString("he-IL")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-teal-700">₪{o.total}</span>
                  <Select value={o.status} onValueChange={v => updateMutation.mutate({ id: o.id, data: { status: v } })}>
                    <SelectTrigger className="w-28 h-8">
                      <Badge className={STATUS_COLORS[o.status]}>{o.status}</Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">pending</SelectItem>
                      <SelectItem value="confirmed">confirmed</SelectItem>
                      <SelectItem value="shipped">shipped</SelectItem>
                      <SelectItem value="delivered">delivered</SelectItem>
                      <SelectItem value="cancelled">cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {o.items?.map((item, i) => <span key={i}>{item.product_name} x{item.quantity}{i < o.items.length - 1 ? ", " : ""}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}