import { create } from 'zustand';
import { ChatMessage, TimelineNode, KnowledgePoints, SocraticType, PersonaRole } from '../types';

interface AppState {
  messages: ChatMessage[];
  timelineNodes: TimelineNode[];
  radarData: KnowledgePoints;
  persona: PersonaRole;
  isLoading: boolean;
  
  setPersona: (p: PersonaRole) => void;
  addMessage: (msg: ChatMessage) => void;
  addTimelineNode: (type: SocraticType, label: string) => string;
  updateRadar: (data: KnowledgePoints) => void;
  setLoading: (loading: boolean) => void;
  popLastMessage: () => void;
  clearAll: () => void;
}

let nodeCounter = 0;

export const useAppStore = create<AppState>((set) => ({
  messages: [],
  timelineNodes: [],
  radarData: { '审题分析': 0, '知识运用': 0, '逻辑推理': 0, '验证反思': 0 },
  persona: 'patient',
  isLoading: false,

  setPersona: (persona) => set({ persona }),

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),

  addTimelineNode: (type, label) => {
    const id = 'tn-' + (++nodeCounter);
    const node: TimelineNode = { id, type, label: label.slice(0, 20) + (label.length > 20 ? '...' : ''), fullLabel: label };
    set((state) => ({ timelineNodes: [...state.timelineNodes, node] }));
    return id;
  },

  updateRadar: (data) => set({ radarData: data }),

  setLoading: (loading) => set({ isLoading: loading }),

  popLastMessage: () => set((state) => {
    if (state.messages.length === 0) return state;
    return { messages: state.messages.slice(0, -1) };
  }),

  clearAll: () => {
    nodeCounter = 0;
    set({
      messages: [],
      timelineNodes: [],
      radarData: { '审题分析': 0, '知识运用': 0, '逻辑推理': 0, '验证反思': 0 },
      isLoading: false
    });
  }
}));
