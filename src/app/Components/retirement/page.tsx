"use client";

import React, { useState, useMemo, useCallback, memo } from "react";

/* 
  🔹 สร้าง interface สำหรับ props ของ InputField 
  เพื่อกำหนดชนิดของข้อมูลที่ส่งเข้ามา
*/
interface InputFieldProps {
  label: string; // ชื่อ label ของช่อง input
  keyName: string; // ชื่อ key สำหรับเก็บใน state
  suffix?: string; // หน่วย เช่น "ปี", "บาท"
  value: string; // ค่าที่กรอกอยู่ใน input
  onChange: (key: string, value: string) => void; // ฟังก์ชันเปลี่ยนค่า
  placeholder?: string; // ข้อความตัวอย่างในช่อง input
  info?: string; // tooltip อธิบายเพิ่มเติม
  min?: number; // ค่าต่ำสุด
  max?: number; // ค่าสูงสุด
  relatedValue?: number; // ค่าที่ต้องใช้เปรียบเทียบ เช่น อายุปัจจุบัน
}

/* 
  🔹 คอมโพเนนต์ InputField ใช้ memo() เพื่อลดการ re-render เมื่อไม่มีการเปลี่ยนแปลงค่า
*/
const InputField = memo(
  ({
    label,
    keyName,
    suffix = "",
    value,
    onChange,
    placeholder = "",
    info,
    min,
    max,
    relatedValue,
  }: InputFieldProps) => {
    // ฟังก์ชันแปลงตัวเลขให้มี comma เช่น 30000 → 30,000
    const formatNumber = (num: string) => {
      const cleaned = num.replace(/,/g, "");
      if (cleaned === "" || isNaN(Number(cleaned))) return "";
      const parts = cleaned.split(".");
      parts[0] = Number(parts[0]).toLocaleString("th-TH");
      return parts.join(".");
    };

    // ฟังก์ชันจัดการเวลาผู้ใช้พิมพ์ตัวเลข
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/,/g, "");
      // อนุญาตเฉพาะตัวเลขและจุดทศนิยม
      if (/^\d*\.?\d*$/.test(raw)) {
        onChange(keyName, raw);
      }
    };

    // ตรวจสอบความถูกต้องของข้อมูล (validation)
    const numberValue = parseFloat(value) || 0;
    let error = "";
    if (min !== undefined && numberValue < min) {
      error = `ต้องมากกว่าหรือเท่ากับ ${min}`;
    } else if (max !== undefined && numberValue > max) {
      error = `ต้องน้อยกว่าหรือเท่ากับ ${max}`;
    } else if (
      relatedValue !== undefined &&
      ((keyName === "retireAge" && numberValue <= relatedValue) ||
        (keyName === "lifeExpectancy" && numberValue <= relatedValue))
    ) {
      // ตรวจว่าค่าที่กรอกต้องมากกว่าอีกค่าหนึ่ง (เช่น อายุเกษียณ > อายุปัจจุบัน)
      error =
        keyName === "retireAge"
          ? `ต้องมากกว่าอายุปัจจุบัน`
          : `ต้องมากกว่าอายุเกษียณ`;
    }

    // ✅ ส่วนของการแสดงผล InputField
    return (
      <div className="bg-gray-50 p-3 rounded relative">
        <label className="text-sm text-gray-600 mb-1 flex items-center gap-1">
          {label}
          {/* แสดง tooltip ถ้ามี info */}
          {info && (
            <div className="relative group cursor-pointer">
              <div className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-200 text-gray-900 text-xs font-bold">
                i
              </div>
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-56 bg-gray-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {info}
              </div>
            </div>
          )}
        </label>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {/* กล่อง input สำหรับกรอกตัวเลข */}
            <input
              id={keyName}
              inputMode="decimal"
              value={formatNumber(value)}
              onChange={handleInput}
              placeholder={placeholder}
              className={`flex-1 min-w-0 w-full px-3 py-2 border rounded text-left focus:outline-none focus:ring-2 font-semibold ${
                error ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              } text-gray-900`}
            />
            {/* หน่วยท้ายช่อง เช่น “ปี”, “บาท” */}
            {suffix && (
              <span className="text-sm text-gray-600 whitespace-nowrap">{suffix}</span>
            )}
          </div>
          {/* แสดงข้อความ error ถ้ามี */}
          {error && <div className="text-red-500 text-xs">{error}</div>}
        </div>
      </div>
    );
  }
);

