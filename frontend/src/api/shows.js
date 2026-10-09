// TEMPORARY — replace the body of getShowDetails with a real GET /shows/:showId
// call (via axiosInstance) once the endpoint exists, or remove it entirely if
// the previous page passes the show through route state (location.state?.show).

import mockShow from '../data/mockShow.js';

/**
 * Returns show details for the given showId.
 * Priority: route state → mock fallback (no real endpoint yet).
 *
 * @param {string} _showId - reserved for the real API call
 * @param {object|null} routeStateShow - value of location.state?.show if available
 */
export async function getShowDetails(_showId, routeStateShow = null) {
  if (routeStateShow) return routeStateShow;
  // TODO: replace with axiosInstance.get(`/shows/${_showId}`).then(r => r.data)
  return mockShow;
}
