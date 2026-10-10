import { useEffect } from 'react';

import { motion, AnimatePresence } from 'motion/react';
import { useNetworkStore } from './store/useNetworkStore';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewView } from './views/OverviewView';
import { LiveMonitorView } from './views/LiveMonitorView';
import { FiveMinuteView } from './views/FiveMinuteView';
import { HourlyView } from './views/HourlyView';
import { DailyView } from './views/DailyView';
import { MonthlyView } from './views/MonthlyView';
import { YearlyView } from './views/YearlyView';
import { TopDaysView } from './views/TopDaysView';
import { HeatmapView } from './views/HeatmapView';
import { CompareView } from './views/CompareView';
import { SettingsView } from './views/SettingsView';
import { HelpView } from './views/HelpView';

export function App() {
  const {
    activeTab,
    fetchInterfaces,
    fetchVnstatData,
    fetchPercentileReport,
    initLiveMonitor,
  } = useNetworkStore();

  useEffect(() => {
    // Initial data fetch
    fetchInterfaces();
    fetchVnstatData();
    fetchPercentileReport();

    // Start background live stream listener
    let cleanup: (() => void) | undefined;
    initLiveMonitor().then((unsub) => {
      cleanup = unsub;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const renderView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'live':
        return <LiveMonitorView />;
      case 'fiveminute':
        return <FiveMinuteView />;
      case 'hourly':
        return <HourlyView />;
      case 'daily':
        return <DailyView />;
      case 'monthly':
        return <MonthlyView />;
      case 'yearly':
        return <YearlyView />;
      case 'top':
        return <TopDaysView />;
      case 'heatmap':
        return <HeatmapView />;
      case 'compare':
        return <CompareView />;
      case 'settings':
        return <SettingsView />;
      case 'help':
        return <HelpView />;
      default:
        return <OverviewView />;
    }
  };


  return (
    <AppLayout>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{
            type: 'spring',
            bounce: 0,
            duration: 0.25,
          }}
          className="w-full"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  );
}

export default App;
