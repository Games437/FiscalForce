"use client";
import { useState } from "react";

// 🧮 ฟังก์ชันคำนวณภาษี
function calculateTaxFull(inputs: any) {
  // แปลงค่าจาก string → number โดยลบ comma ออกก่อน
  const i = Object.fromEntries(
    Object.entries(inputs).map(([k, v]) => [k, parseFloat((v as string).replace(/,/g, "")) || 0])
  ) as any;

  const incomeTotal =
    i.salaryMonthly * 12 + i.bonus + i.business + i.interest + i.dividend + i.rent + i.otherIncome;
  const deductions =
    i.ded_spouse +
    i.ded_children +
    i.ded_parents +
    i.ded_social +
    i.ded_insurance +
    i.ded_health +
    i.ded_fund +
    i.ded_provident +
    i.ded_homeLoan +
    i.ded_donate;

  const taxableIncome = Math.max(incomeTotal - deductions, 0);

  // ตัวอย่างอัตราภาษีแบบขั้นบันได
  const taxBrackets = [
    [150000, 0],
    [300000, 0.05],
    [500000, 0.1],
    [750000, 0.15],
    [1000000, 0.2],
    [2000000, 0.25],
    [5000000, 0.3],
    [Infinity, 0.35],
  ];

  let remaining = taxableIncome;
  let prevLimit = 0;
  let tax = 0;

  for (const [limit, rate] of taxBrackets) {
    if (remaining <= 0) break;
    const taxable = Math.min(limit - prevLimit, remaining);
    tax += taxable * rate;
    remaining -= taxable;
    prevLimit = limit;
  }

  return {
    incomeTotal,
    deductions,
    taxableIncome,
    tax: Math.max(tax - i.taxWithheld, 0),
  };
}

// 🧾 Input Component
function Input({ label, tooltip, value, setValue, full = false }: any) {
  // ฟังก์ชันฟอร์แมตตัวเลขใส่ comma
  const formatNumber = (val: string) => {
    if (!val) return "";
    const parts = val.replace(/,/g, "").split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  // เมื่อพิมพ์ตัวเลข
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    // อนุญาตเฉพาะตัวเลขและจุดทศนิยม
    if (/^\d*\.?\d*$/.test(raw)) {
      setValue(raw); // เก็บค่า raw ที่ไม่มี comma
    }
  };

  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="flex items-center gap-1 font-medium">
        {label}
        {tooltip && (
          <span className="relative cursor-pointer text-green-600 font-bold text-sm group">
            ⓘ
            <span className="absolute left-1/2 transform -translate-x-1/2 bottom-6 bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-100 whitespace-nowrap">
              {tooltip}
            </span>
          </span>
        )}
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={formatNumber(value)}
        onChange={handleChange}
        className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-green-300"
      />
    </div>
  );
}

// 🧮 Main Component
export default function TaxCalculator() {
  const [inputs, setInputs] = useState({
    salaryMonthly: "",
    bonus: "",
    business: "",
    interest: "",
    dividend: "",
    rent: "",
    otherIncome: "",
    ded_spouse: "",
    ded_children: "",
    ded_parents: "",
    ded_social: "",
    ded_insurance: "",
    ded_health: "",
    ded_fund: "",
    ded_provident: "",
    ded_homeLoan: "",
    ded_donate: "",
    taxWithheld: "",
  });

  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    const res = calculateTaxFull(inputs);
    setResult(res);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6 space-y-6 mt-10">
      <h1 className="text-2xl font-bold text-center text-green-600">โปรแกรมคำนวณภาษีรายได้บุคคลธรรมดา</h1>

      {/* Income Section */}
      <div className="grid grid-cols-2 gap-4">
        <Input label="เงินเดือน (บาท/เดือน)" value={inputs.salaryMonthly} setValue={(v: string) => setInputs({ ...inputs, salaryMonthly: v })} />
        <Input label="โบนัส" value={inputs.bonus} setValue={(v: string) => setInputs({ ...inputs, bonus: v })} />
        <Input label="รายได้ธุรกิจ" value={inputs.business} setValue={(v: string) => setInputs({ ...inputs, business: v })} />
        <Input label="ดอกเบี้ย" value={inputs.interest} setValue={(v: string) => setInputs({ ...inputs, interest: v })} />
        <Input label="เงินปันผล" value={inputs.dividend} setValue={(v: string) => setInputs({ ...inputs, dividend: v })} />
        <Input label="ค่าเช่า" value={inputs.rent} setValue={(v: string) => setInputs({ ...inputs, rent: v })} />
        <Input label="รายได้อื่น ๆ" value={inputs.otherIncome} setValue={(v: string) => setInputs({ ...inputs, otherIncome: v })} />
      </div>

      {/* Deductions Section */}
      <h2 className="text-lg font-semibold mt-6 text-green-700">ค่าลดหย่อน</h2>
      <div className="grid grid-cols-2 gap-4">
        <Input label="คู่สมรส" value={inputs.ded_spouse} setValue={(v: string) => setInputs({ ...inputs, ded_spouse: v })} />
        <Input label="บุตร" value={inputs.ded_children} setValue={(v: string) => setInputs({ ...inputs, ded_children: v })} />
        <Input label="บิดา/มารดา" value={inputs.ded_parents} setValue={(v: string) => setInputs({ ...inputs, ded_parents: v })} />
        <Input label="ประกันสังคม" value={inputs.ded_social} setValue={(v: string) => setInputs({ ...inputs, ded_social: v })} />
        <Input label="ประกันชีวิต" value={inputs.ded_insurance} setValue={(v: string) => setInputs({ ...inputs, ded_insurance: v })} />
        <Input label="ประกันสุขภาพ" value={inputs.ded_health} setValue={(v: string) => setInputs({ ...inputs, ded_health: v })} />
        <Input label="กองทุนรวม RMF/SSF" value={inputs.ded_fund} setValue={(v: string) => setInputs({ ...inputs, ded_fund: v })} />
        <Input label="กองทุนสำรองเลี้ยงชีพ" value={inputs.ded_provident} setValue={(v: string) => setInputs({ ...inputs, ded_provident: v })} />
        <Input label="ดอกเบี้ยบ้าน" value={inputs.ded_homeLoan} setValue={(v: string) => setInputs({ ...inputs, ded_homeLoan: v })} />
        <Input label="เงินบริจาค" value={inputs.ded_donate} setValue={(v: string) => setInputs({ ...inputs, ded_donate: v })} />
        <Input label="ภาษีที่ถูกหักไว้แล้ว" value={inputs.taxWithheld} setValue={(v: string) => setInputs({ ...inputs, taxWithheld: v })} full />
      </div>

      {/* Button */}
      <div className="text-center">
        <button
          onClick={handleCalculate}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-semibold"
        >
          คำนวณภาษี
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-green-50 border border-green-300 p-4 rounded-xl mt-6">
          <h3 className="text-lg font-semibold text-green-700 mb-2">ผลการคำนวณ</h3>
          <p>รายได้รวม: {result.incomeTotal.toLocaleString()} บาท</p>
          <p>ค่าลดหย่อนรวม: {result.deductions.toLocaleString()} บาท</p>
          <p>เงินได้สุทธิ: {result.taxableIncome.toLocaleString()} บาท</p>
          <p className="text-red-600 font-bold mt-2">ภาษีที่ต้องชำระ: {result.tax.toLocaleString()} บาท</p>
        </div>
      )}
    </div>
  );
}
