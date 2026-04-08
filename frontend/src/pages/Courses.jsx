import React, { useState, useEffect } from 'react';
import { Book, Users, Clock, Award, ChevronRight, Activity, Percent } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nucleusToken');
    if (!token) return;

    // Fetch timetable and results to aggregate into a single unified course listing
    Promise.all([
      fetch(`${API_BASE_URL}/api/timetable`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/results`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
      fetch(`${API_BASE_URL}/api/attendance`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json())
    ])
    .then(([timetableItems, resultsData, attendanceData]) => {
       const mapped = {};
       
       // Process timetable references for faculty binding
       if(Array.isArray(timetableItems)){
         timetableItems.forEach(t => {
           if(!mapped[t.subject]) mapped[t.subject] = { title: t.subject, code: `CS${t._id ? t._id.toString().slice(-3).toUpperCase() : '101'}` };
           mapped[t.subject].faculty = t.faculty;
           mapped[t.subject].department = `${t.semester}th Sem ${t.branch}`;
         });
       }

       // Map results logic
       if(Array.isArray(resultsData)){
         resultsData.forEach(r => {
           if(!mapped[r.subject]) mapped[r.subject] = { title: r.subject, code: 'NA' };
           mapped[r.subject].credits = r.credits;
           mapped[r.subject].grade = r.grade;
           mapped[r.subject].marks = r.marks;
         });
       }

       // Map attendance
       if(Array.isArray(attendanceData)){
         attendanceData.forEach(a => {
           if(!mapped[a.subject_name]) mapped[a.subject_name] = { title: a.subject_name, code: 'NA' };
           mapped[a.subject_name].total_classes = a.total_classes;
           mapped[a.subject_name].attended_classes = a.attended_classes;
           mapped[a.subject_name].attendance_percent = ((a.attended_classes / (a.total_classes||1)) * 100).toFixed(0);
         });
       }

       setCourses(Object.values(mapped));
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-on-surface-variant animate-pulse">Loading Enrolled Courses...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-on-surface">Registered Courses</h1>
        <p className="text-on-surface-variant">Your actively enrolled syllabus for the current academic session.</p>
      </header>

      {courses.length === 0 ? (
        <div className="p-12 text-center border border-outline-variant/20 rounded-2xl bg-surface-container-lowest">
           <h3 className="text-xl font-bold">No Courses Found</h3>
           <p className="text-sm text-gray-500 mt-2">No active database records mapped to your branch and semester.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <div key={i} className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 group flex flex-col">
              <div className="p-6 border-b border-outline-variant/10 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-125 transition-transform duration-700">
                  <Book size={120} />
                </div>
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg tracking-wide uppercase">
                    {course.code || 'COURSE'}
                  </span>
                  {course.credits && (
                      <span className="flex items-center gap-1 text-xs font-bold text-on-surface-variant bg-surface-container-highest px-3 py-1 rounded-lg">
                        <Award size={14}/> {course.credits} Credits
                      </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-on-surface leading-snug mb-1">{course.title}</h3>
                <p className="text-sm text-on-surface-variant flex items-center gap-2">
                  <Users size={14} /> {course.faculty || 'Faculty Unassigned'}
                </p>
              </div>

              <div className="p-6 bg-surface-container-low/30 space-y-4 flex-1">
                {course.grade && (
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <Activity size={16} /> Latest Grade
                    </div>
                    <span className="font-bold text-primary">{course.grade} ({course.marks} marks)</span>
                  </div>
                )}
                
                {course.attendance_percent && (
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                       <div className="flex items-center gap-2 text-on-surface-variant">
                        <Percent size={16} /> Attendance
                       </div>
                       <span className="font-bold text-on-surface">{course.attendance_percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 rounded-full" style={{ width: `${course.attendance_percent}%` }}></div>
                    </div>
                  </div>
                )}
                
                {course.department && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Class</span>
                    <span className="font-mono text-xs">{course.department}</span>
                  </div>
                )}
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-4 border-t border-outline-variant/10 text-sm font-bold text-primary hover:bg-primary/5 transition-colors">
                View Syllabus <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
