"use client";
import { useState } from "react";

interface Result {
  monthlyPayment: number;
  totalDeposit: number;
  totalInterest: number;
  targetAmount: number;
}

export default function GSBSavingCalculator() {
  const [targetAmount, setTargetAmount] = useState<string>("");
  const [years, setYears] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("");
  const [initialAmount, setInitialAmount] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);

  const handleCalculate = () => {
    const targetVal = Number(targetAmount) || 0;
    const yearsVal = Number(years) || 0;
    const rateVal = Number(interestRate) || 0;
    const initialVal = Number(initialAmount) || 0;

    const months = yearsVal * 12;
    const monthlyRate = (rateVal / 100) / 12;

    if (months <= 0) {
      setResult(null);
      return;
    }

    const futureValueOfInitial = initialVal * Math.pow(1 + monthlyRate, months);
    const remainingAmount = targetVal - futureValueOfInitial;

    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment = remainingAmount / (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate));
    } else {
      monthlyPayment = remainingAmount / months;
    }

    const totalDeposit = initialVal + monthlyPayment * months;
    const totalInterest = targetVal - totalDeposit;

    setResult({
      monthlyPayment,
      totalDeposit,
      totalInterest,
      targetAmount: targetVal
    });
  };

  const handleClear = () => {
    setTargetAmount("");
    setYears("");
    setInterestRate("");
    setInitialAmount("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 shadow-lg"
            style={{ background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)" }}
          >
            <span className="text-4xl">💰</span>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
            คำนวณเงินออม
          </h1>
          <p className="text-gray-600 font-normal text-lg flex items-center justify-center gap-2">
            Government Savings
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-white">
          {/* Input Section */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 rounded-full bg-gradient-to-b from-gray-700 to-gray-900"></div>
              <h2 className="text-2xl font-bold" style={{ color: "#04081b" }}>
                ข้อมูลการออม
              </h2>
            </div>

            <div className="grid gap-5">
              <div className="relative">
                <label className="block text-base font-semibold mb-2" style={{ color: "#04081b" }}>
                  จำนวนเงินที่ต้องการ (บาท)
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg p-3 pl-4 text-base focus:outline-none focus:ring-2 focus:ring-gray-500 border-2 transition-all bg-gradient-to-r from-gray-50/50 to-gray-100/50"
                  style={{ borderColor: "rgba(4,8,27,0.125)", color: "#04081b" }}
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  min={0}
                  step={1000}
                  placeholder="0"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="relative">
                  <label className="block text-base font-semibold mb-2" style={{ color: "#04081b" }}>
                    ระยะเวลาที่ต้องการออม (ปี)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-gray-500 border-2 transition-all bg-gradient-to-r from-gray-50/50 to-gray-100/50"
                    style={{ borderColor: "rgba(4,8,27,0.125)", color: "#04081b" }}
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    min={1}
                    max={50}
                    placeholder="0"
                  />
                </div>

                <div className="relative">
                  <label className="block text-base font-semibold mb-2" style={{ color: "#04081b" }}>
                    อัตราดอกเบี้ย (% ต่อปี)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-gray-500 border-2 transition-all bg-gradient-to-r from-gray-50/50 to-gray-100/50"
                    style={{ borderColor: "rgba(4,8,27,0.125)", color: "#04081b" }}
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    min={0}
                    max={20}
                    step={0.1}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-base font-semibold mb-2" style={{ color: "#04081b" }}>
                  เงินออมเริ่มต้น (บาท)
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-gray-500 border-2 transition-all bg-gradient-to-r from-gray-50/50 to-gray-100/50"
                  style={{ borderColor: "rgba(4,8,27,0.125)", color: "#04081b" }}
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  min={0}
                  step={1000}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <button
                onClick={handleCalculate}
                className="w-full rounded-lg p-3 text-base font-bold text-white shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 relative overflow-hidden group"
                style={{ background: "linear-gradient(135deg, #374151 0%, #111827 100%)" }}
              >
                <span className="relative z-10">คำนวณ</span>
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </button>

              <button
                onClick={handleClear}
                className="w-full rounded-lg p-3 text-base font-bold border-2 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 bg-white"
                style={{
                  color: "#04081b",
                  borderColor: "rgba(4,8,27,0.25)"
                }}
              >
                ล้างข้อมูล
              </button>
            </div>
          </div>

          {/* Result Section */}
          {result && (
            <div className="pt-8 border-t-2" style={{ borderColor: "rgba(4,8,27,0.0625)" }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-gray-600 to-gray-800"></div>
                <h2 className="text-2xl font-bold" style={{ color: "#04081b" }}>
                  ผลการคำนวณ
                </h2>
              </div>

              {/* Main Result Box */}
              <div
                className="rounded-xl p-6 text-white text-center mb-5 shadow-lg relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #374151 0%, #111827 100%)" }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                <div className="relative z-10">
                  <p className="text-sm opacity-90 mb-2 font-normal">จำนวนเงินที่ต้องออม</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <p className="text-4xl font-bold">
                      {result.monthlyPayment > 0
                        ? Math.ceil(result.monthlyPayment).toLocaleString()
                        : 0}
                    </p>
                    <p className="text-lg font-normal">บาท</p>
                  </div>
                  <p className="text-sm opacity-90 mt-2 font-normal">ต่อเดือน</p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-3 mb-6">
                <div
                  className="flex justify-between items-center p-4 rounded-xl border-2 transition-all hover:shadow-md"
                  style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}
                >
                  <span className="font-normal text-base flex items-center gap-2" style={{ color: "#04081b" }}>
                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                    เงินต้นที่ฝากสะสม
                  </span>
                  <span className="font-bold text-base" style={{ color: "#04081b" }}>
                    {Math.ceil(result.totalDeposit).toLocaleString()} บาท
                  </span>
                </div>

                <div
                  className="flex justify-between items-center p-4 rounded-xl border-2 transition-all hover:shadow-md"
                  style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}
                >
                  <span className="font-normal text-base flex items-center gap-2" style={{ color: "#04081b" }}>
                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                    ดอกเบี้ยที่ได้รับ
                  </span>
                  <span className="font-bold text-base" style={{ color: "#04081b" }}>
                    +{Math.ceil(result.totalInterest).toLocaleString()} บาท
                  </span>
                </div>

                <div
                  className="flex justify-between items-center p-5 rounded-xl border-2 shadow-md"
                  style={{ background: "linear-gradient(135deg, #f3f4f615 0%, #1f293715 100%)", borderColor: "#6b728040" }}
                >
                  <span className="font-bold text-base flex items-center gap-2" style={{ color: "#04081b" }}>
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-600 to-gray-900"></div>
                    เงินออมที่ได้รวม
                  </span>
                  <span className="font-bold text-xl bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                    {result.targetAmount.toLocaleString()} บาท
                  </span>
                </div>
              </div>

              {/* Note */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border-l-4 border-amber-400 shadow-sm">
                <p className="text-sm text-gray-700 leading-relaxed font-normal flex items-start gap-2">
                  <span className="text-amber-600 text-lg">💡</span>
                  <span>
                    <span className="font-bold text-amber-800">หมายเหตุ:</span> ผลการคำนวณข้างต้นเป็นเพียงประมาณการเบื้องต้นเท่านั้น
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>💰 วางแผนการเงินเพื่ออนาคตที่มั่นคง</p>
        </div>
      </div>
    </div>
  );
}
