import React from 'react';
import { motion } from 'framer-motion';

// 💡 ฟังก์ชันแปลงข้อความ AI ให้สวยงาม (ไฮไลต์คำ, ใส่กรอบ, จัดบรรทัด)
export const formatAnalysisText = (text: string) => {
  if (!text) return null;

  return text.split('\n').map((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine === '') return <div key={index} className="h-2"></div>;

    // เช็กว่าบรรทัดนี้คือหัวข้อหรือไม่ (ขึ้นต้นด้วย Emoji พวกนี้)
    const isHeaderLine = trimmedLine.match(/^(📌|💡|📅|🔥)/);
    const isListItem = trimmedLine.startsWith('-');

    let contentToProcess = trimmedLine;
    let headerElement = null;

    if (isHeaderLine) {
      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex !== -1 && colonIndex < 40) {
        const headerPart = trimmedLine.substring(0, colonIndex + 1);
        contentToProcess = trimmedLine.substring(colonIndex + 1).trim();
        headerElement = (
          <div className="mt-4 mb-2 pb-1 border-b border-dashed border-red-200 text-red-800 text-[15px] font-bold text-left">
            {headerPart.replace(/\*\*/g, '')}
          </div>
        );
      } else {
        return (
          <div key={index} className="mt-4 mb-2 pb-1 border-b border-dashed border-red-200 text-red-800 text-[15px] font-bold text-left">
            {trimmedLine.replace(/\*\*/g, '')}
          </div>
        );
      }
    }

    // ฟังก์ชันย่อยสำหรับทำไฮไลต์พื้นหลังสีแดงอ่อน ตอนเจอ **ข้อความ**
    const renderContent = (textToRender: string) => {
      const parts = textToRender.split('**');
      return parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="text-red-800 bg-red-50 px-1.5 py-0.5 rounded-md font-semibold mx-0.5 inline-block leading-tight">
            {part}
          </span>
        ) : (
          <span key={i} className="font-light">{part}</span>
        )
      );
    };

    return (
      <div key={index} className="text-left">
        {headerElement}
        {contentToProcess && (
          <div className={`mb-2 leading-relaxed text-[13px] text-slate-700 ${isListItem ? 'pl-4' : ''}`}>
            {renderContent(contentToProcess)}
          </div>
        )}
      </div>
    );
  });
};

// --- Component: AvatarDisplay (เวอร์ชันขยายขนาด ใหญ่สะใจคุณฟุ้ย! 🔥) ---
export const AvatarDisplay = ({ currentLevel, gender, streak = 0, isCompact = false }: { currentLevel: number; gender: "male" | "female"; streak?: number; isCompact?: boolean }) => {
  const avatarData = React.useMemo(() => {
    // 💡 Logic เลือกรูปเดิม
    const suffix = gender === 'female' ? '-w' : '';
    if (currentLevel < 10) {
      return { image: `/avatars/rookie-static${suffix}.png`, glow: 'from-slate-400/20' };
    } else if (currentLevel < 20) {
      return { image: `/avatars/master-static${suffix}.png`, glow: 'from-orange-500/20' };
    } else if (currentLevel < 30) {
      return { image: `/avatars/architect-static${suffix}.png`, glow: 'from-blue-500/20' };
    } else {
      return { image: `/avatars/legacy-static${suffix}.png`, glow: 'from-gold-500/30' };
    }
  }, [currentLevel, gender]);

  return (
    <div className="relative flex items-center justify-center group/avatar p-6 isolate">
      {/* 🌈 Aura Effect (Milestone Reward) */}
      {streak >= 7 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: "-50%", y: "-50%" }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.15, 1],
            rotate: 360,
            x: "-50%",
            y: "-50%"
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`absolute top-1/2 left-1/2 ${isCompact ? 'w-[115%] h-[115%] blur-[30px]' : 'w-[140%] h-[140%] blur-[60px]'} rounded-full z-[-1] pointer-events-none will-change-transform
             ${streak >= 30 ? 'bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-600' :
              streak >= 14 ? 'bg-gradient-to-tr from-purple-500 via-pink-500 to-indigo-600' :
                'bg-gradient-to-tr from-blue-400 via-cyan-400 to-teal-400'}`}
        />
      )}

      {/* 🌟 Rare Particle Effect for 30+ Days */}
      {streak >= 30 && (
        <div className="absolute inset-0 z-[5] pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: "-50%", y: 0 }}
              animate={{
                y: [-20, -100],
                x: ["-50%", `calc(-50% + ${Math.random() * 100 - 50}px)`],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-yellow-200 rounded-full shadow-[0_0_10px_#fef08a]"
            />
          ))}
        </div>
      )}

      {/* ✨ แสงฟุ้งข้างหลัง (ปรับขนาดตามรูป) */}
      <div className={`absolute inset-0 bg-gradient-to-t ${avatarData.glow} to-transparent blur-[120px] rounded-full opacity-60 scale-110`} />

      {/* 👾 รูปอวตาร (ขยายขนาดใหม่ ใหญ่ขึ้นเยอะ!) */}
      <img
        src={avatarData.image}
        alt={`User Avatar Level ${currentLevel}`}
        className="w-64 h-64 md:w-80 md:h-80 object-contain flex-shrink-0 relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
        fetchPriority="high"
        decoding="async"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Image";
        }}
      />

    </div>
  );
};

// 🌟 [NEW LOGIC] ฟังก์ชันคำนวณ Relative Week
export const calculateRelativeWeek = (joinDate: Date, targetDate = new Date()) => {
  const start = new Date(joinDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(targetDate);
  end.setHours(0, 0, 0, 0);

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const weekNumber = Math.max(1, Math.floor(diffDays / 7) + 1);

  const startOfWeek = new Date(start);
  startOfWeek.setDate(start.getDate() + (weekNumber - 1) * 7);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const options = { month: 'short', day: 'numeric' } as const;
  return {
    id: `week-${weekNumber}`,
    label: `สัปดาห์ที่ ${weekNumber}`,
    range: `${startOfWeek.toLocaleDateString('th-TH', options)} - ${endOfWeek.toLocaleDateString('th-TH', options)}`
  };
};
