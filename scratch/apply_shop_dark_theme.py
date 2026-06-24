import os

file_path = "/Users/thanawatlovitayaolan/upskillwithfuii-web/src/app/dashboard/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update the Shop Modal Container style to match the premium dark theme of "คลังสมองอัพสกิล"
target_modal_container = """            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.15)] relative max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >"""

replacement_modal_container = """            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0A0A0A] border border-zinc-800/80 rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.5)] relative max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >"""

if target_modal_container in code:
    code = code.replace(target_modal_container, replacement_modal_container)
    print("1. Shop Modal Container styled to dark successfully!")
else:
    print("1. Shop Modal Container target not found!")


# 2. Update Shop Modal Header to dark background and borders, matching text colors
target_modal_header = """              {/* Header: Sticky at the top */}
              <div className="p-6 md:p-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 sticky top-0 bg-white z-20 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-2xl shadow-[0_10px_20px_-5px_rgba(109,40,217,0.3)]">
                    <ShoppingBag size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">ความสุขระหว่างทาง SHOP</h3>
                    <p className="text-[10px] md:text-xs text-slate-500 font-bold flex items-center gap-1 mt-0.5">
                      <Sparkles size={12} className="text-violet-500 animate-pulse" /> ใช้แต้ม XP ในกระปุกออมสินแลกของรางวัลเพื่อสร้างความสุขเล็กๆ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
                  {/* Piggy Bank Status */}
                  <div className="flex items-center gap-2 bg-slate-50 text-slate-900 px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm shrink-0">
                    <PiggyBank size={14} className="text-violet-500 animate-bounce-slow" />
                    <div className="flex flex-col text-left">
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">กระปุกของคุณ</span>
                      <span className="text-xs font-black mt-0.5 text-slate-900">{potXP} <span className="text-[9px] font-bold text-slate-500">XP</span></span>
                    </div>
                  </div>"""

replacement_modal_header = """              {/* Header: Sticky at the top */}
              <div className="p-6 md:p-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800/50 sticky top-0 bg-[#0A0A0A] z-20 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-2xl shadow-[0_10px_20px_-5px_rgba(109,40,217,0.3)]">
                    <ShoppingBag size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-white leading-tight">ความสุขระหว่างทาง SHOP</h3>
                    <p className="text-[10px] md:text-xs text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                      <Sparkles size={12} className="text-violet-400 animate-pulse" /> ใช้แต้ม XP ในกระปุกออมสินแลกของรางวัลเพื่อสร้างความสุขเล็กๆ
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
                  {/* Piggy Bank Status */}
                  <div className="flex items-center gap-2 bg-[#111] text-white px-3 py-1.5 rounded-xl border border-zinc-800/50 shadow-sm shrink-0">
                    <PiggyBank size={14} className="text-violet-400 animate-bounce-slow" />
                    <div className="flex flex-col text-left">
                      <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest leading-none">กระปุกของคุณ</span>
                      <span className="text-xs font-black mt-0.5 text-white">{potXP} <span className="text-[9px] font-bold text-zinc-400">XP</span></span>
                    </div>
                  </div>"""

if target_modal_header in code:
    code = code.replace(target_modal_header, replacement_modal_header)
    print("2. Shop Modal Header styled to dark successfully!")
else:
    print("2. Shop Modal Header target not found!")


