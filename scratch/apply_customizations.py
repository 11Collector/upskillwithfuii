import os

file_path = "/Users/thanawatlovitayaolan/upskillwithfuii-web/src/app/dashboard/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Fix duplicate lastChatDate property
target_duplicate = """        bookMatchCache: null,
        lastChatDate: null,
        activeShopItems: null,
        redeemedHistory: [],
        lastChatDate: null,
      }, { merge: true });"""

replacement_duplicate = """        bookMatchCache: null,
        lastChatDate: null,
        activeShopItems: null,
        redeemedHistory: [],
      }, { merge: true });"""

if target_duplicate in code:
    code = code.replace(target_duplicate, replacement_duplicate)
    print("1. Duplicate lastChatDate fixed successfully!")
else:
    print("1. Duplicate lastChatDate target not found!")

# 2. Remove old static Happiness Shop section
target_old_shop = """        {/* --- 🛍️ 2.5 Happiness Shop Section --- */}
        {activeTab === "home" && (
          <div className="mb-8 bg-white border border-slate-100 hover:border-violet-100 rounded-[2.5rem] p-6 md:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(139,92,246,0.08)] relative overflow-hidden group transition-all duration-500">
            {/* Background decorative glows */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-gradient-to-br from-violet-400/5 to-indigo-400/5 blur-[100px] rounded-full pointer-events-none z-0 group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-gradient-to-tl from-indigo-400/5 to-purple-400/5 blur-[100px] rounded-full pointer-events-none z-0 group-hover:scale-110 transition-transform duration-700" />

            {/* Top border indicator */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 to-indigo-600 opacity-90 group-hover:h-3 transition-all duration-300" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 sm:p-3.5 bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-2xl shadow-[0_10px_20px_-5px_rgba(109,40,217,0.4)] group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag size={26} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">ความสุขระหว่างทาง SHOP</h2>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-bold flex items-center gap-1.5 mt-0.5">
                    <Sparkles size={12} className="text-violet-400" /> ใช้แต้ม XP ในกระปุกแลกของรางวัลจริง
                  </p>
                </div>
              </div>

              {/* Pot Status Indicator */}
              <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-2xl border border-slate-800 shadow-sm shrink-0">
                <PiggyBank size={18} className="text-violet-400 animate-bounce-slow" />
                <div className="flex flex-col text-left">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">กระปุกของคุณ</span>
                  <span className="text-sm font-black mt-0.5">{potXP} <span className="text-[10px] font-bold text-slate-400">XP</span></span>
                </div>
              </div>
            </div>

            {/* Grid of Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
              {SHOP_ITEMS.map((item) => {
                const canRedeem = potXP >= item.price;
                const deficit = item.price - potXP;
                
                // Color configuration based on tier
                let tierLabel = "";
                let tierColorClass = "";
                if (item.tier === "daily") {
                  tierLabel = "DAILY ☕";
                  tierColorClass = "bg-emerald-50 text-emerald-600 border-emerald-200/50";
                } else if (item.tier === "weekend") {
                  tierLabel = "WEEKEND 🍲";
                  tierColorClass = "bg-amber-50 text-amber-700 border-amber-200/50";
                } else if (item.tier === "mid") {
                  tierLabel = "MID-TIER 🎁";
                  tierColorClass = "bg-orange-50 text-orange-600 border-orange-200/50";
                } else {
                  tierLabel = "EPIC ✈️";
                  tierColorClass = "bg-rose-50 text-rose-600 border-rose-200/50";
                }

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="flex flex-col justify-between bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-violet-100 transition-all duration-300 relative overflow-hidden"
                  >
                    <div>
                      {/* Top tier tag & icon */}
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black tracking-wide border ${tierColorClass}`}>
                          {tierLabel}
                        </span>
                        <span className="text-2xl">{item.emoji}</span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-black text-slate-800 leading-snug mb-4 min-h-[2.5rem]">
                        {item.title}
                      </h4>
                    </div>

                    {/* Bottom: Price & Button */}
                    <div className="space-y-3 pt-2 border-t border-slate-50">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400">ราคา</span>
                        <span className="text-sm font-black text-slate-800 flex items-center gap-1">
                          <Trophy size={12} className="text-yellow-500 fill-current" />
                          {item.price} <span className="text-[10px] font-bold text-slate-400">XP</span>
                        </span>
                      </div>

                      <button
                        disabled={!canRedeem}
                        onClick={() => handleRedeemItem(item)}
                        className={`w-full py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all duration-300 ${
                          canRedeem
                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_4px_10px_rgba(109,40,217,0.2)] hover:from-violet-500 hover:to-indigo-500 active:scale-95"
                            : "bg-slate-50 border border-slate-100 text-slate-400 pointer-events-none"
                        }`}
                      >
                        {canRedeem ? "แลกรางวัล 🚀" : `ขาดอีก ${deficit} XP`}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}"""

