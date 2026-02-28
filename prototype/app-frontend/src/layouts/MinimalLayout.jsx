// Used for public pages like Login, Signup — no sidebar/navbar
export default function MinimalLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#050810] text-white">
      {children}
    </div>
  )
}