# 3. Update Toggle Buttons, Close Button, Modal Content Wrapper, and Tabs to Dark Theme
target_modal_buttons_and_tabs = """                  {/* History Toggle Button */}
                  {activeShopTab === "history" ? (
                    <button
                      onClick={() => setActiveShopTab("daily")}
                      className="flex items-center justify-center w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-black transition-all shrink-0 active:scale-95 border border-slate-200"
                      title="กลับไปหน้าร้าน"
                    >
                      🛒
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveShopTab("history")}
                      className="flex items-center justify-center w-9 h-9 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-black transition-all shrink-0 active:scale-95 shadow-[0_4px_12px_rgba(109,40,217,0.2)]"
                      title="ประวัติการซื้อ"
                    >
                      📜
                    </button>
                  )}

                  <button
                    onClick={() => setShowShopModal(false)}
                    className="text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 p-2 rounded-full transition-all shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content: Scrollable list grouped by Tiers / Active Tab */}
              <div className="px-6 md:px-8 py-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/70 flex flex-col">
                
                {/* Horizontal Tab Switched Menu */}
                {activeShopTab !== "history" && (
                  <div className="flex gap-2 overflow-x-auto pt-2 pb-4 no-scrollbar mb-6 shrink-0">
                    {[
                      { id: "daily", label: "☕ รายวัน" },
                      { id: "weekend", label: "🍲 สุดสัปดาห์" },
                      { id: "mid", label: "🎁 ชิ้นกลาง" },
                      { id: "epic", label: "✈️ บิ๊กโบนัส" }
                    ].map((tab) => {
                      const isActive = activeShopTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveShopTab(tab.id as any)}
                          className={`flex-none flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black transition-all duration-300 border ${
                            isActive
                              ? "bg-violet-600 text-white border-violet-600 shadow-[0_6px_20px_rgba(109,40,217,0.25)] scale-105"
                              : "bg-white text-slate-500 border border-slate-200/70 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-350"
                          }`}
                        >"""

replacement_modal_buttons_and_tabs = """                  {/* History Toggle Button */}
                  {activeShopTab === "history" ? (
                    <button
                      onClick={() => setActiveShopTab("daily")}
                      className="flex items-center justify-center w-9 h-9 bg-[#111] hover:bg-[#1c1c1c] text-zinc-300 rounded-xl text-sm font-black transition-all shrink-0 active:scale-95 border border-zinc-800/50"
                      title="กลับไปหน้าร้าน"
                    >
                      🛒
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveShopTab("history")}
                      className="flex items-center justify-center w-9 h-9 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-black transition-all shrink-0 active:scale-95 shadow-[0_4px_12px_rgba(109,40,217,0.2)]"
                      title="ประวัติการซื้อ"
                    >
                      📜
                    </button>
                  )}

                  <button
                    onClick={() => setShowShopModal(false)}
                    className="text-zinc-400 hover:text-red-500 bg-[#111] hover:bg-red-950/30 p-2 rounded-full transition-all shrink-0 border border-zinc-800/50"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content: Scrollable list grouped by Tiers / Active Tab */}
              <div className="px-6 md:px-8 py-6 overflow-y-auto custom-scrollbar flex-1 bg-[#0A0A0A] flex flex-col">
                
                {/* Horizontal Tab Switched Menu */}
                {activeShopTab !== "history" && (
                  <div className="flex gap-2 overflow-x-auto pt-2 pb-4 no-scrollbar mb-6 shrink-0">
                    {[
                      { id: "daily", label: "☕ รายวัน" },
                      { id: "weekend", label: "🍲 สุดสัปดาห์" },
                      { id: "mid", label: "🎁 ชิ้นกลาง" },
                      { id: "epic", label: "✈️ บิ๊กโบนัส" }
                    ].map((tab) => {
                      const isActive = activeShopTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveShopTab(tab.id as any)}
                          className={`flex-none flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black transition-all duration-300 border ${
                            isActive
                              ? "bg-violet-600 text-white border-violet-600 shadow-[0_6px_20px_rgba(109,40,217,0.25)] scale-105"
                              : "bg-[#161616] text-zinc-500 border border-zinc-800/50 hover:bg-[#1c1c1c] hover:text-zinc-300 hover:border-zinc-700"
                          }`}
                        >"""

if target_modal_buttons_and_tabs in code:
    code = code.replace(target_modal_buttons_and_tabs, replacement_modal_buttons_and_tabs)
    print("3. Modal content, buttons and tabs styled successfully!")
else:
    print("3. Modal content, buttons and tabs target not found!")


