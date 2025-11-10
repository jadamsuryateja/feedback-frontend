import { Config } from '../types';
import { Edit, Calendar, School, Users, BookOpen, Trash2 } from 'lucide-react';

interface ConfigCardProps {
  config: Config;
  onEdit: (config: Config) => void;
  onDelete?: (config: Config) => void;
  showDelete?: boolean;
}

const ConfigCard = ({ config, onEdit, onDelete, showDelete = false }: ConfigCardProps) => {
  return (
    <div className="group bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl p-5 border border-slate-700 hover:border-slate-600 transition-all duration-300 relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header Section */}
      <div className="relative flex justify-between items-start mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2 group-hover:text-blue-400 transition-colors">
            {config.title}
          </h3>
          <span className="inline-block px-2.5 py-1 text-xs font-medium text-blue-400 bg-blue-500/10 rounded-full">
            {config.branch}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(config)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          {showDelete && onDelete && (
            <button
              onClick={() => onDelete(config)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Academic Year</p>
            <p className="text-sm font-medium text-white">{config.academicYear}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <School className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Year & Semester</p>
            <p className="text-sm font-medium text-white">Year {config.year}, Sem {config.semester}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Section</p>
            <p className="text-sm font-medium text-white">{config.section}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Subjects</p>
            <p className="text-sm font-medium text-white">
              {config.theorySubjects.length} Theory, {config.labSubjects.length} Lab
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigCard;