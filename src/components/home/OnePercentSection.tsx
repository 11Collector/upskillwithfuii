"use client";

interface OnePercentSectionProps {
  onePercentDay: number;
  setOnePercentDay: (day: number) => void;
}

export default function OnePercentSection({
  onePercentDay,
  setOnePercentDay,
}: OnePercentSectionProps) {
  const improveVal = Math.pow(1.01, onePercentDay);
  const declineVal = Math.pow(0.99, onePercentDay);

  const generatePath = (base: number) => {
    const points = [];
    for (let d = 0; d <= 365; d += 10) {
      const val = Math.pow(base, d);
      const clampedVal = Math.min(val, 40);
      const x = 30 + (d / 365) * 280;
      const y = 185 - (clampedVal / 40) * 165;
      points.push(`${x},${y}`);
    }
    return `M ${points.join(" L ")}`;
  };

  return (
    <section
      data-nosnippet
      className="relative w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] mx-auto mb-12 max-w-6xl overflow-hidden rounded-[2.5rem] border border-slate-800 bg-slate-900 p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:p-10"
    >
      {/* Glow Effects */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.25em] bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              THE 1% RULE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2.5">
              พลังของการเก่งขึ้นวันละ 1%
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1">
              การพัฒนาตัวเองแค่วันละนิด สะสมกันไปเรื่อยๆ จะสร้างผลลัพธ์มหาศาล
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/50 px-4 py-2 rounded-2xl self-stretch md:self-auto justify-center shadow-inner">
            <span className="text-xs text-slate-400 font-bold">เป้าหมาย:</span>
            <span className="text-sm text-amber-400 font-black">{onePercentDay} วัน</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left Column: Slider and Metrics */}
          <div className="md:col-span-6 space-y-6 order-2 md:order-1">
            {/* Interactive Slider */}
            <div className="space-y-3 bg-slate-950/40 border border-slate-800/50 rounded-3xl p-5">
              <div className="flex justify-between text-[10px] text-slate-500 font-black tracking-wider">
                <span>เริ่มต้น</span>
                <span>ครึ่งปี (180 วัน)</span>
                <span>ครบปี (365 วัน)</span>
              </div>
              <input
                type="range"
                min="1"
                max="365"
                value={onePercentDay}
                onChange={(e) => setOnePercentDay(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-red-500 focus:outline-none"
              />
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-500 font-bold">
                  เลื่อนเพื่อสลับวันและเห็นผลคูณสะสม
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setOnePercentDay(30)}
                    className={`text-[9px] px-2.5 py-1.5 rounded-xl font-black border transition-all ${
                      onePercentDay === 30
                        ? "bg-white text-slate-900 border-white shadow-md"
                        : "bg-slate-800/50 text-slate-400 border-slate-700/30 hover:bg-slate-800"
                    }`}
                  >
                    30 วัน
                  </button>
                  <button
                    onClick={() => setOnePercentDay(180)}
                    className={`text-[9px] px-2.5 py-1.5 rounded-xl font-black border transition-all ${
                      onePercentDay === 180
                        ? "bg-white text-slate-900 border-white shadow-md"
                        : "bg-slate-800/50 text-slate-400 border-slate-700/30 hover:bg-slate-800"
                    }`}
                  >
                    180 วัน
                  </button>
                  <button
                    onClick={() => setOnePercentDay(365)}
                    className={`text-[9px] px-2.5 py-1.5 rounded-xl font-black border transition-all ${
                      onePercentDay === 365
                        ? "bg-white text-slate-900 border-white shadow-md"
                        : "bg-slate-800/50 text-slate-400 border-slate-700/30 hover:bg-slate-800"
                    }`}
                  >
                    365 วัน
                  </button>
                </div>
              </div>
            </div>

            {/* Path Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Improvement Card */}
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">
                    เก่งขึ้นวันละ 1%
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    1.01^{onePercentDay}
                  </span>
                </div>
                <div className="my-1.5">
                  <span className="text-3xl font-black text-emerald-400 tracking-tight">
                    {improveVal.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 font-bold ml-1">เท่า</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal border-t border-slate-800/80 pt-2 mt-1">
                  {improveVal >= 37.0
                    ? "ศักยภาพก้าวกระโดดมหาศาล! 🚀"
                    : improveVal >= 5.0
                    ? "ศักยภาพงอกเงยอย่างเห็นได้ชัด"
                    : improveVal >= 1.5
                    ? "เริ่มเห็นพัฒนาการชัดเจน"
                    : "เริ่มต้นสะสมผลลัพธ์"}
                </p>
              </div>

              {/* Decline Card */}
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between hover:border-rose-500/30 transition-all duration-300 group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-black uppercase text-rose-400 tracking-wider">
                    ถดถอยวันละ 1%
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    0.99^{onePercentDay}
                  </span>
                </div>
                <div className="my-1.5">
                  <span className="text-3xl font-black text-rose-400 tracking-tight">
                    {declineVal.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 font-bold ml-1">เท่า</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal border-t border-slate-800/80 pt-2 mt-1">
                  {declineVal <= 0.03
                    ? "ศักยภาพดิ่งลงเกือบศูนย์ 🥀"
                    : declineVal <= 0.25
                    ? "ศักยภาพถดถอยอย่างมีนัยสำคัญ"
                    : declineVal <= 0.75
                    ? "ทักษะเดิมเริ่มจางหายไปเยอะ"
                    : "แทบไม่เห็นความแตกต่าง"}
                </p>
              </div>
            </div>

            {/* Multiplier Comparison Banner */}
            <div className="bg-gradient-to-r from-red-600/10 via-purple-600/10 to-indigo-600/10 border border-slate-800 rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg">
              <div className="space-y-0.5">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  แก๊ปความแตกต่าง
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-200">
                  สองทางเลือก ห่างกันมหาศาลถึง
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">
                  {(improveVal / Math.max(declineVal, 0.001)).toFixed(0)}
                </span>
                <span className="text-sm font-black text-amber-400 ml-1">เท่า!</span>
              </div>
            </div>
          </div>

          {/* Right Column: Custom SVG Graph */}
          <div className="md:col-span-6 flex flex-col justify-center items-center order-1 md:order-2">
            <div className="w-full bg-slate-950/60 border border-slate-800/80 rounded-3xl p-4 sm:p-5 relative overflow-hidden shadow-inner">
              {/* SVG Graph */}
              <svg viewBox="0 0 320 220" className="w-full h-auto overflow-visible">
                {/* Grid Lines */}
                <line
                  x1="30"
                  y1="20"
                  x2="310"
                  y2="20"
                  stroke="#334155"
                  strokeWidth="0.5"
                  strokeDasharray="3 3"
                  opacity="0.4"
                />
                <line
                  x1="30"
                  y1="61.25"
                  x2="310"
                  y2="61.25"
                  stroke="#334155"
                  strokeWidth="0.5"
                  strokeDasharray="3 3"
                  opacity="0.4"
                />
                <line
                  x1="30"
                  y1="102.5"
                  x2="310"
                  y2="102.5"
                  stroke="#334155"
                  strokeWidth="0.5"
                  strokeDasharray="3 3"
                  opacity="0.4"
                />
                <line
                  x1="30"
                  y1="143.75"
                  x2="310"
                  y2="143.75"
                  stroke="#334155"
                  strokeWidth="0.5"
                  strokeDasharray="3 3"
                  opacity="0.4"
                />

                {/* Y-Axis Labels */}
                <text
                  x="24"
                  y="23"
                  fill="#475569"
                  textAnchor="end"
                  className="text-[8px] font-mono font-semibold"
                >
                  40
                </text>
                <text
                  x="24"
                  y="64"
                  fill="#475569"
                  textAnchor="end"
                  className="text-[8px] font-mono font-semibold"
                >
                  30
                </text>
                <text
                  x="24"
                  y="105"
                  fill="#475569"
                  textAnchor="end"
                  className="text-[8px] font-mono font-semibold"
                >
                  20
                </text>
                <text
                  x="24"
                  y="146"
                  fill="#475569"
                  textAnchor="end"
                  className="text-[8px] font-mono font-semibold"
                >
                  10
                </text>
                <text
                  x="24"
                  y="183"
                  fill="#475569"
                  textAnchor="end"
                  className="text-[8px] font-mono font-semibold"
                >
                  1
                </text>

                {/* Baseline (1.0) */}
                <line
                  x1="30"
                  y1="180.875"
                  x2="310"
                  y2="180.875"
                  stroke="#475569"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />

                {/* Decline Path (0.99) */}
                <path
                  d={generatePath(0.99)}
                  fill="none"
                  stroke="url(#declineGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Improvement Path (1.01) */}
                <path
                  d={generatePath(1.01)}
                  fill="none"
                  stroke="url(#improveGradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Time vertical indicator line */}
                <line
                  x1={30 + (onePercentDay / 365) * 280}
                  y1="20"
                  x2={30 + (onePercentDay / 365) * 280}
                  y2="185"
                  stroke="#475569"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  opacity="0.8"
                />

                {/* Glow/Ping circle around current position of Improvement path */}
                <circle
                  cx={30 + (onePercentDay / 365) * 280}
                  cy={185 - (Math.min(improveVal, 40) / 40) * 165}
                  r="6"
                  className="fill-emerald-400/30 stroke-emerald-400 stroke-1 animate-pulse"
                />
                <circle
                  cx={30 + (onePercentDay / 365) * 280}
                  cy={185 - (Math.min(improveVal, 40) / 40) * 165}
                  r="3"
                  className="fill-emerald-400"
                />

                {/* Circle around current position of Decline path */}
                <circle
                  cx={30 + (onePercentDay / 365) * 280}
                  cy={185 - (Math.min(declineVal, 40) / 40) * 165}
                  r="5"
                  className="fill-rose-500/30 stroke-rose-500 stroke-1"
                />
                <circle
                  cx={30 + (onePercentDay / 365) * 280}
                  cy={185 - (Math.min(declineVal, 40) / 40) * 165}
                  r="2.5"
                  className="fill-rose-500"
                />

                {/* Active Day moving label at the top of vertical line */}
                <text
                  x={30 + (onePercentDay / 365) * 280}
                  y="12"
                  fill="#fbbf24"
                  stroke="#020617"
                  strokeWidth="3"
                  paintOrder="stroke"
                  strokeLinejoin="round"
                  textAnchor="middle"
                  className="text-[9px] font-black font-mono"
                >
                  วันที่ {onePercentDay}
                </text>

                {/* Axis Ticks */}
                <line x1="30" y1="185" x2="30" y2="190" stroke="#475569" strokeWidth="1" />
                <line x1="310" y1="185" x2="310" y2="190" stroke="#475569" strokeWidth="1" />

                {/* X-Axis Labels inside SVG */}
                <text
                  x="30"
                  y="212"
                  fill="#64748b"
                  textAnchor="middle"
                  className="text-[8px] font-mono font-bold"
                >
                  Day 0
                </text>
                <text
                  x="310"
                  y="212"
                  fill="#64748b"
                  textAnchor="middle"
                  className="text-[8px] font-mono font-bold"
                >
                  Day 365
                </text>

                {/* Gradients definitions */}
                <defs>
                  <linearGradient id="improveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="50%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <linearGradient id="declineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
