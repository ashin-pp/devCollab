import React, { useState } from 'react';
import { Bot, X, CheckSquare, Bell, Info, Calendar, FileText, Download, ListTodo, AlertCircle, Clock } from 'lucide-react';

export type AiTab = 'tasks' | 'reminders' | 'notifications' | 'schedule';

interface AiDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: AiTab;
}

const TABS: { id: AiTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'reminders', label: 'Reminders', icon: Bell },
  { id: 'notifications', label: 'Notifications', icon: AlertCircle },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
];

const MOCK_TASKS = [
  { id: 1, name: 'Review auth logic for security vulnerabilities', status: 'pending' },
  { id: 2, name: 'Update API documentation with new endpoints', status: 'pending' },
  { id: 3, name: 'Prepare slides for sprint planning', status: 'pending' },
  { id: 4, name: 'Refactor AiDashboard UI component', status: 'completed' },
];

export const AiDashboardModal: React.FC<AiDashboardModalProps> = ({ isOpen, onClose, defaultTab = 'tasks' }) => {
  const [activeTab, setActiveTab] = useState<AiTab>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Tasks Dashboard</h2>
              <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Agentic AI Assistant
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 flex gap-6 border-b border-slate-200 bg-white overflow-x-auto hide-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 flex items-center gap-2 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
                  isActive 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
          {activeTab === 'tasks' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <th className="py-3 px-6">Task Name</th>
                    <th className="py-3 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_TASKS.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6 text-sm font-medium text-slate-700 flex items-center gap-3">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                          task.status === 'completed' 
                            ? 'bg-blue-600 border-blue-600 text-white' 
                            : 'bg-white border-slate-300 group-hover:border-blue-400 cursor-pointer'
                        }`}>
                          {task.status === 'completed' && <CheckSquare className="w-4 h-4" />}
                        </div>
                        <span className={task.status === 'completed' ? 'line-through text-slate-400' : ''}>
                          {task.name}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                          task.status === 'pending' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {MOCK_TASKS.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <ListTodo className="w-12 h-12 mb-3 text-slate-300" />
                  <p className="text-sm font-medium">No tasks found.</p>
                </div>
              )}
            </div>
          )}

          {activeTab !== 'tasks' && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-slate-200 border-dashed">
              <Bot className="w-12 h-12 mb-3 text-slate-300 opacity-50" />
              <p className="text-sm font-medium text-slate-500">
                Data for <span className="capitalize text-slate-700 font-bold">{activeTab}</span> will be displayed here.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Clock className="w-4 h-4" />
            Last updated just now by Assistant
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Report
            </button>
            <button className="px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors">
              Review All Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
