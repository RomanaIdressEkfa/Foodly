import { useEffect, useMemo, useState } from 'react';
import TableShape, { CELL, GAP, rowSpan } from './TableShape.jsx';

// `getState(table)` returns { disabled, note } so the same plan works for the
// customer picker (booked / too small) and the admin editor (everything open).
export default function FloorPlan({ tables, selectedId, onSelect, getState = () => ({}) }) {
  const floors = useMemo(() => {
    const unique = [...new Set(tables.map((t) => t.floor || 'Main floor'))];
    return unique.sort((a, b) => (a === 'Main floor' ? -1 : b === 'Main floor' ? 1 : 0));
  }, [tables]);
  const [floor, setFloor] = useState(floors[0]);

  useEffect(() => {
    if (!floors.includes(floor)) setFloor(floors[0]);
  }, [floors, floor]);

  // Jump to the floor of whatever is selected (e.g. admin picks a Patio table).
  useEffect(() => {
    const selected = tables.find((t) => t._id === selectedId);
    if (selected && selected.floor !== floor) setFloor(selected.floor);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onFloor = tables.filter((t) => (t.floor || 'Main floor') === floor);
  const cols = Math.max(1, ...onFloor.map((t) => t.col));
  const rows = Math.max(1, ...onFloor.map((t) => t.row + rowSpan(t) - 1));

  return (
    <div className="floorplan">
      <div className="floorplan-scroll">
        <div
          className="floorplan-grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${CELL}px)`,
            gridTemplateRows: `repeat(${rows}, ${CELL}px)`,
            gap: GAP,
          }}
        >
          {onFloor.map((t) => {
            const { disabled, note } = getState(t);
            return (
              <div
                key={t._id}
                className="floorplan-cell"
                style={{ gridColumn: t.col, gridRow: `${t.row} / span ${rowSpan(t)}` }}
              >
                <TableShape
                  table={t}
                  active={selectedId === t._id}
                  disabled={disabled}
                  note={note}
                  onClick={disabled ? undefined : () => onSelect?.(t)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {floors.length > 1 && (
        <div className="floor-tabs">
          {floors.map((f) => (
            <button key={f} type="button" className={f === floor ? 'active' : ''} onClick={() => setFloor(f)}>
              {f}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
