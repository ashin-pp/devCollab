import { WorkspaceLayout } from "../../layouts/WorkspaceLayout";
import { MessageSquare, Hash } from "lucide-react";

export const DummyChannelPage = () => {
  return (
    <WorkspaceLayout>
      <div className="flex flex-col h-full bg-white m-6 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="h-16 border-b border-slate-200 flex items-center px-6">
          <Hash className="w-5 h-5 text-slate-400 mr-2" />
          <h2 className="font-bold text-slate-900">development</h2>
          <span className="ml-4 text-sm text-slate-500">Core engineering discussions and updates.</span>
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 shrink-0">
              AC
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-slate-900">Alex Chen</span>
                <span className="text-xs text-slate-500">10:42 AM</span>
              </div>
              <p className="text-slate-700">
                I've just pushed the initial implementation for the Clean Architecture refactor. Please review when you have a chance!
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-600 shrink-0">
              SJ
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-slate-900">Sarah Jenkins</span>
                <span className="text-xs text-slate-500">10:45 AM</span>
              </div>
              <p className="text-slate-700">
                Looks solid! I'll take a deep dive into the dependency injection container this afternoon.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="bg-white border border-slate-300 rounded-lg p-3 flex items-center shadow-sm">
            <input 
              type="text" 
              placeholder="Message #development" 
              className="flex-1 outline-none text-sm"
              disabled
            />
            <button className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-not-allowed">
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
};
