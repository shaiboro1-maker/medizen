import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, User, ArrowRight, CreditCard, Layout, UserCog, XCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
};

export default function AdminTherapists() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [showManageDialog, setShowManageDialog] = useState(false);

  const { data: therapists = [] } = useQuery({
    queryKey: ["adminTherapists"],
    queryFn: () => base44.entities.Therapist.list("-created_date"),
  });

  const { data: paymentSettings = [] } = useQuery({
    queryKey: ["paymentSettings"],
    queryFn: () => base44.entities.PaymentSettings.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Therapist.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTherapists"] });
      setShowManageDialog(false);
      setSelectedTherapist(null);
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ therapist_id, data }) => {
      const existing = paymentSettings.find(p => p.therapist_id === therapist_id);
      return existing 
        ? base44.entities.PaymentSettings.update(existing.id, data)
        : base44.entities.PaymentSettings.create({ ...data, therapist_id });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["paymentSettings"] }),
  });

  const pending = therapists.filter(t => t.status === "pending");
  const approved = therapists.filter(t => t.status === "approved");
  const suspended = therapists.filter(t => t.status === "suspended");
  const featured = therapists.filter(t => t.is_featured === true);

  const handleManageTherapist = (therapist) => {
    setSelectedTherapist(therapist);
    setShowManageDialog(true);
  };

  const handleCancelSubscription = (therapist) => {
    if (confirm(`האם אתה בטוח שברצונך לבטל את המנוי של ${therapist.full_name}?`)) {
      updateMutation.mutate({ 
        id: therapist.id, 
        data: { 
          subscription_type: "free",
          subscription_expires: null,
          status: "suspended"
        } 
      });
    }
  };

  return (
    <div className="p-6 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowRight size={20}/>
        </Button>
        <h1 className="text-2xl font-bold text-[#7C9885]">ניהול מטפלים</h1>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="bg-white rounded-xl p-1 border border-[#E5DDD3] mb-6">
          <TabsTrigger value="pending">ממתינים ({pending.length})</TabsTrigger>
          <TabsTrigger value="approved">פעילים ({approved.length})</TabsTrigger>
          <TabsTrigger value="suspended">מושעים ({suspended.length})</TabsTrigger>
          <TabsTrigger value="featured">מומלצים ({featured.length})</TabsTrigger>
        </TabsList>

        {["pending", "approved", "suspended", "featured"].map(status => (
          <TabsContent key={status} value={status}>
            {(status === "pending" ? pending : status === "approved" ? approved : status === "suspended" ? suspended : featured).length === 0 ? (
              <div className="bg-white rounded-xl border border-[#E5DDD3] p-12 text-center">
                <p className="text-[#A8947D]">אין מטפלים</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(status === "pending" ? pending : status === "approved" ? approved : status === "suspended" ? suspended : featured).map(t => (
                  <div key={t.id} className="bg-white rounded-xl border border-[#E5DDD3] p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {t.profile_image ? <img src={t.profile_image} alt="" className="w-full h-full object-cover"/> : <User size={20} className="text-teal-700"/>}
                        </div>
                        <div>
                          <h3 className="font-bold">{t.full_name}</h3>
                          <p className="text-sm text-gray-500">{t.user_email}</p>
                          <p className="text-sm text-gray-400">{t.categories?.join(", ")} · {t.city}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge className={STATUS_COLORS[t.status]}>{t.status}</Badge>
                            <Badge variant="outline">{t.subscription_type || "free"}</Badge>
                            {t.subscription_expires && (
                              <Badge variant="outline" className="text-xs">
                                עד {new Date(t.subscription_expires).toLocaleDateString('he-IL')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t flex-wrap">
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
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleManageTherapist(t)}>
                            <UserCog size={14} className="ml-1"/> נהל
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateMutation.mutate({ id: t.id, data: { status: "suspended" } })} className="text-red-600">
                            <X size={14} className="ml-1"/> השעה
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleCancelSubscription(t)} className="text-red-600">
                            <XCircle size={14} className="ml-1"/> ביטול מנוי
                          </Button>
                        </>
                      )}
                      {status === "suspended" && (
                        <Button size="sm" onClick={() => updateMutation.mutate({ id: t.id, data: { status: "approved" } })} className="bg-green-600 hover:bg-green-700">
                          <Check size={14} className="ml-1"/> הפעל מחדש
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

      {/* Manage Therapist Dialog */}
      <Dialog open={showManageDialog} onOpenChange={setShowManageDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ניהול מטפל - {selectedTherapist?.full_name}</DialogTitle>
          </DialogHeader>
          {selectedTherapist && (
            <div className="space-y-6">
              {/* Subscription Management */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <CreditCard size={16}/> ניהול מנוי
                </h3>
                <div className="space-y-3">
                  <div>
                    <Label>סוג מנוי</Label>
                    <Select 
                      value={selectedTherapist.subscription_type || "free"} 
                      onValueChange={(v) => updateMutation.mutate({ 
                        id: selectedTherapist.id, 
                        data: { subscription_type: v } 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">חינם</SelectItem>
                        <SelectItem value="basic">בסיסי</SelectItem>
                        <SelectItem value="premium">פרימיום</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>תאריך תפוגה</Label>
                    <Input 
                      type="date" 
                      value={selectedTherapist.subscription_expires?.split('T')[0] || ""}
                      onChange={(e) => updateMutation.mutate({ 
                        id: selectedTherapist.id, 
                        data: { subscription_expires: e.target.value } 
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Featured Therapist Management */}
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Star size={16}/> מטפל מומלץ
                </h3>
                <div className="flex items-center justify-between">
                  <Label>הצג מטפל זה כמומלץ בדף הבית</Label>
                  <Switch
                    checked={selectedTherapist.is_featured || false}
                    onCheckedChange={(checked) => updateMutation.mutate({
                      id: selectedTherapist.id,
                      data: { is_featured: checked }
                    })}
                  />
                </div>
              </div>

              {/* Mini-Site Management */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Layout size={16}/> ניהול מיני סייט
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">מצב מיני סייט</span>
                    <Badge className={selectedTherapist.subscription_type === "premium" || selectedTherapist.subscription_type === "basic" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {selectedTherapist.subscription_type === "premium" || selectedTherapist.subscription_type === "basic" ? "פעיל" : "לא זמין"}
                    </Badge>
                  </div>
                  {selectedTherapist.unique_slug && (
                    <div className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-xs">קישור:</span>
                      <code className="text-xs text-blue-600">/minisite/{selectedTherapist.unique_slug}</code>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    {selectedTherapist.subscription_type === "free" && "שדרג למנוי בסיסי או פרימיום לפתיחת מיני סייט"}
                    {selectedTherapist.subscription_type === "basic" && "מיני סייט בסיסי - תבנית סטנדרטית"}
                    {selectedTherapist.subscription_type === "premium" && "מיני סייט מלא - עיצוב מותאם אישית + בוט לידים"}
                  </p>
                </div>
              </div>

              {/* Payment Collection */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <CreditCard size={16}/> הגדרות גבייה
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>תשלום אוטומטי (הוראת קבע)</Label>
                    <Button 
                      size="sm" 
                      variant={paymentSettings.find(p => p.therapist_id === selectedTherapist.id)?.prepayment_required ? "default" : "outline"}
                      onClick={() => {
                        updatePaymentMutation.mutate({
                          therapist_id: selectedTherapist.id,
                          data: {
                            enable_online_payment: true,
                            prepayment_required: true,
                            prepayment_percentage: 100
                          }
                        });
                      }}
                    >
                      {paymentSettings.find(p => p.therapist_id === selectedTherapist.id)?.prepayment_required ? "פעיל" : "הפעל"}
                    </Button>
                  </div>
                  <div>
                    <Label>אחוז לגביה מראש (%)</Label>
                    <Input 
                      type="number" 
                      defaultValue={paymentSettings.find(p => p.therapist_id === selectedTherapist.id)?.prepayment_percentage || 50}
                      onChange={(e) => {
                        updatePaymentMutation.mutate({
                          therapist_id: selectedTherapist.id,
                          data: { prepayment_percentage: parseInt(e.target.value) }
                        });
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-teal-600">{selectedTherapist.rating || 0}</p>
                  <p className="text-xs text-gray-500">דירוג</p>
                </div>
                <div className="bg-white rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">{selectedTherapist.review_count || 0}</p>
                  <p className="text-xs text-gray-500">ביקורות</p>
                </div>
                <div className="bg-white rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedTherapist.years_experience || 0}</p>
                  <p className="text-xs text-gray-500">שנות ניסיון</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}