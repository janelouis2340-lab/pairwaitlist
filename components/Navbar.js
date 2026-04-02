export default function Navbar() {
  return (
    <nav className="fixed top-10 w-full bg-white/90 backdrop-blur border-b z-40 px-10 py-4 flex justify-between">
      
      <div className="font-extrabold text-xl text-green-800">
        Pair<span className="text-yellow-500">.</span>
      </div>

      <div className="flex gap-6 items-center">
        <a href="#how" className="text-sm text-gray-600 hover:text-black">
          How it works
        </a>

        <a href="#routes" className="text-sm text-gray-600 hover:text-black">
          Routes
        </a>

        <a href="#faq" className="text-sm text-gray-600 hover:text-black">
          FAQ
        </a>

        <a
          href="#signup"
          className="bg-green-800 text-white px-5 py-2 rounded-full text-sm"
        >
          Join Waitlist
        </a>
      </div>
    </nav>
  );
}