if target_old_shop in code:
    code = code.replace(target_old_shop, "")
    print("2. Old static Happiness Shop removed successfully!")
else:
    print("2. Old static Happiness Shop target not found!")

# 3. Mobile unified card avatar image removal + clean outer layout
target_mobile_avatar = """                        {/* Upper Section: Profile Info & Logout */}
                        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <img
                              src={user?.photoURL || "/default-avatar.png"}
                              alt="Profile"
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full border-2 border-slate-500/30 shadow-md shrink-0"
                            />
                            <div className="flex-1 min-w-0 text-left">
                              {isEditingName ? (
                                <div className="flex items-center gap-1.5 w-full">
                                  <input
                                    autoFocus
                                    defaultValue={newName}
                                    onBlur={() => setIsEditingName(false)}
                                    className="bg-slate-700 border border-blue-500 rounded px-1.5 py-0.5 text-[10px] text-white outline-none w-full"
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateName((e.target as HTMLInputElement).value)}
                                  />
                                </div>
                              ) : (
                                <div 
                                  className="cursor-pointer group/mobile-name" 
                                  onClick={() => { setIsEditingName(true); setNewName(user?.displayName || ""); }}
                                >
                                  <span className="text-xs font-black text-white truncate flex items-center gap-1">
                                    {user?.displayName} <Sparkles size={10} className="text-yellow-400 shrink-0" />
                                  </span>
                                  <p className="text-[9px] text-slate-400 font-medium truncate leading-none mt-0.5">{user?.email}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <button onClick={handleLogout} className="p-2 bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-full shadow-lg transition-all shrink-0">"""

replacement_mobile_avatar = """                        {/* Upper Section: Profile Info & Logout */}
                        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                          <div className="flex-1 min-w-0 text-left">
                            {isEditingName ? (
                              <div className="flex items-center gap-1.5 w-full">
                                <input
                                  autoFocus
                                  defaultValue={newName}
                                  onBlur={() => setIsEditingName(false)}
                                  className="bg-slate-700 border border-blue-500 rounded px-1.5 py-0.5 text-[10px] text-white outline-none w-full"
                                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateName((e.target as HTMLInputElement).value)}
                                />
                              </div>
                            ) : (
                              <div 
                                className="cursor-pointer group/mobile-name" 
                                onClick={() => { setIsEditingName(true); setNewName(user?.displayName || ""); }}
                              >
                                <span className="text-xs font-black text-white truncate flex items-center gap-1">
                                  {user?.displayName} <Sparkles size={10} className="text-yellow-400 shrink-0" />
                                </span>
                                <p className="text-[9px] text-slate-400 font-medium truncate leading-none mt-0.5">{user?.email}</p>
                              </div>
                            )}
                          </div>
                          
                          <button onClick={handleLogout} className="p-2 bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-full shadow-lg transition-all shrink-0">"""

if target_mobile_avatar in code:
    code = code.replace(target_mobile_avatar, replacement_mobile_avatar)
    print("3. Mobile avatar picture removed successfully!")
else:
    print("3. Mobile avatar picture target not found!")

# 4. History Toggle Button emoji only
target_history_toggle = """                  {/* History Toggle Button */}
                  {activeShopTab === "history" ? (
                    <button
                      onClick={() => setActiveShopTab("daily")}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black transition-all shrink-0 active:scale-95 border border-slate-200"
                    >
                      <ShoppingBag size={12} className="text-slate-600" />
                      <span>🛒 กลับไปหน้าร้าน</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveShopTab("history")}
                      className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-black transition-all shrink-0 active:scale-95 shadow-[0_4px_12px_rgba(109,40,217,0.2)]"
                    >
                      <span>📜 ประวัติการแลก</span>
                    </button>
                  )}"""

replacement_history_toggle = """                  {/* History Toggle Button */}
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
                  )}"""

if target_history_toggle in code:
    code = code.replace(target_history_toggle, replacement_history_toggle)
    print("4. History toggle button simplified successfully!")
else:
    print("4. History toggle button target not found!")

