// PlacementJourney.jsx
import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* -----------------------------------------
   Dummy DATA for "Most Hiring Company"
   (You can replace with REAL values)
------------------------------------------*/
const MOST_HIRING_COMPANY = {
  2018: "Infosys",
  2019: "TCS",
  2020: "Reliance Jio",
  2021: "Microsoft",
  2022: "Crest Data",
  2023: "Meditab",
  2024: "Einfochips",
  2025: "Google"
};

function getMostHiringCompany(year) {
  return MOST_HIRING_COMPANY[year] || "N/A";
}

/* -------------------------
  Premium walking-man SVG
--------------------------*/
const WalkingManSVG = ({ walking = true, rotate = 0 }) => (
  <svg
    width="54"
    height="80"
    viewBox="0 0 54 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      transform: `rotate(${rotate}deg)`,
      transition: "transform 0.18s cubic-bezier(.4,2,.6,1)",
      display: "block"
    }}
  >
    {/* Head */}
    <circle cx="27" cy="14" r="10" fill="#4f46e5" stroke="#1f2937" strokeWidth="1.5" />
    {/* Torso */}
    <rect x="22" y="26" width="10" height="22" rx="4" fill="#4f46e5" />
    {/* Arms */}
    <rect x="10" y="30" width="34" height="6" rx="3" fill="#4f46e5" />
    {/* Left leg */}
    <motion.rect
      x="22"
      y="48"
      width="6"
      height="26"
      rx="3"
      fill="#4f46e5"
      animate={{ rotate: walking ? [25, -25, 25] : 0 }}
      transition={{ repeat: walking ? Infinity : 0, duration: 1.05, ease: "linear" }}
      style={{ originX: "25%", originY: "0%" }}
    />
    {/* Right leg */}
    <motion.rect
      x="28"
      y="48"
      width="6"
      height="26"
      rx="3"
      fill="#4f46e5"
      animate={{ rotate: walking ? [-25, 25, -25] : 0 }}
      transition={{ repeat: walking ? Infinity : 0, duration: 1.05, ease: "linear" }}
      style={{ originX: "75%", originY: "0%" }}
    />
  </svg>
);

/* -------------------------
  Data (2018 - 2025)
--------------------------*/
const data = [
  { year: 2018, students: 45, companies: 12 },
  { year: 2019, students: 62, companies: 15 },
  { year: 2020, students: 58, companies: 14 },
  { year: 2021, students: 90, companies: 22 },
  { year: 2022, students: 110, companies: 30 },
  { year: 2023, students: 125, companies: 32 },
  { year: 2024, students: 140, companies: 38 },
  { year: 2025, students: 150, companies: 42 }
];

/* -------------------------
  Constants & helpers
--------------------------*/
const TRACK_WIDTH = 920;
const TRACK_HEIGHT = 340;
const TRACK_TOP = 70;
const TRACK_BOTTOM = TRACK_HEIGHT - 50;
const MAN_SIZE = 54;
const ANIMATION_DURATION = 26;

const COLORS = {
  trackStart: "#818cf8",
  trackMid: "#6366f1",
  trackEnd: "#4f46e5",
  trackShadow: "#e0e7ff",
  markerActive: "#4f46e5",
  markerIdle: "#eef2ff",
  bubbleBg: "rgba(255,255,255,0.70)",
  bubbleBorder: "rgba(79,70,229,0.08)"
};

function getY(val, min, max) {
  const range = max - min || 1;
  return TRACK_BOTTOM - ((val - min) / range) * (TRACK_BOTTOM - TRACK_TOP);
}

function getSmoothPath(points) {
  if (!points || points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    d += ` Q ${midX} ${prev.y} ${curr.x} ${curr.y}`;
  }
  return d;
}

function getSlope(path, length) {
  const delta = 4;
  try {
    const p1 = path.getPointAtLength(Math.max(0, length - delta));
    const p2 = path.getPointAtLength(Math.min(path.getTotalLength(), length + delta));
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  } catch {
    return 0;
  }
}

