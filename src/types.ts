export interface KnowledgePoints {
  '审题分析': number;
  '知识运用': number;
  '逻辑推理': number;
  '验证反思': number;
}

export type SocraticType = 'clarification' | 'hint' | 'reflection' | 'challenge';

export interface AIResponse {
  message: string;
  socratic_type: SocraticType;
  knowledge_points: KnowledgePoints;
  next_expectation: string;
}

export type MessageType = 'text' | 'image' | 'file';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: MessageType;
  fileData?: string;
  fileName?: string;
  socraticType?: SocraticType;
  rawAI?: string;
}

export interface TimelineNode {
  id: string;
  type: SocraticType;
  label: string;
  fullLabel: string;
}

export type PersonaRole = 'patient' | 'humorous';
