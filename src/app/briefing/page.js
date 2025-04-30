import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Mission Briefing: Le Chiffre",
  description: "Top secret mission briefing on target Le Chiffre",
};

export default function Briefing() {
  return (
    <div className="min-h-screen bg-black text-gray-300 p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        {/* Top Secret Header */}
        <div className="border-b-2 border-red-600 mb-8 pb-4">
          <h1 className="text-red-600 text-center text-4xl font-bold tracking-wider">
            TOP SECRET
          </h1>
          <p className="text-center text-sm">CLEARANCE LEVEL: 00</p>
        </div>
        
        {/* Mission Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2 text-gray-100">MISSION BRIEFING: OPERATION CASINO ROYALE</h2>
          <p className="text-sm text-gray-400">
            AGENT: 007 | DATE: {new Date().toLocaleDateString()} | TIME: {new Date().toLocaleTimeString()}
          </p>
        </div>
        
        {/* Target Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="col-span-1 flex justify-center">
            <div className="w-64 h-auto border border-gray-700 relative">
              <Image
                src="/Le_Chiffre_by_Mads_Mikkelsen.jpg"
                alt="Le Chiffre"
                width={256}
                height={350}
                className="object-cover"
                priority
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2">
                <p className="text-red-500 text-sm text-center">
                  TARGET: Le Chiffre
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-span-2">
            <h3 className="text-xl font-bold mb-4 text-gray-100">TARGET: LE CHIFFRE</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-gray-400 text-sm">REAL NAME:</h4>
                <p>Unknown</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">NATIONALITY:</h4>
                <p>Albanian</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">OCCUPATION:</h4>
                <p>Private banker to terrorist organizations</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">DISTINGUISHING FEATURES:</h4>
                <p>Facial scar over left eye, weeps blood from damaged tear duct</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">KNOWN ASSOCIATES:</h4>
                <p>Valenka (girlfriend), Kratt (bodyguard)</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mission Details */}
        <div className="mb-8 bg-gray-900 p-6 border-l-4 border-red-600">
          <h3 className="text-xl font-bold mb-4 text-gray-100">MISSION OBJECTIVE</h3>
          <p className="mb-4">
            Le Chiffre has recently lost a significant sum of his clients' money in a failed stock market venture. 
            Intelligence suggests he is planning to recoup these losses through a high-stakes poker game at Casino Royale in Montenegro.
          </p>
          <p className="mb-4">
            Your mission is to enter the poker game, defeat Le Chiffre, and force him to seek asylum with MI6, 
            giving us access to his terrorist network and clients.
          </p>
          <p className="font-bold text-red-500">
            AUTHORIZATION: Lethal force is permitted only if absolutely necessary.
          </p>
        </div>
        
        {/* Additional Intelligence */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-gray-100">ADDITIONAL INTELLIGENCE</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Le Chiffre is a mathematical genius with a talent for poker and chess</li>
            <li>He suffers from asthma and carries an inhaler at all times</li>
            <li>Known to be ruthless - has ordered multiple assassinations</li>
            <li>Currently desperate and dangerous due to financial situation</li>
            <li>May attempt to cheat during the poker game</li>
          </ul>
        </div>
        
        {/* Footer */}
        <div className="border-t-2 border-gray-700 pt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            This document will self-destruct in 60 seconds
          </p>
          <Link 
            href="/"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
          >
            Return to HQ
          </Link>
        </div>
      </div>
    </div>
  );
}
