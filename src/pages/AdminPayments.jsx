import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, CreditCard, FileText, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminPayments() {
  const { data: appointments = [] } = useQuery({
    queryKey: ["allAppointments"],
    queryFn: () => base44.entities.Appointment.list("-date", 200),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["allOrders"],
    queryFn: () => base44.entities.Order.list("-created_date", 200),
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["allInvoices"],
    queryFn: () => base44.entities.Invoice.list("-created_date", 100),
  });

  const totalRevenue = appointments
    .filter(a => a.payment_status === "paid")
    .reduce((s, a) => s + (a.price || 0), 0);

  const totalOrdersRevenue = orders
    .filter(o => o.payment_status === "paid")
    .reduce((s, o) => s + (o.total || 0), 0);

  const pendingPayments = appointments
    .filter(a => a.payment_status === "unpaid")
    .reduce((s, a) => s + (a.price || 0), 0);

  const paidInvoices = invoices.filter(i => i.status === "paid").length;
  const pendingInvoices = invoices.filter(i => i.status === "sent").length;

  return (
    <div className="p-6 md:p-8" style={{backgroundColor: '#F5F1E8'}}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#7C9885]">💳 סליקה וחשבוניות</h1>
        <p className="text-[#A8947D]">ניהול תשלומים והכנסות</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
              <DollarSign className="text-green-600" size={20}/>
            </div>
            <p className="text-2xl font-bold">₪{totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-500">הכנסות מתורים</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
              <DollarSign className="text-purple-600" size={20}/>
            </div>
            <p className="text-2xl font-bold">₪{totalOrdersRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-500">הכנסות מחנות</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
              <TrendingUp className="text-amber-600" size={20}/>
            </div>
            <p className="text-2xl font-bold">₪{pendingPayments.toLocaleString()}</p>
            <p className="text-sm text-gray-500">תשלומים ממתינים</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
              <FileText className="text-blue-600" size={20}/>
            </div>
            <p className="text-2xl font-bold">{invoices.length}</p>
            <p className="text-sm text-gray-500">חשבוניות</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Management */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-[#E5DDD3] p-6">
          <h3 className="font-bold text-[#7C9885] mb-4">הגדרות חשבוניות אוטומטיות</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">יצירה אוטומטית לאחר תשלום</span>
              <Badge className="bg-green-100 text-green-800">פעיל</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">שליחה אוטומטית למייל</span>
              <Badge className="bg-green-100 text-green-800">פעיל</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">מס"ד חשבונית נוכחי</span>
              <Badge variant="outline">INV-{1000 + invoices.length}</Badge>
            </div>
          </div>
          <Button className="w-full mt-4 bg-[#B8A393] hover:bg-[#C5B5A4]">
            הגדרות חשבוניות
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-[#E5DDD3] p-6">
          <h3 className="font-bold text-[#7C9885] mb-4">אינטגרציות סליקה</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-blue-600"/>
                <span className="text-sm font-medium">Stripe</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">מחובר</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-purple-600"/>
                <span className="text-sm font-medium">PayPal</span>
              </div>
              <Badge variant="outline">לא מחובר</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-green-600"/>
                <span className="text-sm font-medium">Bit</span>
              </div>
              <Badge variant="outline">לא מחובר</Badge>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4">
            הוסף אינטגרציה
          </Button>
        </div>
      </div>

      {/* Recent Transactions */}
      <h2 className="text-lg font-bold mb-4 text-[#7C9885]">עסקאות אחרונות</h2>
      <div className="bg-white rounded-xl border border-[#E5DDD3] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F1E8]">
            <tr>
              <th className="text-right p-3 font-medium text-[#7C9885]">תאריך</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">לקוח</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">סוג</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">סכום</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">סטטוס</th>
              <th className="text-right p-3 font-medium text-[#7C9885]">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {appointments.slice(0, 15).map(a => (
              <tr key={a.id} className="border-t border-[#E5DDD3]">
                <td className="p-3">{new Date(a.date).toLocaleDateString('he-IL')}</td>
                <td className="p-3">{a.client_name}</td>
                <td className="p-3">תור טיפול</td>
                <td className="p-3 font-bold">₪{a.price}</td>
                <td className="p-3">
                  <Badge className={
                    a.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                    'bg-amber-100 text-amber-800'
                  }>
                    {a.payment_status === 'paid' ? 'שולם' : 'ממתין'}
                  </Badge>
                </td>
                <td className="p-3">
                  <Button size="sm" variant="outline">
                    <FileText size={14} className="ml-1"/> חשבונית
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}