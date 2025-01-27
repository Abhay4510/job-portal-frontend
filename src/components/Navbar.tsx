"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut } from 'lucide-react';
import { BriefcaseIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

const navItemVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
};

const mobileMenuVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.3,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      when: 'afterChildren',
    },
  },
};

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Use our AuthContext here
  const { user, role, logout } = useAuth();

  // If user is not null, we consider them "logged in"
  const isLoggedIn = !!user;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <motion.nav
      className="bg-white shadow-lg sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <motion.div
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center">
              <BriefcaseIcon className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                JobPortal
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/*
             If user is logged in, show relevant links
             Otherwise, show login/sign up
            */}
            {isLoggedIn ? (
              <>
                {/* Always show Jobs */}
                <motion.div
                  custom={0}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/jobs"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                  >
                    Jobs
                  </Link>
                </motion.div>

                {/* Show Post Job if role is 'recruiter' */}
                {role === 'recruiter' && (
                  <motion.div
                    custom={1}
                    variants={navItemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/post-job"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                    >
                      Post Job
                    </Link>
                  </motion.div>
                )}

                {/* Show Profile link */}
                <motion.div
                  custom={2}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/profile"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                  >
                    Profile
                  </Link>
                </motion.div>

                {/* Logout button */}
                <motion.div
                  custom={3}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-blue-600"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </Button>
                </motion.div>
              </>
            ) : (
              // Not logged in: show Login & Sign Up
              <>
                <motion.div
                  custom={0}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div
                  custom={1}
                  variants={navItemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/signup"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <motion.div className="md:hidden flex items-center" whileTap={{ scale: 0.9 }}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90 }}
                    animate={{ rotate: 0 }}
                    exit={{ rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {isLoggedIn ? (
                <>
                  <motion.div variants={navItemVariants}>
                    <Link
                      href="/jobs"
                      className="block px-3 py-2 rounded-md text-gray-700 hover:text-blue-600"
                    >
                      Jobs
                    </Link>
                  </motion.div>
                  {role === 'recruiter' && (
                    <motion.div variants={navItemVariants}>
                      <Link
                        href="/post-job"
                        className="block px-3 py-2 rounded-md text-gray-700 hover:text-blue-600"
                      >
                        Post Job
                      </Link>
                    </motion.div>
                  )}
                  <motion.div variants={navItemVariants}>
                    <Link
                      href="/profile"
                      className="block px-3 py-2 rounded-md text-gray-700 hover:text-blue-600"
                    >
                      Profile
                    </Link>
                  </motion.div>
                  <motion.button
                    variants={navItemVariants}
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-gray-700 hover:text-blue-600"
                  >
                    Logout
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.div variants={navItemVariants}>
                    <Link
                      href="/login"
                      className="block px-3 py-2 rounded-md text-gray-700 hover:text-blue-600"
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div variants={navItemVariants}>
                    <Link
                      href="/signup"
                      className="block px-3 py-2 rounded-md text-gray-700 hover:text-blue-600"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}