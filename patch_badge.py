import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

old_badge = """                        <div className="absolute top-2 right-2 text-xl font-bold bg-gradient-to-br from-gold-400 to-yellow-600 bg-clip-text text-transparent flex items-center justify-center filter drop-shadow-sm">
                          {userLevel}
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-3 bg-black/10 rounded-full blur-[2px]" />
                      </div>

                      {/* Badge ชื่อเต็ม (ปรับสไตล์ให้เหมือน Match % ของ Money) */}
                      <div className={`mt-2.5 px-3 py-1 rounded-full border shadow-sm text-[10px] sm:text-[11px] font-bold tracking-wide backdrop-blur-sm ${levelStyles.badgeClass}`}>
                        {levelStyles.badgeText}
                      </div>
                    </div>
                  </div>"""

new_badge = """                        <div className="absolute top-2 right-2 text-xl font-bold bg-gradient-to-br from-gold-400 to-yellow-600 bg-clip-text text-transparent flex items-center justify-center filter drop-shadow-sm">
                          {userLevel}
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-3 bg-black/10 rounded-full blur-[2px]" />
                      </div>

                      {/* Badge ชื่อเต็ม (ปรับสไตล์ให้เหมือน Match % ของ Money) */}
                      <div className={`mt-2.5 px-3 py-1 rounded-full border shadow-sm text-[10px] sm:text-[11px] font-bold tracking-wide backdrop-blur-sm ${levelStyles.badgeClass}`}>
                        {levelStyles.badgeText}
                      </div>

                      {/* 🎖️ Perfect Week Badge */}
                      {perfectWeeks > 0 && (
                        <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-100 to-yellow-50 border border-amber-200 text-amber-700 rounded-full text-[10px] sm:text-[11px] font-bold shadow-sm whitespace-nowrap" title="ทำแผน Wheel of Life 7 วันสำเร็จแบบ 100%">
                          🎖️ Perfect Week x{perfectWeeks}
                        </div>
                      )}
                    </div>
                  </div>"""

if old_badge in content:
    content = content.replace(old_badge, new_badge)
else:
    print("WARNING: Old badge block not found!")

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
