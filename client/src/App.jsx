import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import WaitlistHero from './components/WaitlistHero';
import Features from './components/Features';
import SocialProof from './components/SocialProof';
import Footer from './components/Footer';
import SuccessModal from './components/SuccessModal';

export default function App() {
  const [modalData, setModalData] = useState(null);
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => {
    fetch('/api/waitlist')
      .then((r) => r.json())
      .then((data) => setWaitlistCount(data.count || 0))
      .catch(() => {});
  }, []);

  const handleSuccess = ({ position, count }) => {
    setWaitlistCount(count);
    setModalData({ position, count });
  };

  return (
    <div className="min-h-screen bg-athena-black text-athena-offwhite selection:bg-athena-gold selection:text-white">
      <div className="bg-grain" />
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />

      <Navbar />

      <main>
        <WaitlistHero
          waitlistCount={waitlistCount}
          onSuccess={handleSuccess}
        />
        <Features />
        <SocialProof count={waitlistCount} />
      </main>

      <Footer />

      {modalData && (
        <SuccessModal
          position={modalData.position}
          count={modalData.count}
          onClose={() => setModalData(null)}
        />
      )}
    </div>
  );
}
