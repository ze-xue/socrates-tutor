import { Radar, RadarChart as ReRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { KnowledgePoints } from '../types';

interface Props { data: KnowledgePoints; }

const labels = ['审题分析', '知识运用', '逻辑推理', '验证反思'];

export function RadarChart({ data }: Props) {
  const chartData = labels.map(label => ({
    subject: label,
    value: Math.round(((data as any)[label] || 0) * 100),
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReRadar cx="50%" cy="50%" outerRadius="70%" data={chartData}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar name="能力" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="#818cf8" fillOpacity={0.3} />
      </ReRadar>
    </ResponsiveContainer>
  );
}