InputField.displayName = "InputField";

/* ค่าตั้งต้นของฟอร์มทั้งหมด */
const DEFAULT_INPUTS = {
  currentAge: "",
  retireAge: "",
  lifeExpectancy: "",
  currentExpense: "",
  inflationRate: "3",
  salaryGrowth: "",
  returnAfterRetire: "",
  pvdReturn: "",
  pvdMonthly: "",
  pvdCurrent: "",
};

/* 
  🔹 คอมโพเนนต์หลัก RetirementPlan 
  ใช้สำหรับคำนวณแผนการเกษียณ
*/
export default function RetirementPlan() {
  // state สำหรับเก็บค่าจากทุกช่อง input
  const [inputs, setInputs] = useState({ ...DEFAULT_INPUTS });

  // ฟังก์ชันเปลี่ยนค่าใน state ตามช่อง input
  const handleChange = useCallback((key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ฟังก์ชันรีเซ็ตค่า input ทั้งหมด
  const handleReset = useCallback(() => {
    setInputs({ ...DEFAULT_INPUTS });
  }, []);

  // แปลง string → number
  const toNumber = (v: string) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  /* 
    ✅ ใช้ useMemo เพื่อคำนวณผลลัพธ์เฉพาะเมื่อค่า input เปลี่ยน
  */
  const results = useMemo(() => {
    const currentAge = toNumber(inputs.currentAge);
    const retireAge = toNumber(inputs.retireAge);
    const lifeExpectancy = toNumber(inputs.lifeExpectancy);
    const currentExpense = toNumber(inputs.currentExpense);
    const inflationRate = toNumber(inputs.inflationRate);
    const salaryGrowth = toNumber(inputs.salaryGrowth);
    const returnAfterRetire = toNumber(inputs.returnAfterRetire);
    const pvdReturn = toNumber(inputs.pvdReturn);
    const pvdMonthly = toNumber(inputs.pvdMonthly);
    const pvdCurrent = toNumber(inputs.pvdCurrent);

    // ✅ ตรวจว่าข้อมูลกรอกครบและถูกต้องก่อนคำนวณ
    if (retireAge <= currentAge || lifeExpectancy <= retireAge || currentExpense <= 0) {
      return {
        yearsToRetire: 0,
        yearsAfterRetire: 0,
        futureExpense: 0,
        realRate: 0,
        totalNeeded: 0,
        totalPVD: 0,
        shortage: 0,
        additionalSavings: 0,
        totalMonthlySavings: 0,
      };
    }

    // 🧮 คำนวณค่าต่างๆ
    const yearsToRetire = retireAge - currentAge;
    const yearsAfterRetire = lifeExpectancy - retireAge;
    const monthsToRetire = yearsToRetire * 12;
    const monthsAfterRetire = yearsAfterRetire * 12;

    // ค่าใช้จ่ายในอนาคต (คิดเงินเฟ้อ)
    const futureExpense =
      currentExpense * Math.pow(1 + inflationRate / 100, yearsToRetire);

    // ผลตอบแทนจริงหลังหักเงินเฟ้อ
    const realRate =
      (1 + returnAfterRetire / 100) / (1 + inflationRate / 100) - 1;
    const realRateMonthly = realRate / 12;

    // ปัจจัยคิดลด (PV factor)
    const pvFactor =
      Math.abs(realRateMonthly) > 1e-12
        ? (1 - Math.pow(1 + realRateMonthly, -monthsAfterRetire)) / realRateMonthly
        : monthsAfterRetire;

    // เงินที่ต้องมีทั้งหมดเมื่อเกษียณ
    const totalNeeded = futureExpense * pvFactor;

    // มูลค่าเงินกองทุนปัจจุบันในอนาคต
    const pvdCurrentFuture = pvdCurrent * Math.pow(1 + pvdReturn / 100, yearsToRetire);
    const rMonthly = pvdReturn / 100 / 12;
    const gMonthly = salaryGrowth / 100 / 12;

    // คำนวณยอดสะสมในอนาคตจากการออมรายเดือน
    let pvdMonthlySavings = 0;
    if (Math.abs(rMonthly - gMonthly) < 1e-12) {
      pvdMonthlySavings =
        pvdMonthly * monthsToRetire * Math.pow(1 + rMonthly, monthsToRetire - 1);
    } else {
      const numerator =
        Math.pow(1 + rMonthly, monthsToRetire) -
        Math.pow(1 + gMonthly, monthsToRetire);
      pvdMonthlySavings = pvdMonthly * (numerator / (rMonthly - gMonthly));
    }

    // มูลค่ากองทุนสำรองเลี้ยงชีพรวมทั้งหมด
    const totalPVD = pvdCurrentFuture + pvdMonthlySavings;
    const shortage = totalNeeded - totalPVD;

    // ปัจจัยสำหรับคำนวณการออมเพิ่ม
    const fvFactor =
      Math.abs(rMonthly) > 1e-12
        ? (Math.pow(1 + rMonthly, monthsToRetire) - 1) / rMonthly
        : monthsToRetire;

    // ต้องออมเพิ่มต่อเดือนเท่าไหร่
    const additionalSavings = shortage > 0 ? shortage / fvFactor : 0;

    // ✅ คืนค่าผลลัพธ์ทั้งหมด
    return {
      yearsToRetire,
      yearsAfterRetire,
      futureExpense,
      realRate: realRate * 100,
      totalNeeded,
      totalPVD,
      shortage,
      additionalSavings,
      totalMonthlySavings: pvdMonthly + additionalSavings,
    };
  }, [inputs]);

  // ฟังก์ชันจัดรูปแบบตัวเลขให้มี comma
  const formatNumber = (num: number, maximumFractionDigits = 0) =>
    new Intl.NumberFormat("th-TH", { maximumFractionDigits }).format(num);

  /* 
    ✅ ส่วนการแสดงผลหน้าเว็บ 
  */
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          แผนการเกษียณ
        </h1>

        {/* ------------------ ส่วนกรอกข้อมูลพื้นฐาน ------------------ */}
        <div className="bg-white rounded-lg p-6 mb-6 border-l-4 border-blue-500">
          <h2 className="text-lg font-bold text-gray-800 mb-4">ข้อมูลพื้นฐาน</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* อายุปัจจุบัน */}
            <InputField
              label="อายุปัจจุบัน"
              keyName="currentAge"
              value={inputs.currentAge}
              onChange={handleChange}
              suffix="ปี"
              placeholder="เช่น 30"
              min={0}
              max={120}
              info="กรอกอายุปัจจุบัน (0-120 ปี)"
            />

            {/* อายุเกษียณ */}
            <InputField
              label="อายุเกษียณ"
              keyName="retireAge"
              value={inputs.retireAge}
              onChange={handleChange}
              suffix="ปี"
              placeholder="เช่น 60"
              min={toNumber(inputs.currentAge) + 1}
              max={100}
              relatedValue={toNumber(inputs.currentAge)}
              info="ต้องมากกว่าอายุปัจจุบัน"
            />

            {/* อายุขัย */}
            <InputField
              label="อายุขัย"
              keyName="lifeExpectancy"
              value={inputs.lifeExpectancy}
              onChange={handleChange}
              suffix="ปี"
              placeholder="เช่น 80"
              min={toNumber(inputs.retireAge) + 1}
              max={150}
              relatedValue={toNumber(inputs.retireAge)}
              info="ต้องมากกว่าอายุเกษียณ"
            />

            {/* ระยะเวลาออมและใช้จ่าย */}
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600 mb-1">ระยะเวลาออม</div>
              <div className="text-lg font-bold text-gray-800">
                {results.yearsToRetire} ปี
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-gray-600 mb-1">ระยะเวลาใช้จ่าย</div>
              <div className="text-lg font-bold text-gray-800">
                {results.yearsAfterRetire} ปี
              </div>
            </div>

            {/* ค่าใช้จ่ายต่อเดือน */}
            <InputField
              label="ค่าใช้จ่ายปัจจุบัน"
              keyName="currentExpense"
              value={inputs.currentExpense}
              onChange={handleChange}
              suffix="บาท/เดือน"
              placeholder="เช่น 30000"
              info="ค่าใช้จ่ายเฉลี่ยต่อเดือนในปัจจุบัน"
            />
          </div>
        </div>

        {/* ------------------ ส่วนอัตราต่างๆ ------------------ */}
        <div className="bg-white rounded-lg p-6 mb-6 border-l-4 border-blue-500">
          <h2 className="text-lg font-bold text-gray-800 mb-4">อัตราต่างๆ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="อัตราเงินเฟ้อ" keyName="inflationRate" value={inputs.inflationRate} onChange={handleChange} suffix="%" placeholder="เช่น 3" info="โดยทั่วไปอยู่ระหว่าง 2-3% ต่อปี" />
            <InputField label="การเพิ่มเงินเดือน" keyName="salaryGrowth" value={inputs.salaryGrowth} onChange={handleChange} suffix="%" placeholder="เช่น 0" info="อัตราการขึ้นเงินเดือนเฉลี่ยต่อปี" />
            <InputField label="ผลตอบแทนหลังเกษียณ" keyName="returnAfterRetire" value={inputs.returnAfterRetire} onChange={handleChange} suffix="%" placeholder="เช่น 4" info="ผลตอบแทนเฉลี่ยจากการลงทุนหลังเกษียณ" />
            <InputField label="ผลตอบแทนกองทุน (PVD)" keyName="pvdReturn" value={inputs.pvdReturn} onChange={handleChange} suffix="%" placeholder="เช่น 4" info="ผลตอบแทนเฉลี่ยต่อปีของกองทุนสำรองเลี้ยงชีพ" />

            {/* แสดง real return rate */}
            <div className="bg-gray-100 p-3 rounded col-span-full relative">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  Real Return Rate
                  {/* tooltip */}
                  <div className="relative group cursor-pointer">
                    <div className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-200 text-gray-900 text-xs font-bold">
                      i
                    </div>
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-44 bg-gray-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      ผลตอบแทนหลังหักเงินเฟ้อ
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {results.realRate.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* ------------------ ส่วนข้อมูลกองทุน PVD ------------------ */}
        <div className="bg-white rounded-lg p-6 mb-6 border-l-4 border-orange-500">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            ข้อมูลกองทุนสำรองเลี้ยงชีพ (PVD)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="เงินสะสมกองทุนต่อเดือน" keyName="pvdMonthly" value={inputs.pvdMonthly} onChange={handleChange} suffix="บาท" placeholder="เช่น 5000" info="จำนวนเงินที่ออมเข้ากองทุนต่อเดือน" />
            <InputField label="มูลค่ากองทุนปัจจุบัน" keyName="pvdCurrent" value={inputs.pvdCurrent} onChange={handleChange} suffix="บาท" placeholder="เช่น 200000" info="ยอดเงินที่มีอยู่ในกองทุนตอนนี้" />
          </div>
        </div>

        {/* ------------------ ส่วนสรุปผล ------------------ */}
        <div className="bg-white rounded-lg p-6 mb-6 border-l-4 border-green-500">
          <h2 className="text-lg font-bold text-gray-800 mb-4">สรุปผล</h2>
          <table className="w-full mb-6">
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                  ค่าใช้จ่าย ณ วันเกษียณ
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-900 font-semibold">
                  {formatNumber(results.futureExpense)} บาท/เดือน
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                  เงินที่ต้องมีทั้งหมด
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-900 font-semibold">
                  {formatNumber(results.totalNeeded)} บาท
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                  มูลค่ากองทุนในอนาคต
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-900 font-semibold">
                  {formatNumber(results.totalPVD)} บาท
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                  เงินที่ยังขาด
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-900 font-semibold">
                  {formatNumber(Math.max(0, results.shortage))} บาท
                </td>
              </tr>
            </tbody>
          </table>

          {/* ต้องออมเพิ่มต่อเดือน */}
          <div className="bg-yellow-100 p-6 rounded-lg text-center mb-4">
            <div className="text-gray-700 mb-2">
              ต้องออมเพิ่มต่อเดือน (นอกจากกองทุน)
            </div>
            <div className="text-4xl font-bold text-red-600">
              {formatNumber(results.additionalSavings)} บาท
            </div>
          </div>

          {/* รวมออมต่อเดือนทั้งหมด */}
          <div className="bg-blue-100 p-6 rounded-lg text-center">
            <div className="text-gray-700 mb-2">
              รวมการออมต่อเดือนทั้งหมด
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {formatNumber(results.totalMonthlySavings)} บาท
            </div>
          </div>
        </div>

        {/* ปุ่มรีเซ็ตค่า */}
        <div className="flex justify-center pb-8">
          <button
            onClick={handleReset}
            className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-md"
          >
            {/* ไอคอนวงกลมรีเซ็ต */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            รีเซ็ตข้อมูล
          </button>
        </div>
      </div>
    </div>
  );
}
