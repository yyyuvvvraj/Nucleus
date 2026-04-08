import React, { useMemo, useState } from 'react';
import { Award, Download, Percent, Printer, Sparkles, Wallet } from 'lucide-react';

const resultsData = {
  '2024-25': {
    'Semester 7': {
      summary: { sgpa: 8.75, previous: 8.55, percentage: 85.5, earned: 24, total: 24, status: 'PASS' },
      courses: [
        {
          code: 'CS701',
          subject: 'Data Structures',
          faculty: 'Dr. Meera Sinha',
          category: 'Core Engineering',
          credits: 4,
          total: 92,
          grade: 'A+',
          examType: 'Theory + Viva',
          attendance: 100,
          remarks: 'Outstanding conceptual clarity and consistent lab performance.',
          components: [
            { label: 'Assignment', scored: 18, total: 20 },
            { label: 'Quiz', scored: 9, total: 10 },
            { label: 'Mid Semester', scored: 28, total: 30 },
            { label: 'End Semester', scored: 37, total: 40 },
          ],
          notes: [
            'Completed all weekly lab submissions on time.',
            'Earned top score in the mid-sem round.',
            'Recommended for peer mentoring.',
          ],
        },
        {
          code: 'CS702',
          subject: 'Cloud Computing',
          faculty: 'Prof. Arvind Rao',
          category: 'Specialization Elective',
          credits: 3,
          total: 88,
          grade: 'A',
          examType: 'Theory + Case Study',
          attendance: 93,
          remarks: 'Strong performance in architecture and deployment modules.',
          components: [
            { label: 'Assignment', scored: 17, total: 20 },
            { label: 'Quiz', scored: 8, total: 10 },
            { label: 'Mid Semester', scored: 27, total: 30 },
            { label: 'End Semester', scored: 36, total: 40 },
          ],
          notes: [
            'Excellent deployment mini-project.',
            'Case study rated in top 10%.',
            'Minor deductions in short-answer sections.',
          ],
        },
        {
          code: 'CS703',
          subject: 'Digital Marketing',
          faculty: 'Dr. Nivedita Ghosh',
          category: 'Open Elective',
          credits: 3,
          total: 74,
          grade: 'B+',
          examType: 'Theory',
          attendance: 89,
          remarks: 'Good analytical work with room to improve in campaign metrics.',
          components: [
            { label: 'Assignment', scored: 15, total: 20 },
            { label: 'Quiz', scored: 7, total: 10 },
            { label: 'Mid Semester', scored: 22, total: 30 },
            { label: 'End Semester', scored: 30, total: 40 },
          ],
          notes: [
            'Presentation was well received.',
            'Needs stronger metrics interpretation.',
            'Attendance remains above requirement.',
          ],
        },
      ],
    },
    'Semester 6': {
      summary: { sgpa: 8.55, previous: 8.31, percentage: 83.1, earned: 23, total: 24, status: 'PASS' },
      courses: [
        {
          code: 'CS601',
          subject: 'Operating Systems',
          faculty: 'Dr. Ritu Malhotra',
          category: 'Core Engineering',
          credits: 4,
          total: 86,
          grade: 'A',
          examType: 'Theory + Lab',
          attendance: 94,
          remarks: 'Strong systems understanding with reliable lab execution.',
          components: [
            { label: 'Assignment', scored: 17, total: 20 },
            { label: 'Quiz', scored: 8, total: 10 },
            { label: 'Mid Semester', scored: 26, total: 30 },
            { label: 'End Semester', scored: 35, total: 40 },
          ],
          notes: ['Good scheduling module performance.', 'Strong lab attendance.', 'Final exam answers were clear.'],
        },
        {
          code: 'CS602',
          subject: 'Computer Networks',
          faculty: 'Prof. Kunal Verma',
          category: 'Core Engineering',
          credits: 4,
          total: 79,
          grade: 'B+',
          examType: 'Theory',
          attendance: 88,
          remarks: 'Solid baseline, with scope to improve protocol reasoning.',
          components: [
            { label: 'Assignment', scored: 15, total: 20 },
            { label: 'Quiz', scored: 7, total: 10 },
            { label: 'Mid Semester', scored: 24, total: 30 },
            { label: 'End Semester', scored: 33, total: 40 },
          ],
          notes: ['Packet analysis was accurate.', 'Needs sharper theory recall.', 'Class participation improved.'],
        },
      ],
    },
  },
  '2023-24': {
    'Semester 5': {
      summary: { sgpa: 8.31, previous: 8.1, percentage: 81.4, earned: 22, total: 22, status: 'PASS' },
      courses: [
        {
          code: 'CS501',
          subject: 'Database Systems',
          faculty: 'Dr. Aarti Joshi',
          category: 'Core Engineering',
          credits: 4,
          total: 84,
          grade: 'A',
          examType: 'Theory + Lab',
          attendance: 95,
          remarks: 'Strong normalization and query design fundamentals.',
          components: [
            { label: 'Assignment', scored: 17, total: 20 },
            { label: 'Quiz', scored: 8, total: 10 },
            { label: 'Mid Semester', scored: 24, total: 30 },
            { label: 'End Semester', scored: 35, total: 40 },
          ],
          notes: ['High-quality ER design submissions.', 'Consistent SQL lab execution.', 'Strong final theory paper.'],
        },
        {
          code: 'CS503',
          subject: 'Design Analysis of Algorithms',
          faculty: 'Dr. Preeti Anand',
          category: 'Core Engineering',
          credits: 4,
          total: 91,
          grade: 'A+',
          examType: 'Theory + Tutorial',
          attendance: 98,
          remarks: 'Excellent reasoning depth and efficient solution design.',
          components: [
            { label: 'Assignment', scored: 19, total: 20 },
            { label: 'Quiz', scored: 9, total: 10 },
            { label: 'Mid Semester', scored: 27, total: 30 },
            { label: 'End Semester', scored: 36, total: 40 },
          ],
          notes: ['Top performer in analysis rounds.', 'Elegant solutions with clear proofs.', 'Strong tutorial participation.'],
        },
      ],
    },
  },
};

const statusForGrade = (grade) => {
  if (grade === 'A+' || grade === 'O') return { label: 'Excellent', className: 'bg-green-100 text-green-700' };
  if (grade === 'A') return { label: 'Good', className: 'bg-blue-100 text-blue-700' };
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

export default function Results() {
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
