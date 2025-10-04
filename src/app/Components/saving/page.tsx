"use client";
import { useState } from "react";

export default function SavingPlanner() {
  const [start, setStart] = useState(10000);
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(20);

  const months = years * 12;
  const r = rate / 100 / 12;
  const futureValue = start * Math.pow(1 + r, months) + monthly * ((Math.pow(1 + r, months) - 1) / r);

  return (
    <div className="min-h-screen bg-[#f6fcff] p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-green-800">
        💰 คำนวณการออม & การลงทุน
      </h1>

      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label>เงินเริ่มต้น</label>
          <input type="number" className="border p-2 rounded" value={start} onChange={(e) => setStart(Number(e.target.value))} />
          <label>ออมต่อเดือน</label>
          <input type="number" className="border p-2 rounded" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} />
          <label>ผลตอบแทนคาดหวัง (% ต่อปี)</label>
          <input type="number" className="border p-2 rounded" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
          <label>ระยะเวลา (ปี)</label>
          <input type="number" className="border p-2 rounded" value={years} onChange={(e) => setYears(Number(e.target.value))} />
        </div>

        <div className="border-t pt-4 mt-4 text-center">
          <p>📊 ดอกเบี้ยทบต้นหลังครบ {years} ปี</p>
          <p className="text-2xl font-bold text-green-700">{futureValue.toLocaleString()} บาท</p>
        </div>
      </div>
    </div>
  );
}