# 5. Tab Slider Active Text Color (change invalid violet-650 to standard violet-600)
target_tab_color = """                            isActive
                              ? "bg-violet-650 text-white border-violet-650 shadow-[0_6px_20px_rgba(109,40,217,0.25)] scale-105"
                              : "bg-white text-slate-500 border border-slate-200/70 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-350" """

# Stripping spaces to ensure matching is robust
target_tab_color_clean = 'isActive\n                              ? "bg-violet-650 text-white border-violet-650 shadow-[0_6px_20px_rgba(109,40,217,0.25)] scale-105"\n                              : "bg-white text-slate-500 border border-slate-200/70 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-350"'

replacement_tab_color = 'isActive\n                              ? "bg-violet-600 text-white border-violet-600 shadow-[0_6px_20px_rgba(109,40,217,0.25)] scale-105"\n                              : "bg-white text-slate-500 border border-slate-200/70 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-350"'

if target_tab_color_clean in code:
    code = code.replace(target_tab_color_clean, replacement_tab_color)
    print("5. Tab slider active color fixed successfully!")
else:
    # Try with single quotes or different whitespace
    code = code.replace('bg-violet-650', 'bg-violet-600')
    code = code.replace('border-violet-650', 'border-violet-600')
    code = code.replace('text-violet-650', 'text-violet-600')
    print("5. Custom replace of bg-violet-650 completed!")

# 6. Premium dark-themed active cards inside shop modal grid
target_active_card = """                              <motion.div
                                key={item.id}
                                whileHover={{ y: -4 }}
                                className="flex flex-col justify-between h-full bg-white p-6 rounded-[2.5rem] border border-slate-200/85 transition-all duration-500 hover:border-violet-300 hover:bg-slate-50/30 relative overflow-hidden shadow-sm hover:shadow-md group/item"
                              >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br blur-2xl rounded-full opacity-10 bg-violet-400 pointer-events-none group-hover/item:opacity-30 transition-opacity duration-300" />
                                
                                <div>
                                  <div className="flex justify-between items-start mb-3">
                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black tracking-wide border uppercase ${tierColor}`}>
                                      {tier}
                                    </span>
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl shadow-inner group-hover/item:scale-110 transition-transform duration-300">
                                      {item.emoji}
                                    </div>
                                  </div>

                                  <span className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 block text-violet-500">
                                    {tier} • {item.price} XP
                                  </span>

                                  <h3 className="text-sm font-black text-slate-800 mb-4 leading-tight group-hover/item:text-violet-600 transition-colors line-clamp-2 min-h-[2.5rem]">
                                    {item.title}
                                  </h3>
                                </div>

                                <div className="flex flex-col mt-auto pt-4 border-t border-slate-100 relative z-10 w-full gap-3">
                                  {canRedeem ? (
                                    <button
                                      onClick={() => {
                                        handleRedeemItem(item);
                                        setShowShopModal(false); // ปิด Modal ร้านค้าเมื่อแลกสำเร็จ เพื่อโชว์ตั๋ว
                                      }}
                                      className="w-full py-3 rounded-2xl text-xs font-black tracking-wider uppercase bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_4px_12px_rgba(109,40,217,0.2)] hover:shadow-[0_8px_20px_rgba(109,40,217,0.3)] hover:from-violet-500 hover:to-indigo-500 active:scale-95 transition-all duration-300 cursor-pointer text-center"
                                    >
                                      แลกรางวัล 🚀
                                    </button>
                                  ) : (
                                    <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 select-none">
                                      <div className="flex justify-between w-full text-[10px] font-bold text-slate-500 px-1">
                                        <span>ขาดอีก {deficit} XP</span>
                                        <span className="text-violet-500 font-bold">{progressPercentage}%</span>
                                      </div>
                                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-violet-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>"""

