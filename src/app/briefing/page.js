import BriefingClient from '../components/BriefingClient';

export const metadata = {
  title: "Mission Briefing: Le Chiffre",
  description: "Top secret mission briefing on target Le Chiffre",
};

export default function Briefing() {
  return (
    <div className="min-h-screen bg-black text-gray-300 p-8 font-mono">
      <BriefingClient />
    </div>
  );
}
