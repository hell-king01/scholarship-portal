import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { EligibilityPredictor } from '@/components/EligibilityPredictor';

export const EligibilityPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <EligibilityPredictor />
      </main>
      <BottomNav />
    </div>
  );
};



