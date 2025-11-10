import { useState, useRef } from 'react';
import { ChevronRight, ChevronLeft, Send, FileText } from 'lucide-react';
import { api } from '../services/api';
import { Config, TheoryFeedback, LabFeedback, Ratings, QUESTIONS } from '../types';
import FormTitleInput from '../components/FormTitleInput';
import { useSocket } from '../context/SocketContext';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { feedbackAnimations } from '../animations';

const blinkAnimation = `
  @keyframes blink {
    0% { background-color: transparent; }
    50% { background-color: rgba(239, 68, 68, 0.2); }
    100% { background-color: transparent; }
  }
  .unanswered {
    animation: blink 1s 3;
  }
  `;

const customRadioStyle = `
  .custom-radio {
    appearance: none;
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid #334155; /* slate-700 */
    border-radius: 50%;
    background-color: #1e293b; /* slate-800 */
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
  }

  .custom-radio:hover {
    border-color: #60a5fa; /* blue-400 */
  }

  .custom-radio:checked {
    border-color: #3b82f6; /* blue-500 */
    background-color: #3b82f6; /* blue-500 */
  }

  .custom-radio:checked::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background-color: #f8fafc; /* slate-50 */
  }

  .custom-radio:focus {
    outline: 2px solid #60a5fa; /* blue-400 */
    outline-offset: 2px;
  }
`;

