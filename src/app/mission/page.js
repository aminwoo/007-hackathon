import MissionClient from '../components/MissionClient';

export const metadata = {
  title: "Mission: Casino Royale",
  description: "Chat with Le Chiffre",
};

export default function Mission() {
  return (
    <div className="min-h-screen bg-black text-gray-300 p-8 font-mono">
      <MissionClient />
    </div>
  );
}
