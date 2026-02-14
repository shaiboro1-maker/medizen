import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { User, Calendar, Heart, ShoppingBag, LogOut, ChevronLeft, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Recommendations from "../components/Recommendations";
import AppDownload from "../components/AppDownload";

export default function MyAccount() {
  const [user, setUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const handleDeleteAccount = async () => {
    if (confirmText !== "מחק את החשבון") return;
    try {
      await base44.entities.User.delete(user.id);
      await base44.auth.logout();
    } catch (error) {
      alert("שגיאה במחיקת החשבון");
    }
  };

  if (!user) return null;

  const menuItems = [
    { icon: <Calendar size={20}/>, label: "התורים שלי", to: "MyAppointments" },
    { icon: <Heart size={20}/>, label: "מועדפים", to: "MyFavorites" },
    { icon: <ShoppingBag size={20}/>, label: "הזמנות", to: "MyOrders" },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "#F5F1E8" }}>
      <div className="bg-white border-b p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowRight size={24}/>
          </button>
          <h1 className="text-xl font-bold">אזור אישי</h1>
        </div>
      </div>
      
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-teal-700"/>
          </div>
          <h2 className="text-2xl font-bold">{user.full_name}</h2>
          <p className="text-gray-500">{user.email}</p>
        </div>

      <Recommendations userType="client" userId={user.email}/>

      <div className="space-y-3 mt-6">
        {menuItems.map(item => (
          <Link
            key={item.to}
            to={createPageUrl(item.to)}
            className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="text-gray-500">{item.icon}</div>
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronLeft size={18} className="text-gray-400"/>
          </Link>
        ))}

        <button
          onClick={() => base44.auth.logout()}
          className="w-full flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-5 hover:bg-red-50 transition-all text-red-600"
          style={{ userSelect: 'none' }}
        >
          <LogOut size={20}/>
          <span className="font-medium">התנתקות</span>
        </button>

        <button
          onClick={() => setShowDeleteDialog(true)}
          className="w-full flex items-center gap-3 bg-white rounded-2xl border border-red-200 p-5 hover:bg-red-50 transition-all text-red-600"
          style={{ userSelect: 'none' }}
        >
          <Trash2 size={20}/>
          <span className="font-medium">מחיקת חשבון</span>
        </button>
      </div>

      <div className="mt-6">
        <AppDownload variant="compact"/>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>מחיקת חשבון</DialogTitle>
            <DialogDescription>
              פעולה זו תמחק את החשבון שלך לצמיתות ואינה ניתנת לביטול. כל התורים, ההזמנות והמידע שלך יימחקו.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              כדי לאשר, הקלד: <strong>מחק את החשבון</strong>
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              placeholder="הקלד כאן..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={confirmText !== "מחק את החשבון"}
            >
              מחק לצמיתות
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}