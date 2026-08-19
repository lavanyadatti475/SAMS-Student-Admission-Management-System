import { useEffect, useState } from 'react';
import api from '../../api/api';

const steps = ['Academic Details', 'Admission Form', 'Review & Submit'];

export default function AdmissionWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [academic, setAcademic] = useState({ secondarySchool: '', secondaryBoard: '', secondaryPercentage: '', secondaryYear: '', intermediateCollege: '', intermediateBoard: '', intermediatePercentage: '', intermediateYear: '', examName: '', examRank: '', examScore: '', examYear: '' });
  const [admission, setAdmission] = useState({ course: 'B.Tech', branch: 'Computer Science', admissionCategory: 'General', hostelRequired: false, scholarshipRequired: false, previousInstitution: '', declarationAccepted: false });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.get('/admissions/me').then((res) => { if (res.data.admission) setAdmission(res.data.admission); }).catch(console.error);
  }, []);

  const nextStep = () => setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((step) => Math.max(step - 1, 0));

  const handleAcademicSave = async () => {
    await api.post('/admissions/academic', { ...academic, secondaryPercentage: Number(academic.secondaryPercentage), intermediatePercentage: Number(academic.intermediatePercentage), examYear: Number(academic.examYear), secondaryYear: Number(academic.secondaryYear), intermediateYear: Number(academic.intermediateYear) });
    setStatus('Academic details saved');
    nextStep();
  };

  const handleAdmissionSave = async () => {
    await api.post('/admissions/draft', admission);
    setStatus('Admission draft saved');
    nextStep();
  };

  const handleSubmit = async () => {
    await api.post('/admissions/submit');
    setStatus('Application submitted successfully');
  };

  return (
    <div
  className="min-h-screen p-8 bg-cover bg-center bg-fixed"
  style={{
    backgroundImage:
      "linear-gradient(rgba(240,248,255,0.92), rgba(240,248,255,0.92)), url('https://jntugv.edu.in/static/media/JNTU_PIC.ae61eebb7dc963f0dd30.png')"
  }}
>
      <div className="fade-up bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-sky-100">
        <h2 className="text-4xl font-bold text-sky-700">Admission </h2>
        <p className="mt-3 text-slate-600 text-lg dark:text-slate-400">Complete the multi-step form to submit your admission application.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, idx) => (
            <div key={step} className={`float-card rounded-3xl p-6 text-center shadow-lg transition-all duration-300 hover:scale-105${idx === currentStep ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}>
              <div className="text-sm uppercase tracking-[0.2em]">Step {idx + 1}</div>
              <div className="mt-2 text-base font-semibold">{step}</div>
            </div>
          ))}
        </div>
      </div>

      {currentStep === 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { label: 'Secondary School', key: 'secondarySchool' },
            { label: 'Board', key: 'secondaryBoard' },
            { label: 'Percentage', key: 'secondaryPercentage', type: 'number' },
            { label: 'Passing Year', key: 'secondaryYear', type: 'number' },
            { label: 'Intermediate College', key: 'intermediateCollege' },
            { label: 'Board', key: 'intermediateBoard' },
            { label: 'Percentage', key: 'intermediatePercentage', type: 'number' },
            { label: 'Passing Year', key: 'intermediateYear', type: 'number' },
            { label: 'Exam Name', key: 'examName' },
            { label: 'Rank', key: 'examRank' },
            { label: 'Score', key: 'examScore' },
            { label: 'Year', key: 'examYear', type: 'number' }
          ].map((item) => (
            <label key={item.key} className="block">
              <span className="text-slate-700 dark:text-slate-200">{item.label}</span>
              <input type={item.type || 'text'} value={academic[item.key]} onChange={(e) => setAcademic({ ...academic, [item.key]: e.target.value })} className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none shadow-sm transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
            </label>
          ))}
          <div className="md:col-span-2 flex justify-between gap-4">
            <button onClick={nextStep} className="w-full rounded-xl border border-slate-300 px-5 py-3 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Skip</button>
            <button onClick={handleAcademicSave} className="w-full rounded-3xl bg-brand-600 px-5 py-3 text-white transition hover:bg-brand-700">Save and continue</button>
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { label: 'Course', key: 'course' },
            { label: 'Branch', key: 'branch' },
            { label: 'Admission Category', key: 'admissionCategory' },
            { label: 'Present Institution', key: 'presentInstitution' }
          ].map((item) => (
            <label key={item.key} className="block">
              <span className="text-slate-700 dark:text-slate-200">{item.label}</span>
              <input type="text" value={admission[item.key]} onChange={(e) => setAdmission({ ...admission, [item.key]: e.target.value })} className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 outline-none shadow-sm transition focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
            </label>
          ))}
          <div className="space-y-4 md:col-span-2">
            <label className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <input type="checkbox" checked={admission.hostelRequired} onChange={(e) => setAdmission({ ...admission, hostelRequired: e.target.checked })} className="h-5 w-5 rounded-md text-brand-600" />
              <span className="text-sm text-slate-700 dark:text-slate-200">Hostel requirement</span>
            </label>
            <label className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <input type="checkbox" checked={admission.scholarshipRequired} onChange={(e) => setAdmission({ ...admission, scholarshipRequired: e.target.checked })} className="h-5 w-5 rounded-md text-brand-600" />
              <span className="text-sm text-slate-700 dark:text-slate-200">Scholarship requirement</span>
            </label>
            <label className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <input type="checkbox" checked={admission.declarationAccepted} onChange={(e) => setAdmission({ ...admission, declarationAccepted: e.target.checked })} className="h-5 w-5 rounded-md text-brand-600" />
              <span className="text-sm text-slate-700 dark:text-slate-200">I agree to the student declaration and terms.</span>
            </label>
          </div>
          <div className="md:col-span-2 flex justify-between gap-4">
            <button onClick={prevStep} className="w-full rounded-3xl border border-slate-300 px-5 py-3 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Back</button>
            <button onClick={handleAdmissionSave} className="w-full rounded-3xl bg-brand-600 px-5 py-3 text-white transition hover:bg-brand-700">Save draft</button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
          <div>
            <h2 className="text-2xl font-semibold">Review your application</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Confirm details and submit your application for admin review.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(admission).filter(([key]) => key !== 'declarationAccepted').map(([key, value]) => (
              <div key={key} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
                <div className="text-sm text-slate-500 dark:text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</div>
                <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{String(value || 'Not set')}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4 md:flex-row">
            <button onClick={prevStep} className="w-full rounded-3xl border border-slate-300 px-5 py-3 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Back</button>
            <button onClick={handleSubmit} className="w-full rounded-3xl bg-brand-600 px-5 py-3 text-white transition hover:bg-brand-700">Submit application</button>
          </div>
        </div>
      )}

      {status && <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-emerald-700">{status}</div>}
    </div>
  );
}
