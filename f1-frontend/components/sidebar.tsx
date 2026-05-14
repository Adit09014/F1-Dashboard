"use client";

import {
  Home,
  Trophy,
  Flag,
  Calendar,
  Timer,
  BarChart3,
  Users,
  Settings,
} from "lucide-react";

import Image from "next/image";

const menuItems = [
  {
    title: "Home",
    icon: Home,
  },
  {
    title: "Live Results",
    icon: Timer,
  },
  {
    title: "Driver Standings",
    icon: Trophy,
  },
  {
    title: "Constructor Standings",
    icon: Users,
  },
  {
    title: "Race Calendar",
    icon: Calendar,
  },
  {
    title: "Circuits",
    icon: Flag,
  },
  {
    title: "Analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-[280px] flex-col border-r border-white/10 bg-[#0B0D17] px-5 py-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Image src="/F1.svg.png" width={50} height={50} alt="F1-Logo" />

        <div>
          <h1 className="text-xl font-bold tracking-wide text-white">
            F1 Analytics
          </h1>

          <p className="text-xs text-gray-400">Live Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-10 flex flex-col gap-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <button
              key={index}
              className={`group flex items-center gap-4 rounded-2xl px-4 py-3 transition-all ${
                index === 0
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                size={20}
                className="transition-transform group-hover:scale-110"
              />

              <span className="text-sm font-medium">{item.title}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Card */}
      <div className="mt-auto rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
        <p className="text-sm text-red-300">Current Session</p>

        <h3 className="mt-2 text-xl font-bold text-white">Monaco GP</h3>

        <p className="mt-1 text-sm text-gray-300">Lap 42 / 78</p>

        <button className="mt-5 w-full rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600">
          View Live Race
        </button>
      </div>
    </aside>
  );
}
