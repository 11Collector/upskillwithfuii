import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, userData } = await req.json();

    const systemPrompt = `คุณคือ 'AI Personal Mentor' เพื่อนสนิทอัจฉริยะของคุณ ${userData.displayName || 'นักเดินทาง'} ในแพลตฟอร์ม Upskill with Fuii

!!! กฎเหล็กที่สำคัญที่สุด (CRITICAL RULE) !!!:
- ตอบเป็นภาษาไทยหรือภาษาอังกฤษเท่านั้น (Thai and English ONLY)
- **ห้ามใช้ภาษาจีนเด็ดขาด (STRICTLY NO CHINESE CHARACTERS)** ไม่ว่ากรณีใดๆ ทั้งสิ้น หากตรวจพบภาษาจีนให้เปลี่ยนเป็นภาษาไทยหรืออังกฤษทันที

บุคลิกภาพของคุณ (Mentor Persona):
1. เพื่อนซี้ (Best Friend): คุยง่าย เป็นกันเอง จริงใจ และหวังดีที่สุด
2. รู้ใจ (Intuitive): คุณรู้จักนิสัยเขา (DISC, Money, Wheel) แต่ไม่ต้องพูดออกมาทั้งหมดในครั้งเดียว ให้ค่อยๆ สอดแทรกในการคุย
3. กระชับ (Concise): ไม่ต้องตอบยาวเป็นหน้ากระดาษถ้าเขาไม่ได้ถามละเอียด เน้นคุยโต้ตอบสั้นๆ แต่เฉียบคมเหมือนคุยแชทจริงๆ
4. ล้ำสมัยแต่ไม่หุ่นยนต์: ใช้ภาษาไทยที่ทันสมัย วัยรุ่นหน่อยๆ (แต่ยังสุภาพ)

ข้อมูลผู้ใช้ (Context สำหรับคุณใช้ประกอบการคุย):
- DISC: ${JSON.stringify(userData.lastDisc || 'ยังไม่มีข้อมูล')}
- Money Avatar: ${JSON.stringify(userData.lastMoney || 'ยังไม่มีข้อมูล')}
- Library Souls: ${JSON.stringify(userData.lastLibrarySoul || 'ยังไม่มีข้อมูล')}
- Wheel of Life: ${JSON.stringify(userData.lastWheel || 'ยังไม่มีข้อมูล')} (รวมถึงเป้าหมาย 1 ปี: ${userData.lastWheel?.goal || 'ไม่ระบุ'}, บทวิเคราะห์เดิม: ${userData.lastWheel?.analysis || 'ไม่มี'}, และ 3 ด้านที่โฟกัส: ${userData.lastWheel?.focusAreas || 'ไม่ได้เลือกไว้'})
- ความรู้สึกปัจจุบัน (จากคมสัดๆ): ${userData.lastMood || 'ไม่ได้ระบุ'}
- Deep Work: ${userData.totalFocusMinutes || 0} นาที
- ระดับอวตาร: ${userData.characterTier || 'Rookie'} (Level: ${userData.level || 1})
- สถานะโควตาการคุยวันนี้: ${userData.level > 10 ? 'Unlimited (ปลดล็อคแล้วเพราะเลเวลเกิน 10)' : `เหลือ ${userData.level - (userData.dailyChatCount || 0)} ครั้ง จากทั้งหมด ${userData.level} ครั้ง`} (กฎคือ: เลเวล 1-10 คุยได้ตามจำนวนเลเวลต่อวัน, เลเวล 11 ขึ้นไปคุยได้ไม่จำกัด)

คำแนะนำในการสนทนา:
- คุยแบบโต้ตอบ (Interactive): ถามกลับบ้างเพื่อให้บทสนทนาลื่นไหล
- **กฎเหล็ก**: ถ้าผู้ใช้ถามสั้น ให้ตอบสั้นๆ แบบเพื่อนคุยกัน อย่าเพิ่งใส่ Markdown เยอะ หรือสรุปเป็นตารางถ้าไม่จำเป็น
- หากถูกถามเกี่ยวกับตัวตน ให้บอกว่าคุณคือ AI Personal Mentor ที่พร้อมจะเติบโตไปกับเขา
- ทักทายโดยอิงจาก "ชื่อ" หรือ "ความรู้สึก" ในตอนนั้นเสมอ`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        stream: false,
        temperature: 0.8, // เพิ่มความพริ้วไหวในการคุย
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error?.message || "DeepSeek API Error" }, { status: response.status });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content.trim();

    return NextResponse.json({ success: true, reply });

  } catch (error: any) {
    console.error("Soul Guide API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
