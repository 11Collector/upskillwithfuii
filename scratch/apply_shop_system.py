import os

file_path = "/Users/thanawatlovitayaolan/upskillwithfuii-web/src/app/dashboard/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    code = f.read()

# ----------------- 1. Replace SHOP_ITEMS with SHOP_POOL & replenishActiveShopItems -----------------
old_shop_items = """const SHOP_ITEMS = [
  // 🟢 ระดับที่ 1: ความสุขรายวัน (Green Tier: daily, 20-40 XP)
  { id: 1, title: "กาแฟ Specialty / ชานมพรีเมียม 1 แก้ว", price: 20, tier: "daily", emoji: "☕" },
  { id: 2, title: "เบเกอรี่ / เค้กจากร้านดัง 1 ชิ้น", price: 30, tier: "daily", emoji: "🍰" },
  { id: 3, title: "มื้อพิเศษตามใจปาก ซูชิเซ็ต / หมูกรอบเบิ้ล", price: 30, tier: "daily", emoji: "🍣" },
  { id: 4, title: "พวงกุญแจ / แผ่นสติกเกอร์ลายที่ชอบ", price: 35, tier: "daily", emoji: "🔑" },
  { id: 5, title: "แก้วน้ำเก็บความเย็น / แก้วมัคน่ารักๆ", price: 40, tier: "daily", emoji: "🥤" },

  // 🟡 ระดับที่ 2: รางวัลสุดสัปดาห์ (Yellow Tier: weekend, 50-80 XP)
  { id: 6, title: "เซ็ตชาบู / หมูกระทะ / ปิ้งย่าง 1 มื้อ", price: 50, tier: "weekend", emoji: "🍲" },
  { id: 7, title: "บอร์ดเกมขนาดเล็ก / การ์ดเกม", price: 50, tier: "weekend", emoji: "🎲" },
  { id: 8, title: "ตั๋วหนังโรง VIP / โรง IMAX 1 ที่นั่ง", price: 60, tier: "weekend", emoji: "🎬" },
  { id: 9, title: "หมอนหนุนดูดวิญญาณ / หมอนเมมโมรี่โฟม", price: 70, tier: "weekend", emoji: "🛌" },
  { id: 10, title: "หนังสือเล่มโปรด / มังงะยกเซ็ต", price: 80, tier: "weekend", emoji: "📚" },

  // 🟠 ระดับที่ 3: ของรางวัลชิ้นกลาง (Orange Tier: mid, 100-150 XP)
  { id: 11, title: "คอร์สเข้าร้านนวดสปา / นวดแผนไทย", price: 100, tier: "mid", emoji: "💆" },
  { id: 12, title: "กล่องสุ่ม Art Toy ยอดฮิต 1 จุ่ม", price: 120, tier: "mid", emoji: "🎁" },
  { id: 13, title: "แผ่นเกมคอนโซล / บัตรเติมเงินเกม", price: 120, tier: "mid", emoji: "🎮" },
  { id: 14, title: "บัตรรับประทานอาหารบุฟเฟต์โรงแรมหรู", price: 150, tier: "mid", emoji: "🍽️" },
  { id: 15, title: "สกินแคร์ / น้ำหอมแบรนด์เนม 1 ขวด", price: 150, tier: "mid", emoji: "🧴" },

  // 🔴 ระดับที่ 4: บิ๊กโบนัส/ทริปในฝัน (Red Tier: epic, 200-500 XP)
  { id: 16, title: "รองเท้าผ้าใบ (Sneakers) คู่ใจคู่ใหม่", price: 200, tier: "epic", emoji: "👟" },
  { id: 17, title: "บัตรคอนเสิร์ต / งานมิวสิคเฟสติวัล", price: 250, tier: "epic", emoji: "🎟️" },
  { id: 18, title: "แกดเจ็ตแต่งโต๊ะคอม / คีย์บอร์ด Custom", price: 300, tier: "epic", emoji: "⌨️" },
  { id: 19, title: "ทริปต่างจังหวัด 2 วัน 1 คืน โรงแรมสวย", price: 350, tier: "epic", emoji: "🏖️" },
  { id: 20, title: "ตั๋วเครื่องบินไปเที่ยวต่างประเทศใกล้ๆ", price: 500, tier: "epic", emoji: "✈️" }
];"""

