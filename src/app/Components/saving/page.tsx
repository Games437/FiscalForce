"use client"; // ใช้ใน Next.js เพื่อบอกว่าคอมโพเนนต์นี้ทำงานฝั่ง Client
import { useState } from "react";

/* ---------- กำหนดชนิดข้อมูลของผลลัพธ์ ---------- */
interface Result {
  monthlyPayment: number; // จำนวนเงินที่ต้องออมต่อเดือน
  totalDeposit: number;   // เงินต้นรวมทั้งหมดที่ออม
  totalInterest: number;  // ดอกเบี้ยที่ได้รับ
  targetAmount: number;   // จำนวนเงินเป้าหมายสุดท้าย
}

/* ---------- คอมโพเนนต์หลัก ---------- */
export default function GSBSavingCalculator() {
  /* ---------- สร้าง state เก็บค่าข้อมูลจาก input ---------- */
  const [targetAmount, setTargetAmount] = useState<string>(""); // เป้าหมายเงินที่อยากได้
  const [years, setYears] = useState<string>("");               // ระยะเวลา (ปี)
  const [interestRate, setInterestRate] = useState<string>(""); // อัตราดอกเบี้ยต่อปี
  const [initialAmount, setInitialAmount] = useState<string>(""); // เงินเริ่มต้นที่มีอยู่แล้ว
  const [result, setResult] = useState<Result | null>(null);     // ผลลัพธ์การคำนวณ

  /* ---------- ฟังก์ชันจัดรูปแบบตัวเลข เช่น ใส่เครื่องหมาย , ---------- */
  const formatNumber = (value: string) => {
    const num = value.replace(/,/g, ""); // ลบ , ออกก่อน
    if (num === "" || isNaN(Number(num))) return "";
    return Number(num).toLocaleString("en-US"); // ใส่ , ทุกหลักพัน
  };

  /* ---------- ฟังก์ชันแปลงข้อความเป็นตัวเลข ---------- */
  const parseNumber = (value: string) => Number(value.replace(/,/g, "")) || 0;

  /* ---------- ฟังก์ชันคำนวณเงินออม ---------- */
  const handleCalculate = () => {
    // แปลงค่าจาก input เป็นตัวเลข
    const targetVal = parseNumber(targetAmount);
    const yearsVal = parseNumber(years);
    const rateVal = parseNumber(interestRate);
    const initialVal = parseNumber(initialAmount);

    const months = yearsVal * 12; // แปลงปีเป็นเดือน
    const monthlyRate = rateVal / 100 / 12; // ดอกเบี้ยต่อเดือน

    // ตรวจสอบหากกรอกปี <= 0 จะไม่คำนวณ
    if (months <= 0) {
      setResult(null);
      return;
    }

    // มูลค่าอนาคตของเงินเริ่มต้น (ทบต้น)
    const futureValueOfInitial = initialVal * Math.pow(1 + monthlyRate, months);

    // คำนวณยอดเงินที่ยังต้องออมเพิ่มให้ถึงเป้าหมาย
    const remainingAmount = targetVal - futureValueOfInitial;

    let monthlyPayment = 0;

    // ถ้ามีดอกเบี้ย
    if (monthlyRate > 0) {
      // สูตรคำนวณเงินฝากรายเดือนแบบอนุกรม (Future Value of Annuity)
      monthlyPayment =
        remainingAmount /
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    } else {
      // ถ้าไม่มีดอกเบี้ยเลย
      monthlyPayment = remainingAmount / months;
    }

    // เงินต้นรวมทั้งหมดที่ฝากในระยะเวลาทั้งหมด
    const totalDeposit = initialVal + monthlyPayment * months;

    // ดอกเบี้ยที่ได้รับ = เป้าหมาย - เงินที่ฝากจริง
    const totalInterest = targetVal - totalDeposit;

    // เก็บผลลัพธ์ใน state
    setResult({
      monthlyPayment,
      totalDeposit,
      totalInterest,
      targetAmount: targetVal,
    });
  };

  /* ---------- ฟังก์ชันล้างข้อมูลทั้งหมด ---------- */
  const handleClear = () => {
    setTargetAmount("");
    setYears("");
    setInterestRate("");
    setInitialAmount("");
    setResult(null);
  };

  /* ---------- ส่วนการแสดงผล UI ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* ---------- ส่วนหัว ---------- */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
            }}
          >
            <span className="text-4xl">💰</span>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
            คำนวณเงินออม
          </h1>
          <p className="text-gray-600 font-normal text-lg">Government Savings</p>
        </div>

        {/* ---------- กล่องหลักของแบบฟอร์ม ---------- */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-white">

          {/* ---------- ส่วนกรอกข้อมูล ---------- */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              ข้อมูลการออม
            </h2>

            <div className="grid gap-5">
              {/* กรอกจำนวนเงินที่ต้องการ */}
              <div>
                <label className="block font-semibold mb-2">
                  จำนวนเงินที่ต้องการ (บาท)
                </label>
                <input
                  type="text"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(formatNumber(e.target.value))}
                  className="w-full rounded-lg p-3 border-2"
                  placeholder="0"
                />
              </div>

              {/* กรอกระยะเวลาและอัตราดอกเบี้ย */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-semibold mb-2">
                    ระยะเวลาที่ต้องการออม (ปี)
                  </label>
                  <input
                    type="text"
                    value={years}
                    onChange={(e) => setYears(formatNumber(e.target.value))}
                    className="w-full rounded-lg p-3 border-2"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    อัตราดอกเบี้ย (% ต่อปี)
                  </label>
                  <input
                    type="text"
                    value={interestRate}
                    onChange={(e) =>
                      setInterestRate(formatNumber(e.target.value))
                    }
                    className="w-full rounded-lg p-3 border-2"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* กรอกเงินเริ่มต้น */}
              <div>
                <label className="block font-semibold mb-2">
                  เงินออมเริ่มต้น (บาท)
                </label>
                <input
                  type="text"
                  value={initialAmount}
                  onChange={(e) =>
                    setInitialAmount(formatNumber(e.target.value))
                  }
                  className="w-full rounded-lg p-3 border-2"
                  placeholder="0"
                />
              </div>
            </div>

            {/* ปุ่มคำนวณ / ล้างข้อมูล */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <button
                onClick={handleCalculate}
                className="p-3 font-bold text-white rounded-lg bg-gray-800 hover:bg-gray-900 transition-all"
              >
                คำนวณ
              </button>

              <button
                onClick={handleClear}
                className="p-3 font-bold rounded-lg border-2 hover:bg-gray-50 transition-all"
              >
                ล้างข้อมูล
              </button>
            </div>
          </div>

          {/* ---------- ส่วนแสดงผลลัพธ์ ---------- */}
          {result && (
            <div className="pt-8 border-t-2 border-gray-200">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                ผลการคำนวณ
              </h2>

              {/* กล่องหลักแสดงจำนวนเงินที่ต้องออมต่อเดือน */}
              <div className="rounded-xl p-6 text-white text-center mb-5 shadow-lg bg-gradient-to-br from-gray-700 to-gray-900">
                <p className="text-sm mb-2 opacity-90">จำนวนเงินที่ต้องออม</p>
                <p className="text-4xl font-bold">
                  {Math.ceil(result.monthlyPayment).toLocaleString()} บาท
                </p>
                <p className="text-sm opacity-90 mt-2">ต่อเดือน</p>
              </div>

              {/* แสดงรายละเอียดแยก */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between p-4 rounded-xl border-2 bg-gray-50">
                  <span>เงินต้นที่ฝากสะสม</span>
                  <span>{Math.ceil(result.totalDeposit).toLocaleString()} บาท</span>
                </div>

                <div className="flex justify-between p-4 rounded-xl border-2 bg-gray-50">
                  <span>ดอกเบี้ยที่ได้รับ</span>
                  <span>+{Math.ceil(result.totalInterest).toLocaleString()} บาท</span>
                </div>

                <div className="flex justify-between p-5 rounded-xl border-2 bg-gray-100 font-bold">
                  <span>เงินออมรวมทั้งหมด</span>
                  <span>{result.targetAmount.toLocaleString()} บาท</span>
                </div>
              </div>

              {/* หมายเหตุ */}
              <div className="p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-400">
                💡 ผลการคำนวณเป็นเพียงประมาณการเบื้องต้น
              </div>
            </div>
          )}
        </div>

        {/* ---------- ส่วนท้าย ---------- */}
        <div className="mt-6 text-center text-sm text-gray-500">
          💰 วางแผนการเงินเพื่ออนาคตที่มั่นคง
        </div>
      </div>
    </div>
  );
}
