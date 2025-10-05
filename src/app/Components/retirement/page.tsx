"use client";

import React, { useState, useMemo, useCallback, memo } from "react";
interface InputFieldProps {
  label: string;
  keyName: string;
  suffix?: string;
  value: string;
  onChange: (key: string, value: string) => void;
}

const InputField = memo(
  ({ label, keyName, suffix = "", value, onChange }: InputFieldProps) => {
    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (/^-?\d*\.?\d*$/.test(val) || val === "") {
        onChange(keyName, val);
      }
    };

    return (
      <div className="bg-gray-50 p-3 rounded">
        <label className="text-sm text-gray-600 block mb-1">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={handleInput}
            className="flex-1 min-w-0 w-full px-3 py-2 border border-gray-300 rounded 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     text-gray-800 font-medium"
          />
          {suffix && (
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {suffix}
            </span>
          )}
        </div>
      </div>
    );
  }
);
InputField.displayName = "InputField";

export default function RetirementPlan() {
  const defaultInputs = {
    currentAge: "0",
    retireAge: "0",
    lifeExpectancy: "0",
    currentExpense: "0",
    inflationRate: "0",
    salaryGrowth: "3",
    returnAfterRetire: "0",
    pvdReturn: "0",
    pvdMonthly: "0",
    pvdCurrent: "0",
  };

  const [inputs, setInputs] = useState(defaultInputs);

  const handleChange = useCallback((key: string, value: string) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setInputs(defaultInputs);
  }, []);

  const toNumber = (v: string) => parseFloat(v) || 0;

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

    if (!retireAge || !lifeExpectancy || !currentExpense) {
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

    const yearsToRetire = retireAge - currentAge;
    const yearsAfterRetire = lifeExpectancy - retireAge;
    const monthsToRetire = yearsToRetire * 12;
    const monthsAfterRetire = yearsAfterRetire * 12;

    const futureExpense =
      currentExpense * Math.pow(1 + inflationRate / 100, yearsToRetire);
    const realRate =
      (1 + returnAfterRetire / 100) / (1 + inflationRate / 100) - 1;
    const realRateMonthly = realRate / 12;
    const pvFactor =
      (1 - Math.pow(1 + realRateMonthly, -monthsAfterRetire)) / realRateMonthly;
    const totalNeeded = futureExpense * pvFactor;

    const pvdCurrentFuture =
      pvdCurrent * Math.pow(1 + pvdReturn / 100, yearsToRetire);
    const rMonthly = pvdReturn / 100 / 12;
    const gMonthly = salaryGrowth / 100 / 12;
    let pvdMonthlySavings = 0;

    if (Math.abs(rMonthly - gMonthly) < 0.0001) {
      pvdMonthlySavings =
        pvdMonthly * monthsToRetire * Math.pow(1 + rMonthly, monthsToRetire);
    } else {
      const factor =
        (Math.pow(1 + rMonthly, monthsToRetire) -
          Math.pow(1 + gMonthly, monthsToRetire)) /
        (rMonthly - gMonthly);
      pvdMonthlySavings = pvdMonthly * factor;
    }

    const totalPVD = pvdCurrentFuture + pvdMonthlySavings;
    const shortage = totalNeeded - totalPVD;
    const fvFactor = (Math.pow(1 + rMonthly, monthsToRetire) - 1) / rMonthly;
    const additionalSavings = shortage / fvFactor;

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

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(num);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          แผนการเกษียณ
        </h1>

        {/* ข้อมูลพื้นฐาน */}
        <div className="bg-white rounded-lg p-6 mb-6 border-l-4 border-blue-500">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            ข้อมูลพื้นฐาน
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <InputField
              label="อายุปัจจุบัน"
              keyName="currentAge"
              value={inputs.currentAge}
              onChange={handleChange}
              suffix="ปี"
            />
            <InputField
              label="อายุเกษียณ"
              keyName="retireAge"
              value={inputs.retireAge}
              onChange={handleChange}
              suffix="ปี"
            />
            <InputField
              label="อายุขัย"
              keyName="lifeExpectancy"
              value={inputs.lifeExpectancy}
              onChange={handleChange}
              suffix="ปี"
            />
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
            <InputField
              label="ค่าใช้จ่ายปัจจุบัน"
              keyName="currentExpense"
              value={inputs.currentExpense}
              onChange={handleChange}
              suffix="บาท/เดือน"
            />
          </div>
        </div>

        {/* อัตราต่างๆ */}
        <div className="bg-white rounded-lg p-6 mb-6 border-l-4 border-blue-500">
          <h2 className="text-lg font-bold text-gray-800 mb-4">อัตราต่างๆ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <InputField
              label="อัตราเงินเฟ้อ"
              keyName="inflationRate"
              value={inputs.inflationRate}
              onChange={handleChange}
              suffix="%"
            />
            <InputField
              label="การเพิ่มเงินเดือน"
              keyName="salaryGrowth"
              value={inputs.salaryGrowth}
              onChange={handleChange}
              suffix="%"
            />
            <InputField
              label="ผลตอบแทนหลังเกษียณ"
              keyName="returnAfterRetire"
              value={inputs.returnAfterRetire}
              onChange={handleChange}
              suffix="%"
            />
            <InputField
              label="ผลตอบแทนกองทุน (PVD)"
              keyName="pvdReturn"
              value={inputs.pvdReturn}
              onChange={handleChange}
              suffix="%"
            />
            <div className="bg-gray-100 p-3 rounded col-span-full">
              <div className="text-sm text-gray-600 mb-1">Real Return Rate</div>
              <div className="text-lg font-bold text-blue-600">
                {results.realRate.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* PVD */}
        <div className="bg-white rounded-lg p-6 mb-6 border-l-4 border-orange-500">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            ข้อมูลกองทุนสำรองเลี้ยงชีพ (PVD)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <InputField
              label="เงินสะสมกองทุนต่อเดือน"
              keyName="pvdMonthly"
              value={inputs.pvdMonthly}
              onChange={handleChange}
              suffix="บาท"
            />
            <InputField
              label="มูลค่ากองทุนปัจจุบัน"
              keyName="pvdCurrent"
              value={inputs.pvdCurrent}
              onChange={handleChange}
              suffix="บาท"
            />
          </div>
        </div>

        {/* สรุปผล */}
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
                  {formatNumber(results.shortage)} บาท
                </td>
              </tr>
            </tbody>
          </table>

          <div className="bg-yellow-100 p-6 rounded-lg text-center mb-4">
            <div className="text-gray-700 mb-2">
              ต้องออมเพิ่มต่อเดือน (นอกจากกองทุน)
            </div>
            <div className="text-4xl font-bold text-red-600">
              {formatNumber(results.additionalSavings)} บาท
            </div>
          </div>

          <div className="bg-blue-100 p-6 rounded-lg text-center">
            <div className="text-gray-700 mb-2">รวมการออมต่อเดือนทั้งหมด</div>
            <div className="text-3xl font-bold text-blue-600">
              {formatNumber(results.totalMonthlySavings)} บาท
            </div>
          </div>
        </div>

        {/* ปุ่มรีเซ็ต */}
        <div className="flex justify-center pb-8">
          <button
            onClick={handleReset}
            className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg 
                       transition-colors duration-200 flex items-center gap-2 shadow-md"
          >
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
