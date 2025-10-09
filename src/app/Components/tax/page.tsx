"use client";
import React, { useState, useRef, useEffect } from "react";
import { Chart, registerables } from "chart.js";

// Register Chart.js components
Chart.register(...registerables);

/* ---------- Helpers ---------- */
const fmtNumber = (n: number) => Number(n || 0).toLocaleString("en-US");

const parseNumber = (s: string) => { 
  if (!s && s !== "0") return 0;      // ค่าว่างให้คืน 0
  const cleaned = String(s).replace(/[,\s]+/g, ""); // ลบ , และช่องว่าง
  const v = Number(cleaned);          // แปลงเป็นตัวเลข
  return Number.isFinite(v) ? v : 0;  // ตรวจสอบเลข
};

/* ---------- Types ---------- */
interface TaxBreakdown {
  range: string;    // ช่วงรายได้
  amount: number;   // จำนวนเงินในขั้นนี้ที่ต้องเสียภาษี
  rate: number;     // อัตราภาษี
  tax: number;      // ภาษีที่ต้องจ่ายในขั้นนี้
}

interface TaxResult {
  totalIncome: number;      // รายได้รวม
  deduction: number;        // ค่าลดหย่อน
  taxable: number;          // เงินได้สุทธิ (totalIncome - deduction)
  tax: number;              // ภาษีที่ต้องจ่าย
  withheld: number;         // ภาษีที่ถูกหัก 
  taxDue: number;           // ภาษีที่ต้องจ่ายเพิ่ม (tax - withheld)
  breakdown: TaxBreakdown[];    // รายละเอียดการคำนวณภาษีในแต่ละขั้น
}