new_shop_pool = """const SHOP_POOL = [
  // 🟢 ระดับที่ 1: ความสุขรายวัน (Green Tier: daily, 20-40 XP)
  { id: 1, title: "กาแฟ Specialty / ชานมพรีเมียม 1 แก้ว", price: 20, tier: "daily", emoji: "☕" },
  { id: 2, title: "เบเกอรี่ / เค้กจากร้านดัง 1 ชิ้น", price: 30, tier: "daily", emoji: "🍰" },
  { id: 3, title: "มื้อพิเศษตามใจปาก ซูชิเซ็ต / หมูกรอบเบิ้ล", price: 30, tier: "daily", emoji: "🍣" },
  { id: 4, title: "พวงกุญแจ / แผ่นสติกเกอร์ลายที่ชอบ", price: 35, tier: "daily", emoji: "🔑" },
  { id: 5, title: "ไอศกรีมเจลาโต้รสโปรด 1 ถ้วย", price: 35, tier: "daily", emoji: "🍨" },
  { id: 6, title: "โดนัทแบรนด์โปรด 2 ชิ้น", price: 25, tier: "daily", emoji: "🍩" },
  { id: 7, title: "เฟรนช์ฟรายส์ชีสถาดใหญ่", price: 30, tier: "daily", emoji: "🍟" },
  { id: 8, title: "ช็อกโกแลตนำเข้าสุดพรีเมียม", price: 40, tier: "daily", emoji: "🍫" },
  { id: 9, title: "ชานมไข่มุกพ่นไฟหวานน้อย", price: 20, tier: "daily", emoji: "🧋" },
  { id: 10, title: "น้ำผลไม้สกัดเย็นเพื่อสุขภาพ", price: 25, tier: "daily", emoji: "🥤" },

  // 🟡 ระดับที่ 2: รางวัลสุดสัปดาห์ (Yellow Tier: weekend, 50-80 XP)
  { id: 11, title: "เซ็ตชาบู / หมูกระทะ / ปิ้งย่าง 1 มื้อ", price: 50, tier: "weekend", emoji: "🍲" },
  { id: 12, title: "บอร์ดเกมขนาดเล็ก / การ์ดเกม", price: 50, tier: "weekend", emoji: "🎲" },
  { id: 13, title: "ตั๋วหนังโรง VIP / โรง IMAX 1 ที่นั่ง", price: 60, tier: "weekend", emoji: "🎬" },
  { id: 14, title: "หมอนหนุนดูดวิญญาณ / หมอนเมมโมรี่โฟม", price: 70, tier: "weekend", emoji: "🛌" },
  { id: 15, title: "หนังสือเล่มโปรด / มังงะยกเซ็ต", price: 80, tier: "weekend", emoji: "📚" },
  { id: 16, title: "บุฟเฟต์ปิ้งย่างร้านโปรดสัปดาห์นี้", price: 60, tier: "weekend", emoji: "🥩" },
  { id: 17, title: "สกินแคร์ / มาส์กหน้าเซ็ตบำรุงผิว", price: 55, tier: "weekend", emoji: "💆" },
  { id: 18, title: "เสื้อยืด / หมวกแฟชั่นลายที่ถูกใจ", price: 65, tier: "weekend", emoji: "🧢" },
  { id: 19, title: "ขนมพรีเมียมนำเข้าจากญี่ปุ่นยกกล่อง", price: 70, tier: "weekend", emoji: "📦" },
  { id: 20, title: "หูฟัง TWS ไร้สายตัวประหยัดสำหรับใส่วิ่ง", price: 80, tier: "weekend", emoji: "🎧" },

  // 🟠 ระดับที่ 3: ของรางวัลชิ้นกลาง (Orange Tier: mid, 100-150 XP)
  { id: 21, title: "คอร์สเข้าร้านนวดสปา / นวดแผนไทย", price: 100, tier: "mid", emoji: "💆" },
  { id: 22, title: "กล่องสุ่ม Art Toy ยอดฮิต 1 จุ่ม", price: 120, tier: "mid", emoji: "🎁" },
  { id: 23, title: "แผ่นเกมคอนโซล / บัตรเติมเงินเกม", price: 120, tier: "mid", emoji: "🎮" },
  { id: 24, title: "บัตรรับประทานอาหารบุฟเฟต์โรงแรมหรู", price: 150, tier: "mid", emoji: "🍽️" },
  { id: 25, title: "สกินแคร์ / น้ำหอมแบรนด์เนม 1 ขวด", price: 150, tier: "mid", emoji: "🧴" },
  { id: 26, title: "คีย์บอร์ดกลไก Mechanical Keyboard", price: 130, tier: "mid", emoji: "⌨️" },
  { id: 27, title: "กระเป๋าเป้สะพายหลังแบรนด์เนมเท่ๆ", price: 140, tier: "mid", emoji: "🎒" },
  { id: 28, title: "เซ็ตชาบูชาบูพรีเมียมวากิว 2 ที่", price: 110, tier: "mid", emoji: "🍲" },
  { id: 29, title: "โคมไฟตั้งโต๊ะอัจฉริยะถนอมสายตา", price: 100, tier: "mid", emoji: "💡" },
  { id: 30, title: "หม้อทอดไร้น้ำมันขนาดพกพาแบรนด์ดัง", price: 120, tier: "mid", emoji: "🍳" },

  // 🔴 ระดับที่ 4: บิ๊กโบนัส/ทริปในฝัน (Red Tier: epic, 200-500 XP)
  { id: 31, title: "รองเท้าผ้าใบ (Sneakers) คู่ใจคู่ใหม่", price: 200, tier: "epic", emoji: "👟" },
  { id: 32, title: "บัตรคอนเสิร์ต / งานมิวสิคเฟสติวัล", price: 250, tier: "epic", emoji: "🎟️" },
  { id: 33, title: "อุปกรณ์จัดโต๊ะคอม / จอมอนิเตอร์ตัวใหม่", price: 300, tier: "epic", emoji: "🖥️" },
  { id: 34, title: "ทริปต่างจังหวัด 2 วัน 1 คืน โรงแรมสวย", price: 350, tier: "epic", emoji: "🏖️" },
  { id: 35, title: "ตั๋วเครื่องบินไปเที่ยวต่างประเทศใกล้ๆ", price: 500, tier: "epic", emoji: "✈️" },
  { id: 36, title: "หูฟังตัดเสียงรบกวน ANC พรีเมียม", price: 400, tier: "epic", emoji: "🎧" },
  { id: 37, title: "โต๊ะทำงานปรับระดับไฟฟ้าเพื่อสุขภาพ", price: 500, tier: "epic", emoji: "🪟" },
  { id: 38, title: "กล้องถ่ายรูป Instant หรือกล้องฟิล์มแนวๆ", price: 300, tier: "epic", emoji: "📷" },
  { id: 39, title: "เครื่องชงกาแฟ Espresso ขนาดเล็กที่บ้าน", price: 450, tier: "epic", emoji: "☕" },
  { id: 40, title: "บัตรสมาชิกร้านหนังสือชั้นนำ 1 ปี", price: 220, tier: "epic", emoji: "💳" }
];

const replenishActiveShopItems = (currentActive: Record<string, any[]>, redeemedList: any[]) => {
  const redeemedIds = redeemedList.map((item: any) => item.id);
  const updatedActive = { ...currentActive };
  let needsUpdate = false;

  const tiers = ["daily", "weekend", "mid", "epic"];
  tiers.forEach((tier) => {
    const items = updatedActive[tier] || [];
    if (items.length < 5) {
      const activeIds = items.map((item: any) => item.id);
      const availablePool = SHOP_POOL.filter(
        (item: any) => item.tier === tier && !redeemedIds.includes(item.id) && !activeIds.includes(item.id)
      );

      if (availablePool.length > 0) {
        const needed = 5 - items.length;
        const shuffled = [...availablePool].sort(() => 0.5 - Math.random());
        const added = shuffled.slice(0, needed);
        updatedActive[tier] = [...items, ...added];
        needsUpdate = true;
      }
    }
  });

  return { updatedActive, needsUpdate };
};"""

if old_shop_items in code:
    code = code.replace(old_shop_items, new_shop_pool)
    print("1. SHOP_POOL applied successfully!")
else:
    print("1. SHOP_POOL target not found!")

