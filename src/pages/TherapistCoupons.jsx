import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Tag, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import moment from "moment";

export default function TherapistCoupons() {
  const [therapist, setTherapist] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: 10,
    applies_to: "all",
    target_id: "",
    max_uses: 100,
    expires_at: moment().add(30, "days").format("YYYY-MM-DD"),
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      if (therapists[0]) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: coupons = [] } = useQuery({
    queryKey: ["therapistCoupons", therapist?.id],
    queryFn: () => base44.entities.Coupon.filter({ therapist_id: therapist.id }, "-created_date"),
    enabled: !!therapist,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["therapistServices", therapist?.id],
    queryFn: () => base44.entities.Service.filter({ therapist_id: therapist.id }),
    enabled: !!therapist,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["therapistCourses", therapist?.id],
    queryFn: () => base44.entities.Course.filter({ therapist_id: therapist.id }),
    enabled: !!therapist,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Coupon.create({ ...data, therapist_id: therapist.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["therapistCoupons"] });
      setNewCoupon({
        code: "",
        discount_type: "percentage",
        discount_value: 10,
        applies_to: "all",
        target_id: "",
        max_uses: 100,
        expires_at: moment().add(30, "days").format("YYYY-MM-DD"),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Coupon.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["therapistCoupons"] }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.Coupon.update(id, { is_active: !is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["therapistCoupons"] }),
  });

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCoupon({ ...newCoupon, code });
  };

  if (!therapist) {
    return <div className="p-8 text-center"><p className="text-gray-500">טוען...</p></div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Tag size={24} className="text-teal-600"/>
        ניהול קופונים והנחות
      </h1>

      {/* Create New Coupon */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <h2 className="font-bold mb-4">יצירת קופון חדש</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>קוד הקופון</Label>
            <div className="flex gap-2">
              <Input
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER2024"
                className="font-mono"
              />
              <Button variant="outline" onClick={generateRandomCode}>
                יצירה אוטומטית
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>סוג הנחה</Label>
            <Select value={newCoupon.discount_type} onValueChange={(v) => setNewCoupon({ ...newCoupon, discount_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">אחוזים (%)</SelectItem>
                <SelectItem value="fixed">סכום קבוע (₪)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>ערך ההנחה</Label>
            <Input
              type="number"
              value={newCoupon.discount_value}
              onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>חל על</Label>
            <Select value={newCoupon.applies_to} onValueChange={(v) => setNewCoupon({ ...newCoupon, applies_to: v, target_id: "" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="service">שירות ספציפי</SelectItem>
                <SelectItem value="course">קורס ספציפי</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {newCoupon.applies_to === "service" && (
            <div className="space-y-2">
              <Label>בחר שירות</Label>
              <Select value={newCoupon.target_id} onValueChange={(v) => setNewCoupon({ ...newCoupon, target_id: v })}>
                <SelectTrigger><SelectValue placeholder="בחר שירות" /></SelectTrigger>
                <SelectContent>
                  {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {newCoupon.applies_to === "course" && (
            <div className="space-y-2">
              <Label>בחר קורס</Label>
              <Select value={newCoupon.target_id} onValueChange={(v) => setNewCoupon({ ...newCoupon, target_id: v })}>
                <SelectTrigger><SelectValue placeholder="בחר קורס" /></SelectTrigger>
                <SelectContent>
                  {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>מספר שימושים מקסימלי</Label>
            <Input
              type="number"
              value={newCoupon.max_uses}
              onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>תוקף עד</Label>
            <Input
              type="date"
              value={newCoupon.expires_at}
              onChange={(e) => setNewCoupon({ ...newCoupon, expires_at: e.target.value })}
            />
          </div>
        </div>
        <Button
          onClick={() => createMutation.mutate(newCoupon)}
          disabled={!newCoupon.code || createMutation.isPending}
          className="mt-4 bg-teal-600 hover:bg-teal-700"
        >
          <Plus size={16} className="ml-2" /> צור קופון
        </Button>
      </div>

      {/* Existing Coupons */}
      <div className="space-y-4">
        <h2 className="font-bold text-lg">קופונים קיימים ({coupons.length})</h2>
        {coupons.length === 0 ? (
          <p className="text-gray-400 text-center py-8">אין קופונים עדיין</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {coupons.map((coupon) => {
              const isExpired = moment(coupon.expires_at).isBefore(moment());
              const isMaxedOut = coupon.used_count >= coupon.max_uses;
              return (
                <div key={coupon.id} className={`bg-white rounded-2xl border p-5 ${!coupon.is_active || isExpired || isMaxedOut ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-teal-50 rounded-lg font-mono font-bold text-teal-700 text-lg">
                        {coupon.code}
                      </div>
                      <button onClick={() => copyToClipboard(coupon.code)} className="text-gray-400 hover:text-teal-600">
                        {copiedCode === coupon.code ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActiveMutation.mutate({ id: coupon.id, is_active: coupon.is_active })}
                      >
                        {coupon.is_active ? "השבת" : "הפעל"}
                      </Button>
                      <button onClick={() => deleteMutation.mutate(coupon.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-gray-900">
                      הנחה: {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `₪${coupon.discount_value}`}
                    </p>
                    <p className="text-gray-500">
                      {coupon.applies_to === "all" ? "חל על כל השירותים" : 
                       coupon.applies_to === "service" ? "שירות ספציפי" : "קורס ספציפי"}
                    </p>
                    <p className="text-gray-400">
                      שימושים: {coupon.used_count}/{coupon.max_uses}
                    </p>
                    <p className="text-gray-400">
                      תוקף: עד {moment(coupon.expires_at).format("DD/MM/YYYY")}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {!coupon.is_active && <Badge variant="outline" className="text-gray-500">מושבת</Badge>}
                      {isExpired && <Badge variant="outline" className="text-red-500">פג תוקף</Badge>}
                      {isMaxedOut && <Badge variant="outline" className="text-orange-500">מוצה</Badge>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}