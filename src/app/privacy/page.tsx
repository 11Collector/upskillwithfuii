"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Eye, Database, Cookie, Trash2 } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-semibold mb-6 touch-manipulation min-h-[44px]"
        >
          <ArrowLeft size={16} />
          กลับหน้าหลัก
        </Link>

        {/* Content Card */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 md:p-10">
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-8 border-b border-slate-100 pb-6">
            <div className="bg-red-100 p-3 rounded-2xl text-red-800">
              <Shield size={28} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-950">
                นโยบายความเป็นส่วนตัว
              </h1>
              <p className="text-slate-400 text-xs md:text-sm mt-0.5">
                ปรับปรุงล่าสุด: 14 กรกฎาคม 2026
              </p>
            </div>
          </div>

          <p className="text-slate-600 text-sm md:text-base mb-8 leading-relaxed">
            เว็บไซต์ <strong>upskilleveryday.com</strong> ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของคุณ นโยบายนี้อธิบายถึงประเภทข้อมูลที่เราจัดเก็บ วิธีการนำข้อมูลไปใช้งาน และสิทธิ์การจัดการข้อมูลส่วนบุคคลของคุณตามกฎหมาย PDPA
          </p>

          {/* Sections */}
          <div className="flex flex-col gap-8">
            {/* Section 1 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <Database size={20} className="text-red-800 shrink-0" />
                1. ข้อมูลส่วนบุคคลที่เราจัดเก็บ
              </h2>
              <div className="text-slate-600 text-sm md:text-base leading-relaxed pl-7">
                <p className="mb-2">เราจะจัดเก็บข้อมูลส่วนบุคคลเท่าที่จำเป็นตามความยินยอมของคุณ ซึ่งได้แก่:</p>
                <ul className="list-disc list-inside space-y-1.5">
                  <li><strong>ข้อมูลโปรไฟล์:</strong> ชื่อบัญชี Google, อีเมล, และรูปภาพโปรไฟล์ (เมื่อสมัครและเข้าสู่ระบบด้วย Google)</li>
                  <li><strong>ข้อมูลการใช้งานเครื่องมือ:</strong> ผลการประเมินตนเอง (เช่น DISC, Wheel of Life, Money Avatar, คำถาม/คำตอบใน Library of Souls)</li>
                  <li><strong>ข้อมูลสถิติและการใช้งาน:</strong> ระดับเลเวล (Level), แต้มสะสม (XP), ภารกิจรายสัปดาห์ (Quests), และประวัติการคุยกับพี่ฟุ้ย</li>
                </ul>
              </div>
            </section>

            {/* Section 2 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <Eye size={20} className="text-red-800 shrink-0" />
                2. การนำข้อมูลไปใช้งาน
              </h2>
              <div className="text-slate-600 text-sm md:text-base leading-relaxed pl-7">
                <p className="mb-2">เราใช้ข้อมูลที่จัดเก็บเพื่อวัตถุประสงค์ดังต่อไปนี้:</p>
                <ul className="list-disc list-inside space-y-1.5">
                  <li>เพื่อแสดงผลบนหน้า Dashboard ส่วนตัว และช่วยบันทึกประวัติการพัฒนาตัวเองของคุณ</li>
                  <li>เพื่อส่งข้อมูลตัวตนและประวัติการคุยเพื่อวิเคราะห์และแนะนำผ่านฟีเจอร์ คุยกับพี่ฟุ้ย ให้ตอบโจทย์คุณมากที่สุด</li>
                  <li>เพื่อดำเนินการชำระเงินและสมัครบริการแบบพรีเมียม (Pro Member) ผ่านระบบรักษาความปลอดภัยของ Stripe</li>
                  <li>เพื่อวิเคราะห์ประสิทธิภาพการใช้งานเว็บไซต์และนำไปพัฒนาบริการให้ดีขึ้น</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <Cookie size={20} className="text-red-800 shrink-0" />
                3. นโยบายการใช้คุกกี้ (Cookie Policy)
              </h2>
              <div className="text-slate-600 text-sm md:text-base leading-relaxed pl-7 space-y-3">
                <p>เว็บไซต์ของเรามีการจัดเก็บคุกกี้เพื่อแบ่งประเภทและยกระดับการให้บริการ ดังนี้:</p>
                
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 md:p-5 flex flex-col gap-3.5">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm md:text-base">คุกกี้ที่จำเป็นอย่างยิ่ง (Strictly Necessary Cookies)</h4>
                    <p className="text-xs md:text-sm text-slate-500 mt-1 leading-relaxed">
                      คุกกี้ประเภทนี้มีความจำเป็นต่อระบบความปลอดภัยและฟังก์ชันพื้นฐาน เช่น คุกกี้ล็อกอินของ Firebase Authentication และระบบประมวลผลการชำระเงินของ Stripe (ไม่สามารถปิดได้)
                    </p>
                  </div>
                  <div className="border-t border-slate-200/50 pt-3">
                    <h4 className="font-bold text-slate-900 text-sm md:text-base">คุกกี้วิเคราะห์พฤติกรรม (Analytics Cookies)</h4>
                    <p className="text-xs md:text-sm text-slate-500 mt-1 leading-relaxed">
                      เราใช้ Firebase Analytics เพื่อวิเคราะห์ว่าหน้าใดบ้างที่มีผู้ใช้งานมากที่สุดเพื่อการพัฒนาฟังก์ชันการทำงาน คุกกี้ประเภทนี้จะทำงานเมื่อคุณกดเลือก "ยอมรับทั้งหมด" เท่านั้น
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <Trash2 size={20} className="text-red-800 shrink-0" />
                4. สิทธิ์และการลบข้อมูลของคุณ
              </h2>
              <div className="text-slate-600 text-sm md:text-base leading-relaxed pl-7">
                <p className="mb-2">คุณมีสิทธิ์ในการเข้าถึง ขอแก้ไข หรือลบข้อมูลส่วนบุคคลของคุณทั้งหมดได้ตลอดเวลา</p>
                <p>
                  หากต้องการทำเรื่องขอลบข้อมูลบัญชีและข้อมูลผลการทดสอบทั้งหมดออกจากฐานข้อมูลของเราอย่างถาวร กรุณาติดต่อทีมงานได้ที่อีเมล <strong>upskillwithfuii@gmail.com</strong> เราจะดำเนินการลบข้อมูลของคุณภายใน 7 วันทำการ
                </p>
              </div>
            </section>
          </div>

          {/* Footer inside card */}
          <div className="border-t border-slate-100 mt-10 pt-6 text-center text-xs md:text-sm text-slate-400">
            © 2026 อัพสกิลกับฟุ้ย. สงวนลิขสิทธิ์ทั้งหมด.
          </div>
        </div>
      </div>
    </div>
  );
}
