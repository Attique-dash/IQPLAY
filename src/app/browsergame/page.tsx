// app/browsergame/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import BrowserGame from "@/components/BrowserGame";

export default function Page() {
  const router = useRouter();
  
  const handleShowDashboard = () => {
    router.push('/dashboard');
  };

  const handleShowBrowserGame = () => {
    router.push('/browsergame');
  };

  return (
    <BrowserGame 
      onShowDashboard={handleShowDashboard}
      onShowBrowserGame={handleShowBrowserGame}
    />
  );
}