import React, { useEffect } from 'react';
import { AnimatePresence } from "framer-motion";

import Navbar from './components/Navbar';

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from './store/useAuthStore';
import { Toaster } from "react-hot-toast";
import PageWrapper from './components/PageWrapper';

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();

  useEffect(() => {
    checkAuth()
  }, [checkAuth]);

  if(isCheckingAuth && !authUser)
    return (
    <div className="flex items-center justify-center h-screen">
      <span className="loading loading-dots loading-xl"></span>
    </div>
    );

  return (
    <div> 
      <AnimatePresence mode="wait">
        <Routes>
          <Route path='/' element={<PageWrapper> {authUser ? <HomePage/> : <Navigate to="/login"/>} </PageWrapper>} />
          <Route path='/signup' element={<PageWrapper> {!authUser ? <SignUpPage/> : <Navigate to="/"/>} </PageWrapper>} />
          <Route path='/login' element={<PageWrapper> {!authUser ? <LoginPage/> : <Navigate to="/"/>} </PageWrapper>} />
          <Route path='/profile' element={<PageWrapper> {authUser ? <ProfilePage/> : <Navigate to="/login"/>} </PageWrapper>} />
        </Routes>
      </AnimatePresence>

      <Toaster/>
    </div>
  )
}

export default App
