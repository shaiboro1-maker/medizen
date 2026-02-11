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
import Landing from './pages/Landing';
import TherapistSearch from './pages/TherapistSearch';
import TherapistProfile from './pages/TherapistProfile';
import BookAppointment from './pages/BookAppointment';
import Exercises from './pages/Exercises';
import Recipes from './pages/Recipes';
import Shop from './pages/Shop';
import Webinars from './pages/Webinars';
import Podcasts from './pages/Podcasts';
import BulletinBoard from './pages/BulletinBoard';
import MyAppointments from './pages/MyAppointments';
import MyAccount from './pages/MyAccount';
import MyFavorites from './pages/MyFavorites';
import MyOrders from './pages/MyOrders';
import TherapistRegister from './pages/TherapistRegister';
import TherapistDashboard from './pages/TherapistDashboard';
import TherapistAppointments from './pages/TherapistAppointments';
import TherapistServices from './pages/TherapistServices';
import TherapistAvailability from './pages/TherapistAvailability';
import TherapistClients from './pages/TherapistClients';
import TherapistContent from './pages/TherapistContent';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Landing": Landing,
    "TherapistSearch": TherapistSearch,
    "TherapistProfile": TherapistProfile,
    "BookAppointment": BookAppointment,
    "Exercises": Exercises,
    "Recipes": Recipes,
    "Shop": Shop,
    "Webinars": Webinars,
    "Podcasts": Podcasts,
    "BulletinBoard": BulletinBoard,
    "MyAppointments": MyAppointments,
    "MyAccount": MyAccount,
    "MyFavorites": MyFavorites,
    "MyOrders": MyOrders,
    "TherapistRegister": TherapistRegister,
    "TherapistDashboard": TherapistDashboard,
    "TherapistAppointments": TherapistAppointments,
    "TherapistServices": TherapistServices,
    "TherapistAvailability": TherapistAvailability,
    "TherapistClients": TherapistClients,
    "TherapistContent": TherapistContent,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};