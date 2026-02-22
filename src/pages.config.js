/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIAdvisor from './pages/AIAdvisor';
import AIHealthAdvisor from './pages/AIHealthAdvisor';
import Accessibility from './pages/Accessibility';
import AdminAppointments from './pages/AdminAppointments';
import AdminApprovals from './pages/AdminApprovals';
import AdminBulletin from './pages/AdminBulletin';
import AdminCRM from './pages/AdminCRM';
import AdminCampaigns from './pages/AdminCampaigns';
import AdminDashboard from './pages/AdminDashboard';
import AdminInspirations from './pages/AdminInspirations';
import AdminNotifications from './pages/AdminNotifications';
import AdminOrders from './pages/AdminOrders';
import AdminPayments from './pages/AdminPayments';
import AdminProducts from './pages/AdminProducts';
import AdminPromotions from './pages/AdminPromotions';
import AdminTherapists from './pages/AdminTherapists';
import AdminUserContent from './pages/AdminUserContent';
import AdminWebinars from './pages/AdminWebinars';
import AdminWeeklyPush from './pages/AdminWeeklyPush';
import AppHome from './pages/AppHome';
import Blog from './pages/Blog';
import BookAppointment from './pages/BookAppointment';
import BulletinBoard from './pages/BulletinBoard';
import ClientPortal from './pages/ClientPortal';
import Diary from './pages/Diary';
import Exercises from './pages/Exercises';
import HealthNews from './pages/HealthNews';
import HealthTracker from './pages/HealthTracker';
import Inspirations from './pages/Inspirations';
import Landing from './pages/Landing';
import MiniSite from './pages/MiniSite';
import Music from './pages/Music';
import MyAccount from './pages/MyAccount';
import MyAppointments from './pages/MyAppointments';
import MyChat from './pages/MyChat';
import MyFavorites from './pages/MyFavorites';
import MyOrders from './pages/MyOrders';
import Podcasts from './pages/Podcasts';
import Recipes from './pages/Recipes';
import Shop from './pages/Shop';
import SubmitContent from './pages/SubmitContent';
import Support from './pages/Support';
import ThankYou from './pages/ThankYou';
import TherapistAIWriter from './pages/TherapistAIWriter';
import TherapistApp from './pages/TherapistApp';
import TherapistAppointments from './pages/TherapistAppointments';
import TherapistAvailability from './pages/TherapistAvailability';
import TherapistBulletin from './pages/TherapistBulletin';
import TherapistCRM from './pages/TherapistCRM';
import TherapistCalendar from './pages/TherapistCalendar';
import TherapistCampaigns from './pages/TherapistCampaigns';
import TherapistChat from './pages/TherapistChat';
import TherapistClients from './pages/TherapistClients';
import TherapistContent from './pages/TherapistContent';
import TherapistContentRecommendations from './pages/TherapistContentRecommendations';
import TherapistCoupons from './pages/TherapistCoupons';
import TherapistCourses from './pages/TherapistCourses';
import TherapistDashboard from './pages/TherapistDashboard';
import TherapistFinance from './pages/TherapistFinance';
import TherapistIntegrations from './pages/TherapistIntegrations';
import TherapistInvoices from './pages/TherapistInvoices';
import TherapistLeadBot from './pages/TherapistLeadBot';
import TherapistMiniSite from './pages/TherapistMiniSite';
import TherapistMiniSiteSettings from './pages/TherapistMiniSiteSettings';
import TherapistNewsletter from './pages/TherapistNewsletter';
import TherapistNotifications from './pages/TherapistNotifications';
import TherapistOnboarding from './pages/TherapistOnboarding';
import TherapistPayments from './pages/TherapistPayments';
import TherapistPodcasts from './pages/TherapistPodcasts';
import TherapistPopups from './pages/TherapistPopups';
import TherapistPricing from './pages/TherapistPricing';
import TherapistProducts from './pages/TherapistProducts';
import TherapistProfile from './pages/TherapistProfile';
import TherapistRegister from './pages/TherapistRegister';
import TherapistReminders from './pages/TherapistReminders';
import TherapistScheduleManager from './pages/TherapistScheduleManager';
import TherapistSearch from './pages/TherapistSearch';
import TherapistServices from './pages/TherapistServices';
import TherapistTeam from './pages/TherapistTeam';
import TherapistWebinars from './pages/TherapistWebinars';
import Webinars from './pages/Webinars';
import AdminContent from './pages/AdminContent';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIAdvisor": AIAdvisor,
    "AIHealthAdvisor": AIHealthAdvisor,
    "Accessibility": Accessibility,
    "AdminAppointments": AdminAppointments,
    "AdminApprovals": AdminApprovals,
    "AdminBulletin": AdminBulletin,
    "AdminCRM": AdminCRM,
    "AdminCampaigns": AdminCampaigns,
    "AdminDashboard": AdminDashboard,
    "AdminInspirations": AdminInspirations,
    "AdminNotifications": AdminNotifications,
    "AdminOrders": AdminOrders,
    "AdminPayments": AdminPayments,
    "AdminProducts": AdminProducts,
    "AdminPromotions": AdminPromotions,
    "AdminTherapists": AdminTherapists,
    "AdminUserContent": AdminUserContent,
    "AdminWebinars": AdminWebinars,
    "AdminWeeklyPush": AdminWeeklyPush,
    "AppHome": AppHome,
    "Blog": Blog,
    "BookAppointment": BookAppointment,
    "BulletinBoard": BulletinBoard,
    "ClientPortal": ClientPortal,
    "Diary": Diary,
    "Exercises": Exercises,
    "HealthNews": HealthNews,
    "HealthTracker": HealthTracker,
    "Inspirations": Inspirations,
    "Landing": Landing,
    "MiniSite": MiniSite,
    "Music": Music,
    "MyAccount": MyAccount,
    "MyAppointments": MyAppointments,
    "MyChat": MyChat,
    "MyFavorites": MyFavorites,
    "MyOrders": MyOrders,
    "Podcasts": Podcasts,
    "Recipes": Recipes,
    "Shop": Shop,
    "SubmitContent": SubmitContent,
    "Support": Support,
    "ThankYou": ThankYou,
    "TherapistAIWriter": TherapistAIWriter,
    "TherapistApp": TherapistApp,
    "TherapistAppointments": TherapistAppointments,
    "TherapistAvailability": TherapistAvailability,
    "TherapistBulletin": TherapistBulletin,
    "TherapistCRM": TherapistCRM,
    "TherapistCalendar": TherapistCalendar,
    "TherapistCampaigns": TherapistCampaigns,
    "TherapistChat": TherapistChat,
    "TherapistClients": TherapistClients,
    "TherapistContent": TherapistContent,
    "TherapistContentRecommendations": TherapistContentRecommendations,
    "TherapistCoupons": TherapistCoupons,
    "TherapistCourses": TherapistCourses,
    "TherapistDashboard": TherapistDashboard,
    "TherapistFinance": TherapistFinance,
    "TherapistIntegrations": TherapistIntegrations,
    "TherapistInvoices": TherapistInvoices,
    "TherapistLeadBot": TherapistLeadBot,
    "TherapistMiniSite": TherapistMiniSite,
    "TherapistMiniSiteSettings": TherapistMiniSiteSettings,
    "TherapistNewsletter": TherapistNewsletter,
    "TherapistNotifications": TherapistNotifications,
    "TherapistOnboarding": TherapistOnboarding,
    "TherapistPayments": TherapistPayments,
    "TherapistPodcasts": TherapistPodcasts,
    "TherapistPopups": TherapistPopups,
    "TherapistPricing": TherapistPricing,
    "TherapistProducts": TherapistProducts,
    "TherapistProfile": TherapistProfile,
    "TherapistRegister": TherapistRegister,
    "TherapistReminders": TherapistReminders,
    "TherapistScheduleManager": TherapistScheduleManager,
    "TherapistSearch": TherapistSearch,
    "TherapistServices": TherapistServices,
    "TherapistTeam": TherapistTeam,
    "TherapistWebinars": TherapistWebinars,
    "Webinars": Webinars,
    "AdminContent": AdminContent,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};