/* ---------- Tax Calculation ---------- */
//ฟังก์ชันคำนวณภาษีเงินได้บุคคลธรรมดา
function calculateTax(inputs: {
  // รายได้
  salaryMonthly: number;              // เงินเดือนต่อเดือน
  bonus: number;                      // โบนัส
  business: number;                   // รายได้จากธุรกิจ
  interest: number;                   // ดอกเบี้ย
  dividend: number;                   // เงินปันผล
  rent: number;                       // ค่าเช่า
  otherIncome: number;                // รายได้อื่นๆ

  // ค่าลดหย่อนครอบครัว
  ded_spouse: boolean;                // คู่สมรสไม่มีรายได้
  ded_father: boolean;                // ลดหย่อนบิดา
  ded_mother: boolean;                // ลดหย่อนมารดา

  // ค่าลดหย่อนผู้พิการ
  ded_disabled_father: boolean;       // บิดาพิการ
  ded_disabled_mother: boolean;       // มารดาพิการ
  ded_disabled_spouse: boolean;       // คู่สมรสพิการ
  ded_disabled_father_spouse: boolean;    // บิดาคู่สมรสพิการ
  ded_disabled_mother_spouse: boolean;    // มารดาคู่สมรสพิการ
  ded_disabled_child: boolean;            // บุตรพิการ
  ded_disabled_relative: boolean;         // ญาติพิการ

  // บุตร
  hasChildren: boolean;               // มีบุตรหรือไม่
  children_before2018: number;        // จำนวนบุตรเกิดก่อน 2561
  children_after2018: number;         // จำนวนบุตรเกิดตั้งแต่ 2561


  // ค่าลดหย่อนประกันและกองทุน
  ded_social: number;                 // ประกันสังคม
  ded_insurance: number;              // ประกันชีวิต
  ded_health: number;                 // ประกันสุขภาพ
  ded_health_parents: number;         // ประกันสุขภาพบิดามารดา
  ded_pension_insurance: number;      // ประกันชีวิตบำนาญ
  ded_fund: number;                   // RMF/SSF
  ded_provident: number;              // กองทุนสำรองเลี้ยงชีพ
  ded_homeLoan: number;               // ดอกเบี้ยบ้าน

  // เงินบริจาค
  ded_donate_education: number;       // บริจาคการศึกษา/กีฬา/สังคม
  ded_donate_general: number;         // บริจาคทั่วไป

  taxWithheld: number;                // ภาษีที่ถูกหัก ณ ที่จ่าย
}): TaxResult {

  // ========== คำนวณรายได้รวม ==========
  const salary = inputs.salaryMonthly * 12;             // เงินเดือนต่อปี
  const salaryExpense = Math.min(salary * 0.5, 100000);               // ค่าใช้จ่ายจากเงินเดือน (50% สูงสุด 100,000 บาท)
  const businessExpense = Math.min(inputs.business * 0.6, 100000);    // ค่าใช้จ่ายจากธุรกิจ (60% สูงสุด 100,000 บาท)

  // รายได้รวมทั้งหมด = รายได้ - ค่าใช้จ่าย
  const totalIncome =
    salary - salaryExpense +              // เงินเดือนหลังหักค่าใช้จ่าย
    inputs.bonus +                        // โบนัส
    (inputs.business - businessExpense) + // รายได้ธุรกิจหลังหักค่าใช้จ่าย
    inputs.interest +                     // ดอกเบี้ย
    inputs.dividend +                     // เงินปันผล
    inputs.rent +                         // ค่าเช่า
    inputs.otherIncome;                   // รายได้อื่นๆ

  // ========== คำนวณค่าลดหย่อน ==========
  let deduction = 60000; // ค่าลดหย่อนส่วนตัว

  if (inputs.ded_spouse) deduction += 60000;  // ลดหย่อนคู่สมรสไม่มีรายได้
  if (inputs.ded_father) deduction += 30000;  // ลดหย่อนบิดา
  if (inputs.ded_mother) deduction += 30000;  // ลดหย่อนมารดา

   // ========== ค่าลดหย่อนบุตร ==========
  if (inputs.hasChildren) {
    // บุตรคนแรกลดหย่อน 30,000 อัตโนมัติ
    deduction += 30000;
    // บุตรเพิ่มเติมที่เกิดก่อน 2561
    deduction += inputs.children_before2018 * 30000;
    // บุตรเพิ่มเติมที่เกิดตั้งแต่ 2561
    deduction += inputs.children_after2018 * 60000;
  }

  // ========== ค่าลดหย่อนผู้พิการ (คนละ 60,000) ==========
  let disabledCount = 0;
  if (inputs.ded_disabled_father) disabledCount++;
  if (inputs.ded_disabled_mother) disabledCount++;
  if (inputs.ded_disabled_spouse) disabledCount++;
  if (inputs.ded_disabled_father_spouse) disabledCount++;
  if (inputs.ded_disabled_mother_spouse) disabledCount++;
  if (inputs.ded_disabled_child) disabledCount++;
  if (inputs.ded_disabled_relative) disabledCount++;
  deduction += disabledCount * 60000;

  // ========== ประกันสังคม ==========
  deduction += Math.min(inputs.ded_social, 9000);

  // ========== ประกันชีวิตและสุขภาพ ==========
  const insuranceLife = Math.min(inputs.ded_insurance, 100000);              // ประกันชีวิตสูงสุด
  const insuranceHealth = Math.min(inputs.ded_health, 25000);                // ประกันสุขภาพสูงสุด
  const insuranceHealthParents = Math.min(inputs.ded_health_parents, 15000); // ประกันสุขภาพบิดามารดา

  // ========== ประกันชีวิตบำนาญ ==========
  const maxPension15Percent = totalIncome * 0.15;
  const maxPensionBase = Math.min(inputs.ded_pension_insurance, 200000);
  let pensionInsurance = Math.min(maxPensionBase, maxPension15Percent);

  // ถ้าไม่ได้ใช้สิทธิประกันชีวิตทั่วไป สามารถลดหย่อนได้สูงสุด 300,000
  if (insuranceLife === 0) {
    pensionInsurance = Math.min(
      inputs.ded_pension_insurance,
      300000,
      maxPension15Percent
    );
  }

  // บวกประกันเข้าค่าลดหย่อน
  deduction += insuranceLife;
  deduction += insuranceHealth;
  deduction += insuranceHealthParents;

  // ========== กองทุนต่างๆ รวมกันไม่เกิน 500,000 ==========
  const fundProvident = Math.min(inputs.ded_provident, 500000);
  const fundRMF_SSF = Math.min(inputs.ded_fund, 200000);
  const totalFunds = Math.min(
    fundProvident + fundRMF_SSF + pensionInsurance,
    500000 // รวมกองทุนทั้งหมด + ประกันบำนาญ ไม่เกิน 500,000
  );
  deduction += totalFunds;

  // ========== ดอกเบี้ยบ้าน (ไม่เกิน 100,000) ==========
  deduction += Math.min(inputs.ded_homeLoan, 100000);

  // ========== คำนวณเงินได้สุทธิก่อนหักเงินบริจาค ==========
  const netIncomeBeforeDonate = Math.max(totalIncome - deduction, 0);
  const max10Percent = netIncomeBeforeDonate * 0.1;

  // ========== เงินบริจาค ==========
  // บริจาคการศึกษา กีฬา สังคม โรงพยาบาล (ลดหย่อน 2 เท่า ไม่เกิน 10% ของเงินได้สุทธิ)
  const donateEducation2x = inputs.ded_donate_education * 2;
  const donateEducationFinal = Math.min(donateEducation2x, max10Percent);

  // บริจาคทั่วไป (ตามจ่ายจริง ไม่เกิน 10% ของเงินได้สุทธิ)
  const donateGeneralFinal = Math.min(inputs.ded_donate_general, max10Percent);
  deduction += donateEducationFinal;  
  deduction += donateGeneralFinal;  

  // ========== สรุปการคำนวณภาษี ==========
  const taxable = Math.max(totalIncome - deduction, 0);

  // ========== คำนวณภาษีตามขั้นบันได ==========
  const TAX_BRACKETS = [
    { limit: 150000, rate: 0 },
    { limit: 300000, rate: 0.05 },
    { limit: 500000, rate: 0.1 },
    { limit: 750000, rate: 0.15 },
    { limit: 1000000, rate: 0.2 },
    { limit: 2000000, rate: 0.25 },
    { limit: 5000000, rate: 0.3 },
    { limit: Infinity, rate: 0.35 },
  ];

  let remaining = taxable;  // เงินที่เหลือต้องคำนวณ
  let prev = 0;             // ขอบเขตล่างของขั้นก่อนหน้า
  let tax = 0;              // ภาษีรวม
  const breakdown: TaxBreakdown[] = []; // เก็บรายละเอียด

  // วนลูปคำนวณภาษีแต่ละขั้น
  TAX_BRACKETS.forEach((b) => { // จำนวนเงินในขั้นนี้ = min(เงินที่เหลือ, ขอบเขตบน - ขอบเขตล่าง)
    const amt = Math.max(0, Math.min(remaining, b.limit - prev));
    
    if (amt > 0) { // คำนวณภาษีในขั้นนี้
      const t = amt * b.rate;
      tax += t; 

      // เก็บรายละเอียด
      breakdown.push({
        range: `${fmtNumber(prev + 1)} - ${
          isFinite(b.limit) ? fmtNumber(b.limit) : "ไม่จำกัด"
        }`,
        amount: amt,      // จำนวนเงินในขั้นนี้
        rate: b.rate,     // อัตราภาษี
        tax: t,           // ภาษีที่ต้องจ่ายในขั้นนี้
      });             
    }
    remaining -= amt;     // ลดจำนวนเงินที่เหลือต้องคำนวณ
    prev = b.limit;       // อัพเดตขอบเขตล่าง
  });

  // ========== คำนวณภาษีที่ต้องจ่ายเพิ่ม ==========
  const withheld = inputs.taxWithheld || 0;  // ภาษีที่หักไว้แล้ว
  const taxDue = tax - withheld;             // ภาษีที่ต้องจ่ายเพิ่ม (หรือคืน)

  // คืนค่าผลลัพธ์ 
  return { totalIncome, deduction, taxable, tax, withheld, taxDue, breakdown };
} 

