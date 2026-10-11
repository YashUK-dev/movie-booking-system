// Mock seat data that mirrors the shape returned by GET /shows/:showId/seats.
// Used as a fallback when the live API is unavailable.

// ── Seat prices by section ────────────────────────────────────────────────────
// Classic (Standard) rows A-J: flat rate, one price for every seat.
const CLASSIC_SEAT_PRICE = 200;
// Premium Balcony rows K-M: unchanged.
const BALCONY_SEAT_PRICE = 500;

const MAIN_ROWS    = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const BALCONY_ROWS = ['K', 'L', 'M'];
const MAIN_SEATS_PER_ROW    = 12;
const BALCONY_SEATS_PER_ROW = 20;

const mockSeats = [];

// Classic seating rows (A - J, seats 1 to 12)
for (let r = 0; r < MAIN_ROWS.length; r++) {
  const row = MAIN_ROWS[r];
  for (let n = 1; n <= MAIN_SEATS_PER_ROW; n++) {
    mockSeats.push({
      id:     `mock-${row}${n}`,
      row,
      number: n,
      status: 'available',
      price:  CLASSIC_SEAT_PRICE,
    });
  }
}

// Balcony seating rows (K - M, seats 1 to 20 consecutive)
for (let r = 0; r < BALCONY_ROWS.length; r++) {
  const row = BALCONY_ROWS[r];
  for (let n = 1; n <= BALCONY_SEATS_PER_ROW; n++) {
    mockSeats.push({
      id:     `mock-${row}${n}`,
      row,
      number: n,
      status: 'available',
      price:  BALCONY_SEAT_PRICE,
    });
  }
}

export default mockSeats;
