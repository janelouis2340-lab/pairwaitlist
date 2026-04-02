import SignupBox from "./SignupBox";
import RouteCard from "./RouteCard";

export default function Hero() {
  return (
    <section className="min-h-screen pt-40 px-10 grid md:grid-cols-2 gap-16 max-w-6xl mx-auto">
      
      <div>
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full inline-block mb-6 text-sm">
          ● Now onboarding riders
        </div>

        <h1 className="text-6xl font-extrabold leading-tight mb-6">
          Commute <span className="text-green-700">differently</span>
        </h1>

        <p className="text-gray-600 mb-8">
          Shared rides from places you actually want to be.
        </p>

        <SignupBox />
      </div>

      <RouteCard />
    </section>
  );
}