replacement_active_card = """                              <motion.div
                                key={item.id}
                                whileHover={{ y: -4 }}
                                className="flex flex-col justify-between h-full bg-slate-950 p-6 rounded-[2.5rem] border border-slate-800/80 transition-all duration-500 hover:border-violet-500/30 hover:bg-[#151515] relative overflow-hidden shadow-sm hover:shadow-md group/item"
                              >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br blur-2xl rounded-full opacity-5 bg-violet-400 pointer-events-none group-hover/item:opacity-15 transition-opacity duration-300" />
                                
                                <div>
                                  <div className="flex justify-between items-start mb-3">
                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black tracking-wide border uppercase ${tierColor}`}>
                                      {tier}
                                    </span>
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shadow-inner group-hover/item:scale-110 transition-transform duration-300">
                                      {item.emoji}
                                    </div>
                                  </div>

                                  <span className="text-[9px] font-black uppercase tracking-[0.2em] mb-2 block text-violet-400">
                                    {tier} • {item.price} XP
                                  </span>

                                  <h3 className="text-sm font-black text-white mb-4 leading-tight group-hover/item:text-violet-400 transition-colors line-clamp-2 min-h-[2.5rem]">
                                    {item.title}
                                  </h3>
                                </div>

                                <div className="flex flex-col mt-auto pt-4 border-t border-slate-800 relative z-10 w-full gap-3">
                                  {canRedeem ? (
                                    <button
                                      onClick={() => {
                                        handleRedeemItem(item);
                                        setShowShopModal(false); // ปิด Modal ร้านค้าเมื่อแลกสำเร็จ เพื่อโชว์ตั๋ว
                                      }}
                                      className="w-full py-3 rounded-2xl text-xs font-black tracking-wider uppercase bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_4px_12px_rgba(109,40,217,0.2)] hover:shadow-[0_8px_20px_rgba(109,40,217,0.3)] hover:from-violet-500 hover:to-indigo-500 active:scale-95 transition-all duration-300 cursor-pointer text-center"
                                    >
                                      แลกรางวัล 🚀
                                    </button>
                                  ) : (
                                    <div className="w-full bg-[#131520] border border-slate-800 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1.5 select-none">
                                      <div className="flex justify-between w-full text-[10px] font-bold text-slate-400 px-1">
                                        <span>ขาดอีก {deficit} XP</span>
                                        <span className="text-violet-400 font-bold">{progressPercentage}%</span>
                                      </div>
                                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-violet-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>"""

if target_active_card in code:
    code = code.replace(target_active_card, replacement_active_card)
    print("6. Active cards dark style applied successfully!")
else:
    print("6. Active cards dark style target not found!")

# 7. Premium dark-themed history cards inside shop modal grid
target_history_card = """                              <div
                                key={idx}
                                className="flex flex-col justify-between h-full bg-white p-6 rounded-[2.5rem] border border-slate-200/80 hover:bg-slate-50/50 transition-all duration-500 hover:border-violet-300/40 relative overflow-hidden shadow-sm hover:shadow-md group/item"
                              >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br blur-2xl rounded-full opacity-10 bg-violet-300 pointer-events-none" />
                                
                                <div>
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="px-2 py-0.5 rounded-md text-[8px] font-black tracking-wide border uppercase bg-slate-50 border-slate-200 text-slate-600">
                                      {item.tier}
                                    </span>
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl shadow-inner group-hover/item:scale-110 transition-transform duration-300">
                                      {item.emoji}
                                    </div>
                                  </div>

                                  <h3 className="text-sm font-black text-slate-800 leading-snug mb-4 line-clamp-2 min-h-[2.5rem] group-hover/item:text-violet-600 transition-colors">
                                    {item.title}
                                  </h3>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-slate-100 text-[10px] text-slate-500">
                                  <div className="flex justify-between items-center font-bold">
                                    <span>ใช้แต้มแลก</span>
                                    <span className="text-slate-900 font-black flex items-center gap-1">
                                      <Trophy size={11} className="text-yellow-500 fill-current" />
                                      {item.price} XP
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center font-medium">
                                    <span>วันที่แลก</span>
                                    <span className="text-slate-700 font-bold">{dateStr}</span>
                                  </div>
                                </div>
                              </div>"""

replacement_history_card = """                              <div
                                key={idx}
                                className="flex flex-col justify-between h-full bg-slate-950 p-6 rounded-[2.5rem] border border-slate-800/80 transition-all duration-500 hover:border-violet-500/30 hover:bg-[#151515] relative overflow-hidden shadow-sm hover:shadow-md group/item"
                              >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br blur-2xl rounded-full opacity-5 bg-violet-400 pointer-events-none group-hover/item:opacity-15 transition-opacity duration-300" />
                                
                                <div>
                                  <div className="flex justify-between items-start mb-3">
                                    <span className="px-2 py-0.5 rounded-md text-[8px] font-black tracking-wide border uppercase bg-slate-900 border-slate-800 text-slate-400">
                                      {item.tier}
                                    </span>
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shadow-inner group-hover/item:scale-110 transition-transform duration-300">
                                      {item.emoji}
                                    </div>
                                  </div>

                                  <h3 className="text-sm font-black text-white leading-snug mb-4 line-clamp-2 min-h-[2.5rem] group-hover/item:text-violet-400 transition-colors">
                                    {item.title}
                                  </h3>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-slate-800 text-[10px] text-slate-500">
                                  <div className="flex justify-between items-center font-bold">
                                    <span>ใช้แต้มแลก</span>
                                    <span className="text-white font-black flex items-center gap-1">
                                      <Trophy size={11} className="text-yellow-500 fill-current" />
                                      {item.price} XP
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center font-medium">
                                    <span>วันที่แลก</span>
                                    <span className="text-slate-300 font-bold">{dateStr}</span>
                                  </div>
                                </div>
                              </div>"""

