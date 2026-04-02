export default function HowItWorks() {
  return (
    <section className="py-24 px-10 max-w-6xl mx-auto">
      <h2 className="text-4xl font-extrabold mb-10">How it works</h2>

      <div className="grid md:grid-cols-4 gap-6">
        {["Pick spot", "Match ride", "Ride", "Save money"].map((step, i) => (
          <div key={i}>
            <div className="text-5xl text-gray-200 font-bold">{i + 1}</div>
            <h3 className="font-bold">{step}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}