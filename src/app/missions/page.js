'use client';

import dynamic from "next/dynamic";

// Import MissionSelectClient with dynamic import
const MissionSelectClient = dynamic(() => import('../components/MissionSelectClient'), { ssr: false });

export default function MissionsPage() {
  return <MissionSelectClient />;
}
