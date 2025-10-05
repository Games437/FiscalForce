"use client";
import React, { useState, useRef, useEffect } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

/* ---------- Helpers ---------- */
const fmtNumber = (n: number) => Number(n || 0).toLocaleString("en-US");
const parseNumber = (s: string) => {
  if (!s && s !== "0") return 0;
  const cleaned = String(s).replace(/[,\s]+/g, "");
  const v = Number(cleaned);
  return Number.isFinite(v) ? v : 0;
};

/* ---------- Types ---------- */
interface TaxBreakdown {
  range: string;
  amount: number;
  rate: number;
  tax: number;
}

interface TaxResult {
  totalIncome: number;
  deduction: number;
  taxable: number;
  tax: number;
  withheld: number;
  taxDue: number;
  breakdown: TaxBreakdown[];
}

/* ---------- Tax Calculation ---------- */
function calculateTax(inputs: {
  salaryMonthly: number;
  bonus: number;
  business: number;
  interest: number;
  dividend: number;
  rent: number;
  otherIncome: number;
  ded_spouse: boolean;
  ded_children: number;
  ded_parents: number;
  ded_social: number;
  ded_insurance: number;
  ded_health: number;
  ded_fund: number;
  ded_provident: number;
  ded_homeLoan: number;
  ded_donate: number;
  taxWithheld: number;
}): TaxResult {
  const salary = inputs.salaryMonthly * 12;
  const salaryExpense = Math.min(salary * 0.5, 100000);
  const businessExpense = Math.min(inputs.business * 0.6, 100000);

  const totalIncome =
    salary -
    salaryExpense +
    inputs.bonus +
    (inputs.business - businessExpense) +
    inputs.interest +
    inputs.dividend +
    inputs.rent +
    inputs.otherIncome;

  let deduction = 60000;
  if (inputs.ded_spouse) deduction += 60000;
  deduction += inputs.ded_children * 30000;
  deduction += inputs.ded_parents;
  deduction += Math.min(inputs.ded_social, 9000);
  deduction += Math.min(inputs.ded_insurance, 100000);
  deduction += Math.min(inputs.ded_health, 25000);
  deduction += Math.min(inputs.ded_fund, 200000);
  deduction += Math.min(inputs.ded_provident, 500000);
  deduction += Math.min(inputs.ded_homeLoan, 100000);
  deduction += inputs.ded_donate;

  const taxable = Math.max(totalIncome - deduction, 0);

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

  let remaining = taxable;
  let prev = 0;
  let tax = 0;
  const breakdown: TaxBreakdown[] = [];

  TAX_BRACKETS.forEach((b) => {
    const amt = Math.max(0, Math.min(remaining, b.limit - prev));
    if (amt > 0) {
      const t = amt * b.rate;
      tax += t;
      breakdown.push({
        range: `${fmtNumber(prev + 1)} - ${
          isFinite(b.limit) ? fmtNumber(b.limit) : "∞"
        }`,
        amount: amt,
        rate: b.rate,
        tax: t,
      });
    }
    remaining -= amt;
    prev = b.limit;
  });

  const withheld = inputs.taxWithheld || 0;
  const taxDue = tax - withheld;

  return { totalIncome, deduction, taxable, tax, withheld, taxDue, breakdown };
}

