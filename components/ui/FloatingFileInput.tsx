'use client';

import { useEffect, useId, useState } from 'react';

interface Props {
  label: string;
  name: string;
  accept?: string;
  multiple?: boolean;
  /** optional file‑name shown on first render (coming from the server) */
  defaultValue?: string;
  /** bubble the `<input>` change event up to the parent */
  onFileChangeAction: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FloatingFileInput({
  label,
  name,
  accept,
  multiple = false,
  defaultValue,
  onFileChangeAction,
}: Props) {
  const id = useId();
  const [selected, setSelected] = useState(defaultValue || 'No file selected');

  /* update if parent changes the defaultValue later */
  useEffect(() => {
    if (defaultValue) setSelected(defaultValue);
  }, [defaultValue]);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelected('No file selected');
      return;
    }
    const names = Array.from(e.target.files).map(f => f.name).join(', ');
    setSelected(names);
    onFileChangeAction(e);                   // bubble up
  };

  return (
    <div className="max-w-[300px] space-y-2">
      <label htmlFor={id} className="block text-sm font-light text-gray-500">
        {label}
      </label>

      <div
        className="relative flex h-10 items-center overflow-hidden border border-gray-300 bg-white px-3 py-2"
        style={{ borderRadius: '8px' }}       /* explicit rounded‑lg */
      >
        {/* transparent file input overlay */}
        <input
          id={id}
          name={name}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handle}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
        />

        {/* visible UI */}
        <span className="flex-none text-xs font-light text-gray-500">
          Choose&nbsp;File
        </span>

        <span className="mx-2 flex-none text-gray-400">|</span>

        <span className="flex-auto truncate text-sm font-normal text-black">
          {selected}
        </span>
      </div>
    </div>
  );
}
