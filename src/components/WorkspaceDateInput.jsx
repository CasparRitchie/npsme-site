import React, { useRef } from "react";

export default function WorkspaceDateInput({ value, onChange, min, max, label }) {
  const inputRef = useRef(null);

  function openCalendar() {
    const input = inputRef.current;
    if (!input) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={onChange}
        className="min-w-0 flex-1"
      />
      <button
        type="button"
        className="csv-nps-secondary-link shrink-0 px-3"
        onClick={openCalendar}
        aria-label={label}
        title={label}
      >
        <span aria-hidden="true">📅</span>
      </button>
    </div>
  );
}
