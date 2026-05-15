import { TimelineNode } from '../types';

interface Props { nodes: TimelineNode[]; }

const colors: Record<string, string> = {
  clarification: 'bg-blue-500',
  hint: 'bg-amber-500',
  reflection: 'bg-emerald-500',
  challenge: 'bg-purple-500',
};

const names: Record<string, string> = {
  clarification: '澄清',
  hint: '提示',
  reflection: '反思',
  challenge: '挑战',
};

export function TimelinePanel({ nodes }: Props) {
  if (nodes.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-4">暂无轨迹</p>;
  }

  return (
    <div className="space-y-5 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:to-transparent">
      {nodes.map((node, i) => (
        <div key={node.id} className="flex gap-3 items-start">
          <div className={'w-4 h-4 mt-1 rounded-full border-2 border-white shadow shrink-0 ' + (colors[node.type] || 'bg-slate-400')}></div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{names[node.type] || node.type}</span>
              {i === nodes.length - 1 && (
                <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">当前</span>
              )}
            </div>
            <div className="text-sm text-slate-600">{node.fullLabel}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