const StudentFeedback = () => {
  const { socket } = useSocket();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [config, setConfig] = useState<Config | null>(null);
  const [theoryFeedback, setTheoryFeedback] = useState<TheoryFeedback[]>([]);
  const [labFeedback, setLabFeedback] = useState<LabFeedback[]>([]);
  const [collegeComments, setCollegeComments] = useState('');
  const [departmentComments, setDepartmentComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const loadConfig = async () => {
    if (!title.trim()) {
      setError('Please enter a form title');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await api.config.getByTitle(title);
      setConfig(data);

      const theory: TheoryFeedback[] = data.theorySubjects.map((subject: any) => ({
        teacherName: subject.teacherName,
        subjectName: subject.subjectName,
        ratings: { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Q6: 0, Q7: 0, Q8: 0, Q9: 0, Q10: 0 }
      }));

      const lab: LabFeedback[] = data.labSubjects.map((subject: any) => ({
        labTeacherName: subject.labTeacherName,
        labName: subject.labName,
        ratings: { Q1: 0, Q2: 0, Q3: 0, Q4: 0, Q5: 0, Q6: 0, Q7: 0, Q8: 0, Q9: 0, Q10: 0 }
      }));

      setTheoryFeedback(theory);
      setLabFeedback(lab);
      setStep(1);
    } catch (err: any) {
      setError(err.message || 'Configuration not found');
    } finally {
      setLoading(false);
    }
  };

  const updateTheoryRating = (index: number, question: keyof Ratings, value: number) => {
    const updated = [...theoryFeedback];
    updated[index].ratings[question] = value;
    setTheoryFeedback(updated);
  };

  const updateLabRating = (index: number, question: keyof Ratings, value: number) => {
    const updated = [...labFeedback];
    updated[index].ratings[question] = value;
    setLabFeedback(updated);
  };

  const validateStep = () => {
    let hasUnanswered = false;

    if (step === 1) {
      for (let i = 0; i < theoryFeedback.length; i++) {
        const feedback = theoryFeedback[i];
        for (let q = 1; q <= 10; q++) {
          const qKey = `Q${q}` as keyof Ratings;
          if (feedback.ratings[qKey] === 0) {
            hasUnanswered = true;
            const element = document.getElementById(`theory-${i}-${qKey}`);
            if (element) {
              element.classList.add('unanswered');
              setTimeout(() => {
                element.classList.remove('unanswered');
              }, 3000);
            }
          }
        }
      }
      if (hasUnanswered) {
        toast.error('Please rate all questions for theory subjects', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#FEE2E2',
            color: '#DC2626',
            fontWeight: 500,
          },
        });
        const firstUnanswered = document.querySelector('.unanswered');
        if (firstUnanswered) {
          firstUnanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
      }
    } else if (step === 2) {
      for (let i = 0; i < labFeedback.length; i++) {
        const feedback = labFeedback[i];
        for (let q = 1; q <= 10; q++) {
          const qKey = `Q${q}` as keyof Ratings;
          if (feedback.ratings[qKey] === 0) {
            hasUnanswered = true;
            const element = document.getElementById(`lab-${i}-${qKey}`);
            if (element) {
              element.classList.add('unanswered');
              setTimeout(() => {
                element.classList.remove('unanswered');
              }, 3000);
            }
          }
        }
      }
      if (hasUnanswered) {
        toast.error('Please rate all questions for lab subjects', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#FEE2E2',
            color: '#DC2626',
            fontWeight: 500,
          },
        });
        const firstUnanswered = document.querySelector('.unanswered');
        if (firstUnanswered) {
          firstUnanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step === 1 && labFeedback.length === 0) {
        setStep(3);
      } else {
        setStep(step + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (step === 3 && labFeedback.length === 0) {
      setStep(1);
    } else {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      await api.feedback.submit({
        configTitle: title,
        theoryFeedback,
        labFeedback,
        collegeComments,
        departmentComments
      });

      if (socket) {
        socket.emit('feedback-submitted', {
          branch: config?.branch,
          type: config?.branch === 'BSH' ? 'bsh' : 'department'
        });
      }

      toast.success('Feedback submitted successfully!', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#DCFCE7',
          color: '#16A34A',
          fontWeight: 500,
        },
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit feedback', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#FEE2E2',
          color: '#DC2626',
          fontWeight: 500,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        className="min-h-screen bg-slate-900 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-slate-800 rounded-2xl shadow-xl p-8 text-center max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Send className="w-8 h-8 text-slate-200" />
          </motion.div>
          <motion.h2
            className="text-2xl font-bold text-slate-200 mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Thank You!
          </motion.h2>
          <motion.p
            className="text-slate-400"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your feedback has been submitted successfully.
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-slate-900 py-8 px-4"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={feedbackAnimations.container}
    >
      <Toaster />

      <div className="text-center mt-16 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-200 mb-2">
          NARASARAOPETA ENGINEERING COLLEGE {config?.title || ''}
        </h1>
        <h2 className="text-xl md:text-2xl font-semibold text-slate-300">
          STUDENT FEEDBACK FORM
        </h2>
      </div>

      <AnimatePresence>
        {step > 0 && step < 3 && (
          <motion.div
            className="fixed top-0 left-0 right-0 bg-slate-800/95 border-b border-slate-700 p-2 md:p-3 shadow-md z-50"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="max-w-4xl mx-auto">
              {/* Desktop View */}
              <div className="hidden md:flex items-center justify-center text-sm font-medium text-slate-300">
                <span className="font-bold mr-2 text-slate-200">NOTE:</span>
                <div className="flex gap-4">
                  <span>1: POOR</span>
                  <span>|</span>
                  <span>2: AVERAGE</span>
                  <span>|</span>
                  <span>3: SATISFACTORY</span>
                  <span>|</span>
                  <span>4: GOOD</span>
                  <span>|</span>
                  <span>5: EXCELLENT</span>
                </div>
              </div>

              {/* Mobile View */}
              <div className="md:hidden">
                <div className="text-center font-medium text-gray-700 text-xs">
                  <span className="font-bold block mb-1">NOTE:</span>
                  <div className="grid grid-cols-3 gap-1">
                    <div>1: POOR</div>
                    <div>2: AVERAGE</div>
                    <div>3: SATISFACTORY</div>
                    <div>4: GOOD</div>
                    <div>5: EXCELLENT</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="max-w-4xl mx-auto mt-16 md:mt-20"
        variants={feedbackAnimations.card}
      >
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="form-title"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <FormTitleInput
                title={title}
                setTitle={setTitle}
                loading={loading}
                error={error}
                onSubmit={loadConfig}
              />
            </motion.div>
          ) : (
            <motion.div
              className="bg-slate-800 rounded-2xl shadow-xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Progress Steps */}
              <motion.div className="mb-6" variants={feedbackAnimations.list}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-slate-200">{config?.title}</h2>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((s) => (
                      <motion.div
                        key={s}
                        className={`w-10 h-1 rounded-full ${s <= step ? 'bg-blue-600' : 'bg-gray-300'}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: s * 0.1 }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-slate-400">
                  Step {step} of 3: {step === 1 ? 'Theory Subjects' : step === 2 ? 'Lab Subjects' : 'Comments'}
                </p>
              </motion.div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    className="space-y-6"
                    variants={feedbackAnimations.list}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    {theoryFeedback.map((feedback, index) => (
                      <motion.div
                        key={index}
                        className="border border-slate-700 rounded-lg p-6 bg-slate-800/50"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <h3 className="text-lg font-semibold text-slate-200 mb-2">
                          {feedback.teacherName}
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">{feedback.subjectName}</p>

                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr>
                                <th className="text-left text-sm font-medium text-slate-300 pb-3">Question</th>
                                <th className="text-center text-sm font-medium text-slate-300 pb-3">1</th>
                                <th className="text-center text-sm font-medium text-slate-300 pb-3">2</th>
                                <th className="text-center text-sm font-medium text-slate-300 pb-3">3</th>
                                <th className="text-center text-sm font-medium text-slate-300 pb-3">4</th>
                                <th className="text-center text-sm font-medium text-slate-300 pb-3">5</th>
                              </tr>
                            </thead>
                            <tbody>
                              {QUESTIONS.map((question, qIndex) => {
                                const qKey = `Q${qIndex + 1}` as keyof Ratings;
                                return (
                                  <tr
                                    key={qIndex}
                                    className="border-t border-slate-700"
                                    id={`theory-${index}-${qKey}`}
                                  >
                                    <td className="py-3 text-sm text-slate-300 pr-4">{question}</td>
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                      <td key={rating} className="text-center py-3">
                                        <label className="inline-block cursor-pointer">
                                          <input
                                            type="radio"
                                            name={`theory-${index}-${qKey}`}
                                            checked={feedback.ratings[qKey] === rating}
                                            onChange={() => updateTheoryRating(index, qKey, rating)}
                                            className="custom-radio transform hover:scale-110 transition-transform"
                                          />
                                          <span className="sr-only">Rating {rating}</span>
                                        </label>
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    className="space-y-6"
                    variants={feedbackAnimations.list}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    {labFeedback.map((feedback, index) => (
                      <motion.div
                        key={index}
                        className="border border-slate-700 rounded-lg p-6 bg-slate-800/50"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <h3 className="text-lg font-semibold text-slate-200 mb-2">
                          {feedback.labTeacherName}
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">{feedback.labName}</p>

                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr>
                                <th className="text-left text-sm font-medium text-slate-300 pb-3">Question</th>
                                <th className="text-center text-sm font-medium text-slate-300 pb-3">1</th>
                                <th className="text-center text-sm font-medium text-slate-300 pb-3">2</th>
                                <th className="text-center text-sm font-medium text-slate-300 pb-3">3</th>
                                <th className="text-center text-sm font-medium text-slate-300 pb-3">4</th>
                                <th className="text-center text-sm font-medium text-slate-300 pb-3">5</th>
                              </tr>
                            </thead>
                            <tbody>
                              {QUESTIONS.map((question, qIndex) => {
                                const qKey = `Q${qIndex + 1}` as keyof Ratings;
                                return (
                                  <tr
                                    key={qIndex}
                                    className="border-t border-slate-700"
                                    id={`lab-${index}-${qKey}`}
                                  >
                                    <td className="py-3 text-sm text-slate-300 pr-4">{question}</td>
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                      <td key={rating} className="text-center py-3">
                                        <input
                                          type="radio"
                                          name={`lab-${index}-${qKey}`}
                                          checked={feedback.ratings[qKey] === rating}
                                          onChange={() => updateLabRating(index, qKey, rating)}
                                          className="custom-radio transform hover:scale-110 transition-transform"
                                        />
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Comments about College (Optional)
                      </label>
                      <textarea
                        value={collegeComments}
                        onChange={(e) => setCollegeComments(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400"
                        placeholder="Share your thoughts about the college..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Comments about Department (Optional)
                      </label>
                      <textarea
                        value={departmentComments}
                        onChange={(e) => setDepartmentComments(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400"
                        placeholder="Share your thoughts about the department..."
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <motion.div
                className="flex justify-between mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {step > 1 && (
                  <button
                    onClick={handlePrevious}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>
                )}

                {step < 3 ? (
                  <button
                    onClick={handleNext}
                    className="ml-auto flex items-center gap-2 px-6 py-3 bg-blue-600 text-slate-200 rounded-lg hover:bg-blue-700 transition"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="ml-auto flex items-center gap-2 px-6 py-3 bg-green-600 text-slate-200 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                    {loading ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <style>
        {blinkAnimation}
        {customRadioStyle}
      </style>
    </motion.div>
  );
};

export default StudentFeedback;