# ----------------- 2. Replace State variables & hide-bottom-nav useEffect -----------------
old_states = """  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [redeemedItem, setRedeemedItem] = useState<any>(null);
  const [showLevelInfo, setShowLevelInfo] = useState(false);
  const [showFloatingXP, setShowFloatingXP] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositError, setDepositError] = useState<string>("");

  const [infoModal, setInfoModal] = useState<{ isOpen: boolean, title: string, content: string | React.ReactNode } | null>(null);
  const [bookMatchModal, setBookMatchModal] = useState(false);
  const [bookMatchBooks, setBookMatchBooks] = useState<{ title: string; author: string; reason: string; category: string }[]>([]);
  const [bookMatchLoading, setBookMatchLoading] = useState(false);
  const [savedBooks, setSavedBooks] = useState<Set<string>>(new Set());
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectionBooks, setCollectionBooks] = useState<{ title: string; author: string; category: string }[]>([]);
  const [collectionQuests, setCollectionQuests] = useState<{ title: string; type: string; completedAt: string }[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(false);

  useEffect(() => {
    if (showCollectionModal) {
      document.body.classList.add('hide-bottom-nav');
    } else {
      document.body.classList.remove('hide-bottom-nav');
    }
    return () => document.body.classList.remove('hide-bottom-nav');
  }, [showCollectionModal]);"""

new_states = """  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [activeShopItems, setActiveShopItems] = useState<Record<string, any[]>>({
    daily: [],
    weekend: [],
    mid: [],
    epic: []
  });
  const [redeemedHistory, setRedeemedHistory] = useState<any[]>([]);
  const [activeShopTab, setActiveShopTab] = useState<"daily" | "weekend" | "mid" | "epic" | "history">("daily");
  const [redeemedItem, setRedeemedItem] = useState<any>(null);
  const [showLevelInfo, setShowLevelInfo] = useState(false);
  const [showFloatingXP, setShowFloatingXP] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositError, setDepositError] = useState<string>("");

  const [infoModal, setInfoModal] = useState<{ isOpen: boolean, title: string, content: string | React.ReactNode } | null>(null);
  const [bookMatchModal, setBookMatchModal] = useState(false);
  const [bookMatchBooks, setBookMatchBooks] = useState<{ title: string; author: string; reason: string; category: string }[]>([]);
  const [bookMatchLoading, setBookMatchLoading] = useState(false);
  const [savedBooks, setSavedBooks] = useState<Set<string>>(new Set());
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectionBooks, setCollectionBooks] = useState<{ title: string; author: string; category: string }[]>([]);
  const [collectionQuests, setCollectionQuests] = useState<{ title: string; type: string; completedAt: string }[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(false);

  useEffect(() => {
    if (showCollectionModal || showShopModal) {
      document.body.classList.add('hide-bottom-nav');
    } else {
      document.body.classList.remove('hide-bottom-nav');
    }
    return () => document.body.classList.remove('hide-bottom-nav');
  }, [showCollectionModal, showShopModal]);"""

if old_states in code:
    code = code.replace(old_states, new_states)
    print("2. State declarations applied successfully!")
else:
    print("2. State declarations target not found!")

# ----------------- 3. Replace Firestore sync in loadDashboardData -----------------
old_sync = """        setPotXP(userData.potXP || 0);

        const activeDateToCheck = userData.lastActiveDate || userData.lastQuestDate;"""

new_sync = """        setPotXP(userData.potXP || 0);

        // Sync active shop items and history from Firestore
        const history = userData.redeemedHistory || [];
        setRedeemedHistory(history);

        let active = userData.activeShopItems || { daily: [], weekend: [], mid: [], epic: [] };
        const { updatedActive, needsUpdate } = replenishActiveShopItems(active, history);

        if (needsUpdate || !userData.activeShopItems) {
          const userDocRef = doc(db, "users", currentUser.uid);
          await setDoc(userDocRef, {
            activeShopItems: updatedActive
          }, { merge: true });
          setActiveShopItems(updatedActive);
        } else {
          setActiveShopItems(active);
        }

        const activeDateToCheck = userData.lastActiveDate || userData.lastQuestDate;"""

if old_sync in code:
    code = code.replace(old_sync, new_sync)
    print("3. Firestore sync logic applied successfully!")
else:
    print("3. Firestore sync logic target not found!")

# ----------------- 4. Replace handleDepositXP and handleRedeemItem -----------------
old_handlers = """  const handleDepositXP = async (amount: number) => {
    if (!user) return;
    const maxTransfer = totalXP % 100;
    if (amount <= 0 || amount > maxTransfer) {
      alert(`จำนวน XP ไม่ถูกต้อง โอนได้สูงสุด ${maxTransfer} XP`);
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        totalXP: increment(-amount),
        potXP: increment(amount)
      });

      setTotalXP((prev) => prev - amount);
      setPotXP((prev) => prev + amount);
      setShowDepositModal(false);
      
      playSuccessChime();
    } catch (error) {
      console.error("Error depositing XP:", error);
      alert("เกิดข้อผิดพลาดในการหยอดกระปุก");
    }
  };

  const handleRedeemItem = async (item: any) => {
    if (!user) return;
    if (potXP < item.price) {
      alert("แต้มในกระปุกไม่เพียงพอ");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        potXP: increment(-item.price)
      });

      setPotXP((prev) => prev - item.price);
      setRedeemedItem(item);
      setShowConfetti(true);
      setShowTicketModal(true);

      playSuccessChime();
      
      setTimeout(() => setShowConfetti(false), 4500);
    } catch (error) {
      console.error("Error redeeming item:", error);
      alert("เกิดข้อผิดพลาดในการแลกรางวัล");
    }
  };"""

