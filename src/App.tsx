/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDocFromServer } from "firebase/firestore";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import ResetPasswordForm from "./components/Auth/ResetPasswordForm";
import VerifyEmail from "./components/Auth/VerifyEmail";
import Dashboard from "./components/Dashboard/Dashboard";
import Layout from "./components/Layout/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import { motion, AnimatePresence } from "motion/react";

type AuthView = "login" | "register" | "reset";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<AuthView>("login");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Test connection to Firestore as per guidelines
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    };
    testConnection();

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Initializing AuthDash</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Layout user={user}>
        <AnimatePresence mode="wait">
          {user ? (
            user.emailVerified ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard user={user} />
              </motion.div>
            ) : (
              <motion.div
                key="verify-email"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center items-center min-h-[calc(100vh-12rem)]"
              >
                <VerifyEmail />
              </motion.div>
            )
          ) : (
            <motion.div
              key={authView}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center items-center min-h-[calc(100vh-12rem)]"
            >
              {authView === "login" && (
                <LoginForm
                  onSwitchToRegister={() => setAuthView("register")}
                  onSwitchToReset={() => setAuthView("reset")}
                />
              )}
              {authView === "register" && (
                <RegisterForm onSwitchToLogin={() => setAuthView("login")} />
              )}
              {authView === "reset" && (
                <ResetPasswordForm onSwitchToLogin={() => setAuthView("login")} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Layout>
    </ErrorBoundary>
  );
}