if target_history_card in code:
    code = code.replace(target_history_card, replacement_history_card)
    print("7. History cards dark style applied successfully!")
else:
    print("7. History cards dark style target not found!")

# 8. Tier color tags update
target_tier_colors = """                  if (tier === "daily") {
                    tierTitle = "ความสุขรายวัน (Daily Happiness)";
                    tierIcon = "☕";
                    tierColor = "text-emerald-600 border-emerald-500/20 bg-emerald-500/10";
                  } else if (tier === "weekend") {
                    tierTitle = "รางวัลสุดสัปดาห์ (Weekend Reward)";
                    tierIcon = "🍲";
                    tierColor = "text-amber-600 border-amber-500/20 bg-amber-500/10";
                  } else if (tier === "mid") {
                    tierTitle = "ของรางวัลชิ้นกลาง (Mid-Tier Premium)";
                    tierIcon = "🎁";
                    tierColor = "text-orange-600 border-orange-500/20 bg-orange-500/10";
                  } else {
                    tierTitle = "บิ๊กโบนัส / ทริปในฝัน (Epic Bonus)";
                    tierIcon = "✈️";
                    tierColor = "text-rose-600 border-rose-500/20 bg-rose-500/10";
                  }"""

replacement_tier_colors = """                  if (tier === "daily") {
                    tierTitle = "ความสุขรายวัน (Daily Happiness)";
                    tierIcon = "☕";
                    tierColor = "text-emerald-400 border-emerald-500/20 bg-emerald-500/10";
                  } else if (tier === "weekend") {
                    tierTitle = "รางวัลสุดสัปดาห์ (Weekend Reward)";
                    tierIcon = "🍲";
                    tierColor = "text-amber-400 border-amber-500/20 bg-amber-500/10";
                  } else if (tier === "mid") {
                    tierTitle = "ของรางวัลชิ้นกลาง (Mid-Tier Premium)";
                    tierIcon = "🎁";
                    tierColor = "text-orange-400 border-orange-500/20 bg-orange-500/10";
                  } else {
                    tierTitle = "บิ๊กโบนัส / ทริปในฝัน (Epic Bonus)";
                    tierIcon = "✈️";
                    tierColor = "text-rose-400 border-rose-500/20 bg-rose-500/10";
                  }"""

if target_tier_colors in code:
    code = code.replace(target_tier_colors, replacement_tier_colors)
    print("8. Tier tags contrast colors updated successfully!")
else:
    print("8. Tier tags contrast colors target not found!")

# 9. Ticket notches bg-white
target_notches = """                  {/* Ticket Notches (Custom Styled Left/Right Semi-circles) */}
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-3 w-6 h-6 rounded-full bg-white border-r border-slate-200" />
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-3 w-6 h-6 rounded-full bg-white border-l border-slate-200" />"""

replacement_notches = """                  {/* Ticket Notches (Custom Styled Left/Right Semi-circles) */}
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-3 w-6 h-6 rounded-full bg-white border-r border-slate-800" />
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-3 w-6 h-6 rounded-full bg-white border-l border-slate-800" />"""

if target_notches in code:
    code = code.replace(target_notches, replacement_notches)
    print("9. Ticket notches border-slate-800 applied successfully!")
else:
    # If the notches are bg-slate-900 in the clean file
    target_notches_dark = """                  {/* Ticket Notches (Custom Styled Left/Right Semi-circles) */}
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-3 w-6 h-6 rounded-full bg-slate-900 border-r border-slate-800" />
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-3 w-6 h-6 rounded-full bg-slate-900 border-l border-slate-800" />"""
    if target_notches_dark in code:
        code = code.replace(target_notches_dark, replacement_notches)
        print("9. Ticket notches bg-white border-slate-800 applied successfully!")
    else:
        print("9. Ticket notches target not found!")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(code)
print("All customizations completed successfully!")