new_handlers = """  const handleDepositXP = async (amount: number) => {
    if (!user) return;
    const maxTransfer = totalXP % 100;
    if (amount <= 0 || amount > maxTransfer) {
      alert(`จำนวน XP ไม่ถูกต้อง โอนได้สูงสุด ${maxTransfer} XP`);
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        totalXP: increment(-amount),
        potXP: increment(amount)
      });

      setTotalXP((prev) => prev - amount);
      setPotXP((prev) => prev + amount);
      setShowDepositModal(false);
    } catch (error) {
      console.error("Error depositing XP:", error);
      alert("เกิดข้อผิดพลาดในการออม XP");
    }
  };

  const handleRedeemItem = async (item: any) => {
    if (!user) return;
    if (potXP < item.price) {
      alert("แต้มในกระปุกไม่เพียงพอ");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      const newRedeemedHistory = [...redeemedHistory, { ...item, redeemedAt: new Date().toISOString() }];
      
      const updatedActive = { ...activeShopItems };
      updatedActive[item.tier] = (updatedActive[item.tier] || []).filter((activeItem: any) => activeItem.id !== item.id);
      
      const { updatedActive: finalActive } = replenishActiveShopItems(updatedActive, newRedeemedHistory);

      await updateDoc(userRef, {
        potXP: increment(-item.price),
        activeShopItems: finalActive,
        redeemedHistory: newRedeemedHistory
      });

      setPotXP((prev) => prev - item.price);
      setActiveShopItems(finalActive);
      setRedeemedHistory(newRedeemedHistory);

      setRedeemedItem(item);
      setShowConfetti(true);
      setShowTicketModal(true);

      playSuccessChime();
      
      setTimeout(() => setShowConfetti(false), 4500);
    } catch (error) {
      console.error("Error redeeming item:", error);
      alert("เกิดข้อผิดพลาดในการแลกรางวัล");
    }
  };"""

if old_handlers in code:
    code = code.replace(old_handlers, new_handlers)
    print("4. Handlers applied successfully!")
else:
    print("4. Handlers target not found!")

# ----------------- 5. Clear shop states in handleResetAllData -----------------
old_reset = """        questPrefsBlockDate: "",
        questPreferences: null,
        bookMatchCache: null,"""

new_reset = """        questPrefsBlockDate: "",
        questPreferences: null,
        bookMatchCache: null,
        lastChatDate: null,
        activeShopItems: null,
        redeemedHistory: [],"""

if old_reset in code:
    code = code.replace(old_reset, new_reset)
    print("5. Reset cleanup in Firestore applied successfully!")
else:
    print("5. Reset cleanup in Firestore target not found!")

# Also client UI states in reset function:
old_client_reset = """      setCompletedQuests([]);
      setTotalXP(0);
      setPotXP(0);"""

new_client_reset = """      setCompletedQuests([]);
      setTotalXP(0);
      setPotXP(0);
      setActiveShopItems({ daily: [], weekend: [], mid: [], epic: [] });
      setRedeemedHistory([]);"""

if old_client_reset in code:
    code = code.replace(old_client_reset, new_client_reset)
    print("5b. Reset client states applied successfully!")
else:
    print("5b. Reset client states target not found!")

# ----------------- 6. Remove old static Happiness Shop Section -----------------
# Let's read lines 3720 to 3826 in reverted page.tsx to see what content was deleted.
# We will match the entire block starting with {/* --- 🛍️ 2.5 Happiness Shop Section --- */}
# Let's inspect it in python:
old_static_shop_block = """        {/* --- 🛍️ 2.5 Happiness Shop Section --- */}
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
                    className="flex flex-col justify-between h-full bg-white p-5 rounded-3xl border border-slate-100 hover:border-violet-200/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden group/item"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black tracking-wide border ${tierColorClass}`}>
                          {tierLabel}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shadow-inner group-hover/item:scale-110 transition-transform duration-300">
                          {item.emoji}
                        </div>
                      </div>

                      <h3 className="text-xs font-black text-slate-800 leading-snug mb-4 line-clamp-2 min-h-[2.5rem] group-hover/item:text-violet-650 transition-colors">
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex flex-col mt-auto pt-3 border-t border-slate-50 relative z-10 w-full">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold text-slate-400">ราคา</span>
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1">
                          <Trophy size={11} className="text-yellow-500 fill-current" />
                          {item.price} <span className="text-[10px] font-bold text-slate-400">XP</span>
                        </span>
                      </div>

                      {canRedeem ? (
                        <button
                          onClick={() => handleRedeemItem(item)}
                          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2 rounded-xl text-[10px] font-black tracking-wider uppercase shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 cursor-pointer text-center"
                        >
                          แลกรางวัล 🚀
                        </button>
                      ) : (
                        <div className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2 px-3 text-center text-[10px] font-bold text-slate-400 select-none">
                          ขาดอีก {deficit} XP
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}"""

if old_static_shop_block in code:
    code = code.replace(old_static_shop_block, "")
    print("6. Old static Happiness Shop removed successfully!")
else:
    # Try with slight whitespace variation just in case
    print("6. Old static Happiness Shop block not matched exactly. Attempting regex replacement...")
    import re
    pattern = r"\s*\{\/\*\s*---\s*🛍️\s*2\.5\s*Happiness\s*Shop\s*Section\s*---\s*\*\/.*?\}\s*\}\s*\)\}\n"
    match = re.search(pattern, code, re.DOTALL)
    if match:
        code = code.replace(match.group(0), "")
        print("6. Old static Happiness Shop removed via regex!")
    else:
        print("6. Old static Happiness Shop target not found!")

