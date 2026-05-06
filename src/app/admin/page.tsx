"use client";

import React, { useEffect, useState } from "react";
import { fetchAdminStats, AdminStats } from "@/services/adminService";
import { motion } from "framer-motion";
import { Users, UserCheck, Activity, BarChart3, PieChart, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";

// Allowed admin emails
const ADMIN_EMAILS = ["emotion.tuii@gmail.com", "admin@upskillwithfuii.com"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email && ADMIN_EMAILS.includes(user.email)) {
        setIsAdmin(true);
        try {
          const data = await fetchAdminStats();
          setStats(data);
        } catch (err) {
          console.error("Failed to load stats:", err);
          setError("เกิดข้อผิดพลาดในการโหลดข้อมูล กรุณาลองใหม่อีกครั้ง");
        } finally {
          setLoading(false);
        }
      } else {
        router.push("/"); // Redirect non-admins to home
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-red-500">
        <ShieldAlert size={48} className="mr-4" />
        <p className="text-xl">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  // Find the most used tool
  const toolEntries = Object.entries(stats.toolUsages);
  const maxUsage = Math.max(...toolEntries.map(([_, val]) => val));
  const mostUsedTools = toolEntries.filter(([_, val]) => val === maxUsage).map(([key]) => key);

  const toolNames: Record<string, string> = {
    disc: "DISC Assessment",
    moneyAvatar: "Money Avatar",
    wheelOfLife: "Wheel of Life",
    aiMentorChats: "AI Mentor (Chats)",
    libraryReads: "Library of Souls",
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Admin Dashboard
            </h1>
            <p className="text-neutral-400 mt-2">ภาพรวมการใช้งานของผู้ใช้ทั้งหมด</p>
          </div>
          <div className="bg-neutral-800/50 px-4 py-2 rounded-full border border-neutral-700/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium text-neutral-300">ระบบทำงานปกติ</span>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="ผู้ใช้งานทั้งหมด" 
            value={stats.totalUsers} 
            icon={<Users className="text-indigo-400" size={24} />} 
            gradient="from-indigo-500/20 to-blue-500/5"
            borderColor="border-indigo-500/20"
          />
          <StatCard 
            title="ผู้ใช้ที่กลับมาใช้งานซ้ำ (Returning)" 
            value={stats.returningUsers} 
            subtitle={`${((stats.returningUsers / Math.max(1, stats.totalUsers)) * 100).toFixed(1)}% ของทั้งหมด`}
            icon={<UserCheck className="text-emerald-400" size={24} />} 
            gradient="from-emerald-500/20 to-teal-500/5"
            borderColor="border-emerald-500/20"
          />
          <StatCard 
            title="ผู้ใช้ที่แอคทีฟ (7 วันล่าสุด)" 
            value={stats.activeUsers} 
            icon={<Activity className="text-rose-400" size={24} />} 
            gradient="from-rose-500/20 to-orange-500/5"
            borderColor="border-rose-500/20"
          />
        </div>

        {/* Tool Usage Section */}
        <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <BarChart3 className="text-purple-400" size={24} />
            </div>
            <h2 className="text-2xl font-semibold">ความนิยมของฟังก์ชันต่างๆ</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {toolEntries
                .sort((a, b) => b[1] - a[1])
                .map(([key, value], index) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neutral-300 font-medium flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-neutral-700 text-neutral-400'}`}>
                          {index + 1}
                        </span>
                        {toolNames[key] || key}
                      </span>
                      <span className="text-white font-semibold">{value} ครั้ง</span>
                    </div>
                    <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(value / Math.max(1, maxUsage)) * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${index === 0 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                      />
                    </div>
                  </div>
              ))}
            </div>

            <div className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-800 flex flex-col justify-center items-center text-center space-y-4">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-2">
                <PieChart className="text-amber-400" size={40} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-neutral-400">ฟังก์ชันที่คนใช้เยอะที่สุด</h3>
                <p className="text-3xl font-bold text-amber-400 mt-2">
                  {mostUsedTools.map(t => toolNames[t] || t).join(", ")}
                </p>
                <p className="text-neutral-500 mt-2">
                  ได้รับการเรียกใช้งานทั้งหมด {maxUsage} ครั้ง
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Users Section */}
        <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="text-blue-400" size={24} />
            </div>
            <h2 className="text-2xl font-semibold">รายชื่อผู้ใช้งานที่มีส่วนร่วมสูงสุด (Top 50 Users by XP)</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-neutral-900/80 text-neutral-400">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">อันดับ</th>
                  <th className="px-4 py-3">ชื่อ</th>
                  <th className="px-4 py-3">อีเมล</th>
                  <th className="px-4 py-3">XP ทั้งหมด</th>
                  <th className="px-4 py-3">เข้าสู่ระบบล่าสุด</th>
                  <th className="px-4 py-3 rounded-tr-lg">สถานะ Returning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {(stats.topUsers || []).map((user, idx) => (
                  <tr key={user.id} className="hover:bg-neutral-800/60 transition-colors">
                    <td className="px-4 py-4 font-medium text-neutral-300">#{idx + 1}</td>
                    <td className="px-4 py-4 text-white">{user.name}</td>
                    <td className="px-4 py-4 text-neutral-400">{user.email}</td>
                    <td className="px-4 py-4">
                      <span className="bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md font-semibold">
                        {user.totalXP} XP
                      </span>
                    </td>
                    <td className="px-4 py-4 text-neutral-400">{user.lastLoginAt}</td>
                    <td className="px-4 py-4">
                      {user.isReturning ? (
                        <span className="text-emerald-400 flex items-center gap-1"><UserCheck size={14} /> Returning</span>
                      ) : (
                        <span className="text-neutral-500">New User</span>
                      )}
                    </td>
                  </tr>
                ))}
                {(!stats.topUsers || stats.topUsers.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                      ไม่พบข้อมูลผู้ใช้งาน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, gradient, borderColor }: { title: string, value: number, subtitle?: string, icon: React.ReactNode, gradient: string, borderColor: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${gradient} border ${borderColor} rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between h-full`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-neutral-300 font-medium text-sm md:text-base">{title}</h3>
        <div className="p-2 bg-neutral-900/50 rounded-xl">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-4xl md:text-5xl font-bold text-white tracking-tight">{value}</div>
        {subtitle && <div className="text-neutral-400 text-sm mt-2">{subtitle}</div>}
      </div>
    </motion.div>
  );
}
