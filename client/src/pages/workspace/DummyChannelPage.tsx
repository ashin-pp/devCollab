import { WorkspaceLayout } from '../../layouts/WorkspaceLayout';
import { MessageSquare } from "lucide-react";

export const DummyChannelPage = () => {
  return (
    <WorkspaceLayout>
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Coming Soon</h2>
          <p className="text-slate-500 max-w-md">
            This feature is currently under development. Stay tuned for updates!
          </p>
        </div>
      </div>
    </WorkspaceLayout>
  );
};
