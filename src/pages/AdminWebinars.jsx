import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminWebinars() {
  const queryClient = useQueryClient();
  const { data: webinars = [] } = useQuery({
    queryKey: ["adminWebinars"],
    queryFn: () => base44.entities.Webinar.list("-date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Webinar.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminWebinars"] }),
  });

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-6">ניהול וובינרים</h1>
      {webinars.length === 0 ? (
        <p className="text-center text-gray-400 py-12">אין וובינרים</p>
      ) : (
        <div className="space-y-3">
          {webinars.map(w => (
            <div key={w.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold">{w.title}</h3>
                  <Badge className={w.status === "upcoming" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>{w.status}</Badge>
                </div>
                <p className="text-sm text-gray-500">{w.therapist_name} · {new Date(w.date).toLocaleDateString("he-IL")} · {w.is_free ? "חינם" : `₪${w.price}`}</p>
                <p className="text-xs text-gray-400">{w.current_participants || 0}/{w.max_participants} משתתפים</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(w.id)} className="text-red-500"><Trash2 size={16}/></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}