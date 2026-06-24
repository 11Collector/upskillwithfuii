import re

file_path = "/Users/thanawatlovitayaolan/upskillwithfuii-web/src/app/dashboard/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Targets to check
targets = {
    "SHOP_ITEMS": "const SHOP_ITEMS = [",
    "deposit_state": "  const [showDepositModal, setShowDepositModal] = useState(false);",
    "loadDashboardData_potXP": "        setPotXP(userData.potXP || 0);\n\n        const activeDateToCheck = userData.lastActiveDate || userData.lastQuestDate;",
    "handleDepositXP": "  const handleDepositXP = async (amount: number) => {",
    "handleResetAllData": "        questPrefsBlockDate: \"\",\n        questPreferences: null,\n        bookMatchCache: null,",
    "old_static_shop": "        {/* --- 🛍️ 2.5 Happiness Shop Section --- */}",
    "bento_grid_brain": "                </Link>",
    "mobile_widgets": "                    {/* 📱 Mobile Only: Level & Logout Row (🌟 แสดงเฉพาะบนมือถือ) */}",
    "ticket_modal": "      {/* --- 🎫 Modal: Happiness Ticket Modal (ตั๋วความสุข) --- */}"
}

for name, query in targets.items():
    count = content.count(query)
    print(f"Target '{name}': count={count}")
