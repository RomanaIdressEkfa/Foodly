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
    const d = Math.min(58 + table.capacity * 6, 100);
    return { width: d, height: d };
  }
  if (rowSpan(table) === 2) {
    return { width: 82, height: CELL * 2 + GAP - 62 };
  }
  const s = table.capacity <= 2 ? 68 : 84;
  return { width: s, height: s };
}

// Top-down chair: upholstered seat with the backrest on the side away from
// the table (drawn pointing up; rotated into place per side).
function Chair() {
  return (
    <svg viewBox="0 0 26 24" aria-hidden="true">
      <rect className="chair-back" x="2" y="1" width="22" height="6" rx="3" />
      <rect className="chair-seat" x="4" y="6" width="18" height="16" rx="5" />
      <rect className="chair-shine" x="7" y="9" width="12" height="3" rx="1.5" />
    </svg>
  );
}

const SIDE_ROTATION = { top: 0, right: 90, bottom: 180, left: -90 };

export default function TableShape({ table, active = false, disabled = false, note, onClick }) {
  const size = shapeSize(table);
  const round = table.shape === 'round';

  let chairs;
  if (round) {
    const radius = size.width / 2 + 13;
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