# ----------------- 7. Add light-themed White & Purple Bento Card after Brain Link -----------------
old_bento_brain_context = """                {/* 🌟 6. BRAIN (Upskill Library) - Premium Gold & Black Style */}
                <Link
                  href="/library"
                  className="group block h-full relative cursor-pointer"
                >
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="h-full p-8 rounded-[3rem] shadow-sm border transition-all duration-500 relative overflow-hidden flex flex-col items-center text-center bg-slate-950 border-slate-800 hover:shadow-[0_40px_100px_rgba(0,0,0,0.6)] hover:border-amber-500/50"
                  >

                    {/* 🏷️ Status Badge */}
                    <div className="absolute top-8 right-8 z-30">
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="bg-gradient-to-r from-amber-400 to-yellow-600 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-amber-900/20 flex items-center gap-1.5 uppercase tracking-wider"
                      >
                        <Unlock size={10} className="fill-current" /> OPEN
                      </motion.div>
                    </div>

                    {/* ✨ Ambient Light & Top Bar */}
                    <div className="absolute top-0 right-0 w-72 h-72 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none transition-colors duration-700 bg-amber-500/10 group-hover:bg-amber-500/20" />
                    <div className="absolute top-0 left-0 w-full h-1.5 opacity-80 transition-all duration-500 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300" />

                    <div className="relative z-10 flex flex-col items-center h-full w-full">

                      {/* 🧠 Logo Container */}
                      <div className="relative mb-6 mt-2">
                        <div className="absolute inset-0 blur-3xl opacity-20 bg-amber-400/30" />
                        <div className="relative w-24 h-24 rounded-full border flex items-center justify-center text-6xl transition-transform duration-500 shadow-2xl bg-slate-900 border-amber-500/30 group-hover:scale-110 group-hover:border-amber-400 group-hover:shadow-amber-500/20">
                          🧠
                        </div>
                      </div>

                      <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-2.5 text-amber-500/60">
                        UPSKILL BRAIN
                      </h3>
                      <h2 className="text-3xl font-black mb-3 leading-tight tracking-tight transition-colors text-white group-hover:text-amber-400">
                        คลังสมองอัพสกิล
                      </h2>

                      <p className="text-[14px] font-medium mb-8 px-6 leading-relaxed max-w-[280px] transition-colors text-slate-400">
                        สรุปหนังสือและบทความเด็ดๆ <br /> ที่คัดมาเพื่อคุณโดยเฉพาะ
                      </p>

                      <div className="w-full px-4 mt-auto">
                        <div className="group/btn-library relative">
                          <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(245,158,11,0.4)] group-hover/btn-library:scale-[1.02] group-hover/btn-library:shadow-amber-500/50 active:scale-95">
                            <Sparkles size={16} className="text-slate-950/80" />
                            <span>เปิดอ่านคลังสมอง</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>"""

# The new light-themed white & purple Bento Card!
new_bento_brain_with_shop = old_bento_brain_context + """

                {/* 🌟 HAPPINESS SHOP - Premium White & Purple Style (Theme ขาวม่วง) */}
                <button
                  onClick={() => setShowShopModal(true)}
                  className="group block h-full text-left relative cursor-pointer focus:outline-none w-full"
                >
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="h-full p-8 rounded-[3rem] shadow-sm border transition-all duration-500 relative overflow-hidden flex flex-col items-center text-center bg-white border-slate-200/80 hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] hover:border-violet-400/50"
                  >
                    {/* 🏷️ Status Badge */}
                    <div className="absolute top-8 right-8 z-30">
                      <motion.div
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-violet-500/10 flex items-center gap-1.5 uppercase tracking-wider"
                      >
                        <PiggyBank size={10} className="text-white" /> {potXP} XP
                      </motion.div>
                    </div>

                    {/* ✨ Ambient Light & Top Bar */}
                    <div className="absolute top-0 right-0 w-72 h-72 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none transition-colors duration-700 bg-violet-500/5 group-hover:bg-violet-500/10" />
                    <div className="absolute top-0 left-0 w-full h-1.5 opacity-80 transition-all duration-500 bg-gradient-to-r from-violet-400 via-violet-600 to-violet-400" />

                    <div className="relative z-10 flex flex-col items-center h-full w-full">

                      {/* 🛍️ Logo Container */}
                      <div className="relative mb-6 mt-2">
                        <div className="absolute inset-0 blur-3xl opacity-15 bg-violet-500/20" />
                        <div className="relative w-24 h-24 rounded-full border flex items-center justify-center text-6xl transition-transform duration-500 shadow-xl bg-slate-50 border-slate-100 group-hover:scale-110 group-hover:border-violet-300 group-hover:shadow-violet-200/20">
                          🛍️
                        </div>
                      </div>

                      <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] mb-2.5 text-violet-500/60">
                        HAPPINESS SHOP
                      </h3>
                      <h2 className="text-3xl font-black mb-3 leading-tight tracking-tight transition-colors text-slate-800 group-hover:text-violet-600">
                        ความสุขระหว่างทาง
                      </h2>

                      <p className="text-[14px] font-medium mb-8 px-6 leading-relaxed max-w-[280px] transition-colors text-slate-500">
                        ใช้แต้ม XP ในกระปุกออมสิน <br /> แลกของรางวัลสร้างความสุขเล็กๆ
                      </p>

                      <div className="w-full px-4 mt-auto">
                        <div className="group/btn-shop relative">
                          <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[13px] font-black uppercase tracking-widest transition-all duration-300 shadow-[0_10px_20px_-5px_rgba(109,40,217,0.3)] group-hover/btn-shop:scale-[1.02] group-hover/btn-shop:shadow-violet-500/30 active:scale-95">
                            <ShoppingBag size={16} className="text-white/80" />
                            <span>เปิดร้านค้าความสุข</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </button>"""

if old_bento_brain_context in code:
    code = code.replace(old_bento_brain_context, new_bento_brain_with_shop)
    print("7. Bento grid Happiness Shop card applied successfully!")
else:
    print("7. Bento grid Happiness Shop card target not found!")

# ----------------- 8. Merge mobile widgets and rename หยอดกระปุก to ออม XP (Desktop) -----------------
# Desktop 'หยอดกระปุก' button text target:
old_desktop_pot_btn = """                    <button
                      onClick={() => setShowDepositModal(true)}
                      className="px-2.5 py-1 text-[10px] font-black text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-full shadow-[0_2px_10px_rgba(109,40,217,0.3)] transition-all shrink-0 active:scale-95"
                    >
                      หยอดกระปุก
                    </button>"""

new_desktop_pot_btn = """                    <button
                      onClick={() => setShowDepositModal(true)}
                      className="px-2.5 py-1 text-[10px] font-black text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-full shadow-[0_2px_10px_rgba(109,40,217,0.3)] transition-all shrink-0 active:scale-95"
                    >
                      ออม XP
                    </button>"""

if old_desktop_pot_btn in code:
    code = code.replace(old_desktop_pot_btn, new_desktop_pot_btn)
    print("8a. Desktop 'ออม XP' button applied successfully!")
else:
    print("8a. Desktop 'ออม XP' button target not found!")

