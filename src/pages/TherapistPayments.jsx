import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, DollarSign, Percent, FileText, Save, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-hot-toast";

export default function TherapistPayments() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    enable_online_payment: false,
    payment_provider: "none",
    merchant_id: "",
    prepayment_required: false,
    prepayment_percentage: 100,
    app_exclusive_discount: 0,
    default_discount: 0,
    auto_invoice: false,
    invoice_prefix: "INV",
    tax_rate: 17,
    business_number: ""
  });

  const { data: therapist } = useQuery({
    queryKey: ["current-therapist"],
    queryFn: async () => {
      const user = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: user.email });
      return therapists[0];
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["payment-settings", therapist?.id],
    queryFn: async () => {
      const result = await base44.entities.PaymentSettings.filter({ therapist_id: therapist.id });
      return result[0];
    },
    enabled: !!therapist,
  });

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (settings) {
        return base44.entities.PaymentSettings.update(settings.id, data);
      } else {
        return base44.entities.PaymentSettings.create({
          ...data,
          therapist_id: therapist.id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-settings"] });
      toast.success("ההגדרות נשמרו בהצלחה!");
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">תשלומים וסליקה</h1>
        <p className="text-gray-500">נהל את הגדרות התשלום, סליקה וחשבוניות</p>
      </div>

      <Tabs defaultValue="payment" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payment">סליקה ותשלום</TabsTrigger>
          <TabsTrigger value="discounts">הנחות</TabsTrigger>
          <TabsTrigger value="invoices">חשבוניות</TabsTrigger>
        </TabsList>

        <TabsContent value="payment">
          <div className="bg-white rounded-xl border p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CreditCard size={20}/>
                הגדרות סליקה
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>אפשר תשלום מקוון</Label>
                    <p className="text-sm text-gray-500">אפשר ללקוחות לשלם דרך האפליקציה</p>
                  </div>
                  <Switch
                    checked={form.enable_online_payment}
                    onCheckedChange={(v) => setForm({...form, enable_online_payment: v})}
                  />
                </div>

                {form.enable_online_payment && (
                  <>
                    <div className="space-y-2">
                      <Label>ספק סליקה</Label>
                      <Select value={form.payment_provider} onValueChange={(v) => setForm({...form, payment_provider: v})}>
                        <SelectTrigger>
                          <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stripe">Stripe</SelectItem>
                          <SelectItem value="tranzila">Tranzila</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="bit">Bit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>מספר בית עסק</Label>
                      <Input
                        value={form.merchant_id}
                        onChange={(e) => setForm({...form, merchant_id: e.target.value})}
                        placeholder="הזן מספר בית עסק"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Shield size={20}/>
                גבייה מראש
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>חייב גבייה מראש</Label>
                    <p className="text-sm text-gray-500">דרוש תשלום מראש לאישור תור</p>
                  </div>
                  <Switch
                    checked={form.prepayment_required}
                    onCheckedChange={(v) => setForm({...form, prepayment_required: v})}
                  />
                </div>

                {form.prepayment_required && (
                  <div className="space-y-2">
                    <Label>אחוז לתשלום מראש (%)</Label>
                    <Input
                      type="number"
                      value={form.prepayment_percentage}
                      onChange={(e) => setForm({...form, prepayment_percentage: Number(e.target.value)})}
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-gray-500">100% = תשלום מלא מראש</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="discounts">
          <div className="bg-white rounded-xl border p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Percent size={20}/>
                הנחות קבועות
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>הנחה בלעדית באפליקציה (%)</Label>
                  <Input
                    type="number"
                    value={form.app_exclusive_discount}
                    onChange={(e) => setForm({...form, app_exclusive_discount: Number(e.target.value)})}
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-500">
                    הנחה אוטומטית ללקוחות שמזמינים דרך האפליקציה
                  </p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Percent size={20} className="text-white"/>
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 mb-1">הנחה בלעדית באפליקציה</h4>
                      <p className="text-sm text-amber-800">
                        עודד לקוחות להזמין דרך האפליקציה ותקבל יותר הזמנות ישירות
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>הנחה קבועה למטפל (%)</Label>
                  <Input
                    type="number"
                    value={form.default_discount}
                    onChange={(e) => setForm({...form, default_discount: Number(e.target.value)})}
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-500">
                    הנחה שתוחל אוטומטית על כל התורים
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start gap-3">
                <DollarSign size={20} className="text-blue-600 flex-shrink-0 mt-1"/>
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 mb-1">דוגמה לחישוב</p>
                  <p className="text-blue-800">
                    שירות במחיר ₪200 + הנחה באפליקציה 10% + הנחה קבועה 5% = <strong>₪170</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invoices">
          <div className="bg-white rounded-xl border p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FileText size={20}/>
                הגדרות חשבוניות
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>חשבונית אוטומטית</Label>
                    <p className="text-sm text-gray-500">צור חשבונית אוטומטית לכל תור</p>
                  </div>
                  <Switch
                    checked={form.auto_invoice}
                    onCheckedChange={(v) => setForm({...form, auto_invoice: v})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>קידומת חשבונית</Label>
                    <Input
                      value={form.invoice_prefix}
                      onChange={(e) => setForm({...form, invoice_prefix: e.target.value})}
                      placeholder="INV"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>אחוז מע"מ (%)</Label>
                    <Input
                      type="number"
                      value={form.tax_rate}
                      onChange={(e) => setForm({...form, tax_rate: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>מספר עוסק מורשה / ח.פ</Label>
                  <Input
                    value={form.business_number}
                    onChange={(e) => setForm({...form, business_number: e.target.value})}
                    placeholder="123456789"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="bg-teal-600 hover:bg-teal-700">
          <Save size={16} className="ml-2"/>
          {saveMutation.isPending ? "שומר..." : "שמור הגדרות"}
        </Button>
      </div>
    </div>
  );
}