# 4. History Empty state and List title style to Dark Theme
target_history_empty_and_title = """                {activeShopTab === "history" ? (
                  <div className="flex-1 flex flex-col">
                    {redeemedHistory.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white min-h-[300px]">
                        <span className="text-4xl mb-3">🎁</span>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">ยังไม่มีประวัติการแลกซื้อรางวัล</h4>
                        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                          เริ่มออมแต้มในกระปุกออมสินแล้วนำมาแลกของรางวัลสุดพิเศษเพื่อสร้างรางวัลชีวิตให้ตัวเองกันเถอะ!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 flex-1">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-4">"""

replacement_history_empty_and_title = """                {activeShopTab === "history" ? (
                  <div className="flex-1 flex flex-col">
                    {redeemedHistory.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-zinc-800/80 rounded-[2.5rem] bg-[#111] min-h-[300px]">
                        <span className="text-4xl mb-3">🎁</span>
                        <h4 className="text-sm font-bold text-white mb-1">ยังไม่มีประวัติการแลกซื้อรางวัล</h4>
                        <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                          เริ่มออมแต้มในกระปุกออมสินแล้วนำมาแลกของรางวัลสุดพิเศษเพื่อสร้างรางวัลชีวิตให้ตัวเองกันเถอะ!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 flex-1">
                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-4">"""

if target_history_empty_and_title in code:
    code = code.replace(target_history_empty_and_title, replacement_history_empty_and_title)
    print("4. History empty states styled successfully!")
else:
    print("4. History empty states target not found!")


# 5. Tier section header line & Active Empty items container style
target_tier_header_and_empty = """                    <div className="space-y-4 flex-1 flex flex-col">
                      {/* Tier Section Header */}
                      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 shrink-0">
                        <span className="text-xl">{tierIcon}</span>
                        <h4 className="text-sm md:text-base font-black text-slate-800 tracking-tight">{tierTitle}</h4>
                      </div>

                      {/* Items Grid for this Tier */}
                      {items.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white min-h-[300px]">
                          <span className="text-4xl mb-3">🎉</span>
                          <h4 className="text-sm font-bold text-slate-900 mb-1">แลกหมดเกลี้ยงแล้ว!</h4>
                          <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                            คุณแลกของรางวัลในหมวดนี้ไปครบทุกชิ้นแล้ว ยินดีด้วยครับ! ลองเช็กหมวดอื่นเพื่อหาความสุขเพิ่มเติมได้เลยครับ 🚀
                          </p>
                        </div>"""

replacement_tier_header_and_empty = """                    <div className="space-y-4 flex-1 flex flex-col">
                      {/* Tier Section Header */}
                      <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/50 shrink-0">
                        <span className="text-xl">{tierIcon}</span>
                        <h4 className="text-sm md:text-base font-black text-white tracking-tight">{tierTitle}</h4>
                      </div>

                      {/* Items Grid for this Tier */}
                      {items.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-zinc-800/80 rounded-[2.5rem] bg-[#111] min-h-[300px]">
                          <span className="text-4xl mb-3">🎉</span>
                          <h4 className="text-sm font-bold text-white mb-1">แลกหมดเกลี้ยงแล้ว!</h4>
                          <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                            คุณแลกของรางวัลในหมวดนี้ไปครบทุกชิ้นแล้ว ยินดีด้วยครับ! ลองเช็กหมวดอื่นเพื่อหาความสุขเพิ่มเติมได้เลยครับ 🚀
                          </p>
                        </div>"""

if target_tier_header_and_empty in code:
    code = code.replace(target_tier_header_and_empty, replacement_tier_header_and_empty)
    print("5. Tier headers and empty states styled successfully!")
else:
    print("5. Tier headers and empty states target not found!")


# 6. Shop modal footer styling
target_modal_footer = """              {/* Footer: Bottom of Modal */}
              <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowShopModal(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-2xl transition-all active:scale-95 border border-slate-200"
                >
                  ปิดร้านค้า
                </button>
              </div>"""

