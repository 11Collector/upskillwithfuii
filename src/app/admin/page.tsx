"use client";

import React, { useEffect, useState } from "react";
import { fetchAdminStats, AdminStats } from "@/services/adminService";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  Activity,
  BarChart3,
  PieChart,
  ShieldAlert,
  ArrowUpDown,
  BookOpen,
  Copy,
  Check,
  TrendingUp,
  Zap,
  Award
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/lib/firebase";
import { results as LIBRARY_SOULS_RESULTS } from "@/data/librarySoulsResults";
import { legacyWheelLeads } from "@/data/legacyWheelLeads";

// ChartJS Imports
import { Bar, Doughnut, Line, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS Components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

// Global ChartJS defaults configuration for styling
ChartJS.defaults.color = "#9ca3af";
ChartJS.defaults.font.family = "system-ui, -apple-system, sans-serif";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").filter(Boolean);

const aiFeatureNames: Record<string, string> = {
  ai_mentor: "คุยกับพี่ฟุ้ย (AI Chat)",
  book_match: "Book recommendation",
  quote_generation: "Khom Sat Sat (Quotes)",
};

const toolNames: Record<string, string> = {
  disc: "DISC Assessment",
  moneyAvatar: "Money Avatar",
  wheelOfLife: "Wheel of Life",
  aiMentorChats: "คุยกับพี่ฟุ้ย (Chats)",
  libraryReads: "Library of Souls",
};

const discLabels: Record<string, string> = {
  D: "D - เดอะแบกสายบวก (กระทิง)",
  I: "I - หัวหน้าฝ่ายเอนเตอร์เทน (นกอินทรี)",
  S: "S - ผู้ประสานสิบทิศ (หนู)",
  C: "C - นักวิเคราะห์จอมเนี๊ยบ (หมี)"
};

const discColors: Record<string, string> = {
  D: "bg-red-500",
  I: "bg-orange-500",
  S: "bg-emerald-500",
  C: "bg-blue-500"
};

const moneyLabels: Record<string, string> = {
  HIGH_RISK_HIGH_DISC: "🐺 หมาป่า (เซียนระบบสุดตึง)",
  MID_RISK_HIGH_DISC: "🐜 มด (นักปั้นพอร์ตมือฉมัง)",
  LOW_RISK_HIGH_DISC: "🐌 หอยทาก (ผู้พิทักษ์เงินต้น)",
  HIGH_RISK_MID_DISC: "🐒 ลิง (ล่าเทรนด์ติดดอย)",
  MID_RISK_MID_DISC: "🦦 คาปิบารา (สุดสมดุล)",
  LOW_RISK_MID_DISC: "🐢 เต่า (สายโคตรเซฟโซน)",
  HIGH_RISK_LOW_DISC: "🔥 ฟีนิกซ์ (ดมกาวสุดกราฟ)",
  MID_RISK_LOW_DISC: "🦚 นกยูง (ตัวตึงสายเปย์)",
  LOW_RISK_LOW_DISC: "🦌 กวาง (ผู้ประสบภัย)"
};

const ghostLabels: Record<string, string> = {
  kaonashi: "👻 ไร้หน้า ไร้ขอบเขต",
  vampire: "🧛 เคาท์จอมดองงาน",
  mummy: "🧟 มัมมี่หวั่นสายตา",
  kasa: "☂️ ร่มสามตาจอมวิตก",
  kongkoi: "🏃 กองกอยจอม FOMO",
  headless: "🫀 ผีจอมโอเค",
  pixel: "🔍 พิกเซลจอมด้อยค่า",
  guardian: "🏺 ผีเฝ้าของเดิม"
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [sortBy, setSortBy] = useState<"xp" | "newest">("xp");
  const [copied, setCopied] = useState(false);
  const [activeLeadTab, setActiveLeadTab] = useState<"ebook" | "legacyWheel">("ebook");
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

  // 1. Tool usage calculations (existing)
  const toolEntries = Object.entries(stats.toolUsages);
  const maxUsage = Math.max(...toolEntries.map(([_, val]) => val));
  const mostUsedTools = toolEntries.filter(([_, val]) => val === maxUsage).map(([key]) => key);

  // 2. Chart: Quest Completion Trend (Line)
  const questTrendLabels = stats.questCompletionsTrend.map(t => {
    const parts = t.date.split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : t.date;
  });
  const questTrendData = {
    labels: questTrendLabels,
    datasets: [
      {
        label: "จำนวนเควสที่สำเร็จ",
        data: stats.questCompletionsTrend.map(t => t.count),
        borderColor: "rgba(139, 92, 246, 1)", // Violet 500
        backgroundColor: "rgba(139, 92, 246, 0.08)",
        borderWidth: 3,
        tension: 0.35,
        fill: true,
        pointBackgroundColor: "rgba(139, 92, 246, 1)",
        pointHoverRadius: 7,
      }
    ]
  };
  const questTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(139, 92, 246, 0.2)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.04)" },
        ticks: { color: "#9ca3af" }
      },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.04)" },
        ticks: { 
          color: "#9ca3af",
          stepSize: 1,
          precision: 0
        },
        min: 0
      }
    }
  };

  // 3. Chart: Level Distribution (Doughnut)
  const levelLabels = stats.levelDistribution.map(l => l.range);
  const levelCounts = stats.levelDistribution.map(l => l.count);
  const levelData = {
    labels: levelLabels,
    datasets: [
      {
        data: levelCounts,
        backgroundColor: [
          "rgba(148, 163, 184, 0.8)", // Slate 400
          "rgba(99, 102, 241, 0.8)",  // Indigo 500
          "rgba(16, 185, 129, 0.8)",  // Emerald 500
          "rgba(245, 158, 11, 0.8)",  // Amber 500
          "rgba(239, 68, 68, 0.8)",   // Red 500
        ],
        borderWidth: 1,
        borderColor: "rgba(15, 23, 42, 1)",
      }
    ]
  };
  const levelOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: "#9ca3af",
          padding: 16,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        padding: 12,
        cornerRadius: 12,
      }
    }
  };

  // 4. Chart: AI Feature Calls (Horizontal Bar)
  const aiLabels = Object.keys(stats.aiFeatureCalls).map(k => aiFeatureNames[k] || k);
  const aiCounts = Object.values(stats.aiFeatureCalls);
  const aiData = {
    labels: aiLabels,
    datasets: [
      {
        label: "จำนวนครั้งที่ใช้งาน",
        data: aiCounts,
        backgroundColor: [
          "rgba(99, 102, 241, 0.75)",  // Indigo
          "rgba(236, 72, 153, 0.75)",  // Pink
          "rgba(14, 165, 233, 0.75)",  // Sky
          "rgba(168, 85, 247, 0.75)",  // Purple
          "rgba(234, 179, 8, 0.75)",   // Yellow
        ],
        borderRadius: 8,
        borderWidth: 0,
      }
    ]
  };
  const aiOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        padding: 12,
        cornerRadius: 12,
      }
    },
    scales: {
      x: {
        grid: { color: "rgba(255, 255, 255, 0.04)" },
        ticks: { 
          color: "#9ca3af",
          precision: 0
        },
        min: 0
      },
      y: {
        grid: { display: false },
        ticks: { color: "#e2e8f0", font: { size: 12 } }
      }
    }
  };

  const wheelAverages = stats.wheelAverages || Array(8).fill(0);
  const wheelFocusDistribution = stats.wheelFocusDistribution || Array(8).fill(0);

  const wheelRadarData = {
    labels: [
      '❤️ สุขภาพ',
      '💎 การเงิน',
      '💼 การงาน',
      '👨‍👩‍👧‍👦 ครอบครัว',
      '💑 เพื่อนฝูง',
      '💡 พัฒนาตนเอง',
      '🧘‍♀️ จิตใจ',
      '🌏 ช่วยสังคม'
    ],
    datasets: [
      {
        label: "คะแนนเฉลี่ยความพึงพอใจ",
        data: wheelAverages,
        backgroundColor: "rgba(139, 92, 246, 0.15)",
        borderColor: "rgba(139, 92, 246, 0.75)",
        pointBackgroundColor: "rgba(139, 92, 246, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(139, 92, 246, 1)",
        borderWidth: 2,
      }
    ]
  };

  const wheelRadarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        cornerRadius: 12,
      }
    },
    scales: {
      r: {
        angleLines: { color: "rgba(255, 255, 255, 0.06)" },
        grid: { color: "rgba(255, 255, 255, 0.06)" },
        pointLabels: {
          color: "#cbd5e1",
          font: { size: 10, weight: "bold" as const }
        },
        ticks: {
          color: "#9ca3af",
          backdropColor: "transparent",
          stepSize: 2,
          min: 0,
          max: 10
        }
      }
    }
  };

  const wheelFocusAreasList = [
    { label: '❤️ สุขภาพ', count: wheelFocusDistribution[0] || 0 },
    { label: '💎 การเงิน', count: wheelFocusDistribution[1] || 0 },
    { label: '💼 การงานหรือธุรกิจ', count: wheelFocusDistribution[2] || 0 },
    { label: '👨‍👩‍👧‍👦 ครอบครัว', count: wheelFocusDistribution[3] || 0 },
    { label: '💑 ความสัมพันธ์เพื่อนฝูง', count: wheelFocusDistribution[4] || 0 },
    { label: '💡 พัฒนาตนเอง', count: wheelFocusDistribution[5] || 0 },
    { label: '🧘‍♀️ พัฒนาจิตใจ', count: wheelFocusDistribution[6] || 0 },
    { label: '🌏 ช่วยเหลือสังคม', count: wheelFocusDistribution[7] || 0 },
  ];

  const maxFocusCount = Math.max(...wheelFocusAreasList.map(item => item.count), 1);
  const totalFocusSelections = wheelFocusAreasList.reduce((acc, curr) => acc + curr.count, 0);
  const filteredGhostEntries = Object.entries(stats.ghostDistribution)
    .filter(([k]) => k !== "total")
    .sort((a, b) => b[1] - a[1]);
  const totalGhostDocs = filteredGhostEntries.reduce((acc, [_, val]) => acc + val, 0);

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Admin Dashboard
            </h1>
            <p className="text-neutral-400 mt-2 font-medium">สถิติและภาพรวมการเติบโตของผู้ใช้</p>
          </div>
          <div className="bg-neutral-800/50 px-4 py-2 rounded-full border border-neutral-700/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-semibold text-neutral-300">ระบบทำงานปกติ</span>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            title="ผู้ใช้งานทั้งหมด" 
            value={stats.totalUsers} 
            icon={<Users className="text-indigo-400" size={22} />} 
            gradient="from-indigo-500/15 to-blue-500/5"
            borderColor="border-indigo-500/20"
          />
          <StatCard 
            title="DAU (24 ชม. ล่าสุด)" 
            value={stats.dau} 
            subtitle="Daily Active Users"
            icon={<Activity className="text-rose-400" size={22} />} 
            gradient="from-rose-500/15 to-orange-500/5"
            borderColor="border-rose-500/20"
          />
          <StatCard 
            title="MAU (30 วันล่าสุด)" 
            value={stats.mau} 
            subtitle="Monthly Active Users"
            icon={<UserCheck className="text-emerald-400" size={22} />} 
            gradient="from-emerald-500/15 to-teal-500/5"
            borderColor="border-emerald-500/20"
          />
          <StatCard 
            title="Stickiness (DAU/MAU)" 
            value={`${((stats.dau / Math.max(1, stats.mau)) * 100).toFixed(1)}%`}
            subtitle="อัตราการกลับมาใช้งานซ้ำ"
            icon={<TrendingUp className="text-amber-400" size={22} />} 
            gradient="from-amber-500/15 to-yellow-500/5"
            borderColor="border-amber-500/20"
          />
        </div>

        {/* Charts Row 1: Quest Completions & Levels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Daily Quest Completions Chart */}
          <div className="md:col-span-2 bg-neutral-800/40 border border-neutral-700/50 rounded-[2rem] p-6 md:p-8 backdrop-blur-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-violet-500/20 rounded-xl">
                <Zap className="text-violet-400" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">ยอดการเคลียร์เควสรายวัน</h2>
                <p className="text-neutral-400 text-xs mt-0.5">สถิติจำนวนเควสรายวันที่ทำสำเร็จในรอบ 7 วันที่ผ่านมา</p>
              </div>
            </div>
            <div className="h-[260px] w-full">
              <Line data={questTrendData} options={questTrendOptions} />
            </div>
          </div>

          {/* Level Distribution Chart */}
          <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-[2rem] p-6 md:p-8 backdrop-blur-sm flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-amber-500/20 rounded-xl">
                <Award className="text-amber-400" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">สัดส่วนเลเวลของผู้ใช้งาน</h2>
                <p className="text-neutral-400 text-xs mt-0.5">การแบ่งสัดส่วนเลเวลของผู้ใช้ตามระดับช่วงเลเวล</p>
              </div>
            </div>
            <div className="h-[260px] w-full relative flex items-center justify-center">
              <Doughnut data={levelData} options={levelOptions} />
            </div>
          </div>
        </div>

        {/* Charts Row 2: AI Feature Usages & Assessment Popularity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* AI Feature Calls Chart */}
          <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-[2rem] p-6 md:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-sky-500/20 rounded-xl">
                <Activity className="text-sky-400" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">จำนวนครั้งที่เรียกใช้งาน AI แต่ละฟีเจอร์</h2>
                <p className="text-neutral-400 text-xs mt-0.5">รวมการเรียกใช้ AI ในระบบ (Chat, PDF Report, Quests, Quotes, Books)</p>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <Bar data={aiData} options={aiOptions} />
            </div>
          </div>

          {/* Existing: Tool Usage Section */}
          <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-[2rem] p-6 md:p-8 backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-purple-500/20 rounded-xl">
                  <BarChart3 className="text-purple-400" size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">ความนิยมของฟังก์ชันประเมิน</h2>
                  <p className="text-neutral-400 text-xs mt-0.5">ความถี่การทำแบบประเมินและทูลต่างๆ ของผู้ใช้งาน</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {toolEntries
                  .sort((a, b) => b[1] - a[1])
                  .map(([key, value], index) => (
                    <div key={key} className="space-y-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-neutral-300 font-semibold flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-amber-500/25 text-amber-400 border border-amber-500/30' : 'bg-neutral-700 text-neutral-400'}`}>
                            {index + 1}
                          </span>
                          {toolNames[key] || key}
                        </span>
                        <span className="text-white font-bold">{value} ครั้ง</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden">
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
            </div>

            <div className="bg-neutral-900/50 rounded-2xl p-4 border border-neutral-800/80 flex items-center gap-4 mt-6">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/20">
                <PieChart className="text-amber-400" size={24} />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">ฟังก์ชันยอดฮิตอันดับ 1</h3>
                <p className="text-base font-bold text-amber-400 truncate mt-0.5">
                  {mostUsedTools.map(t => toolNames[t] || t).join(", ")}
                </p>
                <p className="text-neutral-500 text-xs mt-0.5">
                  ได้รับการทำประเมินแล้ว {maxUsage} ครั้ง
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- 📊 New Section: Archetype Distributions for each App --- */}
        <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-[2rem] p-6 md:p-8 backdrop-blur-sm mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl">
              <PieChart className="text-indigo-400" size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold">สถิติผลลัพธ์แบบประเมินรายเครื่องมือ</h2>
              <p className="text-neutral-400 text-xs mt-0.5">การกระจายตัวของคาแรกเตอร์/ประเภทนิสัยที่ผู้ใช้งานเล่นได้ในแต่ละแบบประเมิน</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* DISC Archetype Card */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-300 mb-4 pb-2 border-b border-neutral-800/60 flex items-center justify-between">
                  <span>📊 DISC Assessment</span>
                  <span className="text-[10px] text-indigo-400 font-black">
                    (ทั้งหมด {Object.values(stats.discDistribution).reduce((a,b)=>a+b, 0)} คน)
                  </span>
                </h3>
                <div className="space-y-4">
                  {Object.entries(stats.discDistribution)
                    .sort((a,b) => b[1] - a[1])
                    .map(([key, value], idx) => {
                      const total = Object.values(stats.discDistribution).reduce((a,b)=>a+b, 0) || 1;
                      const percent = Math.round((value / total) * 100);
                      const name = discLabels[key] || key;
                      const color = discColors[key] || "bg-indigo-500";
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-neutral-300 font-semibold">{name}</span>
                            <span className="text-white font-bold">{value} คน ({percent}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                            <div className={`h-full ${color}`} style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Money Avatar Archetype Card */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-300 mb-4 pb-2 border-b border-neutral-800/60 flex items-center justify-between">
                  <span>💰 Money Avatar</span>
                  <span className="text-[10px] text-amber-400 font-black">
                    (ทั้งหมด {Object.values(stats.moneyDistribution).reduce((a,b)=>a+b, 0)} คน)
                  </span>
                </h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                  {Object.entries(stats.moneyDistribution)
                    .sort((a,b) => b[1] - a[1])
                    .map(([key, value], idx) => {
                      const total = Object.values(stats.moneyDistribution).reduce((a,b)=>a+b, 0) || 1;
                      const percent = Math.round((value / total) * 100);
                      const name = moneyLabels[key] || key;
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-neutral-300 font-semibold truncate max-w-[70%]">{name}</span>
                            <span className="text-white font-bold shrink-0">{value} คน ({percent}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Ghost in You Archetype Card */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-300 mb-4 pb-2 border-b border-neutral-800/60 flex items-center justify-between">
                  <span>👻 Ghost in You</span>
                  <span className="text-[10px] text-rose-400 font-black">
                    (ทั้งหมด {totalGhostDocs} คน)
                  </span>
                </h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                  {filteredGhostEntries.map(([key, value], idx) => {
                    const percent = totalGhostDocs > 0 ? Math.round((value / totalGhostDocs) * 100) : 0;
                    const name = ghostLabels[key] || key;
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-300 font-semibold">{name}</span>
                          <span className="text-white font-bold">{value} คน ({percent}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Library of Souls Archetype Card */}
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-300 mb-4 pb-2 border-b border-neutral-800/60 flex items-center justify-between">
                  <span>📚 Library of Souls</span>
                  <span className="text-[10px] text-violet-400 font-black">
                    (ทั้งหมด {Object.values(stats.libraryDistribution).reduce((a,b)=>a+b, 0)} คน)
                  </span>
                </h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                  {Object.entries(stats.libraryDistribution)
                    .sort((a,b) => b[1] - a[1])
                    .map(([key, value], idx) => {
                      const total = Object.values(stats.libraryDistribution).reduce((a,b)=>a+b, 0) || 1;
                      const percent = Math.round((value / total) * 100);
                      const resultObj = LIBRARY_SOULS_RESULTS[key];
                      const name = resultObj ? `${resultObj.emoji} ${resultObj.type} - ${resultObj.title}` : key;
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-neutral-300 font-semibold truncate max-w-[70%]" title={name}>{name}</span>
                            <span className="text-white font-bold shrink-0">{value} คน ({percent}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  {Object.keys(stats.libraryDistribution).length === 0 && (
                    <p className="text-neutral-500 text-xs font-medium text-center py-8">ยังไม่มีข้อมูล</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Wheel of Life Section */}
          <div className="mt-8 pt-8 border-t border-neutral-800/60">
            <h3 className="text-sm font-bold text-neutral-300 mb-6 flex items-center justify-between">
              <span>🎡 Wheel of Life (วงล้อชีวิต)</span>
              <span className="text-[10px] text-violet-400 font-black">
                (ทั้งหมด {stats.wheelTotalDocs} ใบประเมิน)
              </span>
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Radar Chart: คะแนนเฉลี่ยความพึงพอใจ */}
              <div className="lg:col-span-3 bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-neutral-400 mb-4 uppercase tracking-wider">คะแนนความพึงพอใจเฉลี่ย (เต็ม 10 คะแนน)</h4>
                  <div className="h-[280px] w-full relative flex items-center justify-center">
                    {stats.wheelTotalDocs > 0 ? (
                      <Radar data={wheelRadarData} options={wheelRadarOptions} />
                    ) : (
                      <p className="text-neutral-500 text-sm font-medium">ยังไม่มีข้อมูลแบบประเมิน</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar: ด้านที่เลือกโฟกัส */}
              <div className="lg:col-span-2 bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-neutral-400 mb-4 uppercase tracking-wider">สถิติด้านที่ผู้ใช้เลือกโฟกัสมากที่สุด</h4>
                  <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                    {stats.wheelTotalDocs > 0 ? (
                      wheelFocusAreasList
                        .sort((a, b) => b.count - a.count)
                        .map((item, idx) => {
                          const percent = totalFocusSelections > 0 ? Math.round((item.count / totalFocusSelections) * 100) : 0;
                          return (
                            <div key={item.label} className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-neutral-300 font-semibold">{item.label}</span>
                                <span className="text-white font-bold">{item.count} ครั้ง ({percent}%)</span>
                              </div>
                              <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${maxFocusCount > 0 ? (item.count / maxFocusCount) * 100 : 0}%` }} />
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <p className="text-neutral-500 text-sm font-medium">ยังไม่มีข้อมูลการเลือกโฟกัส</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Users Section */}
        <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-[2rem] p-6 md:p-8 backdrop-blur-sm mt-8">
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 rounded-xl">
                <Users className="text-blue-400" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {sortBy === "xp" ? "Top 50 Users by XP" : "สมัครล่าสุด 50 คน"}
                </h2>
                <p className="text-neutral-400 text-xs mt-0.5">รายชื่อและการมีส่วนร่วมของสมาชิกในระบบ</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-neutral-900/60 rounded-2xl p-1 border border-neutral-800">
              <button
                onClick={() => setSortBy("xp")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${sortBy === "xp" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-neutral-400 hover:text-white"}`}
              >
                <ArrowUpDown size={14} /> เรียงตาม XP
              </button>
              <button
                onClick={() => setSortBy("newest")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${sortBy === "newest" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-neutral-400 hover:text-white"}`}
              >
                <ArrowUpDown size={14} /> สมัครล่าสุด
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-neutral-800">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-neutral-900/80 text-neutral-300 font-semibold border-b border-neutral-800">
                <tr>
                  <th className="px-5 py-4">#</th>
                  <th className="px-5 py-4">ชื่อ</th>
                  <th className="px-5 py-4">อีเมล</th>
                  <th className="px-5 py-4">XP ทั้งหมด</th>
                  <th className="px-5 py-4">วันที่สมัคร</th>
                  <th className="px-5 py-4">เข้าสู่ระบบล่าสุด</th>
                  <th className="px-5 py-4">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80 bg-neutral-900/20">
                {([...(sortBy === "newest" ? (stats.allUsers || []) : (stats.topUsers || []))]
                  .sort((a, b) => sortBy === "newest" ? b.createdAtTs - a.createdAtTs : b.totalXP - a.totalXP)
                  .slice(0, 50)
                  .map((user, idx) => (
                  <tr key={user.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-5 py-4 font-semibold text-neutral-400">#{idx + 1}</td>
                    <td className="px-5 py-4 font-bold text-white">{user.name}</td>
                    <td className="px-5 py-4 text-neutral-400">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className="bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 px-2.5 py-1 rounded-xl text-xs font-bold">
                        {user.totalXP} XP
                      </span>
                    </td>
                    <td className="px-5 py-4 text-neutral-400">{user.createdAt}</td>
                    <td className="px-5 py-4 text-neutral-400">{user.lastLoginAt}</td>
                    <td className="px-5 py-4">
                      {user.isReturning ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1.5 text-xs"><UserCheck size={14} /> Returning</span>
                      ) : (
                        <span className="text-neutral-500 text-xs">New User</span>
                      )}
                    </td>
                  </tr>
                )))}
                {(!stats.topUsers || stats.topUsers.length === 0) && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-neutral-500 font-medium">
                      ไม่พบข้อมูลผู้ใช้งาน
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Email Leads Section with Tabs */}
        <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-[2rem] p-6 md:p-8 backdrop-blur-sm mt-8">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/20 rounded-xl">
                <BookOpen className="text-rose-400" size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Email Leads</h2>
                <p className="text-neutral-400 text-xs mt-0.5">
                  {activeLeadTab === "ebook" 
                    ? `${stats.ebookLeads?.length ?? 0} รายชื่อทั้งหมด`
                    : `${legacyWheelLeads.length} รายชื่อทั้งหมด`}
                </p>
              </div>
            </div>
            
            {/* Tab Swapping Control */}
            <div className="flex bg-neutral-900/60 p-1 rounded-2xl border border-neutral-700/30">
              <button
                onClick={() => setActiveLeadTab("ebook")}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  activeLeadTab === "ebook"
                    ? "bg-rose-500/25 border border-rose-500/35 text-rose-300 shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                E-Book ({stats.ebookLeads?.length ?? 0})
              </button>
              <button
                onClick={() => setActiveLeadTab("legacyWheel")}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  activeLeadTab === "legacyWheel"
                    ? "bg-indigo-500/25 border border-indigo-500/35 text-indigo-300 shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                ลูกค้าเก่า Wheel ({legacyWheelLeads.length})
              </button>
            </div>

            <button
              onClick={async () => {
                const list = activeLeadTab === "ebook"
                  ? (stats.ebookLeads || []).map(l => l.email)
                  : legacyWheelLeads.map(l => l.email);
                await navigator.clipboard.writeText(list.join('\n'));
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 border border-neutral-700/80 hover:bg-neutral-700 rounded-xl text-sm font-semibold text-neutral-300 transition-colors"
            >
              {copied ? <><Check size={14} className="text-emerald-400" /> คัดลอกแล้ว</> : <><Copy size={14} /> คัดลอกทั้งหมด</>}
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-neutral-800">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-neutral-900/80 text-neutral-300 font-semibold border-b border-neutral-800">
                <tr>
                  <th className="px-5 py-4">#</th>
                  <th className="px-5 py-4">อีเมล</th>
                  <th className="px-5 py-4">วันที่สมัคร</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80 bg-neutral-900/20">
                {activeLeadTab === "ebook" ? (
                  (stats.ebookLeads || []).map((lead, idx) => (
                    <tr key={lead.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="px-5 py-3.5 text-neutral-500 font-semibold">{idx + 1}</td>
                      <td className="px-5 py-3.5 text-white font-bold">{lead.email}</td>
                      <td className="px-5 py-3.5 text-neutral-400">{lead.createdAt}</td>
                    </tr>
                  ))
                ) : (
                  legacyWheelLeads.map((lead, idx) => (
                    <tr key={lead.email} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="px-5 py-3.5 text-neutral-500 font-semibold">{idx + 1}</td>
                      <td className="px-5 py-3.5 text-white font-bold">{lead.email}</td>
                      <td className="px-5 py-3.5 text-neutral-400">{lead.createdAt}</td>
                    </tr>
                  ))
                )}
                {activeLeadTab === "ebook" && (!stats.ebookLeads || stats.ebookLeads.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-neutral-500 font-medium">ยังไม่มี Lead</td>
                  </tr>
                )}
                {activeLeadTab === "legacyWheel" && legacyWheelLeads.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-neutral-500 font-medium">ยังไม่มี Lead</td>
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

function StatCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
  borderColor
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-gradient-to-br ${gradient} border ${borderColor} rounded-[2rem] p-6 backdrop-blur-sm flex flex-col justify-between h-full`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-neutral-300 font-semibold text-sm md:text-base">{title}</h3>
        <div className="p-2 bg-neutral-900/40 rounded-xl border border-white/5">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{value}</div>
        {subtitle && <div className="text-neutral-400 text-xs font-medium mt-1">{subtitle}</div>}
      </div>
    </motion.div>
  );
}
