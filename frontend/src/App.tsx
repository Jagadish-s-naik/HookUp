import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';
import UpgradeModal from './components/modals/UpgradeModal';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import Library from './pages/Library';
import Analytics from './pages/Analytics';
import Account from './pages/Account';
import Onboarding from './pages/Onboarding';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import Affiliate from './pages/Affiliate';
import Calendar from './pages/Calendar';
import CaptionWriter from './pages/CaptionWriter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return <div style={{color: 'black', padding: '20px'}}><h1>Hello World</h1></div>;
}

export default App;