/* ---------- Main Component ---------- */
export default function TaxPlannerWizard() {
  const totalSteps = 6;         
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Record<string, string | boolean>>({
    // ========== รายได้ ==========
    salaryMonthly: "",
    bonus: "",
    business: "",
    interest: "",
    dividend: "",
    rent: "",
    otherIncome: "",
    // ========== สถานะครอบครัว ==========
    maritalStatus: "โสด",
    ded_spouse: false,
    ded_father: false, 
    ded_mother: false,
    // ========== ประกันและกองทุน ==========
    ded_social: "",             
    ded_insurance: "",           
    ded_health: "",              
    ded_health_parents: "",      
    ded_pension_insurance: "",   
    ded_fund: "",                
    ded_provident: "",           
    ded_homeLoan: "",            
    // ========== ผู้พิการ ==========
    ded_disabled_father: false, 
    ded_disabled_mother: false, 
    ded_disabled_spouse: false, 
    ded_disabled_father_spouse: false, 
    ded_disabled_mother_spouse: false, 
    ded_disabled_child: false, 
    ded_disabled_relative: false, 
    // ========== บุตร ==========
    hasChildren: false,
    children_before2018: "", 
    children_after2018: "",
    // ========== เงินบริจาค ==========
    ded_donate_education: "",
    ded_donate_general: "", 
    ded_donate: "",
    // ========== ภาษีหัก ณ ที่จ่าย ==========
    taxWithheld: "", 
  });
  const [result, setResult] = useState<TaxResult | null>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const setField = (k: string, v: string | boolean) =>
    setData((p) => ({ ...p, [k]: v }));

  const next = () => {
    if (step === 1) {
      const salary = parseNumber(String(data.salaryMonthly));
      const bonus = parseNumber(String(data.bonus));
      const otherIncome = parseNumber(String(data.otherIncome));
      // ตรวจสอบเงื่อนไข
      if (salary <= 0 && otherIncome <= 0 && bonus > 0) {
        alert("กรุณาระบุรายได้");
        return;
      }
      if (salary <= 0 && otherIncome <= 0 && bonus <= 0) {
        alert("กรุณาระบุรายได้");
        return;
      }
    }
    setStep((s) => Math.min(totalSteps, s + 1));
  };

  const prev = () => setStep((s) => Math.max(1, s - 1));
  // รีเซ็ตข้อมูลทั้งหมด
  const restart = () => {
    setData({
      salaryMonthly: "",
      bonus: "",
      business: "",
      interest: "",
      dividend: "",
      rent: "",
      otherIncome: "",
      maritalStatus: "โสด",
      ded_spouse: false,
      ded_father: false,
      ded_mother: false,
      ded_disabled_father: false,
      ded_disabled_mother: false,
      ded_disabled_spouse: false,
      ded_disabled_father_spouse: false,
      ded_disabled_mother_spouse: false,
      ded_disabled_child: false,
      ded_disabled_relative: false,
      hasChildren: false,
      children_before2018: "",
      children_after2018: "",
      ded_social: "",
      ded_insurance: "",
      ded_health: "",
      ded_health_parents: "",
      ded_pension_insurance: "",
      ded_fund: "",
      ded_provident: "",
      ded_homeLoan: "",
      ded_donate_education: "",
      ded_donate_general: "", 
      taxWithheld: "",
    });
    setResult(null);
    setStep(1);
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
  };

  const runCalculate = () => {     // เรียกฟังก์ชันคำนวณภาษี
    const i = {                    // เตรียมข้อมูล
      salaryMonthly: parseNumber(String(data.salaryMonthly)),
      bonus: parseNumber(String(data.bonus)),
      business: parseNumber(String(data.business)),
      interest: parseNumber(String(data.interest)),
      dividend: parseNumber(String(data.dividend)),
      rent: parseNumber(String(data.rent)),
      otherIncome: parseNumber(String(data.otherIncome)),
      ded_spouse: Boolean(data.ded_spouse),
      ded_father: Boolean(data.ded_father),
      ded_mother: Boolean(data.ded_mother),
      ded_disabled_father: Boolean(data.ded_disabled_father),
      ded_disabled_mother: Boolean(data.ded_disabled_mother),
      ded_disabled_spouse: Boolean(data.ded_disabled_spouse),
      ded_disabled_father_spouse: Boolean(data.ded_disabled_father_spouse),
      ded_disabled_mother_spouse: Boolean(data.ded_disabled_mother_spouse),
      ded_disabled_child: Boolean(data.ded_disabled_child),
      ded_disabled_relative: Boolean(data.ded_disabled_relative),
      children_before2018: parseNumber(String(data.children_before2018)),
      children_after2018: parseNumber(String(data.children_after2018)),
      hasChildren: Boolean(data.hasChildren),
      ded_social: parseNumber(String(data.ded_social)),
      ded_insurance: parseNumber(String(data.ded_insurance)),
      ded_health: parseNumber(String(data.ded_health)),
      ded_health_parents: parseNumber(String(data.ded_health_parents)),
      ded_pension_insurance: parseNumber(String(data.ded_pension_insurance)),
      ded_fund: parseNumber(String(data.ded_fund)),
      ded_provident: parseNumber(String(data.ded_provident)),
      ded_homeLoan: parseNumber(String(data.ded_homeLoan)),
      ded_donate_education: parseNumber(String(data.ded_donate_education)),
      ded_donate_general: parseNumber(String(data.ded_donate_general)),
      taxWithheld: parseNumber(String(data.taxWithheld)),
    };

    const res = calculateTax(i);

    // ถ้ารายได้สุทธิน้อยกว่า 150,000 บาท
    if (res.taxable <= 150000) {
      setResult({
        ...res,
        tax: 0,
        taxDue: 0,
        breakdown: [],
      });
      setStep(6);
      return;
    }
    setResult(res);
    setStep(6);
  };


  /* ---------- Draw Chart ---------- */
useEffect(() => {
    if (!chartRef.current || !result) return;
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;
    // ถ้ามีกราฟอยู่แล้วให้ลบก่อน
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    // เตรียมข้อมูล
    const labels = result.breakdown.map((b, i) => `ขั้นที่ ${i + 1}`);
    const data = result.breakdown.map((b) => b.tax);
    // สร้างกราฟใหม่
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "ภาษีที่ต้องจ่ายในแต่ละขั้น (บาท)",
            data,
            borderWidth: 0,
            backgroundColor: result.breakdown.map((b, i) =>
              i === result.breakdown.length - 1 ? "#a3e635" : "#fde047"
            ),
            borderRadius: 12,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(0,0,0,0.8)",
            titleFont: { size: 14 },
            bodyFont: { size: 13 },
            padding: 10,
            callbacks: {
              title: (ctx) => `ขั้นที่ ${ctx[0].dataIndex + 1}`,
              label: (ctx) => {
                const b = result.breakdown[ctx.dataIndex];
                return [
                  `ช่วงรายได้: ${b.range}`,
                  `อัตราภาษี: ${(b.rate * 100).toFixed(0)}%`,
                  `ภาษีที่จ่าย: ${fmtNumber(b.tax)} บาท`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#444", font: { size: 12 } },
          },
          y: {
            beginAtZero: true,
            grid: { color: "#eee" },
            ticks: {
              color: "#444",
              font: { size: 12 },
              callback: (v) => fmtNumber(Number(v)),
            },
            title: { display: true, text: "ภาษี (บาท)", color: "#666" },
          },
        },
        animation: {
          duration: 1200,
          easing: "easeOutQuart",
        },
      },
    });
  }, [result]);

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow-2xl p-8 font-sans">
      {/* Progress Bar */} 
      <div className="mb-10">
        <div className="flex justify-between">
          {["รายรับ", "ครอบครัว", "กองทุน", "ประกัน", "อื่นๆ", "ผลลัพธ์"].map(
            (t, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-300 
                ${
                  step >= i + 1
                    ? "bg-gray-900 border-gray-900 text-white scale-110"
                    : "border-gray-300 text-gray-700"
                }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-xs mt-2 ${
                    step === i + 1
                      ? "text-black font-semibold"
                      : "text-gray-400"
                  }`}
                >
                  {t}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Step Container */}
      <div className="flex flex-col justify-start animate-fadein ">
        {step < 6 && (
          <div className="space-y-6 min-h-[450px] min-w-[550px]">
            <h2 className="text-2xl font-bold text-black">Step {step}</h2>
            <p className="text-sm text-gray-500">
              กรอกข้อมูลของคุณในแต่ละขั้นตอนให้ครบถ้วน
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {step === 1 && (
                <>
                  <NumInput
                    label="เงินเดือน (บาท)"
                    value={String(data.salaryMonthly)}
                    onChange={(v) => setField("salaryMonthly", v)}
                  />
                  <NumInput
                    label="โบนัส (บาท)"
                    value={String(data.bonus)}
                    onChange={(v) => setField("bonus", v)}
                  />
                  <NumInput
                    label="รายได้อื่นๆ เช่น การขายของออนไลน์, รับจ้างฟรีแลนซ์ (บาท)"
                    value={String(data.otherIncome)}
                    onChange={(v) => setField("otherIncome", v)}
                  />
                </>
              )}

              {step === 2 && (
                <>
                  {/* สถานะสมรส */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium block mb-2">
                      สถานะสมรส
                    </label>
                    <div className="flex gap-4">
                      {["โสด", "หย่า", "สมรส"].map((status) => (
                        <label key={status} className="flex items-center gap-2">
                          <input
                            type="radio"  
                            name="maritalStatus" 
                            value={status}
                            checked={data.maritalStatus === status}
                            onChange={(e) =>
                              setField("maritalStatus", e.target.value)
                            }
                            className="w-4 h-4 accent-blue-600"
                          />
                          <span>{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* แสดงเมื่อเลือกสถานะแล้ว */}
                  {data.maritalStatus && (
                    <>
                      {/* ลดหย่อนบิดา-มารดา */}
                      <div className="md:col-span-2 border-t pt-4">
                        <label className="text-sm font-medium flex items-center gap-1 mb-2">
                          ลดหย่อนบิดา-มารดา (คนละ 30,000 บาท)
                          {/* ไอคอน info */}
                          <div className="relative group">
                            <div className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-200 text-gray-900 text-xs font-bold cursor-pointer">
                              i
                            </div>

                            {/* Tooltip */}
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-60 bg-gray-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                              พ่อแม่ของคุณต้องมีอายุ 60 ปีขึ้นไป
                              และมีรายได้ต่อปีน้อยกว่า 30,000 บาท
                            </div>
                          </div>
                        </label>
                        <div className="flex gap-6">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(data.ded_father)}
                              onChange={(e) =>
                                setField("ded_father", e.target.checked)
                              }
                              className="w-4 h-4 accent-blue-600"
                            />
                            <span>บิดา</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(data.ded_mother)}
                              onChange={(e) =>
                                setField("ded_mother", e.target.checked)
                              }
                              className="w-4 h-4 accent-blue-600"
                            />
                            <span>มารดา</span>
                          </label>
                        </div>
                      </div>

                      {/* ลดหย่อนผู้พิการ */}
                      <div className="md:col-span-2 border-t pt-4">
                        <label className="text-sm font-medium block mb-2">
                          ลดหย่อนผู้พิการหรือทุพพลภาพ (ไม่มีเงินได้) - คนละ
                          60,000 บาท
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                          *กรณีบิดา, มารดา, คู่สมรส, บิดาคู่สมรส, มารดาคู่สมรส
                          และบุตร / หากเป็นญาติอื่นได้เพียง 1 คนเท่านั้น
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(data.ded_disabled_father)}
                              onChange={(e) =>
                                setField(
                                  "ded_disabled_father",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 accent-blue-600"
                            />
                            <span className="text-sm">บิดา</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(data.ded_disabled_mother)}
                              onChange={(e) =>
                                setField(
                                  "ded_disabled_mother",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 accent-blue-600"
                            />
                            <span className="text-sm">มารดา</span>
                          </label>
                          {data.maritalStatus === "สมรส" && (
                            <>
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={Boolean(data.ded_disabled_spouse)}
                                  onChange={(e) =>
                                    setField(
                                      "ded_disabled_spouse",
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 accent-blue-600"
                                />
                                <span className="text-sm">คู่สมรส</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={Boolean(
                                    data.ded_disabled_father_spouse
                                  )}
                                  onChange={(e) =>
                                    setField(
                                      "ded_disabled_father_spouse",
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 accent-blue-600"
                                />
                                <span className="text-sm">บิดาคู่สมรส</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={Boolean(
                                    data.ded_disabled_mother_spouse
                                  )}
                                  onChange={(e) =>
                                    setField(
                                      "ded_disabled_mother_spouse",
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 accent-blue-600"
                                />
                                <span className="text-sm">มารดาคู่สมรส</span>
                              </label>
                            </>
                          )}
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(data.ded_disabled_child)}
                              onChange={(e) =>
                                setField("ded_disabled_child", e.target.checked)
                              }
                              className="w-4 h-4 accent-blue-600"
                            />
                            <span className="text-sm">บุตร</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={Boolean(data.ded_disabled_relative)}
                              onChange={(e) =>
                                setField(
                                  "ded_disabled_relative",
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 accent-blue-600"
                            />
                            <span className="text-sm">
                              ญาติ (พี่, น้อง ฯลฯ)
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* คู่สมรสไม่มีรายได้ */}
                      {data.maritalStatus === "สมรส" && (
                        <div className="md:col-span-2 border-t pt-4">
                          <label className="flex items-center gap-2 font-medium">
                            <input
                              type="checkbox"
                              checked={Boolean(data.ded_spouse)}
                              onChange={(e) =>
                                setField("ded_spouse", e.target.checked)
                              }
                              className="w-4 h-4 accent-blue-600"
                            />
                            คู่สมรสไม่มีรายได้ (60,000 บาท)
                          </label>
                        </div>
                      )}

                      {/* มีบุตรหรือไม่ */}
                      {(data.maritalStatus === "หย่า" ||
                        data.maritalStatus === "สมรส") && (
                        <>
                          <div className="md:col-span-2 border-t pt-4">
                            <label className="flex items-center gap-2 font-medium">
                              <input
                                type="checkbox"
                                checked={Boolean(data.hasChildren)}
                                onChange={(e) => {
                                  setField("hasChildren", e.target.checked);
                                  if (!e.target.checked) {
                                    setField("children_before2018", "");
                                    setField("children_after2018", "");
                                  }
                                }}
                                className="w-4 h-4 accent-blue-600"
                              />
                              มีบุตรอายุไม่เกิน 25 ปี
                            </label>
                          </div>

                          {data.hasChildren && (
                            <>
                              <div className="md:col-span-2 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                <p className="text-sm text-yellow-800">
                                  ✓ บุตรคนแรกจะลดหย่อนอัตโนมัติ <strong>30,000 บาท</strong>
                                </p>
                                <p className="text-xs text-yellow-700 mt-1">
                                  หากมีบุตรเพิ่มเติม กรุณากรอกจำนวนด้านล่าง
                                </p>
                              </div>

                              <NumInput
                                label="จำนวนบุตรเพิ่มเติมที่เกิดก่อนปี 2561 (ลดหย่อน 30,000/คน)"
                                value={String(data.children_before2018)}
                                onChange={(v) => setField("children_before2018", v)}
                                info="ไม่ต้องนับบุตรคนแรก เฉพาะคนที่ 2, 3, 4... เป็นต้นไป"
                                full
                              />
                              <NumInput
                                label="จำนวนบุตรเพิ่มเติมที่เกิดตั้งแต่ปี 2561 (ลดหย่อน 60,000/คน)"
                                value={String(data.children_after2018)}
                                onChange={(v) => setField("children_after2018", v)}
                                info="ไม่ต้องนับบุตรคนแรก เฉพาะคนที่ 2, 3, 4... เป็นต้นไป"
                                full
                              />
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {step === 3 && (
                <>
                  <NumInput
                    label="ประกันสังคม"
                    value={String(data.ded_social)}
                    onChange={(v) => setField("ded_social", v)}
                    info="สูงสุดไม่เกิน 9,000 บาท"
                  />
                  <NumInput
                    label="กองทุนสำรองเลี้ยงชีพ"
                    value={String(data.ded_provident)}
                    onChange={(v) => setField("ded_provident", v)}
                    info="ลดหย่อนได้สูงสุด 15% ของได้ แต่ไม่เกิน 500,000 บาท"
                  />
                  <NumInput
                    label="ดอกเบี้ยที่อยู่อาศัย"
                    value={String(data.ded_homeLoan)}
                    onChange={(v) => setField("ded_homeLoan", v)}
                    info="สูงสุดไม่เกิน 100,000 บาท"
                  />
                </>
              )}

              {step === 4 && (
                <>
                  <NumInput
                    label="เบี้ยประกันชีวิต (ไม่เกิน 100,000)"
                    value={String(data.ded_insurance)}
                    onChange={(v) => setField("ded_insurance", v)}
                  />
                  <NumInput
                    label="เบี้ยประกันสุขภาพ (ไม่เกิน 25,000)"
                    value={String(data.ded_health)}
                    onChange={(v) => setField("ded_health", v)}
                    info="เมื่อรวมกับเบี้ยประกันทั่วไป ไม่เกิน 100,000 บาท"
                  />
                  <NumInput
                    label="เบี้ยประกันสุขภาพบิดา-มารดา (ไม่เกิน 15,000)"
                    value={String(data.ded_health_parents)}
                    onChange={(v) => setField("ded_health_parents", v)}
                  />
                  <NumInput
                    label="เบี้ยประกันชีวิตบำนาญ"
                    value={String(data.ded_pension_insurance)}
                    onChange={(v) => setField("ded_pension_insurance", v)}
                    info="ไม่เกิน 15% ของรายได้พึงประเมิน แต่ไม่เกิน 200,000 บาท"
                  />
                  <div className="md:col-span-2 bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>หมายเหตุ:</strong> เบี้ยประกันชีวิตบำนาญ ไม่เกิน
                      15% ของรายได้ทั้งปี และไม่เกิน 200,000 บาท
                      หากไม่ได้ใช้สิทธิประกันชีวิตทั่วไป สามารถนำมารวมได้สูงสุด
                      300,000 บาท และรวมกับกองทุนอื่นไม่เกิน 500,000 บาท
                    </p>
                  </div>
                </>
              )}

              {step === 5 && (
                <>
                  <NumInput
                    label="RMF / SSF"
                    value={String(data.ded_fund)}
                    onChange={(v) => setField("ded_fund", v)}
                    full
                    info="สูงสุด 30% ของรายได้ทั้งปี และรวมกับกองทุนกลุ่มเกษียณ ไม่เกิน 500,000 บาท"
                  />
                  <div className="md:col-span-2 border-t pt-4">
                    <h3 className="text-md font-semibold text-black mb-3">
                      เงินบริจาค
                    </h3>
                  </div>
                  <NumInput
                    label="บริจาคเพื่อการศึกษา กีฬา พัฒนาสังคม โรงพยาบาลรัฐ"
                    value={String(data.ded_donate_education)}
                    onChange={(v) => setField("ded_donate_education", v)}
                    full
                    info="ลดหย่อน 2 เท่า แต่ไม่เกิน 10% ของเงินได้สุทธิ"
                  />
                  <div className="md:col-span-2 border-t pt-4"></div>
                  <NumInput
                    label="เงินบริจาคอื่นๆ"
                    value={String(data.ded_donate_general)}
                    onChange={(v) => setField("ded_donate_general", v)}
                    full
                    info="ไม่เกิน 10% ของเงินได้สุทธิ"
                  />
                  <div className="md:col-span-2 border-t pt-4"></div>
                  <NumInput
                    label="ภาษีหัก ณ ที่จ่าย"
                    value={String(data.taxWithheld)}
                    onChange={(v) => setField("taxWithheld", v)}
                    full
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 6 — Result */}
        {step === 6 && result && (
          <div className="space-y-6">
            {result.tax <= 0 ? (
              <div className="p-6 bg-green-50 border-l-8 border-green-600 rounded-xl shadow">
                <h3 className="text-2xl font-bold text-green-700 mb-2">🎉 คุณไม่ต้องเสียภาษีในปีนี้</h3>
                <p className="text-gray-700 text-lg">
                  เนื่องจากรายได้สุทธิน้อยกว่า 150,000 บาท ตามเกณฑ์ยกเว้นภาษี
                </p>
              </div>
            ) : (
              <>
                <div className="p-6 bg-gray-50 border-2 border-black rounded-xl shadow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    ภาษีที่คุณต้องจ่ายประมาณ
                  </h3>
                  <p className="text-5xl font-bold text-gray-900">
                    {fmtNumber(Math.abs(result.taxDue))} บาท
                  </p>
                  <p className="text-lg text-red-600">
                    คิดเป็น {((result.tax / result.totalIncome) * 100).toFixed(2)}%
                    ของรายได้ทั้งหมด
                  </p>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="p-2 text-left">ช่วงเงินได้</th>
                        <th className="p-2 text-center">อัตราภาษี</th>
                        <th className="p-2 text-right">เงินได้ที่เสียภาษี</th>
                        <th className="p-2 text-right">ภาษีแต่ละขั้น</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.breakdown.map((b, i) => (
                        <tr key={i} className="border-t hover:bg-gray-100">
                          <td className="p-2">{b.range}</td>
                          <td className="p-2 text-center">
                            {(b.rate * 100).toFixed(0)}%
                          </td>
                          <td className="p-2 text-right">{fmtNumber(b.amount)}</td>
                          <td className="p-2 text-right text-red-600">
                            {fmtNumber(b.tax)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-10 text-center">
                  <div className="mt-6 h-[300px]">
                    <canvas ref={chartRef}></canvas>
                  </div>
                </div>
              </>
            )}
          </div>
)}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        {step > 1 && step < 6 ? (
          <button
            onClick={prev}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            ย้อนกลับ
          </button>
        ) : (
          <div />
        )}
        {step < 5 && (
          <button
            onClick={next}
            className="bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300"
          >
            ถัดไป
          </button>
        )}
        {step === 5 && (
          <button
            onClick={runCalculate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            คำนวณ
          </button>
        )}
        {step === 6 && (
          <button
            onClick={restart}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            เริ่มใหม่
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Input Component ---------- */
function NumInput({
  label,
  value,
  onChange,
  full = false,
  info = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  full?: boolean;
  info?: string;
}) {
  // ฟังก์ชัน format ตัวเลขให้มีลูกน้ำ
  const formatNumber = (num: string) => {
    if (num === "") return "";
    const cleaned = num.replace(/,/g, "");
    if (!/^\d+\.?\d*$/.test(cleaned)) return num; // ✅ เพิ่มการตรวจสอบ
    const parts = cleaned.split(".");
    parts[0] = Number(parts[0]).toLocaleString("en-US");
    return parts.join(".");
  };

  // ลบลูกน้ำก่อนเก็บลง state
  const unformatNumber = (num: string) => num.replace(/,/g, "");
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (/^[0-9,]*\.?[0-9]*$/.test(v) || v === "") {
      const unformatted = unformatNumber(v);
      onChange(unformatted);
    }
  };
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="text-sm font-medium flex items-center gap-2">
        {label}
        {/* Tooltip icon */}
        {info && (
          <div className="relative group cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-200 text-gray-900 text-xs font-bold">
              i
            </div>
            {/* Tooltip ด้านข้างขวา */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-56 bg-gray-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              {info}
            </div>
          </div>
        )}
      </label>
      <input
        inputMode="numeric"
        value={formatNumber(value)}
        onChange={handle}
        placeholder="0"
        className="w-full border border-black rounded-lg p-2 mt-1 focus:ring-2 focus:ring-black bg-gray-50 text-black"
      />
    </div>
  );
}