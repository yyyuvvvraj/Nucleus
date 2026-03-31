import { useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  Filter,
  MoreVertical,
  Percent,
  Printer,
  Sparkles,
  TrendingUp,
  Wallet,
} from 'lucide-react';

const resultsData = {
  '2024-25': {
    'Semester 7': {
      summary: { sgpa: 8.75, previousSgpa: 8.55, creditsEarned: 24, totalCredits: 24, percentage: 85.5, status: 'PASS' },
      trend: [
        { label: 'Sem 1', score: 8.2 },
        { label: 'Sem 3', score: 8.7 },
        { label: 'Sem 5', score: 8.4 },
        { label: 'Sem 6', score: 9.1 },
        { label: 'Sem 7', score: 8.75 },
      ],
      courses: [
        {
          code: 'CS701',
          subject: 'Data Structures',
          category: 'Core Engineering',
          credits: 4,
          total: 92,
          grade: 'A+',
          attendance: 100,
          faculty: 'Dr. Meera Sinha',
          examType: 'Theory + Viva',
          remarks: 'Outstanding conceptual clarity and consistent lab performance.',
          gradeTone: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20',
          components: [
            { label: 'Assignment', scored: 18, total: 20 },
            { label: 'Quiz', scored: 9, total: 10 },
            { label: 'Mid Semester', scored: 28, total: 30 },
            { label: 'End Semester', scored: 37, total: 40 },
          ],
          timeline: [
            'Completed all weekly lab submissions on time.',
            'Earned top score in the mid-sem practical round.',
            'Recommended for peer mentoring in algorithms.',
          ],
        },
        {
          code: 'CS702',
          subject: 'Cloud Computing',
          category: 'Specialization Elective',
          credits: 3,
          total: 88,
          grade: 'A',
          attendance: 93,
          faculty: 'Prof. Arvind Rao',
          examType: 'Theory + Case Study',
          remarks: 'Strong performance in architecture and deployment modules.',
          gradeTone: 'bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/20',
          components: [
            { label: 'Assignment', scored: 17, total: 20 },
            { label: 'Quiz', scored: 8, total: 10 },
            { label: 'Mid Semester', scored: 27, total: 30 },
            { label: 'End Semester', scored: 36, total: 40 },
          ],
          timeline: [
            'Excellent AWS deployment mini-project.',
            'Case study submission rated among top 10%.',
            'Minor deductions in short-answer sections.',
          ],
        },
        {
          code: 'CS703',
          subject: 'Digital Marketing',
          category: 'Open Elective',
          credits: 3,
          total: 74,
          grade: 'B+',
          attendance: 89,
          faculty: 'Dr. Nivedita Ghosh',
          examType: 'Theory',
          remarks: 'Good analytical work with room to improve in campaign metrics.',
          gradeTone: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20',
          components: [
            { label: 'Assignment', scored: 15, total: 20 },
            { label: 'Quiz', scored: 7, total: 10 },
            { label: 'Mid Semester', scored: 22, total: 30 },
            { label: 'End Semester', scored: 30, total: 40 },
          ],
          timeline: [
            'Campaign audit presentation was well received.',
            'Needs stronger accuracy in metrics interpretation.',
            'Attendance remains comfortably above requirement.',
          ],
        },
        {
          code: 'CS704',
          subject: 'Machine Learning Lab',
          category: 'Practical',
          credits: 2,
          total: 95,
          grade: 'O',
          attendance: 98,
          faculty: 'Dr. Yash Khanna',
          examType: 'Practical',
          remarks: 'Exceptional implementation quality across all lab tasks.',
          gradeTone: 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/20',
          components: [
            { label: 'Lab Work', scored: 19, total: 20 },
            { label: 'Model Review', scored: 10, total: 10 },
            { label: 'Practical Exam', scored: 28, total: 30 },
            { label: 'Project Demo', scored: 38, total: 40 },
          ],
          timeline: [
            'Best final project demo in the lab batch.',
            'Maintained near-perfect attendance.',
            'Submitted optimized notebooks with clear documentation.',
          ],
        },
      ],
    },
    'Semester 6': {
      summary: { sgpa: 8.55, previousSgpa: 8.31, creditsEarned: 23, totalCredits: 24, percentage: 83.1, status: 'PASS' },
      trend: [
        { label: 'Sem 1', score: 8.2 },
        { label: 'Sem 2', score: 8.0 },
        { label: 'Sem 4', score: 8.6 },
        { label: 'Sem 5', score: 8.4 },
        { label: 'Sem 6', score: 8.55 },
      ],
      courses: [
        {
          code: 'CS601',
          subject: 'Operating Systems',
          category: 'Core Engineering',
          credits: 4,
          total: 86,
          grade: 'A',
          attendance: 94,
          faculty: 'Dr. Ritu Malhotra',
          examType: 'Theory + Lab',
          remarks: 'Strong systems understanding with reliable lab execution.',
          gradeTone: 'bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/20',
          components: [
            { label: 'Assignment', scored: 17, total: 20 },
            { label: 'Quiz', scored: 8, total: 10 },
            { label: 'Mid Semester', scored: 26, total: 30 },
            { label: 'End Semester', scored: 35, total: 40 },
          ],
          timeline: ['Good performance in process scheduling module.', 'Strong lab attendance.', 'Final exam answers were structurally clear.'],
        },
        {
          code: 'CS602',
          subject: 'Computer Networks',
          category: 'Core Engineering',
          credits: 4,
          total: 79,
          grade: 'B+',
          attendance: 88,
          faculty: 'Prof. Kunal Verma',
          examType: 'Theory',
          remarks: 'Solid baseline, with scope to improve protocol reasoning.',
          gradeTone: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20',
          components: [
            { label: 'Assignment', scored: 15, total: 20 },
            { label: 'Quiz', scored: 7, total: 10 },
            { label: 'Mid Semester', scored: 24, total: 30 },
            { label: 'End Semester', scored: 33, total: 40 },
          ],
          timeline: ['Packet analysis work was accurate.', 'Needs sharper theory recall under time pressure.', 'Class participation improved over the semester.'],
        },
        {
          code: 'CS603',
          subject: 'Software Engineering',
          category: 'Core Engineering',
          credits: 3,
          total: 84,
          grade: 'A',
          attendance: 96,
          faculty: 'Dr. Rakesh Menon',
          examType: 'Theory + Presentation',
          remarks: 'Well rounded performance with excellent group collaboration.',
          gradeTone: 'bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/20',
          components: [
            { label: 'Assignment', scored: 16, total: 20 },
            { label: 'Presentation', scored: 9, total: 10 },
            { label: 'Mid Semester', scored: 24, total: 30 },
            { label: 'End Semester', scored: 35, total: 40 },
          ],
          timeline: ['Documentation quality was above class average.', 'Excellent contribution to group sprint review.', 'Very strong attendance record.'],
        },
      ],
    },
  },
  '2023-24': {
    'Semester 5': {
      summary: { sgpa: 8.31, previousSgpa: 8.1, creditsEarned: 22, totalCredits: 22, percentage: 81.4, status: 'PASS' },
      trend: [
        { label: 'Sem 1', score: 8.2 },
        { label: 'Sem 2', score: 8.0 },
        { label: 'Sem 3', score: 8.3 },
        { label: 'Sem 4', score: 8.6 },
        { label: 'Sem 5', score: 8.31 },
      ],
      courses: [
        {
          code: 'CS501',
          subject: 'Database Systems',
          category: 'Core Engineering',
          credits: 4,
          total: 84,
          grade: 'A',
          attendance: 95,
          faculty: 'Dr. Aarti Joshi',
          examType: 'Theory + Lab',
          remarks: 'Strong normalization and query design fundamentals.',
          gradeTone: 'bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/20',
          components: [
            { label: 'Assignment', scored: 17, total: 20 },
            { label: 'Quiz', scored: 8, total: 10 },
            { label: 'Mid Semester', scored: 24, total: 30 },
            { label: 'End Semester', scored: 35, total: 40 },
          ],
          timeline: ['High-quality ER design submissions.', 'Consistent SQL lab execution.', 'Strong final theory paper structure.'],
        },
        {
          code: 'CS502',
          subject: 'Theory of Computation',
          category: 'Core Engineering',
          credits: 4,
          total: 76,
          grade: 'B+',
          attendance: 87,
          faculty: 'Prof. Nitin Gupta',
          examType: 'Theory',
          remarks: 'Good progress with formal language concepts over time.',
          gradeTone: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20',
          components: [
            { label: 'Assignment', scored: 14, total: 20 },
            { label: 'Quiz', scored: 7, total: 10 },
            { label: 'Mid Semester', scored: 23, total: 30 },
            { label: 'End Semester', scored: 32, total: 40 },
          ],
          timeline: ['Automata proofs improved steadily.', 'Needs faster completion in formal derivations.', 'Healthy attendance through the term.'],
        },
        {
          code: 'CS503',
          subject: 'Design Analysis of Algorithms',
          category: 'Core Engineering',
          credits: 4,
          total: 91,
          grade: 'A+',
          attendance: 98,
          faculty: 'Dr. Preeti Anand',
          examType: 'Theory + Tutorial',
          remarks: 'Excellent reasoning depth and efficient solution design.',
          gradeTone: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20',
          components: [
            { label: 'Assignment', scored: 19, total: 20 },
            { label: 'Quiz', scored: 9, total: 10 },
            { label: 'Mid Semester', scored: 27, total: 30 },
            { label: 'End Semester', scored: 36, total: 40 },
          ],
          timeline: ['Top performer in complexity analysis rounds.', 'Submitted elegant solutions with clear proofs.', 'Tutorial participation remained strong all semester.'],
        },
      ],
    },
  },
};

