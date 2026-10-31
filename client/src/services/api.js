import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || '';
const baseURL = rawBaseURL ? rawBaseURL.replace(/\/+$/, '') : '';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const caseApi = {
  // Generate a new mystery
  createCase: async (premise, difficulty) => {
    const response = await api.post('/api/cases', { premise, difficulty });
    return response.data;
  },

  // Get active case data (without solution/culprit flag)
  getCase: async (id) => {
    const response = await api.get(`/api/cases/${id}`);
    return response.data;
  },

  // Discover a specific clue
  discoverClue: async (caseId, clueId) => {
    const response = await api.post(`/api/cases/${caseId}/clues/${clueId}/discover`);
    return response.data;
  },

  // Request the next sequential hint
  requestHint: async (caseId) => {
    const response = await api.post(`/api/cases/${caseId}/hints`);
    return response.data;
  },

  // Submit final accusation
  submitAccusation: async (caseId, suspectId) => {
    const response = await api.post(`/api/cases/${caseId}/accuse`, { suspectId });
    return response.data;
  },

  // Get final case result (after resolution)
  getCaseResult: async (caseId) => {
    const response = await api.get(`/api/cases/${caseId}/result`);
    return response.data;
  },
};

export default api;

