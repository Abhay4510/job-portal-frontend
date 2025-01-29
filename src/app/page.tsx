"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { BriefcaseIcon, SearchIcon, StarIcon, UsersIcon, GlobeIcon } from "lucide-react";

// Particle component for background effect
const Particle = ({ delay = 0 }) => {
  const randomSize = Math.random() * 4 + 2;
  const randomDuration = Math.random() * 20 + 10;

  return (
    <motion.div
      className="absolute rounded-full bg-blue-400/20"
      style={{
        width: randomSize,
        height: randomSize,
        left: `${Math.random() * 100}%`,
        top: -10,
      }}
      animate={{
        y: ["0vh", "100vh"],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        delay: delay,
        ease: "linear",
      }}
    />
  );
};

export default function HomePage() {
  const { scrollY } = useScroll();
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 50 }, (_, i) => i));
  }, []);

  const yBg = useTransform(scrollY, [0, 300], [0, 100]);
  const springYBg = useSpring(yBg, { stiffness: 100, damping: 30 });
  const backgroundY = useTransform(springYBg, (value) => `${value}%`);

  const features = [
    { icon: BriefcaseIcon, text: "1000+ Job Opportunities" },
    { icon: SearchIcon, text: "Smart Job Matching" },
    { icon: StarIcon, text: "Top Companies" },
  ];

  const recruiterFeatures = [
    { icon: UsersIcon, text: "Find Top Talent Easily" },
    { icon: GlobeIcon, text: "Global Reach for Hiring" },
    { icon: BriefcaseIcon, text: "Streamlined Recruitment Process" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 overflow-hidden">
      {/* Particle Background */}
      <div className="fixed inset-0 pointer-events-none">
        {particles.map((_, i) => (
          <Particle key={i} delay={i * 0.2} />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <motion.div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, #dbeafe 0%, transparent 70%)",
            y: backgroundY,
          }}
        />

        <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            {/* Animated Badge */}
            <motion.div
              className="mb-8 inline-block"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="mr-2"
                >
                  ✨
                </motion.span>
                Connecting recruiters and job seekers seamlessly
              </span>
            </motion.div>

            {/* Main Heading with Gradient */}
            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              The Perfect Platform for Recruiters & Job Seekers
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="mt-6 text-lg leading-8 text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Whether you&apos;re hiring talent or searching for your next opportunity, we make the process simple, efficient, and rewarding.
            </motion.p>

            {/* Feature Cards */}
            <motion.div
              className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[...features, ...recruiterFeatures].map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.2 }}
                >
                  <feature.icon className="h-6 w-6 text-blue-600 mb-2 mx-auto" />
                  <p className="text-sm font-medium text-gray-700">{feature.text}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="mt-10 flex items-center justify-center gap-x-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/jobs">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Browse Jobs
                  </Button>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/signup">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Sign Up Now
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