# Mobile layout merging:
old_mobile_widgets = """                    {/* 📱 Mobile Only: Level & Logout Row (🌟 แสดงเฉพาะบนมือถือ) */}
                    <div className="flex sm:hidden flex-col items-center justify-center gap-3 w-full mt-6 relative z-[999]">
                      <div className="flex items-center justify-center gap-2 w-full">
                        {/* 🎯 Mobile: Level Box & Edit Name */}
                        <div className="flex items-center gap-3 bg-slate-800/80 p-1.5 pl-2 pr-4 rounded-full border border-slate-600 backdrop-blur-sm shadow-xl relative w-full max-w-[250px] hover:border-yellow-500/50 transition-colors">
                          <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-slate-900 shrink-0">
                            <Trophy size={14} className="fill-current" />
                          </div>
                          <div className="flex-1 min-w-0 text-left">

                            {/* 🟢 ส่วนสลับโหมด แก้ไข / แสดงผล */}
                            {isEditingName ? (
                              <div className="flex items-center gap-1">
                                <input
                                  autoFocus
                                  defaultValue={newName}
                                  onBlur={(e) => {
                                    // Do not update automatically on blur to avoid conflict, just close
                                    setIsEditingName(false);
                                  }}
                                  className="bg-slate-700 border border-blue-500 rounded px-1.5 py-0.5 text-[10px] text-white outline-none w-full"
                                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateName((e.target as HTMLInputElement).value)}
                                />
                              </div>
                            ) : (
                              <div className="cursor-pointer" onClick={() => { setIsEditingName(true); setNewName(user?.displayName || ""); }}>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-black text-white truncate flex items-center gap-1">
                                    {user?.displayName} <Sparkles size={10} className="text-yellow-400" />
                                  </span>
                                  {/* ปุ่ม Info สำหรับเปิด Modal กลางจอ */}
                                  <button onClick={(e) => { e.stopPropagation(); setShowLevelInfo(true); }} className="text-slate-400 p-1">
                                    <Info size={14} />
                                  </button>
                                </div>
                                <p className="text-[9px] font-bold text-yellow-400 uppercase tracking-widest leading-none mt-0.5">
                                  {/* ✅ แก้ไขจุดนี้: เปลี่ยนจาก .split(' ')[0] เป็น .split(' (')[0] เพื่อให้ได้ชื่อเต็มภาษาอังกฤษ */}
                                  LV.{currentLevel} {getLevelTitle(currentLevel).split(' (')[0]}
                                </p>
                              </div>
                            )}

                            <div className="w-full h-1 bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" style={{ width: `${currentLevelXP}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Mobile: Logout Button */}
                        <button onClick={handleLogout} className="p-2.5 bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-full shadow-lg transition-all shrink-0">
                          <LogOut size={14} />
                        </button>
                      </div>

                      {/* 🐷 Saving Pot Widget (Mobile) */}
                      <div className="flex items-center gap-3 bg-slate-800/80 p-1.5 pl-2 pr-4 rounded-full border border-slate-600 backdrop-blur-sm shadow-xl relative w-full max-w-[250px] hover:border-violet-500/50 transition-colors">
                        <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] shrink-0">
                          <PiggyBank size={14} />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block">Saving Pot</span>
                          <p className="text-xs font-black text-white mt-0.5 truncate">
                            {potXP} <span className="text-[10px] font-bold text-slate-400">XP</span>
                          </p>
                        </div>
                        <button
                          onClick={() => setShowDepositModal(true)}
                          className="px-2.5 py-1 text-[10px] font-black text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-full shadow-[0_2px_10px_rgba(109,40,217,0.3)] transition-all shrink-0 active:scale-95"
                        >
                          หยอดกระปุก
                        </button>
                      </div>
                    </div>"""

new_mobile_widgets = """                    {/* 📱 Mobile Only: Combined User Profile & Saving Pot Card */}
                    <div className="flex sm:hidden w-full mt-6 relative z-[999] justify-center">
                      <div className="w-full max-w-[280px] bg-slate-800/90 border border-slate-700/60 p-5 rounded-[2rem] shadow-2xl backdrop-blur-md relative overflow-hidden">
                        {/* Subtle background glow */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br blur-2xl rounded-full opacity-10 bg-violet-500 pointer-events-none" />
                        
                        {/* Upper Section: Profile Info & Logout */}
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
                          
                          <button onClick={handleLogout} className="p-2 bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-full shadow-lg transition-all shrink-0">
                            <LogOut size={12} />
                          </button>
                        </div>

                        {/* Middle Section: Level Progress */}
                        <div className="mb-4 text-left">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Level Progress</span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-black text-yellow-400">LV.{currentLevel}</span>
                              <button onClick={() => setShowLevelInfo(true)} className="text-slate-400 hover:text-yellow-400 p-0.5 transition-colors">
                                <Info size={12} />
                              </button>
                            </div>
                          </div>
                          <p className="text-[9px] font-bold text-yellow-400/90 uppercase tracking-widest leading-none truncate mb-2">
                            {getLevelTitle(currentLevel).split(' (')[0]}
                          </p>
                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden relative">
                            <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000" style={{ width: `${currentLevelXP}%` }} />
                          </div>
                        </div>

                        {/* Lower Section: Saving Pot */}
                        <div className="bg-[#111]/60 border border-white/5 p-3 rounded-2xl flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-1.5 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] shrink-0">
                              <PiggyBank size={14} />
                            </div>
                            <div className="text-left min-w-0">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider leading-none block">Saving Pot</span>
                              <p className="text-[11px] font-black text-white mt-0.5 truncate">
                                {potXP} <span className="text-[9px] font-bold text-slate-400">XP</span>
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowDepositModal(true)}
                            className="px-2.5 py-1 text-[10px] font-black text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-full shadow-[0_2px_10px_rgba(109,40,217,0.3)] transition-all shrink-0 active:scale-95"
                          >
                            ออม XP
                          </button>
                        </div>
                      </div>
                    </div>"""

if old_mobile_widgets in code:
    code = code.replace(old_mobile_widgets, new_mobile_widgets)
    print("8b. Mobile unified card layout applied successfully!")
else:
    print("8b. Mobile unified card layout target not found!")

