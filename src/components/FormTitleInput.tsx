import { Send } from 'lucide-react';
import { motion } from 'framer-motion';

interface FormTitleInputProps {
  title: string;
  setTitle: (title: string) => void;
  loading: boolean;
  error: string;
  onSubmit: () => void;
}

const FormTitleInput = ({ title, setTitle, loading, error, onSubmit }: FormTitleInputProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  // Add handler for title changes
  const handleTitleChange = (value: string) => {
    setTitle(value.toUpperCase());
  };

  return (
    <div className="fixed inset-0 overflow-hidden animate-gradient bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Add animated waves */}
      <div className="absolute inset-0 z-0">
        <div className="wave"></div>
        <div className="wave translate-y-[10px] opacity-50"></div>
        <div className="wave translate-y-[20px] opacity-30"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute top-8"
        >
          <h2 className="text-4xl font-bold text-gray-100 text-center tracking-wider">
            NARASARAOPETA ENGINEERING COLLEGE
            <br />
            <span className="text-3xl">(AUTONOMOUS)</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full mx-4"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gray-900 rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-800"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
                Student Feedback
              </h1>
              <p className="text-gray-400 mt-4 text-base">
                Please enter the feedback form title provided by your coordinator
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="ENTER FORM TITLE"
                  className="w-full px-4 py-4 text-lg bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-transparent outline-none placeholder-gray-500 uppercase"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-800 text-gray-100 py-4 px-6 text-lg rounded-lg font-medium hover:bg-gray-700 focus:ring-4 focus:ring-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Start Feedback'}
              </button>
            </form>

            {error && (
              <div className="mt-6 bg-red-900/20 border border-red-800 text-red-400 px-4 py-4 rounded-lg">
                {error}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default FormTitleInput;