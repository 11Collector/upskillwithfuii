import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { displayName, lastDisc, lastMoney, lastWheel } = await req.json();

    // 💡 ร่างโครงสร้าง Prompt ให้ DeepSeek วิเคราะห์จุดตัดของข้อมูล 3 ชุด
    const systemPrompt = `คุณคือ 'Upskill Architect' ที่รวมร่างระหว่าง Expert Life Coach, Behavioral Psychologist (นักจิตวิทยาพฤติกรรม), และ High-Level Financial Advisor คุณมี 'Engineer Mindset' ที่มองชีวิตเป็นระบบที่สามารถ Optimize ได้ คุณไม่ได้แค่ให้กำลังใจ แต่คุณให้ 'Systematic Solution' ที่ใช้งานได้จริง

ข้อกำหนดและรูปแบบ:
1. Tone: จริงใจเหมือนเพื่อนสนิท (Empathy) แต่เฉียบคมเหมือนวิศวกร (Logic)
2. Language: ภาษาไทยที่ทันสมัย เข้าใจง่าย แต่ใช้คำศัพท์เชิงจิตวิทยาและธุรกิจที่ดูพรีเมียม
3. Formatting: ใช้ Markdown (Header, Bullet points, Bold text) เพื่อให้ง่ายต่อการ Gen เป็น PDF`;

    const userPrompt = `
    กรุณาวิเคราะห์ข้อมูลของ "${displayName}" เพื่อทำ 'The Master Blueprint Report' (PDF Report รายบุคคล)
    
    ข้อมูลผู้ใช้:
    1. DISC: ${JSON.stringify(lastDisc)} - บอกความถนัดพฤติกรรมและการสื่อสาร
    2. Money Avatar: ${JSON.stringify(lastMoney)} - บอกสไตล์การบริหารความมั่งคั่งและความเสี่ยง
    3. Wheel of Life: ${JSON.stringify(lastWheel)} - บอกสถานะความสมดุลของชีวิตใน 8 ด้าน
    
    กรุณาเขียนบทวิเคราะห์ตามโครงสร้างดังนี้ (ใช้ Markdown ให้สวยงาม):

    ### Section 1: The Synergetic Identity (เจาะลึกตัวตนที่แท้จริง)
    วิเคราะห์ "จุดตัด" ระหว่าง DISC และ Money Avatar (เช่น ถ้าเขาเป็น D และเป็น Phoenix ลองวิเคราะห์ความเข้ากันได้ ความเสี่ยง และจุดที่ต้องระวัง)
    สรุป "Superpower" (พลังพิเศษ) และ "System Bug" (จุดอ่อนพฤติกรรม) เป็นข้อๆ อย่างชัดเจน

    ### Section 2: The Root Cause Analysis (วิเคราะห์รากเหง้าของ Wheel of Life)
    มองไปที่ด้านที่ คะแนนต่ำที่สุด 3 อันดับแรกจาก Wheel of Life
    วิเคราะห์ว่า "นิสัย DISC ของเขา" ไปขัดขวางการเติบโตของด้านนั้นอย่างไร
    บอก "The One Thing" (กิจกรรมเดียวที่ถ้าทำแล้ว จะช่วยดันคะแนนรอบด้านขึ้นพร้อมกัน)

    ### Section 3: Financial Engineering (การเงินฉบับคนพันธุ์คุณ)
    ออกแบบวิธีเก็บเงิน/ลงทุนที่ "เข้าจริต" นิสัยเขาที่สุด เพื่อให้ทำง่ายและไม่ล้มเลิก
    "The Survival Guide": วิธีแก้ปัญหาเฉพาะหน้าเมื่อเจอวิกฤตเศรษฐกิจ โดยอิงจาก Money Avatar ของผู้ใช้

    ### Section 4: 30-Day Master Roadmap (ตารางเปลี่ยนชีวิต 4 สัปดาห์)
    สร้างตารางกิจกรรมที่ชัดเจน แบ่งเป็นรายอาทิตย์:
    - Week 1: Debugging Mindset (ปรับทัศนคติที่ขวางทางเป้าหมาย)
    - Week 2: Wealth Optimization (ปรับพอร์ตหรือพฤติกรรมการใช้เงิน 1 อย่าง)
    - Week 3: Relationship & Balance (ซ่อมแซมหรือเสริมสร้างด้านที่แหว่งใน Wheel of Life)
    - Week 4: Scaling Momentum (สร้างวินัยใหม่ที่จะทำต่อได้ในระยะยาว)

    ### Section 5: Final Architect's Note (บทสรุปจากผู้ออกแบบชีวิต)
    ข้อความปิดท้ายที่ทรงพลัง ตรึงใจ ทิ้งท้ายด้วย Quote ที่คุณแต่งขึ้นมาใหม่เพื่อ "${displayName}" โดยเฉพาะ เพื่อสร้างแรงบันดาลใจให้ลงมือปฏิบัติจริง
    `;

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
          { role: "user", content: userPrompt }
        ],
        stream: false,
        temperature: 0.5, // ใช้ความแม่นยำสูงหน่อยเพื่อให้ข้อมูล Logic เชื่อมโยงกันเป๊ะ
        max_tokens: 3000  // 🔥 ปรับเพิ่มเพื่อให้ได้ Report ที่ยาวและละเอียด (ประมาณ 5-8 หน้ากระดาษ)
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.error?.message || "DeepSeek API Error" }, { status: response.status });
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content.trim();

    return NextResponse.json({ success: true, analysis });

  } catch (error: any) {
    console.error("DeepSeek Report Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}