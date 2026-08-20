import Hero from "@/components/Hero";
import Thesis from "@/components/Thesis";
import Track from "@/components/Track";
import TrackFeatures from "@/components/TrackFeatures";
import Gates from "@/components/Gates";
import Evaluation from "@/components/Evaluation";
import Agenda from "@/components/Agenda";
import Outcomes from "@/components/Outcomes";
import Eligibility from "@/components/Eligibility";
import Admissions from "@/components/Admissions";

import Donut from "@/components/Donut";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col relative">
      <div className="fixed inset-0 z-5 flex items-center justify-center pointer-events-none">
        <Donut />
      </div>
      <Hero />

      <Thesis />
      <Track />
      <TrackFeatures />
      <Gates />
      <Evaluation />
      <Agenda />
      <Outcomes />
      <Eligibility />
      <Admissions />

      {/* Footer spacing */}
    </main>
  );
}
