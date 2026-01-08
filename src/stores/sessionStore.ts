import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, Library, ProcessingState } from '../types';

interface SessionState {
  library: Library;
  currentSession: Session | null;
  processingState: ProcessingState | null;

  // Session management
  createSession: (session: Session) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  deleteSession: (sessionId: string) => void;
  getSession: (sessionId: string) => Session | undefined;

  // Current session
  setCurrentSession: (session: Session | null) => void;

  // Processing state
  setProcessingState: (state: ProcessingState | null) => void;

  // Topic/Question updates
  updateTopic: (sessionId: string, topicIndex: number, updates: Partial<Session['topics'][0]>) => void;
  updateQuestion: (sessionId: string, topicIndex: number, questionIndex: number, updates: Partial<Session['topics'][0]['questions'][0]>) => void;

  // Score updates
  updateScore: (sessionId: string, updates: Partial<Session['score']>) => void;

  // Clear all data
  clearLibrary: () => void;
}

const generateId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      library: { sessions: [] },
      currentSession: null,
      processingState: null,

      createSession: (session) =>
        set((state) => ({
          library: {
            sessions: [session, ...state.library.sessions],
          },
          currentSession: session,
        })),

      updateSession: (sessionId, updates) =>
        set((state) => ({
          library: {
            sessions: state.library.sessions.map((s) =>
              s.id === sessionId ? { ...s, ...updates } : s
            ),
          },
          currentSession:
            state.currentSession?.id === sessionId
              ? { ...state.currentSession, ...updates }
              : state.currentSession,
        })),

      deleteSession: (sessionId) =>
        set((state) => ({
          library: {
            sessions: state.library.sessions.filter((s) => s.id !== sessionId),
          },
          currentSession:
            state.currentSession?.id === sessionId ? null : state.currentSession,
        })),

      getSession: (sessionId) => {
        const { library } = get();
        return library.sessions.find((s) => s.id === sessionId);
      },

      setCurrentSession: (session) => set({ currentSession: session }),

      setProcessingState: (processingState) => set({ processingState }),

      updateTopic: (sessionId, topicIndex, updates) =>
        set((state) => {
          const updatedSessions = state.library.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            const updatedTopics = [...s.topics];
            updatedTopics[topicIndex] = { ...updatedTopics[topicIndex], ...updates };
            return { ...s, topics: updatedTopics };
          });

          const updatedCurrent =
            state.currentSession?.id === sessionId
              ? {
                  ...state.currentSession,
                  topics: state.currentSession.topics.map((t, i) =>
                    i === topicIndex ? { ...t, ...updates } : t
                  ),
                }
              : state.currentSession;

          return {
            library: { sessions: updatedSessions },
            currentSession: updatedCurrent,
          };
        }),

      updateQuestion: (sessionId, topicIndex, questionIndex, updates) =>
        set((state) => {
          const updatedSessions = state.library.sessions.map((s) => {
            if (s.id !== sessionId) return s;
            const updatedTopics = [...s.topics];
            const updatedQuestions = [...updatedTopics[topicIndex].questions];
            updatedQuestions[questionIndex] = {
              ...updatedQuestions[questionIndex],
              ...updates,
            };
            updatedTopics[topicIndex] = {
              ...updatedTopics[topicIndex],
              questions: updatedQuestions,
            };
            return { ...s, topics: updatedTopics };
          });

          const updatedCurrent =
            state.currentSession?.id === sessionId
              ? {
                  ...state.currentSession,
                  topics: state.currentSession.topics.map((t, ti) =>
                    ti === topicIndex
                      ? {
                          ...t,
                          questions: t.questions.map((q, qi) =>
                            qi === questionIndex ? { ...q, ...updates } : q
                          ),
                        }
                      : t
                  ),
                }
              : state.currentSession;

          return {
            library: { sessions: updatedSessions },
            currentSession: updatedCurrent,
          };
        }),

      updateScore: (sessionId, updates) =>
        set((state) => ({
          library: {
            sessions: state.library.sessions.map((s) =>
              s.id === sessionId
                ? { ...s, score: { ...s.score, ...updates } }
                : s
            ),
          },
          currentSession:
            state.currentSession?.id === sessionId
              ? {
                  ...state.currentSession,
                  score: { ...state.currentSession.score, ...updates },
                }
              : state.currentSession,
        })),

      clearLibrary: () =>
        set({
          library: { sessions: [] },
          currentSession: null,
          processingState: null,
        }),
    }),
    {
      name: 'youtube-learning-sessions',
    }
  )
);

export { generateId };
