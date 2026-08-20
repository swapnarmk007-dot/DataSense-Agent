import React from 'react';
import {
  Brain,
  LayoutDashboard,
  Upload,
  MessageSquareCode,
  TableProperties,
  Sparkles,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  FileText,
  Code2,
  CheckCircle2,
  Database
} from 'lucide-react';
import { NavTab, DatasetProfile } from '../types';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  datasetProfile: DatasetProfile | null;
  datasetName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  datasetProfile,
  datasetName
}) => {
  const tabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Dataset', icon: Upload },
    { id: 'chat', label: 'AI Data Chat', icon: MessageSquareCode },
    { id: 'profile', label: 'Data Profile', icon: TableProperties },
    { id: 'clean', label: 'Data Cleaning', icon: Sparkles },
    { id: 'visualize', label: 'Visual Analytics', icon: BarChart3 },
    { id: 'anomalies', label: 'Anomaly Detection', icon: AlertTriangle },
    { id: 'forecast', label: 'Forecasting', icon: TrendingUp },
    { id: 'insights', label: 'AI Insights', icon: Lightbulb },
    { id: 'report', label: 'Report', icon: FileText },
    { id: 'codebase', label: 'Python Repo', icon: Code2 },
  ];

  return (
    <header id="main-header" className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Branding Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm ring-4 ring-blue-50">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">DataSense Agent</h1>
                <span className="text-xs px-2 py-0.5 font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  Agentic AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Autonomous AI Data Analyst &bull; Developed by <span className="font-semibold text-slate-700">Swapna V</span> (Agentic AI Engineer | IPEC Solutions)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {datasetProfile ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium truncate max-w-[140px]" title={datasetName}>
                  {datasetName}
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-600 font-mono">{datasetProfile.rowCount.toLocaleString()} rows</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                <span>No dataset loaded</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav id="navbar-tabs" className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
