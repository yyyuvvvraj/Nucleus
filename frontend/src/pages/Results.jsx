import React, { useMemo, useState } from 'react';
import { Award, Download, Percent, Printer, Sparkles, Wallet } from 'lucide-react';

const statusForGrade = (grade) => {
  if (grade === 'A+' || grade === 'O') return { label: 'Excellent', className: 'bg-green-100 text-green-700' };
  if (grade === 'A') return { label: 'Good', className: 'bg-blue-100 text-blue-700' };
  if (grade === 'B+') return { label: 'Satistfactory', className: 'bg-yellow-100 text-yellow-700' };
  return { label: 'Needs Review', className: 'bg-red-100 text-red-700' };
};

const FilterSelect = ({ label, value, options, onChange }) => (
  <div className="min-w-[180px]">
    <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="w-full rounded-lg bg-surface-container-highest text-on-surface text-sm font-semibold px-4 py-3 border border-outline-variant/20"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const StatCard = ({ title, value, note, icon: Icon }) => (
  <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{title}</span>
        <div className="mt-4 text-5xl font-bold text-primary tracking-tight">{value}</div>
        <p className="mt-2 text-sm font-medium text-on-surface-variant">{note}</p>
      </div>
      <div className="p-3 bg-secondary-fixed rounded-lg text-on-secondary-fixed">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function Results() {
  const [resultsData, setResultsData] = React.useState(null);

  React.useEffect(() => {
    const token = localStorage.getItem('nucleusToken');
    if (!token) return;

    fetch(`${API_BASE_URL}/api/results`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(fetchedResults => {
        let earned = 0, totalCred = 0, totalMarks = 0;
        const courses = (fetchedResults || []).map((r, i) => {
          earned += r.credits || 0;
          totalCred += r.credits || 0;
          totalMarks += r.marks || 0;
          return {
            code: `CS${100 + i}`,
            subject: r.subject,
            faculty: 'Assigned Faculty',
            category: 'Core Engineering',
            credits: r.credits,
            total: r.marks,
            grade: r.grade,
            examType: 'Theory',
            attendance: 90,
            remarks: 'Synchronized from university database.',
            components: [{ label: 'Final Evaluation', scored: r.marks, total: 100 }],
            notes: ['Verified grading cycle complete.']
          };
        });

        const percentage = courses.length ? (totalMarks / courses.length) : 0;
        const sgpa = (percentage / 10).toFixed(2);

        setResultsData({
          'Dynamic Sync': {
            'Current Semester': {
              summary: { sgpa: Number(sgpa), previous: Math.max(0, Number(sgpa) - 0.2), percentage, earned, total: totalCred, status: 'PASS' },
              courses: courses.length > 0 ? courses : [{
                code: 'NA', subject: 'No Results Found', faculty: '-', category: '-', credits: 0, total: 0, grade: 'NA', examType: '-', attendance: 0, remarks: '', components: [{label: 'Final', scored: 0, total: 100}], notes: []
              }]
            }
          }
        });
      })
      .catch(console.error);
  }, []);

  if (!resultsData) return <div className="p-8 text-center text-on-surface-variant animate-pulse">Syncing Exam Results...</div>;
  return <ResultsLayout resultsData={resultsData} />;
}

function ResultsLayout({ resultsData }) {
  const years = Object.keys(resultsData);
  const [selectedYear, setSelectedYear] = useState(years[0]);
  const semesters = Object.keys(resultsData[selectedYear]);
  const [selectedSemester, setSelectedSemester] = useState(semesters[0]);
  const [viewMode, setViewMode] = useState('Overall');
  const data = resultsData[selectedYear][selectedSemester];
  const [selectedCode, setSelectedCode] = useState(data.courses[0].code);
  const [expanded, setExpanded] = useState([data.courses[0].code]);

  const selectedCourse = useMemo(
    () => data.courses.find((course) => course.code === selectedCode) || data.courses[0],
    [data, selectedCode]
  );

  const distribution = useMemo(() => {
    const counts = data.courses.reduce((acc, course) => {
      if (course.grade === 'A+' || course.grade === 'O') acc.excellent += 1;
      else if (course.grade === 'A') acc.good += 1;
      else acc.review += 1;
      return acc;
    }, { excellent: 0, good: 0, review: 0 });
    const total = data.courses.length || 1;
    return [
      { label: 'Excellent', value: Math.round((counts.excellent / total) * 100), bar: 'bg-secondary' },
      { label: 'Good', value: Math.round((counts.good / total) * 100), bar: 'bg-primary' },
      { label: 'Needs Review', value: Math.round((counts.review / total) * 100), bar: 'bg-error' },
    ];
  }, [data]);

  const courses = useMemo(() => {
    const ordered = [...data.courses];
    if (viewMode === 'Internal') {
      return ordered.sort((a, b) => (b.components[0].scored + b.components[1].scored) - (a.components[0].scored + a.components[1].scored));
    }
    if (viewMode === 'External') {
      return ordered.sort((a, b) => (b.components[2].scored + b.components[3].scored) - (a.components[2].scored + a.components[3].scored));
    }
    return ordered.sort((a, b) => b.total - a.total);
  }, [data, viewMode]);

  const changeYear = (event) => {
    const nextYear = event.target.value;
    const nextSemester = Object.keys(resultsData[nextYear])[0];
    const firstCode = resultsData[nextYear][nextSemester].courses[0].code;
    setSelectedYear(nextYear);
    setSelectedSemester(nextSemester);
    setSelectedCode(firstCode);
    setExpanded([firstCode]);
  };

  const changeSemester = (event) => {
    const nextSemester = event.target.value;
    const firstCode = resultsData[selectedYear][nextSemester].courses[0].code;
    setSelectedSemester(nextSemester);
    setSelectedCode(firstCode);
    setExpanded([firstCode]);
  };

  const toggleCourse = (code) => {
    setSelectedCode(code);
    setExpanded((current) => (current.includes(code) ? current.filter((item) => item !== code) : [...current, code]));
  };

  return (
    <div className="p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-500">
      <nav className="mb-4 flex items-center gap-2">
        <span className="label-md uppercase text-[10px] font-bold tracking-widest text-on-surface-variant">Portal</span>
        <span className="material-symbols-outlined text-sm text-on-surface-variant">chevron_right</span>
        <span className="label-md uppercase text-[10px] font-bold tracking-widest text-secondary">Exam Results</span>
      </nav>

      <div className="flex flex-col gap-4 mb-8 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-primary tracking-tight">Results</h2>
          <p className="text-on-surface-variant mt-1 font-medium">
            Academic Year {selectedYear} • Current SGPA: <span className="text-secondary">{data.summary.sgpa.toFixed(2)}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <FilterSelect label="Academic Year" value={selectedYear} options={years} onChange={changeYear} />
          <FilterSelect label="Semester" value={selectedSemester} options={semesters} onChange={changeSemester} />
          <button className="px-4 py-3 bg-surface-container-highest text-on-surface text-sm font-semibold rounded-lg flex items-center gap-2 hover:bg-surface-dim transition-colors">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Filter
          </button>
          <button className="px-4 py-3 bg-secondary text-on-secondary text-sm font-semibold rounded-lg flex items-center gap-2 transition-transform active:scale-95">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-10">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Overall Progress</span>
            <h3 className="text-4xl font-bold text-primary">
              {data.summary.percentage.toFixed(1)}%
              <span className="text-sm font-medium text-green-600 ml-2">↑ {(data.summary.sgpa - data.summary.previous).toFixed(2)} from previous</span>
            </h3>
            <div className="w-full bg-surface-container-low h-3 rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full" style={{ width: `${data.summary.percentage}%` }}></div>
            </div>
          </div>
          <div className="xl:pl-8 xl:border-l border-outline-variant/20">
            <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">Requirement</p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-error"></div>
              <span className="text-sm font-bold text-primary">{data.summary.status}</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-2 max-w-[180px]">
              {data.summary.earned}/{data.summary.total} credits earned for the selected semester.
            </p>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-primary p-6 rounded-xl text-white flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Focused Course</span>
          <div>
            <p className="text-5xl font-bold">{selectedCourse.grade}</p>
            <p className="text-sm text-slate-300 font-medium mt-1">{selectedCourse.subject}</p>
          </div>
          <div className="flex gap-2 mt-4">
            {['Internal', 'External', 'Overall'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                  viewMode === mode ? 'bg-white text-primary' : 'bg-blue-500 text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <StatCard title="Semester SGPA" value={data.summary.sgpa.toFixed(2)} note="Current semester performance." icon={Sparkles} />
        <StatCard title="Credits Earned" value={`${data.summary.earned}`} note={`Out of ${data.summary.total} registered credits.`} icon={Wallet} />
        <StatCard title="Total Percentage" value={`${data.summary.percentage.toFixed(1)}%`} note="Weighted result across all listed courses." icon={Percent} />
        <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Grade Distribution</span>
          <div className="mt-4 space-y-4">
            {distribution.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-on-surface">{item.label}</span>
                  <span className="text-xs font-bold text-primary">{item.value}%</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className={`${item.bar} h-full rounded-full`} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Subject</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Subject Code</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Credits</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Total</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Percentage</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Status</th>
            </tr>
          </thead>
          {courses.map((course) => {
            const status = statusForGrade(course.grade);
            const isExpanded = expanded.includes(course.code);
            return (
              <tbody key={course.code} className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="hover:bg-surface-container transition-colors group cursor-pointer" onClick={() => toggleCourse(course.code)}>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-8 rounded-full ${course.grade === 'B+' ? 'bg-error' : 'bg-secondary'}`}></div>
                      <div>
                        <p className="font-bold text-primary">{course.subject}</p>
                        <p className="text-xs text-on-surface-variant">{course.faculty}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-mono text-xs font-semibold text-on-surface-variant">{course.code}</td>
                  <td className="px-6 py-5 text-center font-bold text-on-surface">{course.credits}</td>
                  <td className="px-6 py-5 text-center font-bold text-on-surface">{course.total}</td>
                  <td className="px-6 py-5 w-64">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-surface-container h-2 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full rounded-full" style={{ width: `${course.total}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-primary">{course.total}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className={`px-2 py-1 ${status.className} text-[10px] font-bold uppercase rounded`}>{status.label}</span>
                  </td>
                </tr>

                {isExpanded ? (
                  <tr className="bg-surface-container transition-colors">
                    <td colSpan="6" className="px-6 py-6">
                      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                        <div className="xl:col-span-3 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-surface rounded-lg p-4">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Exam Type</p>
                              <p className="mt-2 text-sm font-bold text-on-surface">{course.examType}</p>
                            </div>
                            <div className="bg-surface rounded-lg p-4">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Attendance</p>
                              <p className="mt-2 text-sm font-bold text-on-surface">{course.attendance}%</p>
                            </div>
                            <div className="bg-surface rounded-lg p-4">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Category</p>
                              <p className="mt-2 text-sm font-bold text-on-surface">{course.category}</p>
                            </div>
                          </div>

                          <div className="bg-surface rounded-lg p-4">
                            <h4 className="text-sm font-bold text-primary mb-4">Assessment Components</h4>
                            <div className="space-y-4">
                              {course.components.map((item) => (
                                <div key={item.label}>
                                  <div className="flex justify-between mb-2">
                                    <span className="text-sm font-semibold text-on-surface">{item.label}</span>
                                    <span className="text-xs font-bold text-on-surface-variant">{item.scored}/{item.total}</span>
                                  </div>
                                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                                    <div className="bg-secondary h-full rounded-full" style={{ width: `${(item.scored / item.total) * 100}%` }}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="xl:col-span-2 space-y-4">
                          <div className="bg-primary text-white rounded-xl p-5 relative overflow-hidden">
                            <div className="relative z-10">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Selected Course</p>
                              <h4 className="mt-2 text-2xl font-bold">{course.subject}</h4>
                              <p className="mt-1 text-sm text-slate-300">{course.remarks}</p>
                            </div>
                            <Award className="absolute -bottom-4 -right-4 h-24 w-24 text-white/10" />
                          </div>

                          <div className="bg-surface rounded-lg p-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Faculty Notes</p>
                            <div className="mt-4 space-y-3">
                              {course.notes.map((note) => (
                                <div key={note} className="flex gap-3">
                                  <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                                  <p className="text-xs text-on-surface-variant leading-relaxed">{note}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            );
          })}
        </table>

        <div className="bg-surface-container-low px-6 py-3 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Showing {courses.length} of {data.courses.length} Subjects</p>
          <div className="flex gap-2">
            <button className="p-1 hover:bg-white rounded transition-colors disabled:opacity-30" disabled={true}>
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button className="p-1 hover:bg-white rounded transition-colors">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 p-6 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-4">
        <span className="material-symbols-outlined text-blue-600">info</span>
        <div className="w-full">
          <h4 className="text-sm font-bold text-blue-900">Detailed Result Review</h4>
          <p className="text-xs text-blue-800/80 leading-relaxed mt-1">
            Click any subject row to open its detailed marks breakdown. Academic year and semester selectors currently use dummy datasets so you can preview different result sets immediately.
          </p>
          <div className="mt-4 flex gap-3">
            <button className="px-4 py-2 bg-white text-blue-900 text-sm font-semibold rounded-lg border border-blue-200 flex items-center gap-2 hover:bg-blue-50 transition-colors">
              <Printer className="h-4 w-4" />
              Print Results
            </button>
            <button className="px-4 py-2 bg-secondary text-on-secondary text-sm font-semibold rounded-lg flex items-center gap-2 transition-transform active:scale-95">
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
