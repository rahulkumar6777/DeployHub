import { useState } from 'react'

export default function FaqItem({ q, a, delay = 0 }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="reveal bg-[#111827] border border-white/5 rounded-xl overflow-hidden"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-medium text-sm">{q}</span>
        <span
          className={`text-[#00e5ff] text-xl leading-none transition-transform duration-200 ${
            open ? 'rotate-45' : ''
          }`}
        >
          +
        </span>
      </button>

      {open && (
        <div className="px-6 pb-5 text-sm text-gray-400 leading-relaxed">
          {a}
        </div>
      )}
    </div>
  )
}