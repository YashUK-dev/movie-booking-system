// TEMPORARY — replace with data passed from the show details page via route
// state (location.state?.show) or fetched from GET /shows/:showId.

const mockShow = {
  movieTitle:  'Sample Movie',
  description: 'A short two-sentence placeholder description of the movie. It gives just enough context to fill the summary card without distracting from the booking flow.',
  theatre:     'Avalanche Cinemas, Screen 1',
  date:        'Sat, 10 Oct 2026',
  time:        '7:30 PM',
  language:    'English',
  format:      '2D',
};

export default mockShow;
