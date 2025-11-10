import { useState } from 'react';
import { api } from '../services/api';
import { Switch } from '@headlessui/react';
import { Download, Filter } from 'lucide-react';

declare global {
  interface Window {
    XLSX: any;
  }
}

const BRANCHES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI', 'AIML', 'DS', 'CS', 'IT', 'MBA', 'MCA'];
const BSH_BRANCHES = ['CSE-BSH', 'ECE-BSH', 'EEE-BSH', 'MECH-BSH', 'CIVIL-BSH', 'AI-BSH', 'AIML-BSH', 'DS-BSH', 'CS-BSH', 'IT-BSH'];

const FeedbackExport = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [branch, setBranch] = useState('');
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isBSH, setIsBSH] = useState(false);
  const [bshBranch, setBshBranch] = useState('');

  const handleBSHToggle = (value: boolean) => {
    setIsBSH(value);
    setBranch(''); // Reset branch when toggling
    setBshBranch(''); // Reset BSH branch when toggling
  };

  const fetchResponses = async () => {
    setError('');
    setLoading(true);

    try {
      const params: any = {};
      if (academicYear) params.academicYear = academicYear;
      if (year) params.year = year;
      if (semester) params.semester = semester;
      
      // Handle branch parameter based on BSH toggle
      if (isBSH && bshBranch) {
        params.branch = bshBranch;
        params.isBSH = true;
      } else if (!isBSH && branch) {
        params.branch = branch;
        params.isBSH = false;
      }

      const data = await api.feedback.getResponses(params);
      setResponses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch responses');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!window.XLSX) {
      setError('Excel library not loaded. Please refresh the page.');
      return;
    }

    const wb = window.XLSX.utils.book_new();
    
    // Add metadata sheet
    const metadata = [{
      'Export Date': new Date().toLocaleString(),
      'Academic Year': academicYear || 'All',
      'Year': year || 'All',
      'Semester': semester || 'All',
      'Branch': (isBSH ? bshBranch : branch) || 'All'
    }];
    const metadataSheet = window.XLSX.utils.json_to_sheet(metadata);
    window.XLSX.utils.book_append_sheet(wb, metadataSheet, 'Export Info');

    // Group responses by section and type
    const sections = new Set(responses.map(r => r.section));
    const sectionTheoryGroups: { [section: string]: { [key: string]: number[][] } } = {};
    const sectionLabGroups: { [section: string]: { [key: string]: number[][] } } = {};
    const comments: any[] = [];

    // Process all responses
    responses.forEach((response) => {
      // Collect comments
      if (response.collegeComments || response.departmentComments) {
        comments.push({
          'Timestamp': new Date(response.submittedAt).toLocaleString(),
          'Section': response.section,
          'College Comments': response.collegeComments || '',
          'Department Comments': response.departmentComments || ''
        });
      }

      // Process theory feedback
      response.theoryFeedback?.forEach((theory: any) => {
        const key = `${theory.teacherName} : ${theory.subjectName}`;
        
        // Add to section-specific groups
        if (!sectionTheoryGroups[response.section]) {
          sectionTheoryGroups[response.section] = {};
        }
        if (!sectionTheoryGroups[response.section][key]) {
          sectionTheoryGroups[response.section][key] = [];
        }
        sectionTheoryGroups[response.section][key].push(Object.values(theory.ratings));
      });

      // Process lab feedback
      response.labFeedback?.forEach((lab: any) => {
        const key = `${lab.labTeacherName} : ${lab.labName}`;
        
        // Add to section-specific groups
        if (!sectionLabGroups[response.section]) {
          sectionLabGroups[response.section] = {};
        }
        if (!sectionLabGroups[response.section][key]) {
          sectionLabGroups[response.section][key] = [];
        }
        sectionLabGroups[response.section][key].push(Object.values(lab.ratings));
      });
    });

    // Add border style
    const borderStyle = {
      style: 'thick', // Change from 'thin' to 'medium'
      color: { rgb: '000000' }
    };

    const fullBorder = {
      top: borderStyle,
      bottom: borderStyle,
      left: borderStyle,
      right: borderStyle
    };

    // Helper function to apply borders to a worksheet
    const applyBordersToSheet = (worksheet: any) => {
      const range = window.XLSX.utils.decode_range(worksheet['!ref']);
      
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellRef = window.XLSX.utils.encode_cell({ r: row, c: col });
          if (!worksheet[cellRef]) {
            worksheet[cellRef] = { t: 's', v: '' };
          }
          worksheet[cellRef].s = {
            border: fullBorder,
            alignment: { vertical: 'center', horizontal: 'center' }
          };
        }
      }
    };

    // Apply borders to metadata sheet
    applyBordersToSheet(metadataSheet);

    // Create comments sheet with borders
    if (comments.length > 0) {
      const commentsSheet = window.XLSX.utils.json_to_sheet(comments);
      const commentsCols = [
        { wch: 20 }, // Timestamp
        { wch: 15 }, // Section
        { wch: 40 }, // College Comments
        { wch: 40 }  // Department Comments
      ];
      commentsSheet['!cols'] = commentsCols;
      applyBordersToSheet(commentsSheet);
      window.XLSX.utils.book_append_sheet(wb, commentsSheet, 'Comments');
    }

    // Helper function to process group data with borders
    function processGroupData(groups: { [key: string]: number[][] }) {
      const data: any[] = [];
      
      Object.entries(groups).forEach(([key, ratings]) => {
        // Add header row with merged cells for teacher/subject
        data.push({
          'Subject/Teacher': key,
          'Entry': '',
          ...Object.fromEntries([...Array(10)].map((_, i) => [`Q${i + 1}`, '']))
        });

        // Add column headers for questions
        data.push({
          'Subject/Teacher': '',
          'Entry': 'Response #',
          ...Object.fromEntries([...Array(10)].map((_, i) => [`Q${i + 1}`, `Question ${i + 1}`]))
        });

        // Add individual ratings
        ratings.forEach((rating, index) => {
          data.push({
            'Subject/Teacher': '',
            'Entry': index + 1,
            ...Object.fromEntries(rating.map((r, i) => [`Q${i + 1}`, r]))
          });
        });

        // Calculate and add statistics
        const sums = ratings.reduce((acc, curr) => curr.map((v, i) => acc[i] + v), Array(10).fill(0));
        const count = ratings.length;
        const averages = sums.map(sum => sum / count);
        const percentages = averages.map(avg => (avg / 5) * 100);

        // Add statistics with formatting
        data.push({}, // Empty row for spacing
        {
          'Subject/Teacher': 'Statistics',
          'Entry': 'Total',
          ...Object.fromEntries(sums.map((sum, i) => [`Q${i + 1}`, sum]))
        },
        {
          'Subject/Teacher': '',
          'Entry': 'Average',
          ...Object.fromEntries(averages.map((avg, i) => [`Q${i + 1}`, Number(avg.toFixed(2))]))
        },
        {
          'Subject/Teacher': '',
          'Entry': 'Percentage',
          ...Object.fromEntries(percentages.map((pct, i) => [`Q${i + 1}`, `${pct.toFixed(1)}%`]))
        },
        {}, // Empty row for spacing between subjects
        {});

      });

      return data;
    }

    // Create section-specific sheets with borders
    sections.forEach(section => {
      // Theory sheet
      if (Object.keys(sectionTheoryGroups[section] || {}).length > 0) {
        const sectionTheoryData = processGroupData(sectionTheoryGroups[section]);
        const sectionTheorySheet = window.XLSX.utils.json_to_sheet(sectionTheoryData);
        
        const theoryCols = [
          { wch: 30 }, // Subject/Teacher
          { wch: 12 }, // Entry
          ...Array(10).fill({ wch: 10 }) // Q1-Q10
        ];
        sectionTheorySheet['!cols'] = theoryCols;
        
        // Apply borders to theory sheet
        applyBordersToSheet(sectionTheorySheet);
        
        window.XLSX.utils.book_append_sheet(wb, sectionTheorySheet, `${section} Theory`);
      }

      // Lab sheet
      if (Object.keys(sectionLabGroups[section] || {}).length > 0) {
        const sectionLabData = processGroupData(sectionLabGroups[section]);
        const sectionLabSheet = window.XLSX.utils.json_to_sheet(sectionLabData);
        
        const labCols = [
          { wch: 30 }, // Subject/Teacher
          { wch: 12 }, // Entry
          ...Array(10).fill({ wch: 10 }) // Q1-Q10
        ];
        sectionLabSheet['!cols'] = labCols;
        
        // Apply borders to lab sheet
        applyBordersToSheet(sectionLabSheet);
        
        window.XLSX.utils.book_append_sheet(wb, sectionLabSheet, `${section} Lab`);
      }
    });

    const fileName = `feedback_${(isBSH ? bshBranch : branch) || 'all'}_${academicYear || 'all'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    window.XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl shadow-md p-6 border border-slate-700">
        {/* BSH Toggle moved to top */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Export Filters
          </h2>
          
          <div className="flex items-center gap-3">
            <Switch
              checked={isBSH}
              onChange={handleBSHToggle}
              className={`${
                isBSH ? 'bg-blue-600' : 'bg-slate-600'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
            >
              <span className="sr-only">Enable BSH feedback</span>
              <span
                className={`${
                  isBSH ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
            <span className="text-sm font-medium text-white">
              BSH Feedback
            </span>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g., 2023-2024"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Years</option>
                {/* Show only year 1 for BSH, otherwise show all years */}
                {(isBSH ? [1] : [1, 2, 3, 4]).map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Semesters</option>
                {[1, 2].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Branch
              </label>
              <select
                value={isBSH ? bshBranch : branch}
                onChange={(e) => isBSH ? setBshBranch(e.target.value) : setBranch(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Branches</option>
                {(isBSH ? BSH_BRANCHES : BRANCHES).map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={fetchResponses}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <Filter className="w-4 h-4" />
                Apply Filters
              </>
            )}
          </button>

          <button
            onClick={exportToExcel}
            disabled={responses.length === 0 || loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {responses.length > 0 && (
          <div className="mt-4 text-sm text-slate-400">
            {responses.length} responses found
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackExport;
