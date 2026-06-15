"use client";

import React, { useState, useMemo } from "react";
import { VaultFile } from "@/lib/vault";
import { Clock, Play, Pause, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

interface TimelapseViewProps {
  files: VaultFile[];
}

export default function TimelapseView({ files }: TimelapseViewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrubValue, setScrubValue] = useState(100);

  // Derive global timeline from files
  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      // Fallback to current time if subagent hasn't added createdAt yet
      const timeA = (a.metadata?.createdAt as number) || Date.now();
      const timeB = (b.metadata?.createdAt as number) || Date.now();
      return timeA - timeB;
    });
  }, [files]);

  const timelineData = useMemo(() => {
    if (sortedFiles.length === 0) return [];
    
    // Group cumulatively by day for the sparkline chart
    const dailyCounts: Record<string, number> = {};
    let cumulative = 0;
    
    sortedFiles.forEach(file => {
      const time = (file.metadata?.createdAt as number) || Date.now();
      const date = new Date(time).toLocaleDateString();
      cumulative++;
      dailyCounts[date] = cumulative;
    });

    return Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count
    }));
  }, [sortedFiles]);

  return (
    <div className="w-full h-full p-6 flex flex-col bg-[#050505] text-slate-200" style={{ fontFamily: "monospace" }}>
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <h2 className="text-2xl flex items-center gap-3 text-emerald-400">
          <Clock className="text-emerald-500" /> Vault Timelapse
        </h2>
        <div className="text-sm text-slate-500">
          Scrub through your vault's history
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full gap-8">
        {/* Artistic Growth Sparkline */}
        <div className="h-64 w-full bg-black border border-slate-800 rounded-xl p-4 shadow-2xl relative overflow-hidden">
          <div className="absolute top-4 left-4 flex items-center gap-2 text-slate-400 text-sm z-10">
            <Activity size={16} /> Historical Note Growth
          </div>
          
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ background: '#000', border: '1px solid #333', borderRadius: '8px' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Playback Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-black transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>
            
            <div className="flex-1 flex flex-col gap-2">
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={scrubValue}
                onChange={(e) => setScrubValue(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>Genesis</span>
                <span>Present Day</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
