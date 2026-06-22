export default function Loading({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-[#8B8B9E] text-[14px]">
      <svg className="animate-spin w-5 h-5 text-[#7C3AED]" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
      </svg>
      {text}
    </div>
  );
}
