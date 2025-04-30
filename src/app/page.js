import HomeClient from './components/HomeClient';

export const metadata = {
  title: "MI6 Secure Terminal",
  description: "Secure access terminal for MI6 agents",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-green-500 p-8 font-mono">
      <HomeClient />
    </div>
  );
}
