import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Phone, Mail, MessageCircle, HelpCircle, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Support() {
  const faqs = [
    {
      q: "איך אני מוצא מטפל?",
      a: "השתמש בשדה החיפוש בדף הבית או עבור לעמוד 'מצא מטפל'. ניתן לסנן לפי תחום, אזור גיאוגרפי, דירוג ועוד."
    },
    {
      q: "איך אני מבטל תור?",
      a: "היכנס ל'התורים שלי', בחר את התור שברצונך לבטל ולחץ על 'ביטול תור'. שים לב למדיניות הביטול של המטפל."
    },
    {
      q: "האם השירות חינם?",
      a: "הרישום והשימוש בפלטפורמה חינמיים לחלוטין. תשלום מבוצע רק עבור תורים, קורסים או מוצרים שנרכשים."
    },
    {
      q: "איך אני מתקין את האפליקציה?",
      a: "לחץ על כפתור 'התקן את האפליקציה' בדף הבית. האפליקציה תיוסף למסך הבית שלך לגישה מהירה."
    },
    {
      q: "האם המידע שלי מאובטח?",
      a: "כן, אנו משתמשים בטכנולוגיות הצפנה מתקדמות ומקפידים על הגנת הפרטיות שלך בהתאם לתקנות."
    },
    {
      q: "איך אני יכול להיות מטפל בפלטפורמה?",
      a: "לחץ על 'הרשמה כמטפל' בתפריט, מלא את הפרטים הנדרשים ותעבור תהליך אישור. לאחר אישור תוכל לנהל את העמוד שלך."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4 text-gray-900 text-center">מרכז תמיכה</h1>
      <p className="text-gray-600 text-center mb-12">אנחנו כאן כדי לעזור לך</p>

      {/* Contact Methods */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg transition-all">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone size={28} className="text-teal-600"/>
          </div>
          <h3 className="font-bold text-lg mb-2">טלפון</h3>
          <p className="text-gray-600 text-sm mb-4">זמינים א'-ה' 9:00-17:00</p>
          <a href="tel:031234567" className="text-teal-600 font-semibold hover:text-teal-700">
            03-1234567
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg transition-all">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-teal-600"/>
          </div>
          <h3 className="font-bold text-lg mb-2">דוא"ל</h3>
          <p className="text-gray-600 text-sm mb-4">מענה תוך 24 שעות</p>
          <a href="mailto:support@wellnesshub.co.il" className="text-teal-600 font-semibold hover:text-teal-700">
            support@wellnesshub.co.il
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg transition-all">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={28} className="text-teal-600"/>
          </div>
          <h3 className="font-bold text-lg mb-2">WhatsApp</h3>
          <p className="text-gray-600 text-sm mb-4">תמיכה מהירה</p>
          <a href="https://wa.me/972501234567" target="_blank" rel="noreferrer" className="text-teal-600 font-semibold hover:text-teal-700">
            050-1234567
          </a>
        </div>
      </div>

      {/* Installation Instructions */}
      <div className="bg-gradient-to-l from-teal-600 to-emerald-600 rounded-2xl p-8 mb-16 text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">הוראות התקנת האפליקציה</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              📱 התקנה במכשיר iPhone/iPad
            </h3>
            <ol className="space-y-3 text-teal-50">
              <li className="flex gap-3">
                <span className="font-bold">1.</span>
                <span>פתח את האתר בדפדפן Safari</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">2.</span>
                <span>לחץ על כפתור השיתוף (מרובע עם חץ למעלה) בתחתית המסך</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">3.</span>
                <span>גלול למטה ובחר "הוסף למסך הבית" (Add to Home Screen)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">4.</span>
                <span>לחץ על "הוסף" (Add) בפינה השמאלית העליונה</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">5.</span>
                <span>האפליקציה תופיע במסך הבית שלך!</span>
              </li>
            </ol>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              📱 התקנה במכשיר Android
            </h3>
            <ol className="space-y-3 text-teal-50">
              <li className="flex gap-3">
                <span className="font-bold">1.</span>
                <span>פתח את האתר בדפדפן Chrome</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">2.</span>
                <span>לחץ על תפריט הדפדפן (שלוש נקודות ⋮) בפינה השמאלית העליונה</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">3.</span>
                <span>בחר "התקן אפליקציה" (Install app) או "הוסף למסך הבית"</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">4.</span>
                <span>לחץ על "התקן" (Install) בחלון הקופץ</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">5.</span>
                <span>האפליקציה תופיע במסך הבית ובמגירת האפליקציות!</span>
              </li>
            </ol>
          </div>
        </div>

        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            💻 התקנה במחשב (Windows/Mac)
          </h3>
          <ol className="space-y-3 text-teal-50">
            <li className="flex gap-3">
              <span className="font-bold">1.</span>
              <span>פתח את האתר בדפדפן Chrome, Edge או Brave</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">2.</span>
              <span>חפש את אייקון ההתקנה (➕ או ⬇) בשורת הכתובת, בדרך כלל בצד ימין</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">3.</span>
              <span>לחץ על האייקון ובחר "התקן" (Install)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold">4.</span>
              <span>האפליקציה תיפתח בחלון נפרד ותתווסף לתפריט התחל/Applications</span>
            </li>
          </ol>
          <p className="mt-4 text-sm text-teal-100">
            💡 טיפ: לאחר ההתקנה, האפליקציה תפעל כמו אפליקציה רגילה, עם אייקון משלה וללא שורת כתובת של דפדפן.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-gray-900 text-center">שאלות נפוצות</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <HelpCircle size={20} className="text-teal-600"/>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{faq.q}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Resources */}
      <div className="bg-gray-50 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">צריך עזרה נוספת?</h2>
        <p className="text-gray-600 mb-6">
          צוות התמיכה שלנו כאן בשבילך. אל תהסס לפנות אלינו בכל שאלה או בעיה.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to={createPageUrl("Accessibility")}>
            <Button variant="outline" className="rounded-xl">
              <FileText size={16} className="ml-2"/> הצהרת נגישות
            </Button>
          </Link>
          <Link to={createPageUrl("Landing")}>
            <Button className="bg-teal-600 hover:bg-teal-700 rounded-xl">
              חזרה לדף הבית
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}