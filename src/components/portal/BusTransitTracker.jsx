import React, { useState, useEffect } from 'react';
import {
  Compass,
  Phone,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Navigation,
  RefreshCw,
  User,
  Users,
} from 'lucide-react';
import { useSchoolData } from '../../context/SchoolDataContext';

const BusTransitTracker = () => {
  const { schoolData } = useSchoolData();
  const { transitBus } = schoolData;
  const [liveMinutes, setLiveMinutes] = useState(9);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulated live countdown tick
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveMinutes((prev) => (prev > 1 ? prev - 1 : 9));
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  const handleSimulateRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Telemetry Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden">
        {/* Subtle Ambient Pulse */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                Live GPS Transit Telemetry
              </span>
              <span className="text-xs text-slate-400 font-mono">• {transitBus.busNo}</span>
            </div>
            <h3 className="text-2xl font-bold mt-1 text-slate-800 dark:text-slate-100">
              {transitBus.routeNo}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Current Status: <strong className="text-amber-500">{transitBus.currentStatus}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* ETA Countdown Badge */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center min-w-[120px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                ETA at Your Stop
              </span>
              <div className="text-2xl font-bold font-mono text-amber-500 mt-0.5">
                {liveMinutes} Mins
              </div>
            </div>

            {/* Speedometer */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center min-w-[100px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Speed
              </span>
              <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-0.5">
                {transitBus.speedKmH} km/h
              </div>
            </div>

            {/* Refresh Satellite Button */}
            <button
              type="button"
              onClick={handleSimulateRefresh}
              className="p-3 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Ping GPS Satellite"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Crew Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Driver in Charge</span>
              <strong className="text-slate-800 dark:text-slate-200">{transitBus.driverName}</strong>
            </div>
            <a
              href={`tel:${transitBus.driverPhone}`}
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
              title="Call Driver"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Transit Helper</span>
            <strong className="text-slate-800 dark:text-slate-200">{transitBus.helperName}</strong>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Vehicle Specification</span>
            <strong className="text-slate-800 dark:text-slate-200">{transitBus.capacity}</strong>
          </div>
        </div>
      </div>

      {/* Interactive Transit Stops Timeline */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <h4 className="font-bold text-base text-slate-800 dark:text-slate-100 mb-6">
          Morning Route 3 Stops Progression Timeline
        </h4>

        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {transitBus.stops.map((stop, idx) => {
            const isCompleted = stop.status === 'completed';
            const isApproaching = stop.status === 'approaching';
            const isDestination = stop.status === 'destination';

            return (
              <div key={idx} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* Timeline node */}
                <span
                  className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : isApproaching
                      ? 'bg-amber-500 border-amber-300 text-white animate-pulse'
                      : isDestination
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 border-slate-400 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h5
                      className={`font-bold text-sm ${
                        isApproaching
                          ? 'text-amber-500'
                          : isCompleted
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {stop.name}
                    </h5>
                    {stop.current && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500 text-white shadow-xs">
                        Your Boarding Stop
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Scheduled: {stop.time}</span>
                </div>

                <div className="text-xs font-semibold">
                  {isCompleted && <span className="text-emerald-500">Departed on Schedule</span>}
                  {isApproaching && (
                    <span className="text-amber-500 font-bold flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 animate-bounce" />
                      Approaching in {liveMinutes} Mins
                    </span>
                  )}
                  {!isCompleted && !isApproaching && (
                    <span className="text-slate-400">Scheduled Stop</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BusTransitTracker;

