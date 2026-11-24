"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { usePathname } from "next/navigation";

type AuthView = "login" | "register";

interface AuthModalContextType {
  isOpen: boolean;
  view: AuthView;
  openModal: (view?: AuthView) => void;
  closeModal: () => void;
  setView: (view: AuthView) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<AuthView>("login");
  const pathname = usePathname();

  // Close modal on navigation change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const openModal = (viewToOpen: AuthView = "login") => {
    setView(viewToOpen);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <AuthModalContext.Provider value={{ isOpen, view, openModal, closeModal, setView }}>
      {children}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Card wrapper */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-[480px] z-10"
            >
              {view === "login" ? (
                <LoginForm
                  onSwitchView={() => setView("register")}
                  onClose={closeModal}
                  onSuccess={closeModal}
                />
              ) : (
                <RegisterForm
                  onSwitchView={() => setView("login")}
                  onClose={closeModal}
                  onSuccess={closeModal}
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
