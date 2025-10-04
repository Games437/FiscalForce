"use client";
import { useState } from "react";

export default function RetirementPlanner() {
  const [age, setAge] = useState(25);
  const [retireAge, setRetireAge] = useState(60);
  const [expense, setExpense] = useState(20000);
  const [inflation, setInflation] = useState(3);
  const [lifeExpect, setLifeExpect] = useState(80);

  const years = retireAge - age;
  const futureExpense = expense * Math.pow(1 + inflation / 100, years);
  const totalYearsAfter = lifeExpect - retireAge;
  const totalNeeded = futureExpense * 12 * totalYearsAfter;
  const monthlySave = totalNeeded / (years * 12);

  return (
    <div className="min-h-screen bg-[#f6fcff] p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-green-800">
        📈 วางแผนเกษียณ Retirement Planner
      </h1>

      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label>อายุปัจจุบัน</label>
          <input type="number" className="border p-2 rounded" value={age} onChange={(e) => setAge(Number(e.target.value))} />
          <label>อายุที่อยากเกษียณ</label>
          <input type="number" className="border p-2 rounded" value={retireAge} onChange={(e) => setRetireAge(Number(e.target.value))} />
          <label>ค่าใช้จ่ายต่อเดือน (ปัจจุบัน)</label>
          <input type="number" className="border p-2 rounded" value={expense} onChange={(e) => setExpense(Number(e.target.value))} />
          <label>อัตราเงินเฟ้อที่คาด (% ต่อปี)</label>
          <input type="number" className="border p-2 rounded" value={inflation} onChange={(e) => setInflation(Number(e.target.value))} />
          <label>อายุคาดว่าจะใช้เงินหลังเกษียณ</label>
          <input type="number" className="border p-2 rounded" value={lifeExpect} onChange={(e) => setLifeExpect(Number(e.target.value))} />
        </div>

        <div className="border-t pt-4 mt-4 text-center">
          <p>💵 ค่าใช้จ่ายต่อเดือนในอนาคต: <b>{futureExpense.toFixed(0)} บาท</b></p>
          <p>🏦 เงินก้อนที่ต้องมีทั้งหมด: <b>{totalNeeded.toLocaleString()} บาท</b></p>
          <p>🪙 ควรเริ่มออมเดือนละ: <b>{monthlySave.toFixed(0)} บาท</b></p>
        </div>
      </div>
    </div>
  );
}
