// API functions for the seat selection screen.
// Uses axiosInstance for live calls; falls back to mock data if the call fails.

import API from './axiosInstance.js';
import mockSeats from '../data/mockSeats.js';

// ------------------------------------------------------------------
// normalizeSeat — single place to adapt the backend shape to our app.
// If the backend field names change, only edit here.
// ------------------------------------------------------------------
function normalizeSeat(raw) {
  return {
    id:     raw.id,
    row:    raw.row,
    number: raw.number,
    status: raw.status,   // "available" | "locked" | "booked"
    price:  raw.price,
  };
}

// ------------------------------------------------------------------
// fetchSeats — GET /shows/:showId/seats
// Returns a normalized array of seats. Falls back to mock data on any error.
// ------------------------------------------------------------------
export async function fetchSeats(showId) {
  try {
    const response = await API.get(`/shows/${showId}/seats`);
    return response.data.map(normalizeSeat);
  } catch (err) {
    // Network down, backend not running, or VITE_API_URL missing — use mock.
    console.warn('[seats] Live API unavailable, using mock data.', err?.message);
    return mockSeats.map(normalizeSeat);
  }
}

// ------------------------------------------------------------------
// lockSeats — POST /shows/:showId/seats/lock  with { seatIds: [...] }
// Throws a descriptive Error (with error.status) so the UI can react.
// ------------------------------------------------------------------
export async function lockSeats(showId, seatIds) {
  try {
    const response = await API.post(`/shows/${showId}/seats/lock`, { seatIds });
    return response.data;
  } catch (err) {
    const status = err?.response?.status;
    const message =
      status === 409
        ? 'One or more seats were just taken. Please choose again.'
        : `Failed to lock seats (HTTP ${status ?? 'network error'}).`;

    const error = new Error(message);
    error.status = status ?? null;
    throw error;
  }
}