const gradeRank = { O: 5, 'A+': 4, A: 3, 'B+': 2, B: 1 };

const formatDelta = (current, previous) => {
  const diff = (current - previous).toFixed(2);
  return `${diff.startsWith('-') ? '' : '+'}${diff}`;
};

const getGradeTone = (grade) => {
  if (grade === 'O' || grade === 'A+') return 'text-emerald-300';
  if (grade === 'A') return 'text-teal-300';
  return 'text-amber-300';
};

const getAttendanceTone = (value) => {
  if (value >= 95) return 'text-emerald-300';
  if (value >= 85) return 'text-amber-300';
  return 'text-rose-300';
};

const FilterSelect = ({ label, value, options, onChange }) => (
  <label className="relative min-w-[180px]">
    <span className="absolute -top-2 left-4 rounded-full bg-[#0f172a] px-2 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
      {label}
    </span>
    <select
      value={value}
      onChange={onChange}
      className="w-full appearance-none rounded-2xl border border-slate-700 bg-slate-900/90 py-3.5 pl-4 pr-11 text-sm font-semibold text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
  </label>
);

const SummaryCard = ({ icon: Icon, title, value, detail, accent, badge, badgeTone }) => (
  <article className="results-panel p-6 transition duration-300 hover:-translate-y-1 hover:border-slate-700/90">
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className={`rounded-2xl p-3 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      {badge ? <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${badgeTone}`}>{badge}</span> : null}
    </div>
    <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.26em] text-slate-500">{title}</p>
    <h2 className="results-display text-4xl font-extrabold tracking-tight text-white">{value}</h2>
    <p className="mt-2 text-sm font-medium text-slate-400">{detail}</p>
  </article>
);

