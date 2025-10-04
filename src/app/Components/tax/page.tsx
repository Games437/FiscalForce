"use client";
import { useState, useRef, useEffect } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export default function TaxPlannerWizard() {
  const totalSteps = 6;
  const [currentStep, setCurrentStep] = useState(1);

  // 🧾 Input State
  const [inputs, setInputs] = useState({
    salaryMonthly: 0, bonus: 0, business: 0, interest: 0, dividend: 0, rent: 0, otherIncome: 0,
    ded_spouse: false, ded_children: 0, ded_parents: 0, ded_social: 0,
    ded_insurance: 0, ded_health: 0, ded_fund: 0, ded_provident: 0,
    ded_homeLoan: 0, ded_donate: 0, taxWithheld: 0,
  });

  const [result, setResult] = useState<any>(null);
  const pieRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLCanvasElement>(null);

  const fmt = (n: number) => Number(n || 0).toLocaleString("en-US");

  const updateField = (key: string, val: any) =>
    setInputs((prev) => ({ ...prev, [key]: val }));

  const nextStep = () => currentStep < totalSteps && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);
  const restart = () => {
    setInputs({
      salaryMonthly: 0, bonus: 0, business: 0, interest: 0, dividend: 0, rent: 0, otherIncome: 0,
      ded_spouse: false, ded_children: 0, ded_parents: 0, ded_social: 0,
      ded_insurance: 0, ded_health: 0, ded_fund: 0, ded_provident: 0,
      ded_homeLoan: 0, ded_donate: 0, taxWithheld: 0,
    });
    setResult(null);
    setCurrentStep(1);
  };

  // 📊 คำนวณภาษี
  const calculateTaxFull = () => {
    const i = inputs;
    const salary = i.salaryMonthly * 12;
    const salaryExpense = Math.min(salary * 0.5, 100000);
    const businessExpense = Math.min(i.business * 0.6, 100000);

    const totalIncome = (salary - salaryExpense) + i.bonus + (i.business - businessExpense)
      + i.interest + i.dividend + i.rent + i.otherIncome;

    let deduction = 60000;
    if (i.ded_spouse) deduction += 60000;
    deduction += i.ded_children * 30000;
    deduction += i.ded_parents;
    deduction += Math.min(i.ded_social, 9000);
    deduction += Math.min(i.ded_insurance, 100000);
    deduction += Math.min(i.ded_health, 25000);
    deduction += Math.min(i.ded_fund, 200000);
    deduction += Math.min(i.ded_provident, 500000);
    deduction += Math.min(i.ded_homeLoan, 100000);
    deduction += i.ded_donate;

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

    let remaining = taxable, prev = 0, tax = 0;
    const breakdown: any[] = [];
    TAX_BRACKETS.forEach(b => {
      const amt = Math.max(0, Math.min(remaining, b.limit - prev));
      if (amt > 0) {
        const t = amt * b.rate;
        tax += t;
        breakdown.push({
          range: `${fmt(prev + 1)}-${isFinite(b.limit) ? fmt(b.limit) : "∞"}`,
          amount: amt, rate: b.rate, tax: t
        });
      }
      remaining -= amt; prev = b.limit;
    });

    const withheld = i.taxWithheld || 0;
    const taxDue = tax - withheld;
    return { totalIncome, deduction, taxable, tax, withheld, taxDue, breakdown };
  };

  const onCalculate = () => {
    const res = calculateTaxFull();
    setResult(res);
    setCurrentStep(6);
  };

  // 🎨 Chart rendering
  useEffect(() => {
    let pieChart: Chart | null = null;
    let barChart: Chart | null = null;
    if (result && pieRef.current) {
      pieChart = new Chart(pieRef.current, {
        type: "pie",
        data: {
          labels: ["เงินได้สุทธิหลังหัก", "ภาษี"],
          datasets: [{ data: [result.taxable - result.tax, result.tax], backgroundColor: ["#60a5fa", "#fb7185"] }],
        },
        options: { plugins: { legend: { position: "bottom" } } },
      });
    }
    if (result && barRef.current) {
      barChart = new Chart(barRef.current, {
        type: "bar",
        data: {
          labels: result.breakdown.map((b: any) => b.range),
          datasets: [{ label: "ภาษีที่ต้องจ่าย", data: result.breakdown.map((b: any) => b.tax), backgroundColor: "#34d399" }],
        },
        options: { scales: { y: { beginAtZero: true } } },
      });
    }
    return () => { pieChart?.destroy(); barChart?.destroy(); };
  }, [result]);

  const StepWrapper = ({ step, children }: any) =>
    currentStep === step ? <div className="fade">{children}</div> : null;

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow-lg p-8 font-sans">
      {/* Progress */}
      <div className="relative mb-10">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -z-10"></div>
        <div className="flex justify-between relative">
          {["รายรับ","ลดหย่อนครอบครัว","กองทุน/สังคม","ประกัน","กองทุนอื่น","ผลลัพธ์"].map((label,i)=>(
            <div key={i}
              className={`w-10 h-10 rounded-full border-4 flex items-center justify-center font-bold
                ${currentStep>=i+1?"bg-green-600 text-white border-green-600 scale-110 shadow":"bg-white text-gray-700 border-gray-400"}`}>
              {i+1}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1 – รายรับ */}
      <StepWrapper step={1}>
        <h2 className="text-xl font-semibold text-green-700 mb-4">Step 1: รายรับ</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="เงินเดือน (บาท/เดือน)" tooltip="ใส่เงินเดือนที่ได้รับต่อเดือน" value={inputs.salaryMonthly} setValue={(v)=>updateField("salaryMonthly",v)} />
          <Input label="โบนัส" tooltip="โบนัสต่อปี" value={inputs.bonus} setValue={(v)=>updateField("bonus",v)} />
          <Input label="ธุรกิจ/ฟรีแลนซ์" tooltip="รายได้จากธุรกิจหรือฟรีแลนซ์" value={inputs.business} setValue={(v)=>updateField("business",v)} />
          <Input label="ดอกเบี้ยเงินฝาก" tooltip="รายได้จากดอกเบี้ยธนาคาร" value={inputs.interest} setValue={(v)=>updateField("interest",v)} />
          <Input label="เงินปันผล" tooltip="เงินปันผลจากหุ้นหรือกองทุน" value={inputs.dividend} setValue={(v)=>updateField("dividend",v)} />
          <Input label="ค่าเช่า" tooltip="รายได้จากการให้เช่าทรัพย์สิน" value={inputs.rent} setValue={(v)=>updateField("rent",v)} />
          <Input label="รายได้อื่น ๆ" tooltip="รายได้อื่น ๆ ที่ไม่ได้ระบุไว้ข้างต้น" value={inputs.otherIncome} setValue={(v)=>updateField("otherIncome",v)} full />
        </div>
      </StepWrapper>

      {/* Step 2 – ลดหย่อนครอบครัว */}
      <StepWrapper step={2}>
        <h2 className="text-xl font-semibold text-green-700 mb-4">Step 2: ลดหย่อนครอบครัว</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="col-span-2 flex items-center gap-2">
            <input type="checkbox" checked={inputs.ded_spouse} onChange={(e)=>updateField("ded_spouse",e.target.checked)} className="w-4 h-4 text-green-600" />
            คู่สมรสไม่มีรายได้ (60,000 บาท)
          </label>
          <Input label="จำนวนบุตร" tooltip="จำนวนบุตรที่มีสิทธิ์ลดหย่อน" value={inputs.ded_children} setValue={(v)=>updateField("ded_children",v)} />
          <Input label="บิดามารดา/ผู้พิการ (บาท)" tooltip="ค่าลดหย่อนจากการเลี้ยงดู" value={inputs.ded_parents} setValue={(v)=>updateField("ded_parents",v)} />
        </div>
      </StepWrapper>

      {/* Step 3 – กองทุน / ประกันสังคม */}
      <StepWrapper step={3}>
        <h2 className="text-xl font-semibold text-green-700 mb-4">Step 3: กองทุน / ประกันสังคม</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="ประกันสังคม" tooltip="สูงสุด 9,000 บาท" value={inputs.ded_social} setValue={(v)=>updateField("ded_social",v)} />
          <Input label="กองทุนสำรองเลี้ยงชีพ" tooltip="จำนวนเงินสะสมในกองทุน" value={inputs.ded_provident} setValue={(v)=>updateField("ded_provident",v)} />
          <Input label="RMF / SSF" tooltip="สูงสุด 200,000 บาท" value={inputs.ded_fund} setValue={(v)=>updateField("ded_fund",v)} full />
        </div>
      </StepWrapper>

      {/* Step 4 – ประกัน */}
      <StepWrapper step={4}>
        <h2 className="text-xl font-semibold text-green-700 mb-4">Step 4: ประกัน</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="เบี้ยประกันชีวิต" tooltip="สูงสุด 100,000 บาท" value={inputs.ded_insurance} setValue={(v)=>updateField("ded_insurance",v)} />
          <Input label="เบี้ยประกันสุขภาพ" tooltip="สูงสุด 25,000 บาท" value={inputs.ded_health} setValue={(v)=>updateField("ded_health",v)} />
        </div>
      </StepWrapper>

      {/* Step 5 – กองทุนอื่น */}
      <StepWrapper step={5}>
        <h2 className="text-xl font-semibold text-green-700 mb-4">Step 5: กองทุนอื่น ๆ</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="ดอกเบี้ยบ้าน" tooltip="สูงสุด 100,000 บาท" value={inputs.ded_homeLoan} setValue={(v)=>updateField("ded_homeLoan",v)} />
          <Input label="เงินบริจาค" tooltip="จำนวนเงินบริจาค" value={inputs.ded_donate} setValue={(v)=>updateField("ded_donate",v)} />
          <Input label="ภาษีหัก ณ ที่จ่าย" tooltip="จำนวนภาษีที่ถูกหักแล้ว" value={inputs.taxWithheld} setValue={(v)=>updateField("taxWithheld",v)} full />
        </div>
      </StepWrapper>

      {/* Step 6 – ผลลัพธ์ */}
      <StepWrapper step={6}>
        {result && (
          <div>
            <h2 className="text-2xl font-bold text-green-700 mb-6">📊 ผลลัพธ์การคำนวณภาษี</h2>
            <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4 shadow-sm mb-6">
              <table className="w-full text-sm">
                <tbody>
                  <tr><td>รายได้รวม</td><td className="text-right">{fmt(result.totalIncome)}</td></tr>
                  <tr><td>หักลดหย่อน</td><td className="text-right">{fmt(result.deduction)}</td></tr>
                  <tr><td>เงินได้สุทธิ</td><td className="text-right">{fmt(result.taxable)}</td></tr>
                  <tr><td>ภาษีรวม</td><td className="text-right">{fmt(result.tax)}</td></tr>
                  <tr><td>ภาษีหักแล้ว</td><td className="text-right">{fmt(result.withheld)}</td></tr>
                  <tr className="bg-green-100 font-semibold">
                    <td>สรุป</td>
                    <td className="text-right">{result.taxDue>0?`ต้องจ่ายเพิ่ม ${fmt(result.taxDue)}`:`ขอคืน ${fmt(-result.taxDue)}`}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-3 rounded shadow-sm">
                <canvas ref={pieRef}></canvas>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <canvas ref={barRef}></canvas>
              </div>
            </div>

            {/* ตารางขั้นบันไดภาษี */}
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-2 text-green-700">ตารางขั้นบันไดภาษี</h3>
              <table className="w-full border text-sm rounded overflow-hidden">
                <thead className="bg-green-100">
                  <tr>
                    <th className="py-2 px-3 text-left">ช่วงเงินได้ (บาท)</th>
                    <th className="py-2 px-3 text-center">อัตราภาษี</th>
                    <th className="py-2 px-3 text-right">เงินได้ที่เสียภาษี</th>
                    <th className="py-2 px-3 text-right">ภาษีแต่ละขั้น</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.map((b: any, idx: number) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 px-3">{b.range}</td>
                      <td className="py-2 px-3 text-center">{(b.rate * 100).toFixed(0)}%</td>
                      <td className="py-2 px-3 text-right">{fmt(b.amount)}</td>
                      <td className="py-2 px-3 text-right">{fmt(b.tax)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </StepWrapper>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button onClick={prevStep} className="bg-gray-200 px-4 py-2 rounded">ย้อนกลับ</button>
        {currentStep < totalSteps && <button onClick={nextStep} className="bg-green-600 text-white px-4 py-2 rounded">ถัดไป</button>}
        {currentStep === totalSteps && <button onClick={onCalculate} className="bg-green-600 text-white px-4 py-2 rounded">คำนวณ</button>}
        <button onClick={restart} className="bg-gray-300 px-4 py-2 rounded">เริ่มใหม่</button>
      </div>
    </div>
  );
}

/* 🧩 Component Input */
function Input({ label, tooltip, value, setValue, full = false }: any) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="flex items-center gap-1">
        {label}
        <span className="relative cursor-pointer text-green-600 font-bold text-sm">ⓘ
          <span className="absolute left-1/2 transform -translate-x-1/2 bottom-6 bg-gray-800 text-white text-xs rounded-md px-2 py-1 opacity-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-100 whitespace-nowrap">
            {tooltip}
          </span>
        </span>
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-green-300"
      />
    </div>
  );
}