replacement_modal_footer = """              {/* Footer: Bottom of Modal */}
              <div className="p-6 bg-[#0A0A0A] border-t border-zinc-800/50 flex justify-end">
                <button
                  onClick={() => setShowShopModal(false)}
                  className="px-6 py-3 bg-[#161616] hover:bg-[#1c1c1c] text-zinc-300 text-xs font-bold rounded-2xl transition-all active:scale-95 border border-zinc-800/50"
                >
                  ปิดร้านค้า
                </button>
              </div>"""

if target_modal_footer in code:
    code = code.replace(target_modal_footer, replacement_modal_footer)
    print("6. Shop modal footer styled successfully!")
else:
    print("6. Shop modal footer target not found!")


# 7. Make ticket black/dark when bought (in modal & exported image)
target_ticket_body = """                {/* 🎟️ Ticket Container to Export */}
                <div
                  id="happiness-ticket"
                  className="w-full bg-[#fbfbfe] border border-slate-200 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center shadow-inner"
                  style={{ fontFamily: 'monospace' }}
                >
                  {/* Background Glow */}
                  <div className="absolute -top-20 -left-20 w-36 h-36 bg-violet-600/10 blur-[50px] rounded-full pointer-events-none" />
                  <div className="absolute -bottom-20 -right-20 w-36 h-36 bg-indigo-600/10 blur-[50px] rounded-full pointer-events-none" />

                  {/* Ticket Notches (Custom Styled Left/Right Semi-circles) */}
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-3 w-6 h-6 rounded-full bg-white border-r border-slate-800" />
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-3 w-6 h-6 rounded-full bg-white border-l border-slate-800" />

                  {/* Top header */}
                  <div className="flex flex-col items-center w-full border-b border-dashed border-slate-200 pb-4 mb-4">
                    <span className="text-[14px] font-black text-violet-650 tracking-wider">HAPPINESS TICKET</span>
                    <span className="text-[9px] font-semibold text-slate-500 mt-1 uppercase tracking-[0.2em]">upskilleveryday.com</span>
                  </div>

                  {/* Emoji & Main Content */}
                  <div className="text-4xl mb-3 animate-bounce">{redeemedItem.emoji}</div>
                  <h3 className="text-base font-black text-slate-800 px-2 mb-2 tracking-tight line-clamp-2">
                    {redeemedItem.title}
                  </h3>

                  {/* Price tag */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/50 text-amber-800 text-xs font-black mb-4">
                    <Trophy size={12} className="fill-current" /> {redeemedItem.price} XP REDEEMED
                  </div>

                  {/* Dotted Divider for notches */}
                  <div className="w-full border-t border-dashed border-slate-200 my-2" />

                  {/* User metadata & Date */}
                  <div className="w-full grid grid-cols-2 gap-2 text-left text-[9px] font-bold text-slate-500 py-2">
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase tracking-wider">REDEEMER</span>
                      <span className="text-slate-800 truncate block">{user?.displayName?.split(' ')[0] || 'Upskiller'}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] text-slate-500 uppercase tracking-wider">DATE</span>
                      <span className="text-slate-800 block">{new Date().toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Barcode representation */}
                  <div className="w-full flex flex-col items-center border-t border-dashed border-slate-200 pt-4 mt-2">
                    <div className="w-full h-8 flex justify-center items-stretch gap-[1.5px] opacity-70 mb-1">
                      {[1, 2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 1].map((width, i) => (
                        <div
                          key={i}
                          className="bg-slate-800 rounded-sm"
                          style={{ width: `${width}px` }}
                        />
                      ))}
                    </div>
                    <span className="text-[7px] text-slate-550 uppercase tracking-[0.3em]">#HPN-{redeemedItem.id}-{potXP + redeemedItem.price}</span>
                  </div>

                  {/* Stamp/Seal Badge style watermark */}
                  <div className="absolute right-4 top-4 w-12 h-12 border-2 border-indigo-500/10 rounded-full flex items-center justify-center rotate-12 pointer-events-none">
                    <span className="text-[6px] text-indigo-500/20 font-black uppercase text-center tracking-tighter">APPROVED<br />FUII MENTOR</span>
                  </div>
                </div>"""