# ----------------- 9. Rename deposit modal labels to ออม XP -----------------
old_deposit_modal = """      {/* --- 🐷 Modal: หยอดกระปุกออม XP --- */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowDepositModal(false);
                setDepositAmount("");
                setDepositError("");
              }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-700 p-8 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] text-left overflow-hidden z-10"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/10 blur-[60px] rounded-full pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-black text-white flex items-center gap-2">
                    <PiggyBank size={18} className="text-violet-400" />
                    หยอดกระปุกออม XP
                  </h4>
                  <button
                    onClick={() => {
                      setShowDepositModal(false);
                      setDepositAmount("");
                      setDepositError("");
                    }}
                    className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                  โอนเศษ XP สะสมไปไว้ที่ Saving Pot เพื่อสะสมไว้แลกของรางวัลใน Shop โดย <span className="text-violet-400 font-bold">เลเวลปัจจุบันของคุณจะไม่ลดลง</span>
                </p>

                <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-3xl mb-6 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">โอนได้สูงสุด</span>
                    <span className="text-xs font-bold text-white">เพื่อรักษาเลเวลเดิม</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-violet-400">{totalXP % 100}</span>
                    <span className="text-[10px] font-bold text-slate-400 ml-1">XP</span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">จำนวนที่ต้องการหยอด</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDepositAmount(val);
                        const num = parseInt(val);
                        const maxTransfer = totalXP % 100;
                        if (isNaN(num) || num <= 0) {
                          setDepositError("กรุณากรอกจำนวนที่ถูกต้อง");
                        } else if (num > maxTransfer) {
                          setDepositError(`หยอดได้สูงสุด ${maxTransfer} XP เท่านั้นเพื่อไม่ให้เลเวลลด`);
                        } else {
                          setDepositError("");
                        }
                      }}
                      placeholder="0"
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3.5 px-4 pr-16 text-white font-bold outline-none focus:border-violet-500 transition-all text-sm"
                    />
                    <button
                      onClick={() => {
                        const maxTransfer = totalXP % 100;
                        setDepositAmount(maxTransfer.toString());
                        setDepositError("");
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[10px] font-black text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 rounded-xl transition-all"
                    >
                      MAX
                    </button>
                  </div>
                  {depositError && (
                    <p className="text-[11px] font-bold text-red-400 mt-2 flex items-center gap-1">
                      <span>⚠️</span> {depositError}
                    </p>
                  )}
                </div>

                <button
                  disabled={!!depositError || !depositAmount || parseInt(depositAmount) <= 0}
                  onClick={() => {
                    const amt = parseInt(depositAmount);
                    if (!isNaN(amt)) {
                      handleDepositXP(amt);
                      setDepositAmount("");
                    }
                  }}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  ยืนยันหยอดกระปุก 🚀
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>"""

new_deposit_modal = """      {/* --- 🐷 Modal: ออม XP --- */}
      <AnimatePresence>
        {showDepositModal && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowDepositModal(false);
                setDepositAmount("");
                setDepositError("");
              }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-700 p-8 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] text-left overflow-hidden z-10"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/10 blur-[60px] rounded-full pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-black text-white flex items-center gap-2">
                    <PiggyBank size={18} className="text-violet-400" />
                    ออม XP
                  </h4>
                  <button
                    onClick={() => {
                      setShowDepositModal(false);
                      setDepositAmount("");
                      setDepositError("");
                    }}
                    className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                  โอนเศษ XP สะสมไปไว้ที่ Saving Pot เพื่อสะสมไว้แลกของรางวัลใน Shop โดย <span className="text-violet-400 font-bold">เลเวลปัจจุบันของคุณจะไม่ลดลง</span>
                </p>

                <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-3xl mb-6 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">โอนได้สูงสุด</span>
                    <span className="text-xs font-bold text-white">เพื่อรักษาเลเวลเดิม</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-violet-400">{totalXP % 100}</span>
                    <span className="text-[10px] font-bold text-slate-400 ml-1">XP</span>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">จำนวนที่ต้องการออม</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDepositAmount(val);
                        const num = parseInt(val);
                        const maxTransfer = totalXP % 100;
                        if (isNaN(num) || num <= 0) {
                          setDepositError("กรุณากรอกจำนวนที่ถูกต้อง");
                        } else if (num > maxTransfer) {
                          setDepositError(`ออมได้สูงสุด ${maxTransfer} XP เท่านั้นเพื่อไม่ให้เลเวลลด`);
                        } else {
                          setDepositError("");
                        }
                      }}
                      placeholder="0"
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3.5 px-4 pr-16 text-white font-bold outline-none focus:border-violet-500 transition-all text-sm"
                    />
                    <button
                      onClick={() => {
                        const maxTransfer = totalXP % 100;
                        setDepositAmount(maxTransfer.toString());
                        setDepositError("");
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[10px] font-black text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 rounded-xl transition-all"
                    >
                      MAX
                    </button>
                  </div>
                  {depositError && (
                    <p className="text-[11px] font-bold text-red-400 mt-2 flex items-center gap-1">
                      <span>⚠️</span> {depositError}
                    </p>
                  )}
                </div>

                <button
                  disabled={!!depositError || !depositAmount || parseInt(depositAmount) <= 0}
                  onClick={() => {
                    const amt = parseInt(depositAmount);
                    if (!isNaN(amt)) {
                      handleDepositXP(amt);
                      setDepositAmount("");
                    }
                  }}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  ยืนยันการออม 🚀
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>"""

if old_deposit_modal in code:
    code = code.replace(old_deposit_modal, new_deposit_modal)
    print("9. Deposit modal wording applied successfully!")
else:
    print("9. Deposit modal wording target not found!")

