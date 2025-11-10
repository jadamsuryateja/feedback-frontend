import { useState } from 'react';
import { Search, Printer } from 'lucide-react';
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

// Add this interface at the top with other interfaces
interface FeedbackSummary {
  teacherName: string;
  subjectName: string;
  type: 'Theory' | 'Lab';
  totalResponses: number;
  questionScores: QuestionScores;
  comments: string[]; // Add this field
}

interface Comment {
  collegeComments: string;
  departmentComments: string;
  submittedAt: string;
}

const FeedbackSummary = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [branch, setBranch] = useState('');
  const [section, setSection] = useState('');
  const [summary, setSummary] = useState<any[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBSH, setIsBSH] = useState(false);
  const [bshBranch, setBshBranch] = useState('');

  const fetchData = async () => {
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!academicYear || !year || !semester || !section) {
        throw new Error('Please fill all required fields');
      }

      // Validate branch selection
      if (isBSH && !bshBranch) {
        throw new Error('Please select a BSH branch');
      }
      if (!isBSH && !branch) {
        throw new Error('Please select a branch');
      }

      // Base params
      const params: any = {
        academicYear,
        year,
        semester,
        section,
        branch: isBSH ? bshBranch : branch,
        isBSH: isBSH
      };

      console.log('Sending params:', params); // Add this for debugging

      const data = await api.feedback.getSummary(params);
      
      if (!data?.summary || data.summary.length === 0) {
        setError('No feedback data found for the selected criteria');
        setSummary([]);
      } else {
        setSummary(data.summary);
        setComments(data.comments);
        setError('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch feedback summary');
      setSummary([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalScore = (scores: QuestionScores): string => {
    const total = Object.values(scores).reduce((sum: number, score: QuestionScore) => {
      return sum + parseFloat(score.percentage.toString());
    }, 0);
    return (total / 10).toFixed(2);
  };

  // Add print function
  const handlePrint = () => {
    window.print();
  };

  // Update print styles
  const addPrintStyles = `
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
        padding: 0.3cm !important;
      }
      /* Reduce font sizes even more for portrait */
      .print-section h2 {
        font-size: 14px !important;
        margin-bottom: 6px !important;
      }
      .print-section .text-sm {
        font-size: 8px !important;
      }
      .print-section span,
      .print-section td,
      .print-section th {
        font-size: 8px !important;
        padding: 2px 4px !important;
      }
      /* Tighter grid for info section */
      .print-section .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 4px !important;
        margin-bottom: 6px !important;
      }
      /* Smaller table */
      .print-section table {
        font-size: 8px !important;
        border: 1px solid #d1d5db !important;
        width: 100% !important;
        table-layout: fixed !important;
      }
      .print-section th,
      .print-section td {
        border: 1px solid #d1d5db !important;
        padding: 2px !important;
        white-space: nowrap !important;
      }
      /* Tighter spacing */
      .print-section > div {
        margin-bottom: 0.5cm !important;
        padding: 4px !important;
      }
      /* Smaller badges */
      .print-section [class*='rounded-full'] {
        padding: 1px 4px !important;
        font-size: 7px !important;
      }
      /* Portrait page setup */
      @page {
        margin: 0.3cm !important;
        size: A4 portrait;
      }
      /* Tighter spacing */
      .print-section .mb-6 {
        margin-bottom: 0.3rem !important;
      }
      .print-section .p-6 {
        padding: 0.3rem !important;
      }
      .print-section .gap-4 {
        gap: 0.2rem !important;
      }
      /* Adjusted column widths for portrait */
      .print-section th:first-child,
      .print-section td:first-child {
        width: 60px !important;
      }
      .print-section th:not(:first-child),
      .print-section td:not(:first-child) {
        width: calc((100% - 60px) / 11) !important;
      }

      /* Logo styles for print */
      .print-header {
        display: block !important;
        text-align: center;
        margin-bottom: 20px;
        visibility: visible !important;
      }
      .print-header img {
        height: 60px !important;
        margin: 0 auto !important;
      }
      .print-header h1 {
        font-size: 16px !important;
        font-weight: bold !important;
        color: black !important;
        margin-top: 8px !important;
        text-align: center !important;
      }

      /* Handle long text in print */
      .print-section .truncate {
        max-width: 150px !important;
        white-space: normal !important;
        word-break: break-word !important;
      }

      .print-section .break-words {
        word-break: break-word !important;
        white-space: normal !important;
        font-size: 8px !important;
      }

      /* Comments section styles for print */
      .print-section h3 {
        font-size: 12px !important;
        margin-top: 8px !important;
        margin-bottom: 4px !important;
      }

      .print-section .space-y-2 {
        margin-top: 4px !important;
      }

      .print-section .space-y-2 > div {
        padding: 2px 4px !important;
        margin-bottom: 2px !important;
        border: 1px solid #d1d5db !important;
        page-break-inside: avoid !important;
      }

      .print-section .space-y-2 p {
        font-size: 8px !important;
        line-height: 1.2 !important;
        margin: 0 !important;
      }

      /* Comments section print styles */
      .comments-section {
        page-break-before: auto !important;
        page-break-inside: avoid !important;
        margin-top: 1cm !important;
        width: 100% !important;
        margin: 1cm 0 !important;
      }

      .comments-section h3 {
        font-size: 12px !important;
        font-weight: bold !important;
        margin-bottom: 0.5cm !important;
        color: black !important;
      }

      .comments-section table {
        width: 100% !important;
        border-collapse: collapse !important;
        table-layout: fixed !important; /* Added fixed layout */
        page-break-inside: auto !important;
      }

      .comments-section th,
      .comments-section td {
        width: 50% !important;
        padding: 8px !important;
        vertical-align: top !important;
        border: 1px solid #d1d5db !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
        white-space: pre-line !important;
      }

      .comments-section td > div.break-words {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        font-size: 8px !important;
        line-height: 1.3 !important;
        white-space: pre-line !important;
        word-break: break-word !important;
      }

      .comments-section tr {
        page-break-inside: avoid !important;
      }

      .comments-section .text-xs {
        font-size: 7px !important;
        margin-top: 4px !important;
        color: #6b7280 !important;
      }

      /* Force equal width columns */
      .comments-section table > thead > tr > th:first-child,
      .comments-section table > thead > tr > th:last-child,
      .comments-section table > tbody > tr > td:first-child,
      .comments-section table > tbody > tr > td:last-child {
        width: 50% !important;
        max-width: 50% !important;
      }

      /* Prevent content overflow */
      .comments-section td > div {
        box-sizing: border-box !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      /* Signature section styles */
      .signature-section {
        display: block !important;
        visibility: visible !important;
        margin-top: 3cm !important; /* Add space before signature */
        text-align: right !important;
        page-break-inside: avoid !important;
        background: transparent !important;
        margin-right: 2cm !important;
      }

      .signature-section img {
        height: 40px !important;
        width: auto !important;
        display: block !important; /* Changed to block */
        margin-left: auto !important; /* Center align with text */
        margin-bottom: 4px !important;
      }

      .signature-text {
        font-size: 10px !important;
        font-weight: bold !important;
        color: black !important;
        text-align: center !important; /* Center align text */
        width: 120px !important; /* Set fixed width */
        margin-left: auto !important; /* Align with signature */
      }
    }
  `;

  const validateSection = (section: string): boolean => {
    const pattern = /^[A-Z]$/;
    return pattern.test(section);
  };

  const handleBSHToggle = (value: boolean) => {
    setIsBSH(value);
    // Reset all fields
    setBshBranch('');
    setAcademicYear('');
    setYear('');
    setSemester('');
    setBranch('');
    setSection('');
    setSummary([]);
  };

  return (
    <div className="space-y-6">
      <style>{addPrintStyles}</style>
      <div className="bg-slate-800 rounded-xl shadow-md p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">Feedback Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {/* BSH Toggle Switch */}
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
              <span className="text-sm font-medium text-white">
                Show BSH Data
              </span>
            </div>
          </div>

          {/* Regular Fields (shown when BSH is false) */}
          {!isBSH && (
            <>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2024-2025"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400"
                >
                  <option value="">Select Year</option>
                  {[1, 2, 3, 4].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400"
                >
                  <option value="">Select Semester</option>
                  {[1, 2].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Branch
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400"
                >
                  <option value="">Select Branch</option>
                  {BRANCHES.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Section
                </label>
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
                  placeholder="Enter section (A-Z)"
                  className={`w-full px-4 py-2 bg-slate-700 border ${
                    section && !validateSection(section)
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-600 focus:ring-blue-500'
                  } text-white rounded-lg focus:ring-2 focus:border-transparent outline-none placeholder-slate-400 uppercase`}
                />
                {section && !validateSection(section) && (
                  <p className="mt-1 text-sm text-red-400">
                    Section must be a single uppercase letter (A-Z)
                  </p>
                )}
              </div>
            </>
          )}

          {/* BSH Fields (shown when BSH is true) */}
          {isBSH && (
            <>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2024-2025"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400"
                >
                  <option value="">Select Year</option>
                  {[1].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  BSH Branch
                </label>
                <select
                  value={bshBranch}
                  onChange={(e) => setBshBranch(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400"
                >
                  <option value="">Select BSH Branch</option>
                  {BSH_BRANCHES.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400"
                >
                  <option value="">Select Semester</option>
                  {[1, 2].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Section
                </label>
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
                  placeholder="Enter section (A-Z)"
                  className={`w-full px-4 py-2 bg-slate-700 border ${
                    section && !validateSection(section)
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-slate-600 focus:ring-blue-500'
                  } text-white rounded-lg focus:ring-2 focus:border-transparent outline-none placeholder-slate-400 uppercase`}
                />
                {section && !validateSection(section) && (
                  <p className="mt-1 text-sm text-red-400">
                    Section must be a single uppercase letter (A-Z)
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Search className="w-5 h-5" />
            {loading ? 'Loading...' : 'Fetch Data'}
          </button>

          {/* Add Print Button */}
          {summary.length > 0 && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Printer className="w-5 h-5" />
              Print Report
            </button>
          )}
        </div>

        {/* Display error message */}
        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}
      </div>

      <div className="print-section">
        {/* Print header - Make sure it's visible */}
        <div className="print-header hidden">
          <img src={logo} alt="NEC Logo" className="h-16 mx-auto" />
          <h1 className="text-center text-xl font-bold mt-2 mb-1">
            NARASARAOPETA ENGINEERING COLLEGE(AUTONOMOUS)
          </h1>
          <h1 className="text-center text-lg font-bold mb-4">
            FEEDBACK REPORT
          </h1>
        </div>

        {/* Existing summary mapping */}
        {summary.map((item, index) => (
          <div key={index} className="bg-slate-800 rounded-xl shadow-md p-6 mb-6 border border-slate-700">
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-slate-700">
                <tbody>
                  {/* First row */}
                  <tr>
                    <td className="border border-slate-600 px-4 py-2">
                      <span className="text-slate-400">Academic Year:</span>{" "}
                      <span className="text-white">{academicYear}</span>
                    </td>
                    <td className="border border-slate-600 px-4 py-2">
                      <span className="text-slate-400">Year:</span>{" "}
                      <span className="text-white">{year}</span>
                    </td>
                    <td className="border border-slate-600 px-4 py-2">
                      <span className="text-slate-400">Semester:</span>{" "}
                      <span className="text-white">{semester}</span>
                    </td>
                    <td className="border border-slate-600 px-4 py-2">
                      <span className="text-slate-400">Branch:</span>{" "}
                      <span className="text-white truncate">{isBSH ? bshBranch : branch}</span>
                    </td>
                    <td className="border border-slate-600 px-4 py-2">
                      <span className="text-slate-400">Section:</span>{" "}
                      <span className="text-white">{section}</span>
                    </td>
                    <td className="border border-slate-600 px-4 py-2">
                      <span className="text-slate-400">Total Responses:</span>{" "}
                      <span className="text-white">{item.totalResponses}</span>
                    </td>
                  </tr>
                  {/* Second row */}
                  <tr>
                    <td className="border border-slate-600 px-4 py-2" colSpan={3}>
                      <span className="text-slate-400">Subject:</span>{" "}
                      <span className="text-white truncate">{item.subjectName}</span>
                    </td>
                    <td className="border border-slate-600 px-4 py-2" colSpan={2}>
                      <span className="text-slate-400">Teacher:</span>{" "}
                      <span className="text-white truncate">{item.teacherName}</span>
                    </td>
                    <td className="border border-slate-600 px-4 py-2">
                      <span className="text-slate-400">Type:</span>{" "}
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
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
                    <td className="border border-slate-600 px-4 py-2 font-semibold text-white">
                      Percentage (%)
                    </td>
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

        {/* Move comments section to bottom */}
        {comments.length > 0 && (
          <div className="mt-8 comments-section">
            <h3 className="text-xl font-semibold text-white mb-4">Overall Student Comments</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-slate-700">
                <thead>
                  <tr className="bg-slate-700/50">
                    <th className="border border-slate-600 px-4 py-2 text-white w-1/2">College Feedback</th>
                    <th className="border border-slate-600 px-4 py-2 text-white w-1/2">Department Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((comment, index) => (
                    <tr key={index}>
                      <td className="border border-slate-600 p-4 text-slate-200">
                        <div className="break-words">
                          {comment.collegeComments || 'No college feedback provided'}
                        </div>
                      </td>
                      <td className="border border-slate-600 p-4 text-slate-200">
                        <div className="break-words">
                          {comment.departmentComments || 'No department feedback provided'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Move signature section here, after all content */}
        <div className="signature-section hidden">
          <img src={signature} alt="Vice Principal Signature" />
          <div className="signature-text">Signature of Vice Principal</div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSummary;
