import { Sparkles, FileText } from 'lucide-react';
import { getOpenAIStatus } from '../services/openaiNarrative';

export default function OpenAIStatus() {
  const status = getOpenAIStatus();

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
      status.configured 
        ? 'bg-green-900 bg-opacity-30 border border-green-600 text-green-200' 
        : 'bg-blue-900 bg-opacity-30 border border-blue-600 text-blue-200'
    }`}>
      {status.configured ? (
        <Sparkles className="w-4 h-4" />
      ) : (
        <FileText className="w-4 h-4" />
      )}
      <span>{status.message}</span>
    </div>
  );
}
