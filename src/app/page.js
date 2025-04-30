import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "MI6 Secure Terminal",
  description: "Secure access terminal for MI6 agents",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-green-500 p-8 font-mono">
      <div className="max-w-4xl mx-auto">
        {/* Terminal Header */}
        <div className="border-b border-green-700 mb-8 pb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-wider">MI6 SECURE TERMINAL</h1>
            <div className="text-sm">
              <p>AGENT: 007</p>
              <p>STATUS: ACTIVE</p>
            </div>
          </div>
        </div>
        
        {/* Terminal Content */}
        <div className="mb-8 bg-black border border-green-700 p-6">
          <div className="mb-6">
            <p className="text-sm mb-2 text-green-400">SYSTEM BOOT SEQUENCE INITIATED...</p>
            <p className="text-sm mb-2 text-green-400">VERIFYING CREDENTIALS...</p>
            <p className="text-sm mb-2 text-green-400">WELCOME, 007.</p>
            <p className="text-sm mb-4 text-green-400">SECURE CONNECTION ESTABLISHED.</p>
            <p className="text-sm mb-2 text-yellow-400">URGENT: NEW MISSION ASSIGNMENT</p>
            <p className="text-sm mb-4 text-green-400">AWAITING CONFIRMATION...</p>
          </div>
          
          <div className="mb-6">
            <p className="text-lg mb-4">INCOMING MESSAGE FROM M:</p>
            <div className="bg-gray-900 p-4 border-l-2 border-green-500">
              <p className="mb-2">007,</p>
              <p className="mb-2">
                We have a situation that requires your immediate attention. A high-profile target has been identified 
                for your next assignment.
              </p>
              <p className="mb-2">
                Review the attached briefing for complete details on the target and mission parameters.
              </p>
              <p>
                -M
              </p>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <Link 
              href="/briefing"
              className="bg-green-800 hover:bg-green-700 text-green-100 px-6 py-3 rounded border border-green-600 transition-colors flex items-center"
            >
              <span className="mr-2">ACCESS MISSION BRIEFING</span>
              <span className="animate-pulse">▶</span>
            </Link>
          </div>
        </div>
        
        {/* Terminal Footer */}
        <div className="text-xs text-green-700 border-t border-green-900 pt-4">
          <p>SECURE TERMINAL v7.0 | ENCRYPTION: ACTIVE | CONNECTION: SECURE</p>
          <p>WARNING: UNAUTHORIZED ACCESS IS PROHIBITED AND PUNISHABLE BY LAW</p>
        </div>
      </div>
    </div>
  );
}