replacement_ticket_body = """                {/* 🎟️ Ticket Container to Export */}
                <div
                  id="happiness-ticket"
                  className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center shadow-inner"
                  style={{ fontFamily: 'monospace' }}
                >
                  {/* Background Glow */}
                  <div className="absolute -top-20 -left-20 w-36 h-36 bg-violet-600/15 blur-[50px] rounded-full pointer-events-none" />
                  <div className="absolute -bottom-20 -right-20 w-36 h-36 bg-indigo-600/15 blur-[50px] rounded-full pointer-events-none" />

                  {/* Ticket Notches (Custom Styled Left/Right Semi-circles) */}
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-3 w-6 h-6 rounded-full bg-white border-r border-slate-800" />
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-3 w-6 h-6 rounded-full bg-white border-l border-slate-800" />

                  {/* Top header */}
                  <div className="flex flex-col items-center w-full border-b border-dashed border-slate-800 pb-4 mb-4">
                    <span className="text-[14px] font-black text-violet-400 tracking-wider">HAPPINESS TICKET</span>
                    <span className="text-[9px] font-semibold text-slate-500 mt-1 uppercase tracking-[0.2em]">upskilleveryday.com</span>
                  </div>

                  {/* Emoji & Main Content */}
                  <div className="text-4xl mb-3 animate-bounce">{redeemedItem.emoji}</div>
                  <h3 className="text-base font-black text-white px-2 mb-2 tracking-tight line-clamp-2">
                    {redeemedItem.title}
                  </h3>

                  {/* Price tag */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-black mb-4">
                    <Trophy size={12} className="fill-current" /> {redeemedItem.price} XP REDEEMED
                  </div>

                  {/* Dotted Divider for notches */}
                  <div className="w-full border-t border-dashed border-slate-800 my-2" />

                  {/* User metadata & Date */}
                  <div className="w-full grid grid-cols-2 gap-2 text-left text-[9px] font-bold text-slate-400 py-2">
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase tracking-wider">REDEEMER</span>
                      <span className="text-white truncate block">{user?.displayName?.split(' ')[0] || 'Upskiller'}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[8px] text-slate-500 uppercase tracking-wider">DATE</span>
                      <span className="text-white block">{new Date().toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Barcode representation */}
                  <div className="w-full flex flex-col items-center border-t border-dashed border-slate-800 pt-4 mt-2">
                    <div className="w-full h-8 flex justify-center items-stretch gap-[1.5px] opacity-70 mb-1">
                      {[1, 2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 1].map((width, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-sm"
                          style={{ width: `${width}px` }}
                        />
                      ))}
                    </div>
                    <span className="text-[7px] text-slate-500 uppercase tracking-[0.3em]">#HPN-{redeemedItem.id}-{potXP + redeemedItem.price}</span>
                  </div>

                  {/* Stamp/Seal Badge style watermark */}
                  <div className="absolute right-4 top-4 w-12 h-12 border-2 border-indigo-500/20 rounded-full flex items-center justify-center rotate-12 pointer-events-none">
                    <span className="text-[6px] text-indigo-500/30 font-black uppercase text-center tracking-tighter">APPROVED<br />FUII MENTOR</span>
                  </div>
                </div>"""

if target_ticket_body in code:
    code = code.replace(target_ticket_body, replacement_ticket_body)
    print("7. Ticket styled to black successfully!")
else:
    print("7. Ticket target not found!")


# 8. Update html-to-image export background to match dark ticket
target_to_png = """                        const dataUrl = await toPng(element, {
                          pixelRatio: 3,
                          backgroundColor: '#ffffff', // Sleek light ticket background"""

replacement_to_png = """                        const dataUrl = await toPng(element, {
                          pixelRatio: 3,
                          backgroundColor: '#090D16', // Sleek dark ticket background"""

if target_to_png in code:
    code = code.replace(target_to_png, replacement_to_png)
    print("8. Exporter background styled to dark successfully!")
else:
    print("8. Exporter background target not found!")


with open(file_path, "w", encoding="utf-8") as f:
    f.write(code)

print("All dark theme updates for shop completed successfully!")
