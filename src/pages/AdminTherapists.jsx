import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
};

export default function AdminTherapists() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: therapists = [] } = useQuery({
    queryKey: ["adminTherapists"],
    queryFn: () => base44.entities.Therapist.list("-created_date"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Therapist.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminTherapists"] }),
  });

  const pending = therapists.filter(t => t.status === "pending");
  const approved = therapists.filter(t => t.status === "approved");
  const suspended = therapists.filter(t => t.status === "suspended");

  return (
    <div className="p-6 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowRight size={20}/>
        </Button>
        <h1 className="text-2xl font-bold text-[#7C9885]">ניהול מטפלים</h1>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="bg-gray-100 rounded-xl p-1 mb-6">
          <TabsTrigger value="pending">ממתינים ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">פעילים ({approved.length})</TabsTrigger>
          <TabsTrigger value="suspended">מושעים ({suspended.length})</TabsTrigger>
        </TabsList>

        {["pending", "approved", "suspended"].map(status => (
          <TabsContent key={status} value={status}>
            {(status === "pending" ? pending : status === "approved" ? approved : suspended).length === 0 ? (
              <p className="text-center text-gray-400 py-12">אין מטפלים</p>
            ) : (
              <div className="space-y-3">
                {(status === "pending" ? pending : status === "approved" ? approved : suspended).map(t => (
                  <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {t.profile_image ? <img src={t.profile_image} alt="" className="w-full h-full object-cover"/> : <User size={20} className="text-teal-700"/>}
                        </div>
                        <div>
                          <h3 className="font-bold">{t.full_name}</h3>
                          <p className="text-sm text-gray-500">{t.user_email}</p>
                          <p className="text-sm text-gray-400">{t.categories?.join(", ")} · {t.city}</p>
                        </div>
                      </div>
                      <Badge className={STATUS_COLORS[t.status]}>{t.status}</Badge>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      {status === "pending" && (
                        <>
                          <Button size="sm" onClick={() => updateMutation.mutate({ id: t.id, data: { status: "approved" } })} className="bg-green-600 hover:bg-green-700">
                            <Check size={14} className="ml-1"/> אשר
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: t.id, data: { status: "suspended" } })} className="text-red-600">
                            <X size={14} className="ml-1"/> דחה
                          </Button>
                        </>
                      )}
                      {status === "approved" && (
                        <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: t.id, data: { status: "suspended" } })} className="text-red-600">
                          השעה
                        </Button>
                      )}
                      {status === "suspended" && (
                        <Button size="sm" onClick={() => updateMutation.mutate({ id: t.id, data: { status: "approved" } })} className="bg-green-600 hover:bg-green-700">
                          הפעל מחדש
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}