export default function Results() {
  const academicYears = Object.keys(resultsData);
  const [selectedYear, setSelectedYear] = useState(academicYears[0]);
  const semesterOptions = Object.keys(resultsData[selectedYear]);
  const [selectedSemester, setSelectedSemester] = useState(semesterOptions[0]);
  const [viewMode, setViewMode] = useState('Overall');
  const [selectedCourseCode, setSelectedCourseCode] = useState(resultsData[selectedYear][selectedSemester].courses[0].code);
  const [expandedCodes, setExpandedCodes] = useState([resultsData[selectedYear][selectedSemester].courses[0].code]);

  const semesterData = resultsData[selectedYear][selectedSemester];

  const selectedCourse = useMemo(
    () => semesterData.courses.find((course) => course.code === selectedCourseCode) ?? semesterData.courses[0],
    [semesterData, selectedCourseCode]
  );

  const distribution = useMemo(() => {
    const counts = semesterData.courses.reduce(
      (acc, course) => {
        if (course.grade === 'A+' || course.grade === 'O') acc.excellent += 1;
        else if (course.grade === 'A') acc.good += 1;
        else acc.others += 1;
        return acc;
      },
      { excellent: 0, good: 0, others: 0 }
    );
    const total = semesterData.courses.length || 1;
    return [
      { label: 'Excellent (A+/O)', value: Math.round((counts.excellent / total) * 100), color: 'bg-indigo-500' },
      { label: 'Good (A)', value: Math.round((counts.good / total) * 100), color: 'bg-cyan-400' },
      { label: 'Others', value: Math.round((counts.others / total) * 100), color: 'bg-slate-500' },
    ];
  }, [semesterData]);

  const filteredCourses = useMemo(() => {
    const courses = [...semesterData.courses];
    if (viewMode === 'Internal') {
      return courses.sort(
        (a, b) =>
          b.components.slice(0, 2).reduce((sum, item) => sum + item.scored, 0) -
          a.components.slice(0, 2).reduce((sum, item) => sum + item.scored, 0)
      );
    }
    if (viewMode === 'External') {
      return courses.sort(
        (a, b) =>
          b.components.slice(-2).reduce((sum, item) => sum + item.scored, 0) -
          a.components.slice(-2).reduce((sum, item) => sum + item.scored, 0)
      );
    }
    return courses.sort((a, b) => (gradeRank[b.grade] || 0) - (gradeRank[a.grade] || 0) || b.total - a.total);
  }, [semesterData, viewMode]);

  const trendMax = Math.max(...semesterData.trend.map((item) => item.score));

  const handleYearChange = (event) => {
    const nextYear = event.target.value;
    const nextSemesterOptions = Object.keys(resultsData[nextYear]);
    const nextSemester = nextSemesterOptions[0];
    const nextCourses = resultsData[nextYear][nextSemester].courses;
    setSelectedYear(nextYear);
    setSelectedSemester(nextSemester);
    setSelectedCourseCode(nextCourses[0].code);
    setExpandedCodes([nextCourses[0].code]);
  };

  const handleSemesterChange = (event) => {
    const nextSemester = event.target.value;
    const nextCourses = resultsData[selectedYear][nextSemester].courses;
    setSelectedSemester(nextSemester);
    setSelectedCourseCode(nextCourses[0].code);
    setExpandedCodes([nextCourses[0].code]);
  };

  const toggleCourse = (code) => {
    setSelectedCourseCode(code);
    setExpandedCodes((current) => (current.includes(code) ? current.filter((item) => item !== code) : [...current, code]));
  };

  return (
    <div className="mx-auto max-w-6xl">
      <section className="mb-10">
        <h1 className="results-display text-4xl font-extrabold tracking-tight text-white md:text-5xl">Exam Results</h1>
        <p className="mt-3 max-w-2xl text-base font-medium text-slate-400">
          Explore semester performance, compare dummy result sets, and open each course for a detailed breakdown.
        </p>
      </section>

      <section className="results-page rounded-[32px] p-5 md:p-8">
        <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-center">
          <div className="flex flex-wrap gap-4 xl:col-span-8">
            <FilterSelect label="Academic Year" value={selectedYear} options={academicYears} onChange={handleYearChange} />
            <FilterSelect label="Semester" value={selectedSemester} options={semesterOptions} onChange={handleSemesterChange} />
            <button
              type="button"
              onClick={() => {
                setSelectedCourseCode(semesterData.courses[0].code);
                setExpandedCodes([semesterData.courses[0].code]);
              }}
              className="rounded-2xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              View Results
            </button>
          </div>

          <div className="rounded-[24px] border border-slate-700 bg-slate-900/80 p-1.5 xl:col-span-4">
            <div className="grid grid-cols-3 gap-1 text-xs font-bold">
              {['Internal', 'External', 'Overall'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`rounded-[18px] px-4 py-2.5 transition ${
                    viewMode === mode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={Sparkles}
            title="Semester SGPA"
            value={semesterData.summary.sgpa.toFixed(2)}
            detail={`${formatDelta(semesterData.summary.sgpa, semesterData.summary.previousSgpa)} from previous semester`}
            accent="bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/20"
            badge={`${formatDelta(semesterData.summary.sgpa, semesterData.summary.previousSgpa)} Prev.`}
            badgeTone="bg-emerald-500/15 text-emerald-300"
          />
          <SummaryCard
            icon={Wallet}
            title="Total Credits"
            value={`${semesterData.summary.creditsEarned}/${semesterData.summary.totalCredits}`}
            detail="Credits earned in the selected semester"
            accent="bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/20"
          />
          <SummaryCard
            icon={Percent}
            title="Total Percentage"
            value={`${semesterData.summary.percentage.toFixed(1)}%`}
            detail="Weighted result across all registered courses"
            accent="bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/20"
          />

          <article className="relative overflow-hidden rounded-[28px] border border-indigo-500/30 bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-950/30">
            <div className="relative z-10">
              <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3">
                <Award className="h-5 w-5" />
              </div>
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.24em] text-white/60">Overall Status</p>
              <h2 className="results-display text-4xl font-extrabold tracking-tight">{semesterData.summary.status}</h2>
              <p className="mt-2 text-sm font-medium text-white/75">Selected result set is fully interactive with per-course drilldown.</p>
            </div>
            <CheckCircle2 className="absolute -bottom-7 -right-7 h-32 w-32 text-white/10" />
          </article>
        </section>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.8fr_1fr]">
          <div className="space-y-8">
            <section className="results-panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-6 py-5">
                <div>
                  <h3 className="results-display text-xl font-extrabold text-white">Detailed Marksheet</h3>
                  <p className="mt-1 text-sm text-slate-500">Click any course row to expand component scores and focus the detail panel.</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200">
                    <Filter className="h-4 w-4" />
                  </button>
                  <button className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-slate-950/70">
                      {['Code', 'Subject', 'Cr.', 'Total', 'Grade', 'Action'].map((heading, index) => (
                        <th
                          key={heading}
                          className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-500 ${
                            index >= 2 ? 'text-center' : ''
                          } ${index === 5 ? 'text-right' : ''}`}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  {filteredCourses.map((course) => {
                    const isExpanded = expandedCodes.includes(course.code);
                    const internalScore = course.components.slice(0, 2).reduce((sum, item) => sum + item.scored, 0);
                    const externalScore = course.components.slice(-2).reduce((sum, item) => sum + item.scored, 0);

                    return (
                      <tbody key={course.code} className="divide-y divide-slate-800">
                        <tr
                          onClick={() => toggleCourse(course.code)}
                          className={`cursor-pointer transition ${
                            selectedCourseCode === course.code ? 'bg-indigo-500/10' : 'hover:bg-slate-900/70'
                          }`}
                        >
                          <td className="px-6 py-5 font-mono text-xs font-bold text-indigo-300">{course.code}</td>
                          <td className="px-6 py-5">
                            <div className="font-bold text-white">{course.subject}</div>
                            <div className="text-[11px] font-medium text-slate-500">{course.category}</div>
                          </td>
                          <td className="px-6 py-5 text-center font-bold text-slate-300">{course.credits}</td>
                          <td className="results-display px-6 py-5 text-center text-2xl font-extrabold text-indigo-300">{course.total}</td>
                          <td className="px-6 py-5 text-center">
                            <span className={`rounded-full px-3 py-1 text-xs font-black ${course.gradeTone}`}>{course.grade}</span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button type="button" className="text-slate-500 transition hover:text-indigo-300">
                              {isExpanded ? <ChevronDown className="ml-auto h-5 w-5" /> : <ChevronRight className="ml-auto h-5 w-5" />}
                            </button>
                          </td>
                        </tr>
                        {isExpanded ? (
                          <tr className="bg-slate-950/50">
                            <td colSpan="6" className="px-6 py-5">
                              <div className="grid gap-4 md:grid-cols-4">
                                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                  <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Internal</p>
                                  <p className="mt-2 text-2xl font-extrabold text-white">{internalScore}</p>
                                  <p className="mt-1 text-sm text-slate-400">Assignment + quiz combined</p>
                                </div>
                                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                  <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-500">External</p>
                                  <p className="mt-2 text-2xl font-extrabold text-white">{externalScore}</p>
                                  <p className="mt-1 text-sm text-slate-400">Mid semester + finals</p>
                                </div>
                                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                  <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Attendance</p>
                                  <p className={`mt-2 text-2xl font-extrabold ${getAttendanceTone(course.attendance)}`}>{course.attendance}%</p>
                                  <p className="mt-1 text-sm text-slate-400">Current attendance record</p>
                                </div>
                                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                                  <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Faculty</p>
                                  <p className="mt-2 text-lg font-bold text-white">{course.faculty}</p>
                                  <p className="mt-1 text-sm text-slate-400">{course.examType}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    );
                  })}
                </table>
              </div>
            </section>

            <section className="results-panel p-6">
              <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h3 className="results-display text-xl font-extrabold text-white">Course Detail</h3>
                  <p className="mt-1 text-sm text-slate-500">Selected course: {selectedCourse.code}</p>
                </div>
                <div className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-right">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Grade</p>
                  <p className={`mt-1 text-xl font-extrabold ${getGradeTone(selectedCourse.grade)}`}>{selectedCourse.grade}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h4 className="text-2xl font-bold text-white">{selectedCourse.subject}</h4>
                      <p className="mt-1 text-sm text-slate-400">{selectedCourse.category}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Total Score</p>
                      <p className="results-display mt-1 text-3xl font-extrabold text-indigo-300">{selectedCourse.total}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Faculty</p>
                      <p className="mt-2 text-lg font-bold text-white">{selectedCourse.faculty}</p>
                      <p className="mt-1 text-sm text-slate-400">{selectedCourse.examType}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Remarks</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{selectedCourse.remarks}</p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-indigo-300" />
                      <h5 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">Assessment Components</h5>
                    </div>
                    <div className="mt-5 space-y-4">
                      {selectedCourse.components.map((item) => {
                        const percent = (item.scored / item.total) * 100;
                        return (
                          <div key={item.label}>
                            <div className="mb-2 flex items-center justify-between text-sm">
                              <span className="font-semibold text-slate-200">{item.label}</span>
                              <span className="font-mono text-slate-400">
                                {item.scored} / {item.total}
                              </span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Quick Stats</p>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Credits</span>
                        <span className="font-bold text-white">{selectedCourse.credits}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Attendance</span>
                        <span className={`font-bold ${getAttendanceTone(selectedCourse.attendance)}`}>{selectedCourse.attendance}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Exam Type</span>
                        <span className="font-bold text-white">{selectedCourse.examType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-500">Faculty Notes</p>
                    <div className="mt-4 space-y-3">
                      {selectedCourse.timeline.map((point) => (
                        <div key={point} className="flex gap-3">
                          <div className="mt-2 h-2.5 w-2.5 rounded-full bg-indigo-400" />
                          <p className="text-sm leading-6 text-slate-300">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="results-panel p-6">
              <h3 className="results-display mb-6 text-lg font-extrabold text-white">Grade Distribution</h3>
              <div className="relative mx-auto mb-8 h-48 w-48">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="64" fill="transparent" stroke="#1e293b" strokeWidth="26" />
                  <circle
                    cx="100"
                    cy="100"
                    r="64"
                    fill="transparent"
                    stroke="#6366f1"
                    strokeDasharray="402"
                    strokeDashoffset={402 - (distribution[0].value / 100) * 402}
                    strokeLinecap="round"
                    strokeWidth="26"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="64"
                    fill="transparent"
                    stroke="#22d3ee"
                    strokeDasharray="402"
                    strokeDashoffset={402 - ((distribution[0].value + distribution[1].value) / 100) * 402}
                    strokeLinecap="round"
                    strokeWidth="26"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="results-display text-3xl font-extrabold text-white">{selectedCourse.grade}</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-500">Selected Grade</span>
                </div>
              </div>

              <div className="space-y-3">
                {distribution.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <span className="text-sm font-medium text-slate-300">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[28px] border border-indigo-500/25 bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl shadow-indigo-950/30">
              <div className="relative z-10">
                <h3 className="results-display text-lg font-extrabold">Performance Trend</h3>
                <p className="mt-2 text-sm text-white/65">Historical SGPA across the available dummy semesters</p>
                <div className="mt-8 flex h-40 items-end gap-3">
                  {semesterData.trend.map((item, index) => (
                    <div
                      key={item.label}
                      className={`group relative flex-1 rounded-t-xl ${
                        index === semesterData.trend.length - 1 ? 'bg-white/60' : index % 2 === 0 ? 'bg-white/12' : 'bg-white/25'
                      }`}
                      style={{ height: `${(item.score / trendMax) * 100}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 opacity-0 transition group-hover:opacity-100">
                        {item.score}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/45">
                  {semesterData.trend.map((item) => (
                    <span key={item.label}>{item.label}</span>
                  ))}
                </div>
              </div>
              <TrendingUp className="absolute -right-6 -top-6 h-28 w-28 text-white/10" />
            </section>
          </aside>
        </div>

        <footer className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-slate-800 py-8 md:flex-row">
          <div className="text-center text-xs font-medium leading-6 text-slate-500 md:text-left">
            <div>&copy; 2024 Academic Luminary. Interactive dummy transcript view.</div>
            <div>Switch academic year and semester to preview alternate result sets.</div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button className="inline-flex items-center gap-2 rounded-[18px] border border-slate-700 bg-slate-900/80 px-6 py-3 text-sm font-bold text-slate-200 transition hover:bg-slate-800">
              <Printer className="h-4 w-4" />
              Print Results
            </button>
            <button className="inline-flex items-center gap-2 rounded-[18px] bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500">
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
