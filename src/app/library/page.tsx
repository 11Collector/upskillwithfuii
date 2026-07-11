"use client";

import { useState, useEffect, useRef } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  BookOpen, Clock, ArrowRight, BookMarked, Target,
  Crown, Sparkles, LayoutGrid, Wallet, Briefcase, ChevronRight, CheckCircle2,
  Search, Plus, Trash2, Loader2, Copy, Check, FileText, RefreshCw, Brain, Lock, Settings, X, HelpCircle
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// ✅ 1. นำเข้าข้อมูล
import { mockArticles } from "@/constants/article";
import { db, auth, storage, googleProvider } from "@/lib/firebase";
import { doc, getDoc, onSnapshot, collection, addDoc, updateDoc, deleteDoc, query, orderBy, setDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

// 🎨 2. Themes
const CATEGORY_THEMES: Record<string, { icon: any; color: string; bgColor: string; borderColor: string }> = {
  "ทั้งหมด": {
    icon: <LayoutGrid size={18} />,
    color: "text-slate-400",
    bgColor: "bg-white/5",
    borderColor: "border-white/10"
  },
  "หนังสือ": {
    icon: <BookOpen size={20} />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20"
  },
  "พัฒนาตัวเอง": {
    icon: <Sparkles size={20} />,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20"
  },
  "การเงิน & ลงทุน": {
    icon: <Wallet size={20} />,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/20"
  },
  "ธุรกิจ": {
    icon: <Briefcase size={20} />,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20"
  }
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
};

interface GraphNode {
  id: string;
  title: string;
  category: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface GraphLink {
  source: string;
  target: string;
  type: "wiki" | "ai";
  reason?: string;
  score?: number;
}

interface GraphViewProps {
  notes: any[];
  onSelectNote: (note: any) => void;
  onClose: () => void;
  aiSuggestions: any[];
  onTriggerAiScan: () => void;
  isAiScanning: boolean;
  isProMember: boolean;
  freeScansUsed: number;
}

const GraphView: React.FC<GraphViewProps> = ({
  notes,
  onSelectNote,
  onClose,
  aiSuggestions,
  onTriggerAiScan,
  isAiScanning,
  isProMember,
  freeScansUsed
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [hoveredLink, setHoveredLink] = useState<GraphLink | null>(null);
  const [showAiList, setShowAiList] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgradeToPro = async () => {
    if (isUpgrading) return;
    if (!auth.currentUser) {
      alert("กรุณาเข้าสู่ระบบก่อนครับ");
      return;
    }
    try {
      setIsUpgrading(true);
      const idToken = await auth.currentUser.getIdToken(true);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ plan: "monthly" }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("เกิดข้อผิดพลาด: " + (data.error || "ไม่สามารถติดต่อ Stripe ได้"));
        setIsUpgrading(false);
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert("ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง");
      setIsUpgrading(false);
    }
  };

  const nodesRef = useRef<GraphNode[]>([]);
  const nodeRefs = useRef<Record<string, SVGGElement | null>>({});
  const linkRefs = useRef<Record<string, SVGLineElement | null>>({});
  const pulseRefs = useRef<Record<string, SVGCircleElement | null>>({});
  const draggedNodeIndexRef = useRef<number>(-1);

  // Parse links (Wiki + AI)
  const links: GraphLink[] = [];
  notes.forEach((note) => {
    if (!note.content) return;
    const wikiLinkRegex = /\[\[(.*?)\]\]/g;
    let match;
    while ((match = wikiLinkRegex.exec(note.content)) !== null) {
      const targetTitle = match[1]?.trim();
      if (targetTitle) {
        const targetNote = notes.find((n: any) => n.title?.toLowerCase() === targetTitle.toLowerCase());
        if (targetNote && targetNote.id !== note.id) {
          const exists = links.some(
            (l) =>
              (l.source === note.id && l.target === targetNote.id) ||
              (l.source === targetNote.id && l.target === note.id)
          );
          if (!exists) {
            links.push({ source: note.id, target: targetNote.id, type: "wiki" });
          }
        }
      }
    }
  });

  aiSuggestions.forEach((sug) => {
    const sourceExists = notes.some((n: any) => n.id === sug.source);
    const targetExists = notes.some((n: any) => n.id === sug.target);
    if (sourceExists && targetExists) {
      const exists = links.some(
        (l) =>
          (l.source === sug.source && l.target === sug.target) ||
          (l.source === sug.target && l.target === sug.source)
      );
      if (!exists) {
        links.push({
          source: sug.source,
          target: sug.target,
          type: "ai",
          reason: sug.reason,
          score: sug.score
        });
      }
    }
  });

  // Setup nodes & simulation loop
  useEffect(() => {
    const w = containerRef.current?.clientWidth || 800;
    const h = containerRef.current?.clientHeight || 600;

    const existingNodes = nodesRef.current;
    const newNodes: GraphNode[] = notes.map((note, index) => {
      const found = existingNodes.find((n) => n.id === note.id);
      const wordCount = (note.content || "").trim().split(/\s+/).length;
      const radius = Math.max(8, Math.min(22, 8 + Math.sqrt(wordCount)));
      if (found) {
        return {
          ...found,
          title: note.title || "บันทึกไม่มีชื่อ",
          category: note.category || "พัฒนาตัวเอง",
          radius
        };
      }
      const angle = notes.length > 0 ? (index / notes.length) * 2 * Math.PI : 0;
      const dist = 100 + Math.random() * 80;
      return {
        id: note.id,
        title: note.title || "บันทึกไม่มีชื่อ",
        category: note.category || "พัฒนาตัวเอง",
        x: w / 2 + Math.cos(angle) * dist,
        y: h / 2 + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius,
      };
    });
    nodesRef.current = newNodes;

    // Spatial Hash Grid parameters
    const cellSize = 120;
    let animationFrameId = 0;
    const timeStart = Date.now();

    const animate = () => {
      const currentW = containerRef.current?.clientWidth || 800;
      const currentH = containerRef.current?.clientHeight || 600;
      const time = (Date.now() - timeStart) * 0.005;

      // 1. Clear and construct Spatial Grid
      const grid: Record<string, GraphNode[]> = {};
      newNodes.forEach((node) => {
        const cellX = Math.floor(node.x / cellSize);
        const cellY = Math.floor(node.y / cellSize);
        const cellKey = `${cellX},${cellY}`;
        if (!grid[cellKey]) grid[cellKey] = [];
        grid[cellKey].push(node);
      });

      // 2. Repulsion forces using Spatial Hashing (O(N) average complexity)
      newNodes.forEach((nodeA) => {
        const cellX = Math.floor(nodeA.x / cellSize);
        const cellY = Math.floor(nodeA.y / cellSize);

        // Check self cell + 8 neighbor cells
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            const neighborKey = `${cellX + dx},${cellY + dy}`;
            const neighbors = grid[neighborKey];
            if (neighbors) {
              neighbors.forEach((nodeB) => {
                if (nodeA.id === nodeB.id) return;
                
                const deltaX = nodeB.x - nodeA.x;
                const deltaY = nodeB.y - nodeA.y;
                const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY) || 1;
                const minDist = nodeA.radius + nodeB.radius + 65;
                if (dist < minDist) {
                  const force = (minDist - dist) * 0.06;
                  const fx = (deltaX / dist) * force;
                  const fy = (deltaY / dist) * force;
                  nodeA.vx -= fx;
                  nodeA.vy -= fy;
                }
              });
            }
          }
        }
      });

      // 3. Spring attractive force for links
      links.forEach((link) => {
        const sourceNode = newNodes.find((n) => n.id === link.source);
        const targetNode = newNodes.find((n) => n.id === link.target);
        if (sourceNode && targetNode) {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const desiredDist = link.type === "ai" ? 140 : 100;
          const stiffness = link.type === "ai" ? 0.03 : 0.045;
          const force = (dist - desiredDist) * stiffness;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          sourceNode.vx += fx;
          sourceNode.vy += fy;
          targetNode.vx -= fx;
          targetNode.vy -= fy;
        }
      });

      // 4. Category soft clustering forces
      const categories = ["พัฒนาตัวเอง", "หนังสือ", "การเงิน & ลงทุน", "ธุรกิจ"];
      const categoryCenters: Record<string, { x: number; y: number; count: number }> = {};
      categories.forEach((cat) => {
        categoryCenters[cat] = { x: 0, y: 0, count: 0 };
      });
      newNodes.forEach((node) => {
        if (categoryCenters[node.category]) {
          categoryCenters[node.category].x += node.x;
          categoryCenters[node.category].y += node.y;
          categoryCenters[node.category].count += 1;
        }
      });
      newNodes.forEach((node) => {
        const center = categoryCenters[node.category];
        if (center && center.count > 1) {
          const avgX = center.x / center.count;
          const avgY = center.y / center.count;
          const dx = avgX - node.x;
          const dy = avgY - node.y;
          node.vx += dx * 0.006;
          node.vy += dy * 0.006;
        }
      });

      // 5. Apply velocities and damping
      newNodes.forEach((node, idx) => {
        if (idx === draggedNodeIndexRef.current) return;
        const dx = currentW / 2 - node.x;
        const dy = currentH / 2 - node.y;
        node.vx += dx * 0.005;
        node.vy += dy * 0.005;

        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.85;
        node.vy *= 0.85;
      });

      // 6. Direct SVG DOM modifications for maximum performance (60 FPS bypass virtual DOM)
      newNodes.forEach((node) => {
        const gElem = nodeRefs.current[node.id];
        if (gElem) {
          gElem.setAttribute("transform", `translate(${node.x}, ${node.y})`);
        }
      });

      links.forEach((link) => {
        const sourceNode = newNodes.find((n) => n.id === link.source);
        const targetNode = newNodes.find((n) => n.id === link.target);
        if (sourceNode && targetNode) {
          const lineKey = `${link.source}-${link.target}`;
          const lineElem = linkRefs.current[lineKey];
          if (lineElem) {
            lineElem.setAttribute("x1", String(sourceNode.x));
            lineElem.setAttribute("y1", String(sourceNode.y));
            lineElem.setAttribute("x2", String(targetNode.x));
            lineElem.setAttribute("y2", String(targetNode.y));
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [notes, aiSuggestions]);

  // Dragging handlers
  let isDraggingBg = false;
  let dragStartMouseX = 0;
  let dragStartMouseY = 0;
  let dragStartPanX = 0;
  let dragStartPanY = 0;

  // Core unified dragging logic helpers (shared between Mouse and Touch events)
  const simulateDown = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const worldX = ((clickX - panX - rect.width / 2) / scale) + rect.width / 2;
    const worldY = ((clickY - panY - rect.height / 2) / scale) + rect.height / 2;

    const nodes = nodesRef.current;
    let clickedNodeIndex = -1;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const dx = worldX - node.x;
      const dy = worldY - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= node.radius + 5) {
        clickedNodeIndex = i;
        break;
      }
    }

    if (clickedNodeIndex !== -1) {
      draggedNodeIndexRef.current = clickedNodeIndex;
    } else {
      isDraggingBg = true;
      dragStartMouseX = clientX;
      dragStartMouseY = clientY;
      dragStartPanX = panX;
      dragStartPanY = panY;
    }
  };

  const simulateMove = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const worldX = ((mouseX - panX - rect.width / 2) / scale) + rect.width / 2;
    const worldY = ((mouseY - panY - rect.height / 2) / scale) + rect.height / 2;

    if (draggedNodeIndexRef.current !== -1) {
      const node = nodesRef.current[draggedNodeIndexRef.current];
      if (node) {
        node.x = worldX;
        node.y = worldY;
        node.vx = 0;
        node.vy = 0;
      }
    } else if (isDraggingBg) {
      const dx = clientX - dragStartMouseX;
      const dy = clientY - dragStartMouseY;
      setPanX(dragStartPanX + dx);
      setPanY(dragStartPanY + dy);
    } else {
      // 1. Check if hovering a node mathematically (with tap target padding)
      let foundNode: GraphNode | null = null;
      const nodes = nodesRef.current;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const dx = worldX - node.x;
        const dy = worldY - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= node.radius + 15) { // 15px tap/hover buffer
          foundNode = node;
          break;
        }
      }
      setHoveredNode(foundNode);

      if (foundNode) {
        setHoveredLink(null);
      } else {
        // Find hovered link (if no node hovered)
        let hoveredL: GraphLink | null = null;
        for (let i = 0; i < links.length; i++) {
          const link = links[i];
          const sourceNode = nodesRef.current.find((n) => n.id === link.source);
          const targetNode = nodesRef.current.find((n) => n.id === link.target);
          if (sourceNode && targetNode) {
            const x0 = worldX;
            const y0 = worldY;
            const x1 = sourceNode.x;
            const y1 = sourceNode.y;
            const x2 = targetNode.x;
            const y2 = targetNode.y;
            
            const l2 = (x2-x1)**2 + (y2-y1)**2;
            let t = ((x0 - x1) * (x2 - x1) + (y0 - y1) * (y2 - y1)) / l2;
            t = Math.max(0, Math.min(1, t));
            const projX = x1 + t * (x2 - x1);
            const projY = y1 + t * (y2 - y1);
            const distToLine = Math.sqrt((x0 - projX)**2 + (y0 - projY)**2);
            
            if (distToLine < 8) {
              hoveredL = link;
              break;
            }
          }
        }
        setHoveredLink(hoveredL);
      }
    }
  };

  const simulateUp = () => {
    draggedNodeIndexRef.current = -1;
    isDraggingBg = false;
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    simulateDown(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    simulateMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    simulateUp();
  };

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
      simulateDown(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
      simulateMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    simulateUp();
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomIntensity = 0.08;
    const zoomFactor = e.deltaY < 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);
    setScale((prev) => Math.max(0.3, Math.min(3, prev * zoomFactor)));
  };

  const getNodeColor = (cat: string) => {
    if (cat === "หนังสือ") return "#10b981"; // emerald
    if (cat === "การเงิน & ลงทุน") return "#ec4899"; // rose
    if (cat === "ธุรกิจ") return "#6366f1"; // indigo
    return "#f59e0b"; // amber (พัฒนาตัวเอง)
  };

  return (
    <div ref={containerRef} className="w-full flex-1 min-h-[500px] relative overflow-hidden bg-[#0B0F19] rounded-[2.5rem] border border-slate-800 shadow-inner flex flex-col justify-between select-none">
      {/* 🌌 SVG Graph View */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <defs>
          {/* Neon glow filters */}
          {["#10b981", "#6366f1", "#ec4899", "#f59e0b", "#06b6d4"].map((color) => (
            <filter key={color} id={`glow-${color.toLowerCase().replace("#", "")}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Space Grid Coordinates background */}
        <g opacity="0.15">
          <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#gridPattern)" />
        </g>

        {/* Transform Matrix Group (Zoom + Pan) */}
        <g
          transform={`translate(${panX + (svgRef.current?.clientWidth || 800) / 2}, ${panY + (svgRef.current?.clientHeight || 600) / 2}) scale(${scale}) translate(${-((svgRef.current?.clientWidth || 800) / 2)}, ${-((svgRef.current?.clientHeight || 600) / 2)})`}
        >
          {/* Explicit layer groups for strict depth-ordering (lines under circles) */}
          <g id="links-layer">
            {/* 1. Links / Connecting paths */}
            {links.map((link, idx) => {
              const lineKey = `${link.source}-${link.target}`;
              const isHovered = hoveredLink === link ||
                                (hoveredNode && (hoveredNode.id === link.source || hoveredNode.id === link.target));
              const sourceNode = notes.find((n: any) => n.id === link.source);
              const sourceColor = sourceNode ? getNodeColor(sourceNode.category) : "#6366f1";
              const strokeColor = isHovered 
                ? (link.type === "ai" ? "#06b6d4" : sourceColor)
                : (link.type === "ai" ? "rgba(6,182,212,0.45)" : `${sourceColor}60`);
              const filterVal = isHovered
                ? `url(#glow-${(link.type === "ai" ? "#06b6d4" : sourceColor).toLowerCase().replace("#", "")})`
                : undefined;

              const srcNodeState = nodesRef.current.find((n) => n.id === link.source);
              const trgNodeState = nodesRef.current.find((n) => n.id === link.target);

              return (
                <g key={idx}>
                  <line
                    ref={(el) => { linkRefs.current[lineKey] = el; }}
                    x1={srcNodeState ? srcNodeState.x : undefined}
                    y1={srcNodeState ? srcNodeState.y : undefined}
                    x2={trgNodeState ? trgNodeState.x : undefined}
                    y2={trgNodeState ? trgNodeState.y : undefined}
                    stroke={strokeColor}
                    strokeWidth={isHovered ? (link.type === "ai" ? 3.5 : 3) : (link.type === "ai" ? 2 : 1.8)}
                    strokeDasharray={link.type === "ai" ? "5,5" : undefined}
                    filter={filterVal}
                    pointerEvents="none"
                    className="transition-[stroke,stroke-width,filter] duration-300"
                  />
                </g>
              );
            })}
          </g>

          <g id="nodes-layer">
            {/* 2. Nodes / Cognitive Orbs */}
            {notes.map((note) => {
              const isHovered = hoveredNode?.id === note.id;
              const color = getNodeColor(note.category);
              const nodeState = nodesRef.current.find((n) => n.id === note.id);
              const initialTransform = nodeState 
                ? `translate(${nodeState.x}, ${nodeState.y})` 
                : undefined;

              return (
                <g
                  key={note.id}
                  ref={(el) => { nodeRefs.current[note.id] = el; }}
                  transform={initialTransform}
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    const node = nodesRef.current.find((n) => n.id === note.id);
                    if (node) setHoveredNode(node);
                  }}
                  onMouseLeave={() => setHoveredNode(null)}
                  onDoubleClick={() => onSelectNote(note)}
                >
                  {/* Glowing Outer Halo */}
                  <circle
                    r={isHovered ? 40 : 25}
                    style={{ fill: color, opacity: isHovered ? 0.15 : 0.05 }}
                    filter={`url(#glow-${color.toLowerCase().replace("#", "")})`}
                    className="transition-all duration-300 animate-pulse-subtle"
                  />
                  {/* Core Circle with strict opaque fill inline override */}
                  <circle
                    r={isHovered ? 14 : 10}
                    stroke={color}
                    strokeWidth={isHovered ? 3 : 2}
                    style={{ fill: isHovered ? "#FFFFFF" : "#131a2a", fillOpacity: 1 }}
                    className="transition-all duration-300"
                  />
                  {/* Title */}
                  <text
                    y="22"
                    textAnchor="middle"
                    fill={isHovered ? "#FFFFFF" : "rgba(255,255,255,0.65)"}
                    fontSize={isHovered ? "10px" : "8.5px"}
                    fontWeight={isHovered ? "900" : "700"}
                    className="transition-all duration-200 select-none pointer-events-none font-sans"
                  >
                    {note.title && note.title.length > 14
                      ? note.title.substring(0, 12) + "..."
                      : note.title || "ไม่มีชื่อ"}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>
      {/* SYSTEM OVERLAYS */}
      <div className="absolute top-4 left-4 md:left-6 z-10 flex items-center gap-4">
        {/* Mobile-Friendly Back Button to Notes */}
        <button
          onClick={onClose}
          className="py-1.5 px-3 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:bg-slate-850 hover:border-slate-650 text-white flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <span>←</span> กลับไปหน้าโน้ต
        </button>

        {/* SCI-FI Stats Fluff (Desktop Only) */}
        <div className="hidden md:flex items-center gap-3 select-none pointer-events-none opacity-40">
          <span className="text-[9px] font-black font-mono uppercase tracking-widest text-slate-500">SYSTEM: ACTIVE</span>
          <span className="text-[9px] font-black font-mono uppercase tracking-widest text-slate-500">COORD: {panX.toFixed(0)}, {panY.toFixed(0)}</span>
          <span className="text-[9px] font-black font-mono uppercase tracking-widest text-slate-500">ZOOM: {(scale * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 md:right-6 z-10 flex items-center gap-1.5 md:gap-2">
        <button
          onClick={() => setScale((s) => Math.min(3, s + 0.15))}
          className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:bg-slate-850 hover:border-slate-650 text-white flex items-center justify-center text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          title="Zoom In"
        >
          ＋
        </button>
        <button
          onClick={() => setScale((s) => Math.max(0.3, s - 0.15))}
          className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:bg-slate-850 hover:border-slate-650 text-white flex items-center justify-center text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          title="Zoom Out"
        >
          －
        </button>
        <button
          onClick={() => { setScale(1); setPanX(0); setPanY(0); }}
          className="px-2.5 h-8 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:bg-slate-850 hover:border-slate-650 text-slate-300 flex items-center justify-center text-[9px] font-black uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer"
        >
          รีเซ็ต
        </button>
        {/* Desktop Close Button (Redundant) */}
        <button
          onClick={onClose}
          className="hidden md:flex w-8 h-8 rounded-xl bg-red-650/80 border border-red-500/40 hover:bg-red-600 hover:border-red-500 text-white items-center justify-center shadow-md transition-all active:scale-95 cursor-pointer"
          title="Close Graph"
        >
          <X size={14} />
        </button>
      </div>

      {/* Interactive Mobile Tooltip: Tap node once to open edit */}
      {hoveredNode && (
        <div className="absolute top-16 left-4 right-4 md:right-auto md:left-6 z-10 bg-slate-900/95 border border-slate-700/60 p-4 rounded-2xl max-w-xs shadow-xl backdrop-blur-md animate-fade-in pointer-events-auto select-text text-left">
          <span className="inline-block text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 mb-2">
            {hoveredNode.category}
          </span>
          <h4 className="text-xs font-black text-white leading-snug mb-1.5">{hoveredNode.title}</h4>
          <p className="text-[10px] text-slate-400 font-medium leading-normal mb-2.5">
            💡 ดับเบิลคลิก หรือกดปุ่มด้านล่างเพื่อแก้ไขโน้ตนี้
          </p>
          <button
            onClick={() => onSelectNote(hoveredNode)}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider text-center cursor-pointer transition-colors"
          >
            เปิดแก้ไขโน้ต
          </button>
        </div>
      )}

      {!hoveredNode && hoveredLink?.type === "ai" && hoveredLink.reason && (
        <div className="absolute top-16 left-4 right-4 md:right-auto md:left-6 z-10 bg-slate-950/95 border border-cyan-800 p-4 rounded-2xl max-w-xs shadow-xl backdrop-blur-md animate-fade-in pointer-events-none select-none text-left">
          <span className="inline-block text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-700/40 mb-2">
            ✨ AI Link {hoveredLink.score ? `• สัมพันธ์ ${hoveredLink.score}%` : ""}
          </span>
          <p className="text-[10px] text-[#A5F3FC] font-bold leading-relaxed">
            {hoveredLink.reason}
          </p>
        </div>
      )}

      {/* ℹ️ Collapsible Legend Card */}
      {!showLegend && !showAiList && (
        <button
          onClick={() => setShowLegend(true)}
          className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-10 px-3 py-2 bg-slate-950/90 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <HelpCircle size={12} /> สัญลักษณ์
        </button>
      )}
      
      {showLegend && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:bottom-6 md:left-6 z-10 bg-slate-950/95 border border-slate-800 p-4 rounded-3xl w-auto md:w-56 shadow-xl backdrop-blur-md text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-400">สัญลักษณ์แผนผัง</h4>
              <button
                onClick={() => setShowLegend(false)}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer p-0.5"
              >
                <X size={12} />
              </button>
            </div>
            <div className="space-y-2 text-[9px] font-bold text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]" />
                <span>พัฒนาตัวเอง</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
                <span>หนังสือ</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899] shadow-[0_0_8px_#ec4899]" />
                <span>การเงิน & ลงทุน</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1] shadow-[0_0_8px_#6366f1]" />
                <span>ธุรกิจ</span>
              </div>
              <div className="h-px bg-slate-850 my-2" />
              <div className="flex items-center gap-2">
                <span className="w-4 h-[3px] rounded bg-gradient-to-r from-amber-500 via-[#6366f1] to-emerald-500" />
                <span>ลิงก์ที่คุณเขียน ([[ ]])</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-[2px] border-t-2 border-dashed border-[#06b6d4]" />
                <span>✨ วิเคราะห์เชื่อมโยงโดย AI</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowLegend(false)}
            className="mt-3.5 py-1.5 w-full text-center bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer border border-slate-800 hover:border-slate-700"
          >
            ซ่อนคำอธิบาย
          </button>
        </div>
      )}

      {/* 🧠 Responsive AI suggestions panel */}
      {!showAiList && !showLegend && (
        <button
          onClick={() => setShowAiList(true)}
          className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-10 px-3 py-2 bg-slate-950/90 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <span>✨</span> รายการเชื่อมโยง AI {aiSuggestions.length > 0 && `(${aiSuggestions.length})`}
        </button>
      )}
      {showAiList && (
        <div className="absolute bottom-4 right-4 left-4 md:left-auto md:bottom-6 md:right-6 z-10 bg-slate-950/95 border border-slate-800 p-4 rounded-3xl w-auto md:w-72 shadow-xl backdrop-blur-md text-left max-h-[250px] md:max-h-64 overflow-y-auto no-scrollbar flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>🧠</span> AI Brain Connection
              </h4>
              <button
                onClick={() => setShowAiList(false)}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer p-0.5"
                title="ปิด"
              >
                <X size={12} />
              </button>
            </div>
            <p className="text-[9px] text-slate-500 font-bold mb-3">
              สแกนสมองด้วย AI เพื่อค้นหาจุดเชื่อมโยงของไอเดียที่สัมพันธ์กันอย่างอัจฉริยะ
            </p>

            {aiSuggestions.length === 0 ? (
              <div className="bg-slate-900/50 rounded-xl p-2.5 border border-slate-850 text-[9px] text-slate-400 font-medium leading-relaxed mb-3">
                📝 <strong className="text-slate-300">วิธีสร้างลิงก์สมอง:</strong><br />
                พิมพ์เครื่องหมาย <code className="text-indigo-400 bg-indigo-500/10 px-1 rounded">[[</code> ในช่องจดโน้ตเพื่อค้นหาและเชื่อมโยงโน้ตอื่นๆ เข้าหากันแบบคู่ความรู้
              </div>
            ) : (
              <div className="space-y-1.5 max-h-24 md:max-h-32 overflow-y-auto mb-3 pr-0.5 no-scrollbar">
                <span className="text-[8px] font-black text-pink-500 block uppercase tracking-wider">เชื่อมโยงที่พบแล้ว ({aiSuggestions.length}):</span>
                {aiSuggestions.map((sug: any, i: number) => {
                  const srcNote = notes.find((n: any) => n.id === sug.source);
                  const trgNote = notes.find((n: any) => n.id === sug.target);
                  return (
                    <div key={i} className="bg-pink-950/20 border border-pink-500/10 rounded-xl p-2 text-[9px] text-pink-100 font-semibold leading-snug">
                      💡 <strong className="text-white">{srcNote?.title || "บันทึก A"}</strong> เชื่อมโยงกับ <strong className="text-white">{trgNote?.title || "บันทึก B"}</strong>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (!isProMember && freeScansUsed >= 3) {
                setShowUpgradeModal(true);
              } else {
                onTriggerAiScan();
              }
            }}
            disabled={isAiScanning}
            className="w-full py-2 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAiScanning ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                กำลังสแกนสมอง...
              </>
            ) : (
              <>
                <span>✨</span> AI Brain Scan {!isProMember && (freeScansUsed < 3 ? `(ฟรีอีก ${3 - freeScansUsed} ครั้ง)` : " (ต้องใช้ PRO)")}
              </>
            )}
          </button>
        </div>
      )}

      {/* 👑 Sleek PRO Upgrade Modal */}
      {showUpgradeModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-violet-500/20 rounded-3xl p-5 shadow-2xl text-center flex flex-col justify-between overflow-hidden">
            {/* Background Gradient Orbs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-20 blur-3xl rounded-full pointer-events-none" />

            <div>
              {/* Close Button */}
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-1 cursor-pointer z-10"
              >
                <X size={14} />
              </button>

              {/* Premium Crown Badge */}
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)] mb-3">
                <Crown size={20} className="fill-white" />
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-sm font-black text-white tracking-wide mb-1.5">
                ปลดล็อกสมองอัจฉริยะขั้นสุดด้วย PRO
              </h3>
              <p className="text-[9.5px] text-slate-400 font-bold leading-relaxed mb-4">
                วิเคราะห์เชื่อมโยงความรู้ทุกมิติ ค้นหาจุดสัมพันธ์ของไอเดียที่คาดไม่ถึงด้วยระบบ AI Brain Scan
              </p>

              {/* Premium Value Props */}
              <div className="space-y-2 text-left mb-5">
                <div className="flex items-start gap-2.5 bg-slate-900/50 border border-slate-850 p-2.5 rounded-xl">
                  <span className="text-xs mt-0.5">🧠</span>
                  <div>
                    <h5 className="text-[9.5px] font-black text-violet-300 uppercase tracking-wide">AI Brain Scan</h5>
                    <p className="text-[8.5px] text-slate-400 font-bold">สแกนเชื่อมโยงความสัมพันธ์ของความรู้ทั้งหมดในระบบด้วย AI</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-slate-900/50 border border-slate-850 p-2.5 rounded-xl">
                  <span className="text-xs mt-0.5">♾️</span>
                  <div>
                    <h5 className="text-[9.5px] font-black text-violet-300 uppercase tracking-wide">สร้างคลังความรู้ไม่จำกัด</h5>
                    <p className="text-[8.5px] text-slate-400 font-bold">จดสรุปหนังสือ คอร์สเรียน และบันทึกความคิดได้จุใจไร้ขีดจำกัด</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-slate-900/50 border border-slate-850 p-2.5 rounded-xl">
                  <span className="text-xs mt-0.5">⚡</span>
                  <div>
                    <h5 className="text-[9.5px] font-black text-violet-300 uppercase tracking-wide">Interactive Graph View</h5>
                    <p className="text-[8.5px] text-slate-400 font-bold">มองเห็นเครือข่ายไอเดียเชื่อมต่อถึงกันแบบ Visual ตอบสนองได้สมบูรณ์</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Actions */}
            <div className="space-y-1.5 z-10">
              <button
                onClick={handleUpgradeToPro}
                disabled={isUpgrading}
                className="w-full py-2 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md hover:shadow-violet-500/20 transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isUpgrading ? (
                  <>
                    <Loader2 size={11} className="animate-spin" />
                    กำลังไปหน้าชำระเงิน...
                  </>
                ) : (
                  <>
                    <Crown size={11} className="fill-white" /> อัปเกรดเป็น PRO ตอนนี้
                  </>
                )}
              </button>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer border border-slate-850 transition-colors"
              >
                ยังไม่สนใจ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function LibraryContent() {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const [statusFilter, setStatusFilter] = useState("ทั้งหมด");
  const [readArticles, setReadArticles] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isProMember, setIsProMember] = useState(false);
  const [hasEbookAccess, setHasEbookAccess] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // --- 🧠 Second Brain Notes States ---
  const [activeView, setActiveView] = useState<"library" | "notes">("library");
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("พัฒนาตัวเอง");
  const [searchNoteQuery, setSearchNoteQuery] = useState("");
  const [filterNoteCategory, setFilterNoteCategory] = useState("ทั้งหมด");
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeAiAction, setActiveAiAction] = useState<"summarize" | "coaching" | "quote" | null>(null);
  const [copyStatus, setCopyStatus] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [mobileNotesView, setMobileNotesView] = useState<"list" | "editor">("list");
  const [isCreatingNoteFromUrl, setIsCreatingNoteFromUrl] = useState(false);
  const [noteFontSize, setNoteFontSize] = useState<"sm" | "base" | "lg">("base");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // --- 🛰️ Upgraded Brain Graph & Autocomplete States ---
  const [showGraphView, setShowGraphView] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteQuery, setAutocompleteQuery] = useState("");
  const [autocompleteIndex, setAutocompleteIndex] = useState(-1);
  const [autocompleteActiveIdx, setAutocompleteActiveIdx] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [freeScansUsed, setFreeScansUsed] = useState(0);

  // Load cached AI suggestions
  useEffect(() => {
    if (!user) {
      setAiSuggestions([]);
      return;
    }
    const cached = localStorage.getItem(`ai_suggestions_${user.uid}`);
    if (cached) {
      try {
        setAiSuggestions(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached AI suggestions", e);
      }
    }
  }, [user]);

  const handleCallAiScan = async () => {
    if (!user || notes.length < 2) {
      alert("✨ กรุณาสร้างโน้ตอย่างน้อย 2 ใบขึ้นไปเพื่อทำการสแกนระบบความสัมพันธ์ครับ");
      return;
    }

    // Bypass check: allow if Pro OR freeScansUsed is under 3
    if (!isProMember && freeScansUsed >= 3) {
      alert("✨ ฟีเจอร์ AI Brain Scan วิเคราะห์ความเชื่อมโยง เป็นสิทธิ์เฉพาะสมาชิก PRO\n\nสามารถอัปเดตสมาชิกที่หน้าแดชบอร์ดได้ครับ");
      return;
    }

    setIsAiScanning(true);
    try {
      const idToken = await auth.currentUser?.getIdToken(true);
      
      const notesSummary = notes.map(n => ({
        id: n.id,
        title: n.title || "ไม่มีชื่อ",
        category: n.category || "พัฒนาตัวเอง",
        snippet: (n.content || "").replace(/[#*`_-]/g, "").slice(0, 1200)
      }));

      const promptText = `นี่คือรายการโน้ตทั้งหมดในสมองที่สองของผู้ใช้:\n${JSON.stringify(notesSummary, null, 2)}\n\nโปรดทำการจับคู่เชื่อมโยงไอเดียที่สัมพันธ์กัน และส่งคำตอบคืนเป็น JSON เท่านั้นตามกฎ`;

      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          prompt: promptText,
          type: "second_brain_scan"
        })
      });

      if (!response.ok) {
        throw new Error("AI Scan failed");
      }

      const data = await response.json();
      let suggestions = [];
      try {
        const cleanedText = data.quote.replace(/```json|```/g, "").trim();
        suggestions = JSON.parse(cleanedText);
      } catch (parseErr) {
        console.error("Failed to parse AI JSON response:", parseErr, data.quote);
        const arrayMatch = data.quote.match(/\[\s*\{[\s\S]*\}\s*\]/);
        if (arrayMatch) {
          suggestions = JSON.parse(arrayMatch[0]);
        } else {
          throw new Error("AI returned invalid JSON formatting");
        }
      }

      if (Array.isArray(suggestions)) {
        setAiSuggestions(suggestions);
        localStorage.setItem(`ai_suggestions_${user.uid}`, JSON.stringify(suggestions));

        // Increment freeScansUsed in Firestore for non-Pro members
        if (!isProMember) {
          const nextCount = freeScansUsed + 1;
          setFreeScansUsed(nextCount);
          try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
              freeScansUsed: nextCount
            });
          } catch (dbErr) {
            console.error("Failed to update freeScansUsed in Firestore:", dbErr);
          }
        }

        alert("✨ AI สแกนวิเคราะห์ความเชื่อมโยงเสร็จสิ้นเรียบร้อย! สามารถดูเส้นประเรืองแสงในโหมดแผนผังได้เลยครับ");
      } else {
        throw new Error("Invalid output format");
      }
    } catch (error: any) {
      console.error("AI Scan error:", error);
      alert("❌ เกิดข้อผิดพลาดในการสแกนสมองด้วย AI: " + error.message);
    } finally {
      setIsAiScanning(false);
    }
  };

  const handleSelectAutocomplete = (linkedNote: any) => {
    const editor = document.getElementById("note-content-editor") as HTMLTextAreaElement;
    if (!editor) return;
    
    const start = autocompleteIndex;
    const end = editor.selectionStart;
    const value = noteContent;
    
    const replacement = `[[${linkedNote.title}]] `;
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    setNoteContent(newValue);
    setShowAutocomplete(false);
    
    setTimeout(() => {
      editor.focus();
      const newCursorPos = start + replacement.length;
      editor.selectionStart = editor.selectionEnd = newCursorPos;
    }, 0);
  };

  // Load note font size from localStorage
  useEffect(() => {
    if (!isMounted) return;
    const savedSize = localStorage.getItem("note_font_size");
    if (savedSize === "sm" || savedSize === "base" || savedSize === "lg") {
      setNoteFontSize(savedSize);
    }
  }, [isMounted]);

  const handleFontSizeChange = (size: "sm" | "base" | "lg") => {
    setNoteFontSize(size);
    localStorage.setItem("note_font_size", size);
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    const matchingNotesForAutocomplete = notes.filter((n) => {
      if (selectedNote && n.id === selectedNote.id) return false;
      return n.title?.toLowerCase().includes(autocompleteQuery.toLowerCase());
    });

    if (showAutocomplete) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setAutocompleteActiveIdx((prev) => (prev + 1) % Math.max(1, matchingNotesForAutocomplete.length));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setAutocompleteActiveIdx((prev) => (prev - 1 + matchingNotesForAutocomplete.length) % Math.max(1, matchingNotesForAutocomplete.length));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const targetNote = matchingNotesForAutocomplete[autocompleteActiveIdx];
        if (targetNote) {
          handleSelectAutocomplete(targetNote);
        } else {
          setShowAutocomplete(false);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowAutocomplete(false);
        return;
      }
    }

    if (e.key === "Tab") {
      e.preventDefault();
      // Insert 4 spaces
      const newValue = value.substring(0, start) + "    " + value.substring(end);
      setNoteContent(newValue);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    } else if (e.key === "Enter") {
      // Find the current line the cursor is on
      const beforeCursor = value.substring(0, start);
      const lastNewLine = beforeCursor.lastIndexOf("\n");
      const currentLine = beforeCursor.substring(lastNewLine + 1);

      // Check if current line starts with bullet patterns, like "- ", "• ", "* ", "1/ ", "2/ ", "    " (indents)
      const listMatch = currentLine.match(/^(\s*(?:-\s|•\s|\*\s|\d+\/\s))/);
      if (listMatch) {
        e.preventDefault();
        const prefix = listMatch[1];
        
        // If the line is empty except for the prefix (e.g. user pressed enter on an empty bullet to exit), remove it
        if (currentLine.trim() === prefix.trim()) {
          const newValue = value.substring(0, lastNewLine + 1) + "\n" + value.substring(end);
          setNoteContent(newValue);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = lastNewLine + 2;
          }, 0);
          return;
        }

        let nextPrefix = prefix;
        // If it's a numbered list (e.g., "1/ "), increment it!
        const numberMatch = prefix.match(/^(\s*)(\d+)(\/\s)/);
        if (numberMatch) {
          const indent = numberMatch[1];
          const nextNum = parseInt(numberMatch[2], 10) + 1;
          const suffix = numberMatch[3];
          nextPrefix = `${indent}${nextNum}${suffix}`;
        }

        const newValue = value.substring(0, start) + "\n" + nextPrefix + value.substring(end);
        setNoteContent(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + nextPrefix.length;
        }, 0);
      }
    }
  };

  // Derived state sync when newNote or noteId query param is present
  const newNoteParam = searchParams.get("newNote") === "true";
  const targetNoteId = searchParams.get("noteId");
  // Trigger auth modal if query params are present but user is not logged in and auth loading has completed
  useEffect(() => {
    if (!isMounted || authLoading) return;
    if ((newNoteParam || targetNoteId) && !user) {
      setShowAuthModal(true);
    }
  }, [isMounted, authLoading, newNoteParam, targetNoteId, user]);

  // Handle auto-navigation to editor view when url query params are set and user is logged in
  useEffect(() => {
    if (!isMounted || authLoading) return;
    if (user && (newNoteParam || targetNoteId)) {
      setActiveView("notes");
      setMobileNotesView("editor");
      if (newNoteParam) {
        setIsCreatingNoteFromUrl(true);
      }
    }
  }, [isMounted, authLoading, user, newNoteParam, targetNoteId]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 🆕 Second Brain Notes Listener
  useEffect(() => {
    if (!isMounted || !user) {
      setNotes([]);
      setSelectedNote(null);
      return;
    }

    const notesRef = collection(db, "users", user.uid, "second_brain");
    const q = query(notesRef, orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotes = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setNotes(fetchedNotes);

      setSelectedNote((prev: any) => {
        const urlNoteId = searchParams.get("noteId");
        if (urlNoteId) {
          const target = fetchedNotes.find((n) => n.id === urlNoteId);
          if (target) return target;
        }
        if (prev) {
          const updated = fetchedNotes.find((n) => n.id === prev.id);
          return updated || fetchedNotes[0] || null;
        }
        return fetchedNotes[0] || null;
      });
    }, (error) => {
      console.error("Error fetching notes:", error);
    });

    return () => unsubscribe();
  }, [isMounted, user, searchParams]);

  // 🆕 Create note from query param
  useEffect(() => {
    if (!isMounted || !user) return;

    const params = new URLSearchParams(window.location.search);
    const shouldCreateNewNote = params.get("newNote") === "true";

    if (shouldCreateNewNote) {
      const createEmptyNote = async () => {
        try {
          const notesRef = collection(db, "users", user.uid, "second_brain");
          const createdAtStr = new Date().toISOString();
          const docRef = await addDoc(notesRef, {
            title: "บันทึกที่ไม่มีชื่อ",
            content: "",
            category: "พัฒนาตัวเอง",
            createdAt: createdAtStr,
            updatedAt: createdAtStr
          });

          setActiveView("notes");
          setMobileNotesView("editor");
          setSelectedNote({
            id: docRef.id,
            title: "บันทึกที่ไม่มีชื่อ",
            content: "",
            category: "พัฒนาตัวเอง",
            createdAt: createdAtStr,
            updatedAt: createdAtStr
          });

          // Clear query param
          params.delete("newNote");
          const newRelativePathQuery = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
          window.history.replaceState(null, "", newRelativePathQuery);
        } catch (err) {
          console.error("Failed to auto-create note from query:", err);
        } finally {
          setIsCreatingNoteFromUrl(false);
        }
      };

      createEmptyNote();
    }
  }, [isMounted, user]);

  // 🆕 Clean noteId from query param once note is loaded
  useEffect(() => {
    if (!isMounted) return;
    const urlNoteId = searchParams.get("noteId");
    if (urlNoteId && selectedNote && selectedNote.id === urlNoteId) {
      const params = new URLSearchParams(window.location.search);
      params.delete("noteId");
      const newRelativePathQuery = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState(null, "", newRelativePathQuery);
    }
  }, [isMounted, selectedNote?.id, searchParams]);

  // Sync selected note fields to local input states
  useEffect(() => {
    if (selectedNote) {
      setNoteTitle(selectedNote.title || "");
      setNoteContent(selectedNote.content || "");
      setNoteCategory(selectedNote.category || "พัฒนาตัวเอง");
    } else {
      setNoteTitle("");
      setNoteContent("");
      setNoteCategory("พัฒนาตัวเอง");
    }
  }, [selectedNote?.id]);

  // Auto-save note changes with debounce
  useEffect(() => {
    if (!user || !selectedNote) return;

    const isChanged =
      noteTitle !== (selectedNote.title || "") ||
      noteContent !== (selectedNote.content || "") ||
      noteCategory !== (selectedNote.category || "พัฒนาตัวเอง");

    if (!isChanged) return;

    setIsSaving(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const noteRef = doc(db, "users", user.uid, "second_brain", selectedNote.id);
        await updateDoc(noteRef, {
          title: noteTitle.trim() || "บันทึกที่ไม่มีชื่อ",
          content: noteContent,
          category: noteCategory,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error auto-saving note:", error);
      } finally {
        setIsSaving(false);
      }
    }, 1200);

    return () => clearTimeout(delayDebounce);
  }, [noteTitle, noteContent, noteCategory, user, selectedNote?.id]);

  const deleteCurrentNoteIfEmpty = async () => {
    if (!user || !selectedNote) return;
    const isTitleDefault = !noteTitle.trim() || noteTitle === "บันทึกที่ไม่มีชื่อ";
    const isContentEmpty = !noteContent.trim();
    if (isTitleDefault && isContentEmpty) {
      try {
        const noteRef = doc(db, "users", user.uid, "second_brain", selectedNote.id);
        await deleteDoc(noteRef);
      } catch (error) {
        console.error("Failed to delete empty note on exit:", error);
      }
    }
  };

  const handleSelectNote = async (n: any) => {
    if (selectedNote && selectedNote.id !== n.id) {
      await deleteCurrentNoteIfEmpty();
    }
    setSelectedNote(n);
    setMobileNotesView("editor");
  };

  const handleCreateNote = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    await deleteCurrentNoteIfEmpty();
    try {
      const notesRef = collection(db, "users", user.uid, "second_brain");
      const createdAtStr = new Date().toISOString();
      const newDoc = await addDoc(notesRef, {
        title: "บันทึกที่ไม่มีชื่อ",
        content: "",
        category: "พัฒนาตัวเอง",
        createdAt: createdAtStr,
        updatedAt: createdAtStr
      });
      setSelectedNote({
        id: newDoc.id,
        title: "บันทึกที่ไม่มีชื่อ",
        content: "",
        category: "พัฒนาตัวเอง",
        createdAt: createdAtStr,
        updatedAt: createdAtStr
      });
      setMobileNotesView("editor");
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    try {
      const noteRef = doc(db, "users", user.uid, "second_brain", noteId);
      await deleteDoc(noteRef);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleApplyTemplate = (type: "book" | "daily" | "idea") => {
    let templateText = "";
    if (type === "book") {
      templateText = `========================================
📚 สรุปหนังสือ: [ระบุชื่อหนังสือ]
========================================

1. จุดที่ชอบที่สุด (Key Takeaways)
- 
- 

2. ประโยคทองคำ (Favorite Quotes)
- " "

3. แผนที่จะเอาไปทำจริง (Action Plan)
[ ] 
`;
    } else if (type === "daily") {
      templateText = `========================================
🌅 บันทึกรายวัน & ทบทวนความรู้สึก
========================================

1. วันนี้มีอะไรดีๆ เกิดขึ้นบ้าง (Daily Wins)
- 
- 

2. 3 เรื่องที่รู้สึกขอบคุณวันนี้ (3 Gratitudes)
- 
- 
- 

3. สิ่งที่ควรพัฒนาให้ดียิ่งขึ้นพรุ่งนี้ (Lessons)
- 
`;
    } else if (type === "idea") {
      templateText = `========================================
💡 ไอเดียแล่น (Idea Spark)
========================================

1. รายละเอียดไอเดีย (Concept)
- 

2. ทำไมไอเดียนี้ถึงน่าสนใจ
- 

3. ขั้นตอนเล็กๆ แรกสุดที่จะเริ่มลงมือทำ (First Step)
[ ] 
`;
    }

    setNoteContent((prev) => {
      if (!prev.trim()) return templateText;
      return prev + "\n\n" + templateText;
    });
  };



  const handleCallAi = async (action: "summarize" | "quote" | "coaching") => {
    if (!user || !noteContent.trim()) return;

    if (!isProMember) {
      alert("✨ ฟีเจอร์ AI วิเคราะห์บันทึกสมองที่สอง เป็นสิทธิ์เฉพาะสมาชิก PRO\n\nสามารถอัปเดตสมาชิกที่หน้าแดชบอร์ดได้ครับ");
      return;
    }

    setIsAiLoading(true);
    setActiveAiAction(action);
    try {
      const idToken = await auth.currentUser?.getIdToken(true);
      let promptText = "";

      if (action === "summarize") {
        promptText = `ช่วยสรุปเนื้อหาโน้ตต่อไปนี้ให้กระชับ ตกผลึกออกมาเป็นข้อๆ ไม่เกิน 3 ข้อหลัก โดยเขียนในรูปแบบข้อความธรรมดา (Plain Text) เท่านั้น ห้ามใช้เครื่องหมายจัดฟอร์แมตที่เป็นมาร์กดาวน์ เช่น เครื่องหมายดอกจัน (**) หรือเครื่องหมายสี่เหลี่ยม (#) โดยเด็ดขาด ให้ใช้การขึ้นบรรทัดใหม่ธรรมดาและสัญลักษณ์หัวข้อ เช่น - หรือตัวเลขในการแบ่งข้อเพื่อความอ่านง่าย:\n\n${noteContent}`;
      } else if (action === "coaching") {
        promptText = `ช่วยอ่านโน้ตต่อไปนี้ และวิเคราะห์เพื่อเขียนคำแนะนำในฐานะ "พี่ฟุ้ย" (ที่ปรึกษาแนว Humble Expert ที่คิดเป็นระบบ เป็นพี่ชายที่เก่งกว่าเล่าให้ฟัง)

เป้าหมาย:
ให้ฟีดแบ็กที่ตรงประเด็นและมี "Action Plan" ที่ผู้ใช้สามารถนำไปใช้ปฏิบัติได้ทันที

กฎเหล็กเรื่องน้ำเสียงและภาษา (สำคัญมาก):
1. ใช้ภาษาเขียนที่เป็นกันเอง พูดตรงไปตรงมา แบบพี่ชายคุยกับน้อง หรือเพื่อนคุยกับเพื่อน (ไม่มีพิธีรีตอง)
2. ห้ามใช้คำลงท้ายหวานหรือคำลงท้ายผู้หญิง เช่น "คะ", "ค่ะ", "นะ", "นะคะ" โดยเด็ดขาด
3. หลีกเลี่ยงการพูดคำคมสร้างแรงบันดาลใจแบบลอยๆ แต่เน้นชี้เป้าหมายด้วยตรรกะความจริง (Reality Check)
4. ห้ามใช้ภาษาทางการหรือภาษาวิชาการที่แข็งทื่อ

โครงสร้างผลลัพธ์ (ห้ามใช้ Markdown เช่น ** หรือ # เด็ดขาด ให้ใช้ Plain Text และการขึ้นบรรทัดใหม่เท่านั้น):
- Reality Check: (1-2 ประโยคสั้นๆ ที่จี้จุดสำคัญของโน้ตนี้ กระตุ้นให้เอะใจ)
- Action Plan ที่ลงมือทำได้วันนี้ (เน้นสั้นกระชับที่สุด หัวข้อละไม่เกิน 1 ประโยคสั้นๆ 10-15 คำ):
  1/ [กิจกรรมย่อยที่ 1 ลงมือทำได้ทันทีใน 5 นาที - สั้นกระชับมาก]
  2/ [กิจกรรมย่อยที่ 2 (ถ้ามี) - สั้นกระชับมาก]

โน้ตของผู้ใช้:
${noteContent}`;
      }

      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          prompt: promptText,
          type: "second_brain"
        })
      });

      if (!response.ok) {
        throw new Error("AI call failed");
      }

      const data = await response.json();
      const aiResult = data.quote;

      const dateHeader = `\n\n----------------------------------------\n🤖 AI ${
        action === "summarize" ? "สรุปประเด็น" : "คำแนะนำจากพี่ฟุ้ย"
      } (${new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })})\n`;
      
      setNoteContent((prev) => prev + dateHeader + aiResult);

    } catch (error) {
      console.error("AI Action failed:", error);
      alert("ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI ลองใหม่อีกครั้งนะครับ");
    } finally {
      setIsAiLoading(false);
      setActiveAiAction(null);
    }
  };

  const handleCopyToClipboard = () => {
    if (!noteContent) return;
    navigator.clipboard.writeText(noteContent);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const charCount = noteContent.length;
  const wordCount = noteContent.trim() ? noteContent.trim().split(/\s+/).length : 0;

  // 1. Fetch Articles from Firestore
  useEffect(() => {
    if (!isMounted) return;
    const fetchArticles = async () => {
      try {
        const { collection, getDocs, query, orderBy } = await import("firebase/firestore");
        const articlesRef = collection(db, "articles");
        const q = query(articlesRef, orderBy("id", "desc"));
        const querySnapshot = await getDocs(q);

        const fetchedArticles = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));

        if (fetchedArticles.length > 0) {
          setArticles(fetchedArticles);
        } else {
          setArticles(mockArticles);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
        setArticles(mockArticles);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [isMounted]);

  // 2. Fetch User Read History & PRO status
  useEffect(() => {
    if (!isMounted) return;
    let unsubSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        if (unsubSnapshot) {
          unsubSnapshot();
          unsubSnapshot = null;
        }

        const userRef = doc(db, "users", currentUser.uid);
        unsubSnapshot = onSnapshot(userRef, (snap) => {
          try {
            if (snap.exists()) {
              const userData = snap.data();
              if (userData.readArticles) {
                setReadArticles(userData.readArticles);
              }
              const scans = userData?.freeScansUsed || 0;
              setFreeScansUsed(scans);
              const subscriptionStatus = userData?.subscriptionStatus || userData?.subscription_status || "";
              const subscriptionTier = userData?.subscriptionTier || userData?.subscription_tier || "";
              const isPro =
                userData?.role === "premium" ||
                subscriptionTier === "pro" ||
                ["active", "trialing"].includes(subscriptionStatus) ||
                Boolean(userData?.isLifetimeMember);

              setIsProMember(isPro);

              const hasAccess =
                isPro && (
                  Boolean(userData?.isLifetimeMember) ||
                  userData?.subscriptionPlan === "lifetime" ||
                  userData?.subscriptionPlan === "yearly" ||
                  userData?.subscriptionPlan === "founding_yearly"
                );
              setHasEbookAccess(hasAccess);
            }
          } catch (error) {
            console.error("Error reading user data in library:", error);
          }
        });
      } else {
        setUser(null);
        setReadArticles([]);
        setIsProMember(false);
        setHasEbookAccess(false);
        setFreeScansUsed(0);
      }
      setAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubSnapshot) unsubSnapshot();
    };
  }, [isMounted]);

  const filteredArticles = articles.filter(article => {
    const matchesCategory = activeCategory === "ทั้งหมด" || article.category === activeCategory;
    const isRead = readArticles.includes(article.slug);
    const matchesStatus = statusFilter === "ทั้งหมด"
      || (statusFilter === "อ่านแล้ว" && isRead)
      || (statusFilter === "ยังไม่อ่าน" && !isRead);
    return matchesCategory && matchesStatus;
  });

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedInUser = result.user;

      const userRef = doc(db, "users", loggedInUser.uid);
      await setDoc(userRef, {
        lastLoginAt: serverTimestamp(),
      }, { merge: true });

      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: loggedInUser.email,
          displayName: loggedInUser.displayName,
          photoURL: loggedInUser.photoURL,
          role: "member",
          createdAt: serverTimestamp(),
        });
      }

      setShowAuthModal(false);
      setActiveView("notes");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleToggleView = () => {
    if (activeView === "library") {
      if (!user) {
        setShowAuthModal(true);
        return;
      }
      setActiveView("notes");
    } else {
      setActiveView("library");
    }
  };

  if (!isMounted || isCreatingNoteFromUrl) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-amber-500" size={36} />
        {isCreatingNoteFromUrl && (
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest animate-pulse">
            กำลังสร้างโน้ตใหม่ในคลังสมองของคุณ... 🧠
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans overflow-x-hidden selection:bg-amber-500/30 p-6 md:p-10 ${
      activeView === "notes" ? "bg-slate-50 text-slate-800" : "bg-[#0A0A0A] text-slate-55"
    }`}>

      {/* Background Decor */}
      {activeView === "notes" ? (
        <>
          <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
        </>
      ) : (
        <>
          <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        </>
      )}

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Toggle Switcher: Minimal Pill Button in Top-Right */}
        <div className="absolute right-0 top-0 z-50">
          <Link
            href="/second-brain"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all duration-300 shadow-sm active:scale-95 text-[10px] font-black uppercase tracking-wider bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white"
            title="สลับไปหน้าสมองที่สอง"
          >
            <Brain size={12} className="text-amber-500 animate-pulse" />
            <span>สมองที่สอง</span>
          </Link>
        </div>

        {activeView === "library" ? (
          <>
            {/* --- Header --- */}
            <header className="mb-10">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-black mb-6 border border-amber-500/20 uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                <Crown size={14} /> <span>UPSKILL LIBRARY</span>
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
                คลังสมอง <span className="text-amber-500">อัพสกิล</span>
              </h1>
              <p className="text-slate-500 text-sm md:text-lg font-medium">สรุปหนังสือและบทความพรีเมียมคัดมาเพื่อคุณโดยเฉพาะ</p>
            </header>

            {/* --- Ebook Banner --- */}
            {(!user || !isProMember || hasEbookAccess) && (
              <Link href="/ebook" className="flex items-center justify-between gap-4 mb-8 px-5 py-3.5 rounded-2xl border border-white/8 bg-white/4 hover:bg-white/7 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📖</span>
                  <span className="text-sm text-slate-400">อยากอ่านหนังสือรวมบทความเล่มแรก?</span>
                </div>
                {hasEbookAccess ? (
                  <span className="text-xs font-bold text-emerald-400 whitespace-nowrap group-hover:translate-x-0.5 transition-transform">ดาวน์โหลดฟรี (สำหรับ PRO) →</span>
                ) : (
                  <span className="text-xs font-bold text-amber-400 whitespace-nowrap group-hover:translate-x-0.5 transition-transform">โบนัสสำหรับสมาชิก PRO →</span>
                )}
              </Link>
            )}

            {/* --- Categories --- */}
            <div className="relative mb-14">
              <div className="flex gap-3 overflow-x-auto pt-8 pb-8 px-6 no-scrollbar -mt-8 -mb-8 -mx-6">
                {Object.keys(CATEGORY_THEMES).map((cat, index) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-none flex items-center gap-2.5 px-6 py-3.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all duration-300 border ${activeCategory === cat
                      ? "bg-[#f59e0b] text-black border-[#fbbf24] shadow-[0_10px_30px_rgba(245,158,11,0.4)] scale-105 z-20"
                      : "bg-[#161616] text-zinc-500 border-zinc-800/50 hover:bg-[#1c1c1c] hover:text-zinc-300 hover:border-zinc-700"
                      } ${index === 0 ? "ml-2" : ""}`}
                  >
                    <span className={activeCategory === cat ? "text-black" : "text-zinc-600"}>
                      {CATEGORY_THEMES[cat].icon}
                    </span>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="absolute right-[-24px] top-0 bottom-0 w-20 bg-gradient-to-l from-[#0A0A0A] to-transparent pointer-events-none z-10" />
            </div>

            {/* --- Minimal Status Filters --- */}
            <div className="flex items-center gap-2 mb-10 overflow-x-auto no-scrollbar pb-1">
              <div className="flex items-center gap-1.5 px-3 py-2.5 bg-white/5 rounded-full border border-white/5 shrink-0">
                <LayoutGrid size={12} className="text-slate-500" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Filter</span>
              </div>

              <div className="flex gap-2 shrink-0">
                {[
                  { id: "ทั้งหมด", label: "ทั้งหมด" },
                  { id: "อ่านแล้ว", label: "อ่านแล้ว" },
                  { id: "ยังไม่อ่าน", label: "ยังไม่อ่าน" }
                ].map((status) => (
                  <button
                    key={status.id}
                    onClick={() => setStatusFilter(status.id)}
                    className={`px-4 py-2.5 rounded-full text-[11px] font-bold tracking-wide transition-all duration-300 border shrink-0 min-h-[40px] ${
                      statusFilter === status.id
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
                        : "bg-transparent text-slate-500 border-white/5 hover:border-white/10 hover:text-slate-300"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* --- Grid Area --- */}
            <motion.div
              key={activeCategory}
              initial="hidden"
              animate="show"
              variants={containerVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredArticles.length === 0 && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="col-span-full py-24 text-center bg-[#111]/30 rounded-[3rem] border border-dashed border-white/10"
                  >
                    <div className="bg-amber-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                      <BookOpen size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">ไม่พบบทความในหมวดนี้</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto">ลองเลือกหมวดหมู่ใหม่หรือเปลี่ยนตัวกรองการอ่านดูนะครับ</p>
                    <button
                      onClick={() => { setActiveCategory("ทั้งหมด"); setStatusFilter("ทั้งหมด"); }}
                      className="mt-8 text-amber-500 text-xs font-black uppercase tracking-[0.2em] hover:text-amber-400 transition-colors"
                    >
                      ล้างตัวกรองทั้งหมด
                    </button>
                  </motion.div>
                )}
                {filteredArticles.map((article) => {
                  const theme = CATEGORY_THEMES[article.category] || CATEGORY_THEMES["ทั้งหมด"];
                  return (
                    <motion.div
                      key={article.id}
                      variants={cardVariants}
                      layout
                      className="h-full"
                    >
                      <Link href={`/library/${article.slug}`} className="group block h-full">
                        <div className="h-full bg-[#111] p-8 rounded-[2.5rem] border border-white/5 flex flex-col transition-all duration-500 hover:border-amber-500/30 hover:bg-[#151515] relative overflow-hidden shadow-2xl">
                          {readArticles.includes(article.slug) ? (
                            <div className="absolute top-8 right-8 flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 text-[9px] font-black tracking-widest uppercase shadow-sm">
                              <BookMarked size={10} className="fill-emerald-400" /> อ่านแล้ว
                            </div>
                          ) : (
                            <div className="absolute top-8 right-8 flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/20 text-[9px] font-black tracking-widest uppercase shadow-sm">
                              <Sparkles size={10} className="fill-amber-400" /> +5 XP
                            </div>
                          )}

                          <div className="mb-8 relative">
                            <div className={`w-14 h-14 rounded-2xl ${theme.bgColor} ${theme.borderColor} border flex items-center justify-center ${theme.color} group-hover:scale-110 transition-transform duration-500`}>
                              {theme.icon}
                            </div>
                          </div>

                          <div className="flex-1">
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 block ${theme.color}`}>
                              {article.category} • {(() => {
                                const t = article.readTime?.trim() || '';
                                const m = t.match(/^(\d+)/);
                                if (m && !t.includes('นาที')) return `${m[1]} นาที`;
                                return t;
                              })()}
                            </span>
                            <h2 className="text-2xl font-bold text-white mb-4 leading-tight group-hover:text-amber-400 transition-colors line-clamp-2">
                              {article.title}
                            </h2>
                            <p className="text-slate-500 text-sm leading-relaxed mb-10 font-medium line-clamp-2 opacity-80">
                              {article.excerpt}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{article.date}</span>
                            <div className="flex items-center gap-2 text-xs font-black text-amber-500 group-hover:gap-3 transition-all uppercase tracking-tighter">
                              Read Insight <ChevronRight size={14} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* --- Footer --- */}
            <motion.footer initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="mt-24 text-center py-12 border-t border-white/5">
              <Link href={user ? "/dashboard" : "/"} className="group relative inline-flex items-center gap-4 bg-white text-black px-10 py-4 rounded-full font-black text-sm transition-all hover:bg-amber-400 hover:scale-105 shadow-[0_20px_40px_rgba(255,255,255,0.05)] uppercase tracking-widest">
                <LayoutGrid size={18} /> {user ? "กลับสู่ DASHBOARD" : "กลับหน้าแรก"}
              </Link>
            </motion.footer>
          </>
        ) : (
          <>
            {/* --- Notes Header --- */}
            <header className="mb-10">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-slate-200 rounded-full text-[10px] font-black mb-6 border border-slate-950 uppercase tracking-[0.2em] shadow-sm">
                <Brain size={14} className="text-slate-400" /> <span>SECOND BRAIN</span>
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-800 tracking-tight mb-4">
                สมองที่สอง <span className="text-slate-500">จดบันทึก</span>
              </h1>
              <p className="text-slate-500 text-sm md:text-lg font-medium">เก็บบันทึกสรุปหนังสือและไอเดียพัฒนาตัวเอง</p>
            </header>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col md:flex-row gap-8 bg-white rounded-[3rem] border border-slate-200/80 p-6 md:p-8 shadow-[0_30px_70px_rgba(15,23,42,0.06)] min-h-[640px] relative overflow-hidden"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(99, 102, 241, 0.035) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(99, 102, 241, 0.035) 1px, transparent 1px)
                `,
                backgroundSize: '24px 24px',
                backgroundColor: '#ffffff'
              }}
            >
              {/* 📁 Left Column: Sidebar List */}
              <div className={`w-full md:w-80 shrink-0 flex flex-col border-r border-slate-100 pr-0 md:pr-6 relative ${
                mobileNotesView === "list" ? "block" : "hidden md:flex"
              }`}>
              
              {/* Sidebar Header & Add Note Button */}
              <div className="flex items-center justify-between gap-3 mb-6">
                <h3 className="text-sm font-black text-slate-800 tracking-wide flex items-center gap-1.5">
                  🧠 บันทึกสมอง ({notes.length})
                </h3>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setShowGraphView(!showGraphView);
                      if (!showGraphView && mobileNotesView === "list") {
                        setMobileNotesView("editor");
                      }
                    }}
                    className={`group px-3 py-2 border rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                      showGraphView
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-700 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30"
                        : "bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 border-slate-200/80 hover:border-indigo-200"
                    }`}
                  >
                    <Brain size={12} className={showGraphView ? "animate-pulse text-white" : "text-slate-400 group-hover:text-indigo-500 transition-colors"} />
                    <span>แผนผัง</span>
                  </button>
                  <button
                    onClick={handleCreateNote}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Plus size={12} /> เพิ่มโน้ต
                  </button>
                </div>
              </div>

              {/* Note Search Input */}
              <div className="relative mb-4">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาบันทึกของคุณ..."
                  value={searchNoteQuery}
                  onChange={(e) => setSearchNoteQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-100 border border-transparent rounded-xl text-xs font-bold text-slate-700 placeholder-slate-400 focus:bg-white focus:border-slate-200 focus:outline-none transition-all duration-300"
                />
              </div>

              {/* Filter Category Select (Horizontal scroll of tiny pills) */}
              <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 no-scrollbar border-b border-slate-100">
                {["ทั้งหมด", "พัฒนาตัวเอง", "การเงิน & ลงทุน", "ธุรกิจ", "หนังสือ"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterNoteCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all duration-300 border ${
                      filterNoteCategory === cat
                        ? "bg-slate-900 border-slate-950 text-white shadow-sm"
                        : "bg-slate-50 border-slate-200/60 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Notes List Scroll Container */}
              <div className="flex-1 overflow-y-auto max-h-[480px] pr-1 pb-14 space-y-2.5 no-scrollbar">
                {notes.filter((n) => {
                  const matchesSearch =
                    (n.title || "").toLowerCase().includes(searchNoteQuery.toLowerCase()) ||
                    (n.content || "").toLowerCase().includes(searchNoteQuery.toLowerCase());
                  const matchesCategory =
                    filterNoteCategory === "ทั้งหมด" || n.category === filterNoteCategory;
                  return matchesSearch && matchesCategory;
                }).length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-medium text-xs">
                    ไม่มีบันทึกสำหรับตัวกรองนี้
                  </div>
                ) : (
                  notes
                    .filter((n) => {
                      const matchesSearch =
                        (n.title || "").toLowerCase().includes(searchNoteQuery.toLowerCase()) ||
                        (n.content || "").toLowerCase().includes(searchNoteQuery.toLowerCase());
                      const matchesCategory =
                        filterNoteCategory === "ทั้งหมด" || n.category === filterNoteCategory;
                      return matchesSearch && matchesCategory;
                    })
                    .map((n) => {
                      const isSelected = selectedNote?.id === n.id;
                      const hasText = n.content && n.content.trim().length > 0;
                      const excerpt = hasText
                        ? n.content.replace(/[#*`_-]/g, "").slice(0, 45) + (n.content.length > 45 ? "..." : "")
                        : "ไม่มีเนื้อหาจดบันทึก...";

                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            handleSelectNote(n);
                          }}
                          className={`group relative p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? "bg-indigo-50/70 border-indigo-200 text-indigo-950 shadow-sm"
                              : "bg-slate-50 hover:bg-slate-100/70 border-slate-200/50 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <div className="pr-6">
                            <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5 ${
                              isSelected ? "bg-indigo-200/50 text-indigo-800" : "bg-slate-200 text-slate-600"
                            }`}>
                              {n.category || "พัฒนาตัวเอง"}
                            </span>
                            <h4 className="text-xs font-bold leading-snug line-clamp-1 mb-1">
                              {n.title || "บันทึกที่ไม่มีชื่อ"}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium line-clamp-1 leading-normal">
                              {excerpt}
                            </p>
                            <span className="block text-[8px] text-slate-400 font-bold mt-2 uppercase tracking-wide">
                              {n.updatedAt ? new Date(n.updatedAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' }) : "ไม่มีวันที่"}
                            </span>
                          </div>

                          {/* Delete Note Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowDeleteConfirm(n.id);
                            }}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-600 hover:bg-red-50 bg-slate-100 hover:border-red-200 border border-slate-200 rounded-xl p-2 transition-all duration-200 active:scale-95 shadow-sm z-20"
                            title="ลบบันทึก"
                          >
                            <Trash2 size={15} />
                          </button>

                          {/* Delete Confirmation Popup Inline */}
                          {showDeleteConfirm === n.id && (
                            <div className="absolute inset-0 bg-white/95 rounded-2xl z-30 flex items-center justify-center p-3 border border-red-200 shadow-sm gap-2">
                              <span className="text-[9px] font-black text-slate-700">ลบบันทึกไหม?</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteNote(n.id); }}
                                className="px-2 py-1 bg-red-500 text-white rounded text-[8px] font-bold"
                              >
                                ลบ
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(null); }}
                                className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[8px] font-bold"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                )}
              </div>

              {/* Bottom Fade Mask */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/85 to-transparent pointer-events-none z-10" />
            </div>

            {/* 📝 Right Column: Main Editor Area */}
            <div className={`flex-1 flex flex-col justify-between ${
              mobileNotesView === "editor" ? "flex" : "hidden md:flex"
            }`}>
              {showGraphView ? (
                <GraphView
                  notes={notes}
                  onSelectNote={(note) => {
                    handleSelectNote(note);
                    setShowGraphView(false);
                  }}
                  onClose={() => setShowGraphView(false)}
                  aiSuggestions={aiSuggestions}
                  onTriggerAiScan={handleCallAiScan}
                  isAiScanning={isAiScanning}
                  isProMember={isProMember}
                  freeScansUsed={freeScansUsed}
                />
              ) : selectedNote ? (
                <>
                  <div className="space-y-4 flex flex-col relative">
                    {/* Back button for mobile view */}
                    <button
                      onClick={async () => {
                        await deleteCurrentNoteIfEmpty();
                        setMobileNotesView("list");
                      }}
                      className="md:hidden flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold mb-2 active:scale-95 transition-all self-start"
                    >
                      <ArrowRight size={14} className="rotate-180" />
                      <span>กลับสู่รายการบันทึก</span>
                    </button>
                    
                    {/* Header bar of editor (Saving status and Category selector) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      
                      {/* Saving status indication */}
                      <div className="flex items-center gap-2">
                        {isSaving ? (
                          <span className="text-[10px] font-black text-slate-400 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                            กำลังบันทึกอัตโนมัติ...
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            บันทึกอัตโนมัติเรียบร้อย
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        {/* Note Category dropdown select */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">หมวดหมู่โน้ต:</span>
                          <select
                            value={noteCategory}
                            onChange={(e) => setNoteCategory(e.target.value)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black rounded-lg px-2.5 py-1 border border-transparent focus:bg-white focus:border-slate-200 focus:outline-none transition-colors duration-200 cursor-pointer"
                          >
                            <option value="พัฒนาตัวเอง">พัฒนาตัวเอง</option>
                            <option value="หนังสือ">หนังสือ</option>
                            <option value="การเงิน & ลงทุน">การเงิน & ลงทุน</option>
                            <option value="ธุรกิจ">ธุรกิจ</option>
                          </select>
                        </div>


                         {/* Font Size Selector */}
                         <div className="flex items-center gap-1.5">
                           <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">ขนาดอักษร:</span>
                           <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200/60">
                             {(["sm", "base", "lg"] as const).map((size) => {
                               const label = size === "sm" ? "เล็ก" : size === "base" ? "กลาง" : "ใหญ่";
                               const isActive = noteFontSize === size;
                               return (
                                 <button
                                   key={size}
                                   onClick={() => handleFontSizeChange(size)}
                                   className={`px-2.5 py-0.5 rounded-md text-[9px] font-black transition-all ${
                                     isActive
                                       ? "bg-white text-slate-800 shadow-sm"
                                       : "text-slate-500 hover:text-slate-800"
                                   }`}
                                 >
                                   {label}
                                 </button>
                               );
                             })}
                           </div>
                         </div>
                       </div>
                     </div>

                    {/* Auto-save Hint Banner */}
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 font-medium">
                      <span>💡</span>
                      <span>โน้ตจะ <strong className="font-black text-slate-700">เซฟอัตโนมัติ</strong> ขณะพิมพ์ สามารถใช้เทมเพลตและ AI สรุปเนื้อหาด้านล่างได้ครับ</span>
                    </div>

                    {/* Note Title Input */}
                    <input
                      type="text"
                      placeholder="หัวข้อบันทึก (เช่น สรุปหนังสือ Atomic Habits)..."
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      className="w-full text-2xl font-black text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent"
                    />

                    {/* Note Content Textarea */}
                    <textarea
                      id="note-content-editor"
                      placeholder="พิมพ์จดบันทึกความคิด สรุปความรู้ หรือแผนพัฒนาตัวเองที่นี่ได้เลย..."
                      value={noteContent}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNoteContent(val);
                        
                        const selectionStart = e.target.selectionStart;
                        const textBeforeCursor = val.substring(0, selectionStart);
                        const openBracketIdx = textBeforeCursor.lastIndexOf("[[");
                        const closeBracketIdx = textBeforeCursor.lastIndexOf("]]");
                        
                        if (openBracketIdx !== -1 && openBracketIdx > closeBracketIdx) {
                          const queryText = textBeforeCursor.substring(openBracketIdx + 2);
                          if (!queryText.includes("\n")) {
                            setShowAutocomplete(true);
                            setAutocompleteQuery(queryText);
                            setAutocompleteIndex(openBracketIdx);
                            setAutocompleteActiveIdx(0);
                            return;
                          }
                        }
                        setShowAutocomplete(false);
                      }}
                      onKeyDown={handleKeyDown}
                      rows={14}
                      className={`w-full bg-transparent leading-loose text-slate-600 placeholder-slate-400 focus:outline-none resize-none font-medium pr-1 focus:ring-0 min-h-[320px] ${
                        noteFontSize === "sm"
                          ? "text-sm"
                          : noteFontSize === "base"
                            ? "text-base"
                            : "text-lg"
                      }`}
                    />

                    {/* Autocomplete dropdown overlay */}
                    {showAutocomplete && (
                      <div className="absolute z-50 bg-slate-900/95 border border-slate-700/80 rounded-2xl w-64 shadow-xl max-h-48 overflow-y-auto p-1.5 backdrop-blur-md animate-fade-in text-left"
                           style={{
                             bottom: "60px",
                             left: "20px"
                           }}>
                        <div className="px-2 py-1 text-[8px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800 mb-1 flex items-center justify-between">
                          <span>พิมพ์ค้นหาโน้ต...</span>
                          <span className="text-[7px] opacity-60">(พิมพ์ต่อหลัง [[ ได้เลย)</span>
                        </div>
                        {notes.filter((n) => {
                          if (selectedNote && n.id === selectedNote.id) return false;
                          return n.title?.toLowerCase().includes(autocompleteQuery.toLowerCase());
                        }).length === 0 ? (
                          <div className="px-2 py-1.5 text-[9px] text-slate-400 font-bold">
                            ไม่พบชื่อบันทึก
                          </div>
                        ) : (
                          notes
                            .filter((n) => {
                              if (selectedNote && n.id === selectedNote.id) return false;
                              return n.title?.toLowerCase().includes(autocompleteQuery.toLowerCase());
                            })
                            .map((n, idx) => {
                              const matchingNotes = notes.filter((x) => {
                                if (selectedNote && x.id === selectedNote.id) return false;
                                return x.title?.toLowerCase().includes(autocompleteQuery.toLowerCase());
                              });
                              const isActive = idx === autocompleteActiveIdx;
                              return (
                                <button
                                  key={n.id}
                                  onClick={() => handleSelectAutocomplete(n)}
                                  className={`w-full px-2 py-1.5 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                    isActive
                                      ? "bg-indigo-600 text-white"
                                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                  }`}
                                >
                                  <span className="line-clamp-1">{n.title || "ไม่มีชื่อ"}</span>
                                  <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                                    isActive ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"
                                  }`}>
                                    {n.category}
                                  </span>
                                </button>
                              );
                            })
                        )}
                      </div>
                    )}
                  </div>



                  {/* Footer widgets: Stats, Templates and AI actions */}
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                    
                    {/* Segment 1: Templates List (Visually Grouped) */}
                    <div className="flex items-center gap-1.5 flex-wrap bg-slate-50/50 p-2 rounded-xl border border-slate-100/60">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 pl-1">⚡ คัดลอกเทมเพลต:</span>
                      <button
                        onClick={() => handleApplyTemplate("book")}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors duration-200"
                      >
                        📚 สรุปหนังสือ
                      </button>
                      <button
                        onClick={() => handleApplyTemplate("daily")}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors duration-200"
                      >
                        🌅 ทวนบันทึกรายวัน
                      </button>
                      <button
                        onClick={() => handleApplyTemplate("idea")}
                        className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-100 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors duration-200"
                      >
                        💡 ไอเดียแล่น
                      </button>
                    </div>

                    {/* Segment 2: Toolbar actions & stats */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      {/* Left side: Note counter */}
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-400 font-bold">
                          {charCount} ตัวอักษร ({wordCount} คำ)
                        </span>
                      </div>

                      {/* Right side: Copy to clipboard action */}
                      <button
                        onClick={handleCopyToClipboard}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors duration-200"
                        title="คัดลอกข้อความทั้งหมด"
                      >
                        {copyStatus ? (
                          <>
                            <Check size={11} className="text-green-600" />
                            <span className="text-green-600">คัดลอกแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy size={11} />
                            <span>คัดลอกโน้ต</span>
                          </>
                        )}
                      </button>
                    </div>

                                        {/* Row 2: AI Actions Bar (DeepSeek) */}
                    <div className="flex flex-col gap-2.5 p-3.5 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 rounded-2xl border border-violet-100 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-200/10 blur-xl rounded-full pointer-events-none" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 z-10">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="w-2 h-2 rounded-full bg-violet-600 animate-pulse" />
                          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                            ✨ คุยกับพี่ฟุ้ยช่วยวิเคราะห์
                          </span>
                          {!isProMember && (
                            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 leading-none">
                              <Crown size={8} className="fill-white" />
                              PRO
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold">ผลลัพธ์จะถูกเขียนเพิ่มต่อท้ายบันทึกของคุณอัตโนมัติ</span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 z-10 mt-1 w-full sm:w-auto">
                        <button
                          onClick={() => handleCallAi("summarize")}
                          disabled={isAiLoading || !noteContent.trim()}
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 bg-white hover:bg-violet-50 text-violet-700 border border-violet-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors duration-200 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {activeAiAction === "summarize" ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <span className="flex items-center gap-1">
                              <span>💡 สรุป 3 ประเด็นโน้ต</span>
                              {!isProMember && <Lock size={10} className="text-violet-500/70" />}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => handleCallAi("coaching")}
                          disabled={isAiLoading || !noteContent.trim()}
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border border-transparent rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {activeAiAction === "coaching" ? (
                            <Loader2 size={11} className="animate-spin text-white" />
                          ) : (
                            <span className="flex items-center gap-1">
                              <span>💪 ขอคำแนะนำจากพี่ฟุ้ย</span>
                              {!isProMember && <Lock size={10} className="text-white/70" />}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-slate-400">
                  <div className="w-24 h-24 rounded-full bg-[#f8fafc] flex items-center justify-center text-4xl mb-6 border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
                    🧠
                  </div>
                  <h4 className="text-lg font-black text-slate-800 mb-2">พื้นที่สมองที่สอง (Second Brain)</h4>
                  <p className="text-xs text-slate-400 font-medium max-w-sm text-center leading-relaxed mb-10">
                    เก็บบันทึกสรุปหนังสือ ไอเดียสร้างสรรค์ และบทเรียนพัฒนาตัวเอง เพื่อให้สมองจริงพร้อมจดจ่อกับปัจจุบัน
                  </p>

                  {/* 3 Step Guidance Cards (Flex-wrap or row layout on mobile) */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mb-10 px-4 sm:px-0">
                    <div className="flex-1 bg-slate-50/60 p-5 rounded-[1.5rem] border border-slate-100 text-left shadow-sm">
                      <span className="text-2xl mb-2.5 block">📝</span>
                      <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5">1. จดบันทึก / สรุป</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">บันทึกข้อคิดที่ได้เรียนรู้ ความฝัน หรือแผนงาน</p>
                    </div>
                    <div className="flex-1 bg-slate-50/60 p-5 rounded-[1.5rem] border border-slate-100 text-left shadow-sm">
                      <span className="text-2xl mb-2.5 block">⚡</span>
                      <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5">2. ใช้เทมเพลตช่วย</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">กดเลือกเทมเพลตสรุปหนังสือ หรือทบทวนรายวันเพื่อเริ่มทันที</p>
                    </div>
                    <div className="flex-1 bg-slate-50/60 p-5 rounded-[1.5rem] border border-slate-100 text-left shadow-sm">
                      <span className="text-2xl mb-2.5 block">🤖</span>
                      <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1.5">3. ให้ AI ร่วมคิด</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">สรุปใจความสำคัญ หรือขอคำแนะนำจากโค้ชพี่ฟุ้ย</p>
                    </div>
                  </div>

                  <button
                    onClick={handleCreateNote}
                    className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-[0_10px_25px_rgba(15,23,42,0.15)] active:scale-95 flex items-center gap-2"
                  >
                    + สร้างบันทึกแรก
                  </button>
                </div>
              )}
            </div>

          </motion.div>
        </>
      )}
      </div>

      {/* 🔐 Premium Google Login Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop with premium blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-[#0A0A0A]/85 backdrop-blur-md animate-fade-in"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl text-center overflow-hidden"
            >
              {/* Decorative premium glows */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/10 blur-[60px] rounded-full pointer-events-none" />

              {/* Icon Badge */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6 text-indigo-400">
                <Brain size={32} className="animate-pulse" />
              </div>

              {/* Title & Description */}
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight mb-3">
                บันทึกไว้ในสมองที่สอง
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-8 max-w-xs mx-auto">
                เข้าสู่ระบบด้วย Google เพื่อจดบันทึกความคิด สรุปความรู้ หรือแผนงานส่วนตัวคู่ไปกับ AI คู่คิด
              </p>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-900 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>เข้าสู่ระบบด้วย Google</span>
                </button>

                <button
                  onClick={() => setShowAuthModal(false)}
                  className="w-full py-3 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-colors duration-200 cursor-pointer"
                >
                  กลับไปอ่านบทความ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PremiumLibraryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-amber-500" size={32} />
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest animate-pulse">
          กำลังโหลดคลังสมอง... 🧠
        </p>
      </div>
    }>
      <LibraryContent />
    </Suspense>
  );
}