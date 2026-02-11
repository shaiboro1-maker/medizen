import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  expired: "bg-gray-100 text-gray-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AdminBulletin() {
  const queryClient = useQueryClient();
  const { data: posts = [] } = useQuery({
    queryKey: ["adminBulletin"],
    queryFn: () => base44.entities.BulletinPost.list("-created_date"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.BulletinPost.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminBulletin"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BulletinPost.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminBulletin"] }),
  });

  const pending = posts.filter(p => p.status === "pending");
  const rest = posts.filter(p => p.status !== "pending");

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6">ניהול לוח מודעות</h1>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4">ממתינים לאישור ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-amber-200 p-5">
                <h3 className="font-bold">{p.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{p.description?.slice(0, 150)}</p>
                <p className="text-xs text-gray-400 mt-2">פורסם ע"י {p.therapist_name}</p>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button size="sm" onClick={() => updateMutation.mutate({ id: p.id, data: { status: "approved" } })} className="bg-green-600 hover:bg-green-700">
                    <Check size={14} className="ml-1"/> אשר
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: p.id, data: { status: "rejected" } })} className="text-red-600">
                    <X size={14} className="ml-1"/> דחה
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-lg font-bold mb-4">כל המודעות</h2>
      <div className="space-y-3">
        {rest.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold">{p.title}</h3>
                <Badge className={STATUS_COLORS[p.status]}>{p.status}</Badge>
              </div>
              <p className="text-sm text-gray-500">{p.therapist_name} · {p.category}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id)} className="text-red-500"><Trash2 size={16}/></Button>
          </div>
        ))}
      </div>
    </div>
  );
}