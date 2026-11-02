// Grid metrics shared with FloorPlan so long tables fill exactly two cells.
export const CELL = 132;
export const GAP = 22;

// Square tables with 6+ seats become long tables spanning two grid rows.
export function rowSpan(table) {
  return table.shape === 'square' && table.capacity >= 6 ? 2 : 1;
}

function squareSeats(capacity) {
  const sides = ['top', 'right', 'bottom', 'left'];
  const perSide = Math.floor(capacity / 4);
  const remainder = capacity % 4;
  const seats = [];
  sides.forEach((side, i) => {
    const count = perSide + (i < remainder ? 1 : 0);
    for (let j = 0; j < count; j++) seats.push({ side, offset: ((j + 1) / (count + 1)) * 100 });
  });
  return seats;
}

// Long tables: one chair at each end, the rest along the two long sides.
function longSeats(capacity) {
  const seats = [{ side: 'top', offset: 50 }, { side: 'bottom', offset: 50 }];
  const sideCount = capacity - 2;
  const left = Math.ceil(sideCount / 2);
  const right = sideCount - left;
  for (let j = 0; j < left; j++) seats.push({ side: 'left', offset: ((j + 1) / (left + 1)) * 100 });
  for (let j = 0; j < right; j++) seats.push({ side: 'right', offset: ((j + 1) / (right + 1)) * 100 });
  return seats;
}

function shapeSize(table) {
  if (table.shape === 'round') {
    // 2→68, 4→80, 6→92, 8→104, 10→116, 12→128 — stays clear of the 154px
    // grid pitch (CELL+GAP) once chairs are added around the edge.
    const d = Math.min(56 + table.capacity * 6, 128);
    return { width: d, height: d };
  }
  if (rowSpan(table) === 2) {
    // Both dimensions scale with capacity (6 seats → shortest/narrowest,
    // 12+ → fills the full 2-row span) so the size difference is obvious,
    // not just a few px of width against a height that never changes.
    const maxH = CELL * 2 + GAP - 62;
    const t = Math.min(1, Math.max(0, (table.capacity - 6) / 6));
    const height = Math.round(maxH * 0.6 + maxH * 0.4 * t);
    const width = Math.round(64 + t * 50);
    return { width, height };
  }
  // 1-2 seats → small, 3-5 seats → a step up.
  const s = table.capacity <= 2 ? 66 : 88;
  return { width: s, height: s };
}

// Top-down chair: upholstered seat with the backrest on the side away from
// the table (drawn pointing up; rotated into place per side).
function Chair() {
  return (
    <svg viewBox="0 0 26 24" aria-hidden="true">
      <rect className="chair-back" x="2" y="0.5" width="22" height="7.5" rx="3.5" />
      <rect className="chair-seat" x="3" y="6.5" width="20" height="17" rx="6.5" />
      <rect className="chair-shine" x="7" y="10" width="12" height="3" rx="1.5" />
    </svg>
  );
}

const SIDE_ROTATION = { top: 0, right: 90, bottom: 180, left: -90 };

export default function TableShape({ table, active = false, disabled = false, note, onClick }) {
  const size = shapeSize(table);
  const round = table.shape === 'round';

  let chairs;
  if (round) {
    const radius = size.width / 2 + 5;
    chairs = Array.from({ length: table.capacity }, (_, i) => {
      const deg = (360 / table.capacity) * i;
      return (
        <span
          key={i}
          className="table-chair chair-round"
          style={{ transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-${radius}px)` }}
        >
          <Chair />
        </span>
      );
    });
  } else {
    const seats = rowSpan(table) === 2 ? longSeats(table.capacity) : squareSeats(table.capacity);
    chairs = seats.map((seat, i) => (
      <span
        key={i}
        className={`table-chair chair-${seat.side}`}
        style={{ '--offset': `${seat.offset}%`, '--rot': `${SIDE_ROTATION[seat.side]}deg` }}
      >
        <Chair />
      </span>
    ));
  }

  const classes = ['table-shape', round ? 'round' : '', active ? 'active' : '', disabled ? 'disabled' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      style={size}
      onClick={onClick}
      disabled={disabled && !onClick}
      aria-pressed={active}
      aria-label={`${table.name}, ${table.capacity} seats${note ? `, ${note}` : ''}`}
    >
      {chairs}
      <span className="t-name">{table.name}</span>
      <span className="t-seats">{note || `${table.capacity} seats`}</span>
    </button>
  );
}
