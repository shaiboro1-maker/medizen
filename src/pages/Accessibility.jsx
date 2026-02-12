import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Eye, Ear, MessageCircle, Keyboard, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Accessibility() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">הצהרת נגישות</h1>
      
      <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-teal-700">מחויבותנו לנגישות</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Wellness Hub מחויבת להנגיש את שירותיה לכלל הציבור, לרבות אנשים עם מוגבלויות, 
          בהתאם לתקן הישראלי (ת"י 5568) ולחוק שוויון זכויות לאנשים עם מוגבלות, התשנ"ח-1998.
        </p>
        <p className="text-gray-700 leading-relaxed">
          אנו שואפים לספק חווית משתמש נגישה ומכבדת לכולם, ומשקיעים מאמצים רבים להבטיח 
          שהאתר והאפליקציה שלנו יהיו נגישים לשימוש עבור אנשים עם מוגבלויות.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
        <h2 className="text-2xl font-bold mb-6 text-teal-700">תכונות נגישות באתר</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Keyboard size={24} className="text-teal-600"/>
            </div>
            <div>
              <h3 className="font-bold mb-2">ניווט במקלדת</h3>
              <p className="text-sm text-gray-600">
                ניתן לנווט באתר באמצעות מקלדת בלבד, כולל תמיכה מלאה ב-Tab ו-Enter
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Eye size={24} className="text-teal-600"/>
            </div>
            <div>
              <h3 className="font-bold mb-2">תאימות לקוראי מסך</h3>
              <p className="text-sm text-gray-600">
                האתר תואם לקוראי מסך מובילים כמו JAWS, NVDA ו-VoiceOver
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageCircle size={24} className="text-teal-600"/>
            </div>
            <div>
              <h3 className="font-bold mb-2">טקסט חלופי</h3>
              <p className="text-sm text-gray-600">
                כל התמונות והאייקונים מלווים בתיאור טקסטואלי מפורט
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Ear size={24} className="text-teal-600"/>
            </div>
            <div>
              <h3 className="font-bold mb-2">ניגודיות צבעים</h3>
              <p className="text-sm text-gray-600">
                עיצוב עם ניגודיות גבוהה לקריאה נוחה גם למשתמשים עם לקות ראייה
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-teal-700">רכז נגישות</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          מונתה רכזת נגישות אחראית על תחום הנגישות בארגון:
        </p>
        <div className="bg-teal-50 rounded-xl p-6 space-y-3">
          <p className="font-bold text-lg">רכזת נגישות - Wellness Hub</p>
          <div className="flex items-center gap-3 text-gray-700">
            <Phone size={18} className="text-teal-600"/>
            <span>טלפון: 03-1234567</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <Mail size={18} className="text-teal-600"/>
            <span>דוא"ל: accessibility@meridianwellness.co.il</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-teal-700">משוב ובקשות</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          נשמח לקבל ממך משוב על נגישות האתר. אם נתקלת בבעיית נגישות או אם יש לך הצעות לשיפור, 
          אנא פנה אלינו:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>בטלפון: 03-1234567</li>
          <li>בדוא"ל: accessibility@meridianwellness.co.il</li>
          <li>דרך טופס יצירת הקשר באתר</li>
        </ul>
        <p className="text-sm text-gray-600">
          אנו מתחייבים לטפל בפניות בנושא נגישות בתוך 7 ימי עסקים ולספק פתרון מתאים בהקדם האפשרי.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-teal-700">מידע נוסף</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          הצהרת נגישות זו עודכנה לאחרונה בתאריך: 12 בפברואר 2026
        </p>
        <p className="text-gray-700 leading-relaxed">
          אנו ממשיכים לעבוד על שיפור הנגישות של האתר והאפליקציה, ומבצעים בדיקות תקופתיות 
          כדי להבטיח עמידה בתקנים הנדרשים.
        </p>
      </div>

      <div className="text-center">
        <Link to={createPageUrl("Landing")}>
          <Button className="bg-teal-600 hover:bg-teal-700 rounded-xl px-8">
            חזרה לדף הבית
          </Button>
        </Link>
      </div>
    </div>
  );
}