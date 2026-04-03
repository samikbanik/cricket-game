import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { componentDefs, type ComponentDef } from "@/lib/componentDefs";
import ComponentStage from "@/components/ComponentStage";
import {
  ChevronRight,
  Layers,
  Zap,
  Menu,
  X,
  Gamepad2,
} from "lucide-react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663318787554/D8XJLADP7qtfVyMbk3Yvk2/hero-stadium-bg-FyPgudD6FPfy396dZcie2J.webp";
const BALL_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663318787554/D8XJLADP7qtfVyMbk3Yvk2/cricket-ball-glow-hhYMvfpsDPPMzf9VuHnS4U.webp";

const categories = [
  { id: "full", label: "Full Demo", icon: Zap },
  { id: "scoreboard", label: "Scoreboard", icon: Layers },
  { id: "controls", label: "Controls", icon: Layers },
];

export default function Home() {
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<ComponentDef>(componentDefs[0]);
  const [showExplorer, setShowExplorer] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1117]">
      {/* Hero Section */}
      {!showExplorer && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src={HERO_BG}
              alt=""
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117]/60 via-[#0d1117]/40 to-[#0d1117]" />
          </div>

          {/* Content */}
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center justify-center gap-4 mb-8">
                <img src={BALL_IMG} alt="" className="w-16 h-16 rounded-full" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-400 uppercase tracking-widest">
                    Live Demo
                  </span>
                </div>
              </div>

              <h1
                className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Cricket Game
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                  UI Explorer
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Explore every component of a cricket game interface — from scoreboards to
                power meters — built entirely with React, TypeScript, and SVG. No external
                assets required.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowExplorer(true)}
                  className="px-8 py-3.5 rounded-xl bg-emerald-500 text-white font-semibold text-base shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-colors flex items-center gap-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  Explore Components
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/play")}
                  className="px-8 py-3.5 rounded-xl bg-amber-500/90 text-white font-semibold text-base shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-colors flex items-center gap-2"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <Gamepad2 className="w-5 h-5" />
                  Play Game
                </motion.button>
              </div>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
            >
              {[
                { value: "9", label: "Components" },
                { value: "0", label: "External Assets" },
                { value: "100%", label: "React + SVG" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-2"
            >
              <div className="w-1 h-2 rounded-full bg-white/40" />
            </motion.div>
          </motion.div>
        </motion.section>
      )}

      {/* Explorer */}
      {showExplorer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex h-screen overflow-hidden"
        >
          {/* Mobile toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-gray-300"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Sidebar */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-[280px] flex-shrink-0 h-full border-r border-white/[0.06] bg-[#0d1117]/95 backdrop-blur-xl flex flex-col z-40 fixed lg:relative"
              >
                {/* Sidebar header */}
                <div className="px-5 py-5 border-b border-white/[0.06]">
                  <button
                    onClick={() => setShowExplorer(false)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-3 text-sm"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Back to Home
                  </button>
                  <h2
                    className="text-lg font-bold text-white flex items-center gap-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    <span className="text-xl">🏏</span>
                    Component Explorer
                  </h2>
                </div>

                {/* Component list */}
                <div className="flex-1 overflow-y-auto py-3">
                  {categories.map((cat) => {
                    const items = componentDefs.filter((c) => c.category === cat.id);
                    if (items.length === 0) return null;
                    return (
                      <div key={cat.id} className="mb-2">
                        <div className="px-5 py-2 flex items-center gap-2">
                          <cat.icon className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                            {cat.label}
                          </span>
                        </div>
                        {items.map((comp) => {
                          const isActive = selected.id === comp.id;
                          return (
                            <button
                              key={comp.id}
                              onClick={() => {
                                setSelected(comp);
                                if (window.innerWidth < 1024) setSidebarOpen(false);
                              }}
                              className={`w-full text-left px-5 py-2.5 flex items-center gap-3 transition-all ${
                                isActive
                                  ? "bg-emerald-500/10 border-r-2 border-emerald-400"
                                  : "hover:bg-white/[0.03]"
                              }`}
                            >
                              {isActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                              )}
                              {!isActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-600 flex-shrink-0" />
                              )}
                              <span className="mr-1.5 text-sm">{comp.icon}</span>
                              <span
                                className={`text-sm font-medium ${
                                  isActive ? "text-emerald-400" : "text-gray-400"
                                }`}
                              >
                                {comp.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* Sidebar footer */}
                <div className="px-5 py-4 border-t border-white/[0.06]">
                  <div className="text-[10px] text-gray-600 uppercase tracking-wider">
                    Built with React + TypeScript + SVG
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Main stage */}
          <main className="flex-1 overflow-hidden bg-[#0d1117]">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <ComponentStage component={selected} />
              </motion.div>
            </AnimatePresence>
          </main>
        </motion.div>
      )}
    </div>
  );
}
