export default function RouteCard() {
  return (
    <div className="bg-green-800 text-white p-8 rounded-2xl">
      <p className="text-xs opacity-60 mb-4">LIVE ROUTES</p>

      <div className="space-y-4">
        <div className="flex justify-between">
          <span>Lekki → VI</span>
          <span className="text-yellow-400">₦2,500</span>
        </div>

        <div className="flex justify-between">
          <span>Yaba → Ikeja</span>
          <span className="text-yellow-400">₦2,000</span>
        </div>
      </div>
    </div>
  );
}