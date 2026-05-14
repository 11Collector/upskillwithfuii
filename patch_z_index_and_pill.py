import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# Fix Modal z-index
old_modal = """      {/* 🎯 Modal กติกา Wheel Plan */}
      <AnimatePresence>
        {showWheelRulesModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">"""

new_modal = """      {/* 🎯 Modal กติกา Wheel Plan */}
      <AnimatePresence>
        {showWheelRulesModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">"""

content = content.replace(old_modal, new_modal)

# Fix Floating XP Pill positioning
old_pill = """            className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] pointer-events-none w-[90%] max-w-sm"
          >
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/50 shadow-[0_10px_40px_rgb(0,0,0,0.1)] px-5 py-2.5 rounded-full flex items-center justify-between pointer-events-auto">"""

new_pill = """            className="fixed top-[5rem] md:top-[5.5rem] left-1/2 -translate-x-1/2 z-[90] pointer-events-none w-[90%] max-w-sm"
          >
            <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-[0_10px_20px_rgba(0,0,0,0.1)] px-5 py-2.5 rounded-full flex items-center justify-between pointer-events-auto">"""

content = content.replace(old_pill, new_pill)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