/* ---------- Main Component ---------- */
export default function TaxPlannerWizard() {
  const totalSteps = 6;
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Record<string, string | boolean>>({
    salaryMonthly: "",
    bonus: "",
    business: "",
    interest: "",
    dividend: "",
    rent: "",
    otherIncome: "",
    ded_spouse: false,
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
  const [result, setResult] = useState<TaxResult | null>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const setField = (k: string, v: string | boolean) =>
    setData((p) => ({ ...p, [k]: v }));
  const next = () => setStep((s) => Math.min(totalSteps, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));
  const restart = () => {
    setData({
      salaryMonthly: "",
      bonus: "",
      business: "",
      interest: "",
      dividend: "",
      rent: "",
      otherIncome: "",
      ded_spouse: false,
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
    setResult(null);
    setStep(1);
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }
  };

  const runCalculate = () => {
    const i = {
      salaryMonthly: parseNumber(String(data.salaryMonthly)),
      bonus: parseNumber(String(data.bonus)),
      business: parseNumber(String(data.business)),
      interest: parseNumber(String(data.interest)),
      dividend: parseNumber(String(data.dividend)),
      rent: parseNumber(String(data.rent)),
      otherIncome: parseNumber(String(data.otherIncome)),
      ded_spouse: Boolean(data.ded_spouse),
      ded_children: parseNumber(String(data.ded_children)),
      ded_parents: parseNumber(String(data.ded_parents)),
      ded_social: parseNumber(String(data.ded_social)),
      ded_insurance: parseNumber(String(data.ded_insurance)),
      ded_health: parseNumber(String(data.ded_health)),
      ded_fund: parseNumber(String(data.ded_fund)),
      ded_provident: parseNumber(String(data.ded_provident)),
      ded_homeLoan: parseNumber(String(data.ded_homeLoan)),
      ded_donate: parseNumber(String(data.ded_donate)),
      taxWithheld: parseNumber(String(data.taxWithheld)),
    };
    const res = calculateTax(i);
    setResult(res);
    setStep(6);
  };

  /* ---------- Draw Chart ---------- */
  useEffect(() => {
    if (!chartRef.current || !result) return;

    const dataChart = {
      labels: result.breakdown.map((b) => b.range),
      datasets: [
        {
          label: "เงินได้ที่เสียภาษี",
          data: result.breakdown.map((b) => b.amount),
          backgroundColor: "#60a5fa", // น้ำเงิน
          borderRadius: 6,
        },
        {
          label: "ภาษีแต่ละขั้น",
          data: result.breakdown.map((b) => b.tax),
          backgroundColor: "#34d399", // เขียว
          borderRadius: 6,
        },
      ],
    };

    if (chartInstance.current) {
      chartInstance.current.data = dataChart;
      chartInstance.current.update();
    } else {
      chartInstance.current = new Chart(chartRef.current, {
        type: "bar",
        data: dataChart,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
              labels: { padding: 15, boxWidth: 20 },
            },
            tooltip: {
              mode: "index",
              intersect: false,
              callbacks: {
                label: function (context) {
                  return `${context.dataset.label}: ${fmtNumber(
                    context.parsed.y
                  )} บาท`;
                },
              },
            },
          },
          interaction: {
            mode: "index" as const,
            intersect: false,
          },
          scales: {
            x: { stacked: true, title: { display: true, text: "ช่วงเงินได้" } },
            y: {
              stacked: true,
              beginAtZero: true,
              title: { display: true, text: "จำนวนเงิน (บาท)" },
            },
          },
        },
      });
    }
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
                    ? "bg-green-600 border-green-600 text-white scale-110"
                    : "border-gray-300 text-gray-700"
                }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-xs mt-2 ${
                    step === i + 1
                      ? "text-green-700 font-semibold"
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
      <div className="flex flex-col justify-start animate-fadein overflow-y-auto">
        {step < 6 && (
          <div className="space-y-6 min-h-[650px]">
            {" "}
            {/* <-- เพิ่ม min-h เท่ากันทุกหน้า */}
            <h2 className="text-2xl font-bold text-green-700">Step {step}</h2>
            <p className="text-sm text-gray-500">
              กรอกข้อมูลของคุณในแต่ละขั้นตอนให้ครบถ้วน
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {step === 1 && (
                <>
                  <NumInput
                    label="เงินเดือน (บาท/เดือน)"
                    value={String(data.salaryMonthly)}
                    onChange={(v) => setField("salaryMonthly", v)}
                  />
                  <NumInput
                    label="โบนัส"
                    value={String(data.bonus)}
                    onChange={(v) => setField("bonus", v)}
                  />
                  <NumInput
                    label="รายได้ธุรกิจ"
                    value={String(data.business)}
                    onChange={(v) => setField("business", v)}
                  />
                  <NumInput
                    label="ดอกเบี้ยเงินฝาก"
                    value={String(data.interest)}
                    onChange={(v) => setField("interest", v)}
                  />
                  <NumInput
                    label="เงินปันผล"
                    value={String(data.dividend)}
                    onChange={(v) => setField("dividend", v)}
                  />
                  <NumInput
                    label="ค่าเช่า"
                    value={String(data.rent)}
                    onChange={(v) => setField("rent", v)}
                  />
                  <NumInput
                    label="รายได้อื่น ๆ"
                    value={String(data.otherIncome)}
                    onChange={(v) => setField("otherIncome", v)}
                    full
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <label className="col-span-2 flex items-center gap-2 font-medium">
                    <input
                      type="checkbox"
                      checked={Boolean(data.ded_spouse)}
                      onChange={(e) => setField("ded_spouse", e.target.checked)}
                      className="w-4 h-4 accent-green-600"
                    />
                    คู่สมรสไม่มีรายได้ (60,000)
                  </label>
                  <NumInput
                    label="จำนวนบุตร"
                    value={String(data.ded_children)}
                    onChange={(v) => setField("ded_children", v)}
                  />
                  <NumInput
                    label="พ่อแม่ / ผู้พิการ (บาท)"
                    value={String(data.ded_parents)}
                    onChange={(v) => setField("ded_parents", v)}
                  />
                </>
              )}

              {step === 3 && (
                <>
                  <NumInput
                    label="ประกันสังคม"
                    value={String(data.ded_social)}
                    onChange={(v) => setField("ded_social", v)}
                  />
                  <NumInput
                    label="กองทุนสำรองเลี้ยงชีพ"
                    value={String(data.ded_provident)}
                    onChange={(v) => setField("ded_provident", v)}
                  />
                  <NumInput
                    label="RMF / SSF"
                    value={String(data.ded_fund)}
                    onChange={(v) => setField("ded_fund", v)}
                    full
                  />
                </>
              )}

              {step === 4 && (
                <>
                  <NumInput
                    label="เบี้ยประกันชีวิต"
                    value={String(data.ded_insurance)}
                    onChange={(v) => setField("ded_insurance", v)}
                  />
                  <NumInput
                    label="เบี้ยประกันสุขภาพ"
                    value={String(data.ded_health)}
                    onChange={(v) => setField("ded_health", v)}
                  />
                </>
              )}

              {step === 5 && (
                <>
                  <NumInput
                    label="ดอกเบี้ยบ้าน"
                    value={String(data.ded_homeLoan)}
                    onChange={(v) => setField("ded_homeLoan", v)}
                  />
                  <NumInput
                    label="เงินบริจาค"
                    value={String(data.ded_donate)}
                    onChange={(v) => setField("ded_donate", v)}
                  />
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
            <div className="p-6 bg-green-50 border-2 border-green-400 rounded-xl shadow">
              <h3 className="text-xl font-bold text-green-800 mb-2">
                ภาษีที่คุณต้องจ่ายประมาณ
              </h3>
              <p className="text-5xl font-bold text-green-700">
                {fmtNumber(Math.abs(result.taxDue))} บาท
              </p>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-green-100">
                  <tr>
                    <th className="p-2 text-left">ช่วงเงินได้</th>
                    <th className="p-2 text-center">อัตราภาษี</th>
                    <th className="p-2 text-right">เงินได้ที่เสียภาษี</th>
                    <th className="p-2 text-right">ภาษีแต่ละขั้น</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((b, i) => (
                    <tr key={i} className="border-t hover:bg-green-50">
                      <td className="p-2">{b.range}</td>
                      <td className="p-2 text-center">
                        {(b.rate * 100).toFixed(0)}%
                      </td>
                      <td className="p-2 text-right">{fmtNumber(b.amount)}</td>
                      <td className="p-2 text-right text-pink-600">
                        {fmtNumber(b.tax)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Chart */}
            <div className="mt-8">
              <canvas ref={chartRef} height={300}></canvas>
            </div>
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
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            ถัดไป
          </button>
        )}
        {step === 5 && (
          <button
            onClick={runCalculate}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  full?: boolean;
}) {
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (/^[0-9.,\s]*$/.test(v) || v === "") onChange(v);
  };
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="text-sm font-medium">{label}</label>
      <input
        inputMode="numeric"
        value={value}
        onChange={handle}
        placeholder="0"
        className="w-full border border-green-200 rounded-lg p-2 mt-1 focus:ring-2 focus:ring-green-300 bg-green-50 text-green-900"
      />
    </div>
  );
}