# ----------------- 10. Insert the white-and-purple theme Happiness Shop Modal & Ticket Modal -----------------
# We will insert it right before the Happiness Ticket Modal block!
# Let's inspect the target ticket modal block first:
old_ticket_modal = """      {/* --- 🎫 Modal: Happiness Ticket Modal (ตั๋วความสุข) --- */}
      <AnimatePresence>
        {showTicketModal && redeemedItem && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTicketModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-700 p-6 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.5)] text-center overflow-hidden z-10 flex flex-col items-center"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-500/10 blur-[60px] rounded-full pointer-events-none" />

              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="flex justify-between items-center w-full mb-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SUCCESSFULLY REDEEMED</span>
                  <button
                    onClick={() => setShowTicketModal(false)}
                    className="p-1.5 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* 🎟️ Ticket Container to Export */}
                <div
                  id="happiness-ticket"
                  className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center shadow-inner"
                  style={{ fontFamily: 'monospace' }}
                >
                  {/* Background Glow */}
                  <div className="absolute -top-20 -left-20 w-36 h-36 bg-violet-600/15 blur-[50px] rounded-full pointer-events-none" />
                  <div className="absolute -bottom-20 -right-20 w-36 h-36 bg-indigo-600/15 blur-[50px] rounded-full pointer-events-none" />

                  {/* Ticket Notches (Custom Styled Left/Right Semi-circles) */}
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-3 w-6 h-6 rounded-full bg-slate-900 border-r border-slate-800" />
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-3 w-6 h-6 rounded-full bg-slate-900 border-l border-slate-800" />

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
                </div>

                {/* Action buttons */}
                <div className="w-full mt-6 space-y-2">
                  <button
                    onClick={async () => {
                      const { toPng } = await import("html-to-image");
                      const element = document.getElementById("happiness-ticket");
                      if (!element) return;
                      try {
                        const dataUrl = await toPng(element, {
                          pixelRatio: 3,
                          backgroundColor: '#090D16', // Sleek dark ticket background
                          cacheBust: true,
                          style: {
                            borderRadius: '1.5rem',
                          }
                        });
                        const link = document.createElement("a");
                        link.href = dataUrl;
                        link.download = `happiness-ticket-${redeemedItem.title.replace(/\s+/g, '-').slice(0, 15)}.png`;
                        link.click();
                      } catch (err) {
                        console.error("Error generating ticket image:", err);
                        alert("ไม่สามารถเซฟรูปภาพได้ในขณะนี้");
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all duration-300 active:scale-95"
                  >
                    <Camera size={14} />
                    Save Ticket Image 📸
                  </button>
                  <button
                    onClick={() => setShowTicketModal(false)}
                    className="w-full bg-slate-800 text-slate-300 hover:bg-slate-700 py-3 rounded-2xl font-bold text-xs transition-colors"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>"""

# The new light-themed white & purple Shop Modal & Ticket Modal!
new_both_modals = """      {/* --- 🛍️ Modal: Happiness Shop Modal (ร้านค้าความสุข) --- */}
      <AnimatePresence>
        {showShopModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShopModal(false)}
              className="absolute inset-0"
            />
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white border border-slate-100 rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.15)] relative max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header: Sticky at the top */}
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
                  </div>

                  {/* History Toggle Button */}
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
                              ? "bg-violet-650 text-white border-violet-650 shadow-[0_6px_20px_rgba(109,40,217,0.25)] scale-105"
                              : "bg-white text-slate-500 border border-slate-200/70 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-350"
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Tab content */}
                {activeShopTab === "history" ? (
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
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-4">
                          รายการรางวัลที่คุณแลกไปแล้ว ({redeemedHistory.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {[...redeemedHistory].reverse().map((item, idx) => {
                            const dateStr = item.redeemedAt
                              ? new Date(item.redeemedAt).toLocaleDateString('th-TH', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : "ไม่ทราบวันที่";
                            return (
                              <div
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
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (() => {
                  const tier = activeShopTab;
                  const items = activeShopItems[tier] || [];
                  
                  let tierTitle = "";
                  let tierIcon = "";
                  let tierColor = "";
                  
                  if (tier === "daily") {
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
                  }

                  return (
                    <div className="space-y-4 flex-1 flex flex-col">
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
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {items.map((item) => {
                            const canRedeem = potXP >= item.price;
                            const deficit = item.price - potXP;
                            const progressPercentage = Math.min(100, Math.round((potXP / item.price) * 100));

                            return (
                              <motion.div
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
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Footer: Bottom of Modal */}
              <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowShopModal(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-2xl transition-all active:scale-95 border border-slate-200"
                >
                  ปิดร้านค้า
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- 🎫 Modal: Happiness Ticket Modal (ตั๋วความสุข) --- */}
      <AnimatePresence>
        {showTicketModal && redeemedItem && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTicketModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white border border-slate-200 p-6 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] text-center overflow-hidden z-10 flex flex-col items-center"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/10 blur-[60px] rounded-full pointer-events-none" />

              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="flex justify-between items-center w-full mb-4">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SUCCESSFULLY REDEEMED</span>
                  <button
                    onClick={() => setShowTicketModal(false)}
                    className="p-1.5 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* 🎟️ Ticket Container to Export */}
                <div
                  id="happiness-ticket"
                  className="w-full bg-[#fbfbfe] border border-slate-200 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center shadow-inner"
                  style={{ fontFamily: 'monospace' }}
                >
                  {/* Background Glow */}
                  <div className="absolute -top-20 -left-20 w-36 h-36 bg-violet-600/10 blur-[50px] rounded-full pointer-events-none" />
                  <div className="absolute -bottom-20 -right-20 w-36 h-36 bg-indigo-600/10 blur-[50px] rounded-full pointer-events-none" />

                  {/* Ticket Notches (Custom Styled Left/Right Semi-circles) */}
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-3 w-6 h-6 rounded-full bg-white border-r border-slate-200" />
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-3 w-6 h-6 rounded-full bg-white border-l border-slate-200" />

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
                </div>

                {/* Action buttons */}
                <div className="w-full mt-6 space-y-2">
                  <button
                    onClick={async () => {
                      const { toPng } = await import("html-to-image");
                      const element = document.getElementById("happiness-ticket");
                      if (!element) return;
                      try {
                        const dataUrl = await toPng(element, {
                          pixelRatio: 3,
                          backgroundColor: '#ffffff', // Sleek light ticket background
                          cacheBust: true,
                          style: {
                            borderRadius: '1.5rem',
                          }
                        });
                        const link = document.createElement("a");
                        link.href = dataUrl;
                        link.download = `happiness-ticket-${redeemedItem.title.replace(/\s+/g, '-').slice(0, 15)}.png`;
                        link.click();
                      } catch (err) {
                        console.error("Error generating ticket image:", err);
                        alert("ไม่สามารถเซฟรูปภาพได้ในขณะนี้");
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all duration-300 active:scale-95"
                  >
                    <Camera size={14} />
                    Save Ticket Image 📸
                  </button>
                  <button
                    onClick={() => setShowTicketModal(false)}
                    className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 py-3 rounded-2xl font-bold text-xs transition-colors"
                  >
                    ปิด
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>"""

if old_ticket_modal in code:
    code = code.replace(old_ticket_modal, new_both_modals)
    print("10. Light-themed Modals (Shop & Ticket) applied successfully!")
else:
    print("10. Light-themed Modals (Shop & Ticket) target not found!")

# Write updated code back
with open(file_path, "w", encoding="utf-8") as f:
    f.write(code)
print("Updated file written successfully!")
