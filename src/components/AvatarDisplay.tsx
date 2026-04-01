import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface AvatarDisplayProps {
  currentLevel: number;
}

export const AvatarDisplay = ({ currentLevel }: AvatarDisplayProps) => {
  // 🧭 1. Logic สำหรับเลือกรูปภาพและสีเรืองแสงตาม Level (เหมือนเดิมเป๊ะ)
  const avatarData = useMemo(() => {
    if (currentLevel < 10) {
      return { 
        image: '/avatars/rookie-static.png', 
        glowColor: 'from-slate-400/20',
        title: 'Rookie'
      };
    } else if (currentLevel < 20) {
      return { 
        image: '/avatars/master-static.png', 
        glowColor: 'from-orange-500/20',
        title: 'Master'
      };
    } else {
      return { 
        image: '/avatars/architect-static.png', 
        glowColor: 'from-blue-500/30',
        title: 'Architect'
      };
    }
  }, [currentLevel]);

  return (
    <div className="relative flex items-center justify-center p-4 group/avatar transition-all duration-300">
      
      {/* ✨ แสงฟุ้งข้างหลังอวตาร (ปรับให้ดูมีมิติขึ้นนิดหน่อย) */}
      <div className={`absolute inset-0 bg-gradient-to-t ${avatarData.glowColor} to-transparent blur-3xl rounded-full opacity-60 transition-opacity group-hover/avatar:opacity-100`} />

      {/* 👾 รูปอวตารนิ่ง (ใช้ motion.img เผื่ออยากใส่ Hover effect เล็กๆ) */}
      <motion.img 
        src={avatarData.image} 
        alt={`Avatar for ${avatarData.title}`}
        // ✅ ปรับขนาดตามความชอบ (เช่น w-24 h-24 หรือ w-32 h-32)
        className="w-24 h-24 md:w-32 md:h-32 relative z-10 drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]"
        
        // 💡 ใส่ Hover Effect เล็กๆ ให้ดูไม่แข็งจนเกินไป ( Optional )
        whileHover={{ 
          y: -5, 
          scale: 1.05,
          rotate: [0, -2, 2, 0], // ส่ายนิดๆ พอเท่
          transition: { duration: 0.3 }
        }}
        
        // สำหรับ Pixel Art (หากรูปเป็น Pixel Art) ต้องใส่ class นี้
        style={{ imageRendering: 'pixelated' }} 
      />
    </div>
  );
};