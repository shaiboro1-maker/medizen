import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, TrendingUp, TrendingDown, 
  Plus, ArrowRight, Calendar, Receipt,
  PieChart, BarChart3, Download
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

export default function TherapistFinance() {
  const [therapist, setTherapist] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRecord, setNewRecord] = useState({
    type: "income",
    category: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    description: "",
    payment_method: "cash"
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      const therapists = await base44.entities.Therapist.filter({ user_email: me.email });
      if (therapists.length > 0) setTherapist(therapists[0]);
    };
    init();
  }, []);

  const { data: records = [] } = useQuery({
    queryKey: ["financial-records", therapist?.id, selectedMonth],
    queryFn: async () => {
      const startDate = `${selectedMonth}-01`;
      const endDate = `${selectedMonth}-31`;
      return await base44.entities.FinancialRecord.filter({
        therapist_id: therapist.id,
      }, "-date");
    },
    enabled: !!therapist,
  });

  const addRecordMutation = useMutation({
    mutationFn: (data) => base44.entities.FinancialRecord.create({
      ...data,
      therapist_id: therapist.id,
      amount: parseFloat(data.amount)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["financial-records"]);
      setShowAddDialog(false);
      setNewRecord({
        type: "income",
        category: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        description: "",
        payment_method: "cash"
      });
      toast.success("הרשומה נוספה בהצלחה!");
    },
  });

  const monthRecords = records.filter(r => r.date?.startsWith(selectedMonth));
  const income = monthRecords.filter(r => r.type === "income").reduce((sum, r) => sum + r.amount, 0);
  const expenses = monthRecords.filter(r => r.type === "expense").reduce((sum, r) => sum + r.amount, 0);
  const profit = income - expenses;

  const incomeByCategory = monthRecords
    .filter(r => r.type === "income")
    .reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.amount;
      return acc;
    }, {});

  const expensesByCategory = monthRecords
    .filter(r => r.type === "expense")
    .reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.amount;
      return acc;
    }, {});

  if (!therapist) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">טוען...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-br from-teal-600 to-emerald-600 text-white px-6 py-8">
        <button onClick={() => navigate(-1)} className="mb-4">
          <ArrowRight size={24}/>
        </button>
        <h1 className="text-2xl font-bold mb-2">ניהול פיננסי</h1>
        <p className="text-teal-100">מעקב אחר הכנסות והוצאות</p>
      </div>

      <div className="px-4 -mt-6 space-y-4">
        {/* סיכום חודשי */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="pt-6 text-center">
              <TrendingUp size={24} className="mx-auto mb-2"/>
              <p className="text-sm opacity-90">הכנסות</p>
              <p className="text-2xl font-bold">₪{income.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white">
            <CardContent className="pt-6 text-center">
              <TrendingDown size={24} className="mx-auto mb-2"/>
              <p className="text-sm opacity-90">הוצאות</p>
              <p className="text-2xl font-bold">₪{expenses.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardContent className="pt-6 text-center">
              <DollarSign size={24} className="mx-auto mb-2"/>
              <p className="text-sm opacity-90">רווח</p>
              <p className="text-2xl font-bold">₪{profit.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* בחירת חודש */}
        <Card>
          <CardContent className="pt-6">
            <Label>בחר חודש</Label>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* פירוט לפי קטגוריות */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart size={20}/>
              פירוט לפי קטגוריות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="income">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="income">הכנסות</TabsTrigger>
                <TabsTrigger value="expenses">הוצאות</TabsTrigger>
              </TabsList>
              <TabsContent value="income" className="space-y-2 mt-4">
                {Object.entries(incomeByCategory).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">{category}</span>
                    <span className="text-green-700 font-bold">₪{amount.toLocaleString()}</span>
                  </div>
                ))}
                {Object.keys(incomeByCategory).length === 0 && (
                  <p className="text-center text-gray-500 py-4">אין הכנסות לחודש זה</p>
                )}
              </TabsContent>
              <TabsContent value="expenses" className="space-y-2 mt-4">
                {Object.entries(expensesByCategory).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">{category}</span>
                    <span className="text-red-700 font-bold">₪{amount.toLocaleString()}</span>
                  </div>
                ))}
                {Object.keys(expensesByCategory).length === 0 && (
                  <p className="text-center text-gray-500 py-4">אין הוצאות לחודש זה</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* רשימת תנועות */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt size={20}/>
              תנועות אחרונות
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {monthRecords.slice(0, 10).map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{record.category}</p>
                  <p className="text-sm text-gray-600">{record.description}</p>
                  <p className="text-xs text-gray-500">{format(new Date(record.date), 'dd/MM/yyyy')}</p>
                </div>
                <span className={`font-bold text-lg ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {record.type === 'income' ? '+' : '-'}₪{record.amount.toLocaleString()}
                </span>
              </div>
            ))}
            {monthRecords.length === 0 && (
              <p className="text-center text-gray-500 py-8">אין תנועות לחודש זה</p>
            )}
          </CardContent>
        </Card>

        {/* כפתור הוספת רשומה */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white h-14 text-lg shadow-lg z-40">
              <Plus size={24} className="ml-2"/>
              הוסף תנועה חדשה
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>הוסף תנועה פיננסית</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>סוג</Label>
                <Select value={newRecord.type} onValueChange={(value) => setNewRecord({ ...newRecord, type: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">הכנסה</SelectItem>
                    <SelectItem value="expense">הוצאה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>קטגוריה</Label>
                <Input
                  value={newRecord.category}
                  onChange={(e) => setNewRecord({ ...newRecord, category: e.target.value })}
                  placeholder="לדוגמה: טיפולים, שכירות, ציוד"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>סכום (₪)</Label>
                <Input
                  type="number"
                  value={newRecord.amount}
                  onChange={(e) => setNewRecord({ ...newRecord, amount: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>תאריך</Label>
                <Input
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>תיאור</Label>
                <Input
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>אמצעי תשלום</Label>
                <Select value={newRecord.payment_method} onValueChange={(value) => setNewRecord({ ...newRecord, payment_method: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">מזומן</SelectItem>
                    <SelectItem value="credit_card">אשראי</SelectItem>
                    <SelectItem value="bank_transfer">העברה בנקאית</SelectItem>
                    <SelectItem value="check">צ'ק</SelectItem>
                    <SelectItem value="other">אחר</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => addRecordMutation.mutate(newRecord)}
                className="w-full bg-teal-600"
                disabled={!newRecord.category || !newRecord.amount}
              >
                <Plus size={18} className="ml-2"/>
                הוסף רשומה
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}