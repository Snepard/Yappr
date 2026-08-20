import React, { useEffect } from 'react';
import { AnimatePresence } from "framer-motion";

import Navbar from './components/Navbar';

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import { Toaster } from "react-hot-toast";
import PageWrapper from './components/PageWrapper';
import DeleteMessageAnimation from './components/DeleteMessageAnimation';
import PinRecoveryModal from './components/PinRecoveryModal';
import PinSetupModal from './components/PinSetupModal';

const App = () => {
  const authUser = useAuthStore((state) => state.authUser);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
  const initTheme = useThemeStore((state) => state.initTheme);
  const location = useLocation();

  useEffect(() => {
    checkAuth();
    initTheme();
  }, [checkAuth, initTheme]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <span className="loading loading-dots loading-xl text-sky-400"></span>
      </div>
    );
  }

  return (
    <div> 
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path='/' element={<PageWrapper> {authUser ? <HomePage/> : <Navigate to="/login"/>} </PageWrapper>} />
          <Route path='/signup' element={<PageWrapper> {!authUser ? <SignUpPage/> : <Navigate to="/"/>} </PageWrapper>} />
          <Route path='/login' element={<PageWrapper> {!authUser ? <LoginPage/> : <Navigate to="/"/>} </PageWrapper>} />
          <Route path='/forgot-password' element={<PageWrapper> {!authUser ? <ForgotPasswordPage/> : <Navigate to="/"/>} </PageWrapper>} />
          <Route path='/reset-password/:token' element={<PageWrapper> {!authUser ? <ResetPasswordPage/> : <Navigate to="/"/>} </PageWrapper>} />
          <Route path='/profile' element={<PageWrapper> {authUser ? <ProfilePage/> : <Navigate to="/login"/>} </PageWrapper>} />
        </Routes>
      </AnimatePresence>

      <PinRecoveryModal />
      <PinSetupModal />

      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerStyle={{ top: 20 }}
        toastOptions={{
          className: 'text-sm font-medium rounded-xl shadow-lg border border-slate-200/80 backdrop-blur-md',
          duration: 3000,
        }}
      />
      <DeleteMessageAnimation />
    </div>
  );
};

export default App;
