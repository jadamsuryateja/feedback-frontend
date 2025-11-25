import { useState } from 'react';
import { Search, Printer, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import logo from '/images/logo.png';
import signature from '/images/signature.png';
import { Switch } from '@headlessui/react';

const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI', 'AIML', 'DS', 'CS', 'IT', 'MBA', 'MCA'];
const BSH_BRANCHES = ['CSE-BSH', 'ECE-BSH', 'EEE-BSH', 'MECH-BSH', 'CIVIL-BSH', 'AI-BSH', 'AIML-BSH', 'DS-BSH', 'CS-BSH', 'IT-BSH'];

interface QuestionScore {
  score: number;
  percentage: number;
}

interface QuestionScores {
  [key: string]: QuestionScore;
}

interface FeedbackSummary {
  teacherName: string;
  subjectName: string;
  type: 'Theory' | 'Lab';
  totalResponses: number;
  questionScores: QuestionScores;
  overallPercentage: number;
}

interface Comment {
  collegeComments: string;
  departmentComments: string;
  submittedAt: string;
}

const FeedbackSummaryComponent = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [branch, setBranch] = useState('');
  const [section, setSection] = useState('');
  const [summary, setSummary] = useState<FeedbackSummary[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBSH, setIsBSH] = useState(false);
  const [bshBranch, setBshBranch] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const addPrintStyles = `
    /* Hide signature in frontend, show only in print */
    .signature-section {
      display: none !important;
    }

    @media print {
      body * {
        visibility: hidden;
      }
      .print-section, .print-section * {
        visibility: visible;
        color: black !important;
        background: white !important;
        border-color: #e5e7eb !important;
      }
      .print-section {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        padding: 0.5cm !important;
      }
      
      .print-section h2 {
        font-size: 18px !important;
        margin-bottom: 10px !important;
        font-weight: bold !important;
      }
      
      .print-section h3 {
        font-size: 14px !important;
        margin-top: 10px !important;
        margin-bottom: 8px !important;
        font-weight: bold !important;
      }
      
      .print-section .text-sm {
        font-size: 11px !important;
      }
      
      .print-section span,
      .print-section td,
      .print-section th {
        font-size: 10px !important;
        padding: 6px 8px !important;
        line-height: 1.4 !important;
      }
      
      .print-section table {
        font-size: 9px !important;
        border: 2px solid #000 !important;
        width: 100% !important;
        table-layout: fixed !important;
        margin-bottom: 12px !important;
      }
      
      .print-section th,
      .print-section td {
        border: 1px solid #000 !important;
        padding: 6px 4px !important;
        text-align: left !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        white-space: normal !important;
        vertical-align: top !important;
      }
      
      .print-section th {
        background-color: #f3f4f6 !important;
        font-weight: bold !important;
      }
      
      .print-section > div {
        margin-bottom: 1cm !important;
        padding: 8px !important;
      }

      .signature-section {
        margin-top: 3cm !important;
        padding-top: 1.5cm !important;
        border-top: 2px solid #000 !important;
        display: flex !important;
        justify-content: flex-end !important;
        page-break-inside: avoid !important;
        padding-right: 2cm !important;
        width: 100% !important;
        visibility: visible !important;
      }

      .signature-section img {
        height: 70px !important;
        margin-right: 0.5cm !important;
        margin-bottom: 0.5cm !important;
        display: block !important;
      }

      .signature-text {
        text-align: center !important;
        font-size: 12px !important;
        font-weight: bold !important;
        margin-top: 0.5cm !important;
        white-space: nowrap !important;
        border-top: 2px solid #000 !important;
        padding-top: 0.3cm !important;
      }

      .comments-section .signature-section {
        display: flex !important;
        visibility: visible !important;
      }

      .print-section .signature-section {
        visibility: visible !important;
        color: black !important;
        display: flex !important;
      }
    }
  `;

  const fetchData = async () => {
    setError('');
    setLoading(true);
    setShowComments(false);
    setComments([]);

    try {
      const params: any = {};
      if (academicYear) params.academicYear = academicYear;
      if (year) params.year = year;
      if (semester) params.semester = semester;
      
      if (isBSH && bshBranch) {
        params.branch = bshBranch;
      } else if (!isBSH && branch) {
        params.branch = branch;
      }
      
      if (section) params.section = section;

      const data = await api.feedback.getSummary(params);
      
      const summaryWithoutComments = data.summary.map((item: any) => ({
        teacherName: item.teacherName,
        subjectName: item.subjectName,
        type: item.type,
        totalResponses: item.totalResponses,
        questionScores: item.questionScores,
        overallPercentage: item.overallPercentage
      }));
      
      setSummary(summaryWithoutComments);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch summary');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    setError('');
    setCommentsLoading(true);

    try {
      const params: any = {};
      if (academicYear) params.academicYear = academicYear;
      if (year) params.year = year;
      if (semester) params.semester = semester;
      
      if (isBSH && bshBranch) {
        params.branch = bshBranch;
      } else if (!isBSH && branch) {
        params.branch = branch;
      }
      
      if (section) params.section = section;

      const data = await api.feedback.getResponses(params);
      
      const allComments = data
        .filter((response: any) => response.collegeComments || response.departmentComments)
        .map((response: any) => ({
          collegeComments: response.collegeComments || '',
          departmentComments: response.departmentComments || '',
          submittedAt: response.submittedAt
        }));
      
      setComments(allComments);
      setShowComments(true);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch comments');
    } finally {
      setCommentsLoading(false);
    }
  };

  const calculateTotalScore = (scores: QuestionScores): string => {
    let totalWeightedSum = 0;
    let totalMaxScore = 0;

    Object.values(scores).forEach((q: any) => {
      totalWeightedSum += q.score;
      totalMaxScore += q.score / (parseFloat(q.percentage) / 100);
    });

    return totalMaxScore > 0
      ? ((totalWeightedSum / totalMaxScore) * 100).toFixed(2)
      : '0.00';
  };

  const handlePrint = () => {
    window.print();
  };

  const validateSection = (section: string): boolean => {
    const pattern = /^[A-Z]$/;
    return pattern.test(section);
  };

  const handleBSHToggle = (value: boolean) => {
    setIsBSH(value);
    setBshBranch('');
    setAcademicYear('');
    setYear('');
    setSemester('');
    setBranch('');
    setSection('');
    setSummary([]);
    setComments([]);
    setShowComments(false);
  };

  return (
    <div className="space-y-6">
      <style>{addPrintStyles}</style>
      
      {/* Filter Section */}
      <div className="bg-slate-800 rounded-xl shadow-md p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">Feedback Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <Switch
                checked={isBSH}
                onChange={handleBSHToggle}
                className={`${
                  isBSH ? 'bg-blue-600' : 'bg-slate-700'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
              >
                <span className="sr-only">Toggle BSH Data</span>
                <span
                  className={`${
                    isBSH ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <span className="text-sm font-medium text-white">Show BSH Data</span>
            </div>
          </div>

          {!isBSH && (
            <>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Batch</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2024-2025"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Year</option>
                  {[1, 2, 3, 4].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Semester</option>
                  {[1, 2].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Branch</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Branch</option>
                  {BRANCHES.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Section</label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    if (value === '' || validateSection(value)) {
                      setSection(value);
                    }
                  }}
                  maxLength={1}
                  placeholder="A-Z"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase"
                />
              </div>
            </>
          )}

          {isBSH && (
            <>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Batch</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2024-2025"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Year</option>
                  {[1].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">BSH Branch</label>
                <select
                  value={bshBranch}
                  onChange={(e) => setBshBranch(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select BSH Branch</option>
                  {BSH_BRANCHES.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select Semester</option>
                  {[1, 2].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Section</label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    if (value === '' || validateSection(value)) {
                      setSection(value);
                    }
                  }}
                  maxLength={1}
                  placeholder="A-Z"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Search className="w-5 h-5" />
            {loading ? 'Loading...' : 'Fetch Data'}
          </button>

          <button
            onClick={fetchComments}
            disabled={commentsLoading}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            <MessageSquare className="w-5 h-5" />
            {commentsLoading ? 'Loading...' : 'Fetch Comments'}
          </button>

          {(summary.length > 0 || comments.length > 0) && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Printer className="w-5 h-5" />
              Print Report
            </button>
          )}

          {comments.length > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              {showComments ? 'View Summary' : 'View Comments'}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Print Section */}
      <div className="print-section">
        {/* Print Header */}
        <div className="print-header hidden">
          <img src={logo} alt="NEC Logo" className="h-16 mx-auto" />
          <h1 className="text-center text-xl font-bold mt-2 mb-1">
            NARASARAOPETA ENGINEERING COLLEGE (AUTONOMOUS)
          </h1>
          <h1 className="text-center text-lg font-bold mb-4">
            FEEDBACK REPORT
          </h1>
        </div>

        {/* Summary Section */}
        {!showComments && summary.length > 0 && (
          <div className="space-y-4">
            {summary.map((item, index) => (
              <div key={index} className="bg-slate-800 rounded-xl shadow-md p-6 border border-slate-700">
                {/* Info Grid */}
                <div className="overflow-x-auto mb-4">
                  <table className="w-full border-collapse border border-slate-700" style={{ tableLayout: 'fixed' }}>
                    <tbody>
                      <tr>
                        <td className="border border-slate-600 px-2 py-2 text-sm" style={{ width: '20%', minWidth: '80px' }}>
                          <span className="text-slate-400 block text-xs font-semibold">Batch</span>
                          <span className="text-white font-semibold text-xs break-words">{academicYear}</span>
                        </td>
                        <td className="border border-slate-600 px-2 py-2 text-sm" style={{ width: '10%', minWidth: '50px' }}>
                          <span className="text-slate-400 block text-xs font-semibold">Year</span>
                          <span className="text-white font-semibold text-xs">{year}</span>
                        </td>
                        <td className="border border-slate-600 px-2 py-2 text-sm" style={{ width: '15%', minWidth: '70px' }}>
                          <span className="text-slate-400 block text-xs font-semibold">Semester</span>
                          <span className="text-white font-semibold text-xs">{semester}</span>
                        </td>
                        <td className="border border-slate-600 px-2 py-2 text-sm" style={{ width: '15%', minWidth: '70px' }}>
                          <span className="text-slate-400 block text-xs font-semibold">Branch</span>
                          <span className="text-white font-semibold text-xs line-clamp-2">{isBSH ? bshBranch : branch}</span>
                        </td>
                        <td className="border border-slate-600 px-2 py-2 text-sm" style={{ width: '12%', minWidth: '60px' }}>
                          <span className="text-slate-400 block text-xs font-semibold">Section</span>
                          <span className="text-white font-semibold text-xs">{section}</span>
                        </td>
                        <td className="border border-slate-600 px-2 py-2 text-sm" style={{ width: '18%', minWidth: '80px' }}>
                          <span className="text-slate-400 block text-xs font-semibold">Responses</span>
                          <span className="text-white font-semibold text-xs">{item.totalResponses}</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-600 px-2 py-2 text-sm" colSpan={2} style={{ minWidth: '130px' }}>
                          <span className="text-slate-400 block text-xs font-semibold">Subject</span>
                          <span className="text-white font-semibold text-xs line-clamp-2">{item.subjectName}</span>
                        </td>
                        <td className="border border-slate-600 px-2 py-2 text-sm" colSpan={2} style={{ minWidth: '140px' }}>
                          <span className="text-slate-400 block text-xs font-semibold">Teacher</span>
                          <span className="text-white font-semibold text-xs line-clamp-2">{item.teacherName}</span>
                        </td>
                        <td className="border border-slate-600 px-2 py-2 text-sm" colSpan={2} style={{ minWidth: '140px' }}>
                          <span className="text-slate-400 block text-xs font-semibold">Type</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-block ${
                            item.type === 'Theory' 
                              ? 'bg-blue-900/50 text-white border border-blue-800' 
                              : 'bg-green-900/50 text-white border border-green-800'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Scores Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-slate-700">
                    <thead>
                      <tr className="bg-slate-700/50">
                        <th className="border border-slate-600 px-4 py-2 text-white">Metric</th>
                        {Array.from({ length: 10 }, (_, i) => (
                          <th key={i} className="border border-slate-600 px-4 py-2 text-white">Q{i + 1}</th>
                        ))}
                        <th className="border border-slate-600 px-4 py-2 text-white">Overall</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-600 px-4 py-2 font-semibold text-white">Score</td>
                        {Array.from({ length: 10 }, (_, i) => (
                          <td key={i} className="border border-slate-600 px-4 py-2 text-center text-slate-200">
                            {item.questionScores[`Q${i + 1}`]?.score || 0}
                          </td>
                        ))}
                        <td className="border border-slate-600 px-4 py-2 text-center font-semibold text-white">
                          {calculateTotalScore(item.questionScores)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-slate-600 px-4 py-2 font-semibold text-white">%</td>
                        {Array.from({ length: 10 }, (_, i) => (
                          <td key={i} className="border border-slate-600 px-4 py-2 text-center text-slate-200">
                            {item.questionScores[`Q${i + 1}`]?.percentage || 0}%
                          </td>
                        ))}
                        <td className="border border-slate-600 px-4 py-2 text-center font-semibold bg-slate-700/50 text-white">
                          {calculateTotalScore(item.questionScores)}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comments Section */}
        {showComments && comments.length > 0 && (
          <div className="bg-slate-800 rounded-lg shadow border border-slate-700 comments-section">
            <div className="p-4 bg-slate-700 border-b border-slate-600">
              <h3 className="text-xl font-bold text-white">Student Comments</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-700">
                    <th className="border border-slate-600 p-2 text-left font-semibold text-white w-1/2">College Comments</th>
                    <th className="border border-slate-600 p-2 text-left font-semibold text-white w-1/2">Department Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((comment, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-750'}>
                      <td className="border border-slate-600 p-2 text-slate-200 break-words">
                        <div className="break-words">{comment.collegeComments || '-'}</div>
                      </td>
                      <td className="border border-slate-600 p-2 text-slate-200 break-words">
                        <div className="break-words">{comment.departmentComments || '-'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature Section */}
            <div className="mt-8 pt-6 border-t border-slate-600">
              <div className="flex justify-end pr-8">
                <div className="text-center">
                  <img src={signature} alt="Vice Principal Signature" className="h-20 mb-2" />
                  <div className="text-slate-200 text-sm font-semibold border-t border-slate-600 pt-2">
                    Signature of Vice Principal
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showComments && comments.length === 0 && (
          <div className="p-4 bg-yellow-900/50 border border-yellow-700 rounded text-yellow-200">
            No comments found for the selected criteria.
          </div>
        )}

         {/* Signature Section */}
        <div className="signature-section">
          <div>
            <img src={signature} alt="Vice Principal Signature" />
            <div className="signature-text">Signature of Vice Principal</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSummaryComponent;
