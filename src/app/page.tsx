"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { useEffect, useState } from "react"
import { BriefcaseIcon, SearchIcon, StarIcon, UsersIcon, GlobeIcon } from "lucide-react"

// Particle component for background effect
const Particle = ({ delay = 0 }) => {
  const randomSize = Math.random() * 4 + 2
  const randomDuration = Math.random() * 20 + 10

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
        repeat: Number.POSITIVE_INFINITY,
        delay: delay,
        ease: "linear",
      }}
    />
  )
}

export default function HomePage() {
  const { scrollY } = useScroll()
  const [particles, setParticles] = useState<number[]>([])

  useEffect(() => {
    setParticles(Array.from({ length: 50 }, (_, i) => i))
  }, [])

  const yBg = useTransform(scrollY, [0, 300], [0, 100])
  const springYBg = useSpring(yBg, { stiffness: 100, damping: 30 })
  const backgroundY = useTransform(springYBg, (value) => `${value}%`)

  const features = [
    { icon: BriefcaseIcon, text: "1000+ Job Opportunities" },
    { icon: SearchIcon, text: "Smart Job Matching" },
    { icon: StarIcon, text: "Top Companies" },
  ]

  const recruiterFeatures = [
    { icon: UsersIcon, text: "Find Top Talent Easily" },
    { icon: GlobeIcon, text: "Global Reach for Hiring" },
    { icon: BriefcaseIcon, text: "Streamlined Recruitment" },
  ]

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
            backgroundImage: "radial-gradient(circle at center, #dbeafe 0%, transparent 70%)",
            y: backgroundY,
          }}
        />

        <div className="mx-auto max-w-7xl py-32 sm:py-48 lg:py-56">
          <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2">
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
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    className="mr-2"
                  >
                    ✨
                  </motion.span>
                  Connecting talent with opportunity
                </span>
              </motion.div>

              {/* Main Heading with Gradient */}
              <motion.h1
                className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                Your Career Journey Starts Here
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="mt-6 text-lg leading-8 text-gray-600"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Whether you&apos;re a job seeker looking for your next big opportunity or a recruiter searching for top
                talent, our platform makes the process simple, efficient, and rewarding.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/jobs">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Find Jobs
                    </Button>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/signup">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Post a Job
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* Hero Image */}
            <motion.div
              className="mt-16 lg:mt-0 lg:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Image
                src="/job_portal_about.svg?height=400&width=600"
                alt="Job seekers and recruiters connecting"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl"
              />
            </motion.div>
          </div>

          {/* Feature Cards */}
          <motion.div
            className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {[...features, ...recruiterFeatures].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
              >
                <feature.icon className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.text}</h3>
                <p className="text-sm text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua.
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Testimonial Section */}
          <motion.div
            className="mt-32 bg-blue-50 rounded-2xl p-8 lg:p-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">What Our Users Say</h2>
              <blockquote className="text-xl italic text-gray-700">
                "This platform has revolutionized our hiring process. We&apos;ve found amazing talent and reduced our
                time-to-hire significantly!"
              </blockquote>
              <div className="mt-4">
                <p className="font-semibold text-gray-900">Jane Doe</p>
                <p className="text-sm text-gray-600">HR Manager, Tech Innovators Inc.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