/* -------------------------
  Component
--------------------------*/
export default function PlacementJourney() {
  const svgPathRef = useRef(null);
  const animationRef = useRef(null);
  const [trackPoints, setTrackPoints] = useState([]);
  const [pathLength, setPathLength] = useState(0);
  const [manProgress, setManProgress] = useState(0);
  const [currentYearIdx, setCurrentYearIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [sliderIdx, setSliderIdx] = useState(null);
  const [showStats, setShowStats] = useState(true);

  /* Track points setup */
  useEffect(() => {
    const minVal = Math.min(...data.map((d) => d.students));
    const maxVal = Math.max(...data.map((d) => d.students));
    const gap = TRACK_WIDTH / (data.length - 1);

    const pts = data.map((d, i) => ({
      x: 40 + i * gap,
      y: getY(d.students, minVal, maxVal)
    }));

    setTrackPoints(pts);
  }, []);

  /* Path length */
  useEffect(() => {
    if (svgPathRef.current) {
      try {
        setPathLength(svgPathRef.current.getTotalLength());
      } catch {
        setPathLength(0);
      }
    }
  }, [trackPoints]);

  /* Animation */
  useEffect(() => {
    let start;
    let lastYearIdx = currentYearIdx;
    let pausedAt = null;

    function animate(ts) {
      if (!start) start = ts;

      if (paused) {
        pausedAt = ts;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      if (pausedAt) {
        start += ts - pausedAt;
        pausedAt = null;
      }

      const elapsed = (ts - start) / 1000;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

      setManProgress(progress);

      const idx = Math.round(progress * (data.length - 1));

      if (idx !== lastYearIdx) {
        setShowStats(false);
        setTimeout(() => setShowStats(true), 140);
        setCurrentYearIdx(idx);
        lastYearIdx = idx;
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setShowStats(true);
      }
    }

    if (sliderIdx !== null) {
      const immediateProgress = sliderIdx / (data.length - 1);
      setManProgress(immediateProgress);
      setCurrentYearIdx(sliderIdx);
      setShowStats(true);
      setSliderIdx(null);
      return;
    }

    setShowStats(false);
    animationRef.current = requestAnimationFrame(animate);

    return () => animationRef.current && cancelAnimationFrame(animationRef.current);
  }, [paused, sliderIdx]);

  /* Man position */
  let manPos = { x: 40, y: TRACK_BOTTOM, rotate: 0 };

  if (svgPathRef.current && pathLength > 0) {
    const length = manProgress * pathLength;
    const pt = svgPathRef.current.getPointAtLength(length);
    manPos.x = pt.x;
    manPos.y = pt.y;
    manPos.rotate = getSlope(svgPathRef.current, length);
  }

  const yearMarkers = trackPoints.map((pt, i) => ({
    ...pt,
    idx: i,
    year: data[i].year
  }));

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex flex-col items-center justify-center py-10 px-4">
      <div className="mt-32 relative w-full max-w-5xl mx-auto">
        {/* Full SVG */}
        <svg
          width={TRACK_WIDTH}
          height={TRACK_HEIGHT}
          className="block mx-auto"
          style={{ overflow: "visible" }}
        >
          <defs>
            <linearGradient id="trackMain" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={COLORS.trackStart} />
              <stop offset="50%" stopColor={COLORS.trackMid} />
              <stop offset="100%" stopColor={COLORS.trackEnd} />
            </linearGradient>
          </defs>

          {/* Main track */}
          <path
            ref={svgPathRef}
            d={getSmoothPath(trackPoints)}
            stroke="url(#trackMain)"
            strokeWidth={9}
            fill="none"
          />

          {/* Year markers */}
          {yearMarkers.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={i === currentYearIdx ? 18 : 14}
                fill={i === currentYearIdx ? COLORS.markerActive : COLORS.markerIdle}
                stroke="#312e81"
                strokeWidth={i === currentYearIdx ? 3 : 1.2}
                style={{
                  transition: "all 220ms ease",
                }}
              />
              <text
                x={pt.x}
                y={pt.y + 6}
                textAnchor="middle"
                fontSize={i === currentYearIdx ? 16 : 13}
                fontWeight={700}
                fill={i === currentYearIdx ? "#fff" : "#4f46e5"}
                style={{ pointerEvents: "none" }}
              >
                {pt.year}
              </text>
            </g>
          ))}
        </svg>

        {/* Walking man */}
        <motion.div
          animate={{
            x: manPos.x - MAN_SIZE / 2,
            y: manPos.y - MAN_SIZE - 6
          }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          style={{
            position: "absolute",
            left: 0,
            top: 0
          }}
        >
          <WalkingManSVG walking={!paused} rotate={manPos.rotate} />
        </motion.div>

        {/* Stats bubble */}
        <AnimatePresence>
          {showStats && yearMarkers[currentYearIdx] && (
            <motion.div
              key={currentYearIdx}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.35 }}
              style={{
                position: "absolute",
                left: 32,
                top: 32,
                zIndex: 50
              }}
            >
              <div
                style={{
                  background: COLORS.bubbleBg,
                  padding: "18px 22px",
                  borderRadius: 20,
                  border: `2px solid ${COLORS.bubbleBorder}`,
                  backdropFilter: "blur(6px)",
                  minWidth: 220
                }}
              >
                <div className="text-indigo-700 font-bold text-xl">
                  {data[currentYearIdx].year}
                </div>

                <div className="mt-2 text-slate-700 font-medium">
                  👨‍🎓 Students Placed:
                  <span className="font-bold text-indigo-600 ml-1">
                    {data[currentYearIdx].students}
                  </span>
                </div>

                <div className="mt-2 text-slate-700 font-medium">
                  🏢 Companies Visited:
                  <span className="font-bold text-indigo-600 ml-1">
                    {data[currentYearIdx].companies}
                  </span>
                </div>

                <div className="mt-3 text-indigo-500 font-semibold">
                  Most Hiring Company:
                  <span className="ml-2 text-indigo-700">
                    {getMostHiringCompany(data[currentYearIdx].year)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-10 flex items-center gap-5">
        {/* Restart */}
        <button
          onClick={() => {
            setManProgress(0);
            setCurrentYearIdx(0);
            setPaused(false);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Restart
        </button>

        {/* Play/Pause */}
        <button
          onClick={() => setPaused(!paused)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {paused ? "Play" : "Pause"}
        </button>

        {/* Slider */}
        <input
          type="range"
          min="0"
          max={data.length - 1}
          value={currentYearIdx}
          onChange={(e) => setSliderIdx(Number(e.target.value))}
          className="w-64"
        />
      </div>
    </div>
  );
}
