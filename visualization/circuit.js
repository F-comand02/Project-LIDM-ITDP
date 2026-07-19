/**
 * PhysiViz AI - Kirchhoff Circuit Concept Lab Animation
 * Features: High-fidelity schematic vector circuit (battery, resistors, wire, branch junctions),
 * flowing electron light particles along the SVG loop paths, with animation speeds
 * dynamically scaled in real-time according to current values (I_masuk, I1, I2).
 */

export class CircuitVisualizer {
  constructor(container, vars) {
    this.container = container;
    
    // Core electrical current values
    this.I_masuk = vars.I_masuk !== undefined ? parseFloat(vars.I_masuk) : 10;
    this.I1 = vars.I1 !== undefined ? parseFloat(vars.I1) : 4;
    this.I2 = this.I_masuk - this.I1;

    this.isPlaying = false;
    this.timerId = null;

    this.init();
  }

  init() {
    this.container.innerHTML = ""; // Clear existing placeholder

    // Base SVG Wrapper
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 800 400");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.classList.add("w-full", "h-full", "bg-[#090D16]", "rounded-2xl");

    // Add CSS Filters for gorgeous neon glowing elements
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="glow-violet" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    `;
    svg.appendChild(defs);

    // Group for Circuit Paths / Wires
    const wiresGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    wiresGroup.setAttribute("stroke", "#334155");
    wiresGroup.setAttribute("stroke-width", "5");
    wiresGroup.setAttribute("fill", "none");
    wiresGroup.setAttribute("stroke-linecap", "round");
    wiresGroup.setAttribute("stroke-linejoin", "round");

    // 1. Main entering loop wires (Left side containing Battery & main resistor)
    const mainPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    mainPath.setAttribute("d", "M 100,200 L 300,200");
    wiresGroup.appendChild(mainPath);

    // 2. Splitting branches (Junction to split branches, and merge back)
    const upperBranch = document.createElementNS("http://www.w3.org/2000/svg", "path");
    upperBranch.setAttribute("d", "M 300,200 L 300,100 L 500,100 L 500,200");
    wiresGroup.appendChild(upperBranch);

    const lowerBranch = document.createElementNS("http://www.w3.org/2000/svg", "path");
    lowerBranch.setAttribute("d", "M 300,200 L 300,300 L 500,300 L 500,200");
    wiresGroup.appendChild(lowerBranch);

    // 3. Return path to battery
    const returnPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    returnPath.setAttribute("d", "M 500,200 L 700,200 L 700,360 L 100,360 L 100,200");
    wiresGroup.appendChild(returnPath);

    svg.appendChild(wiresGroup);

    // SCHEMATIC COMPONENT RENDERING
    // A. Draw Resistors (Zig-zags or clean rectangles)
    this.drawResistor(svg, 160, 200, 0, "R_masuk"); // Main resistor
    this.drawResistor(svg, 400, 100, 0, "R₁"); // Branch 1
    this.drawResistor(svg, 400, 300, 0, "R₂"); // Branch 2

    // B. Draw Battery (DC power source symbol) on bottom wire
    this.drawBattery(svg, 400, 360);

    // C. Draw Junction Nodes
    this.drawNode(svg, 300, 200, "Junction A");
    this.drawNode(svg, 500, 200, "Junction B");

    // D. Text current tags / Labels
    this.drawText(svg, 220, 175, `I_masuk = ${this.I_masuk} A`, "#F59E0B", "13px");
    this.drawText(svg, 400, 75, `I₁ = ${this.I1} A`, "#10B981", "12px");
    this.drawText(svg, 400, 275, `I₂ = ${this.I2.toFixed(1)} A`, "#8B5CF6", "12px");

    // ELECTRON FLOW PARTICLES CONTAINER (Glowing dots)
    const electronGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    electronGroup.id = "electron-particles";
    svg.appendChild(electronGroup);

    this.container.appendChild(svg);
    this.svg = svg;

    // Telemetry dashboard card overlay
    const overlay = document.createElement("div");
    overlay.className = "absolute top-4 left-4 p-3 bg-slate-900/90 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 max-w-sm";
    overlay.innerHTML = `
      <div class="font-bold text-slate-200">Kirchhoff Current Loop</div>
      <div class="mt-1 text-yellow-500">I_masuk = I₁ + I₂</div>
      <div class="text-slate-400 mt-1">${this.I_masuk}A = ${this.I1}A + ${this.I2.toFixed(1)}A</div>
    `;
    this.container.appendChild(overlay);

    this.resetElectrons();
  }

  drawResistor(svg, cx, cy, rotation, label) {
    const rw = 40;
    const rh = 16;
    
    // Draw background to cover underlying wire lines
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("x", cx - rw/2);
    bg.setAttribute("y", cy - rh/2);
    bg.setAttribute("width", rw);
    bg.setAttribute("height", rh);
    bg.setAttribute("fill", "#090D16");
    svg.appendChild(bg);

    // Resistor Box
    const box = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    box.setAttribute("x", cx - rw/2);
    box.setAttribute("y", cy - rh/2);
    box.setAttribute("width", rw);
    box.setAttribute("height", rh);
    box.setAttribute("stroke", "#64748B");
    box.setAttribute("stroke-width", "3");
    box.setAttribute("fill", "#1E293B");
    box.setAttribute("rx", "2");
    svg.appendChild(box);

    // Resistor inner decorative coils / stripes
    const stripe = document.createElementNS("http://www.w3.org/2000/svg", "line");
    stripe.setAttribute("x1", cx);
    stripe.setAttribute("y1", cy - rh/2);
    stripe.setAttribute("x2", cx);
    stripe.setAttribute("y2", cy + rh/2);
    stripe.setAttribute("stroke", "#475569");
    stripe.setAttribute("stroke-width", "2");
    svg.appendChild(stripe);

    // Tag name label
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", cx);
    text.setAttribute("y", cy - 12);
    text.setAttribute("fill", "#94A3B8");
    text.setAttribute("font-size", "10px");
    text.setAttribute("font-family", "monospace");
    text.setAttribute("text-anchor", "middle");
    text.textContent = label;
    svg.appendChild(text);
  }

  drawBattery(svg, cx, cy) {
    // Battery DC poles
    const pad = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    pad.setAttribute("x", cx - 25);
    pad.setAttribute("y", cy - 15);
    pad.setAttribute("width", 50);
    pad.setAttribute("height", 30);
    pad.setAttribute("fill", "#090D16");
    svg.appendChild(pad);

    // Long pole (positive)
    const pole1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    pole1.setAttribute("x1", cx - 8);
    pole1.setAttribute("y1", cy - 15);
    pole1.setAttribute("x2", cx - 8);
    pole1.setAttribute("y2", cy + 15);
    pole1.setAttribute("stroke", "#EF4444");
    pole1.setAttribute("stroke-width", "4");
    svg.appendChild(pole1);

    // Short pole (negative)
    const pole2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    pole2.setAttribute("x1", cx + 8);
    pole2.setAttribute("y1", cy - 8);
    pole2.setAttribute("x2", cx + 8);
    pole2.setAttribute("y2", cy + 8);
    pole2.setAttribute("stroke", "#3B82F6");
    pole2.setAttribute("stroke-width", "6");
    svg.appendChild(pole2);

    // Battery Sign label
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", cx);
    label.setAttribute("y", cy - 20);
    label.setAttribute("fill", "#E2E8F0");
    label.setAttribute("font-size", "10px");
    label.setAttribute("font-family", "monospace");
    label.setAttribute("text-anchor", "middle");
    label.textContent = "Battery (V)";
    svg.appendChild(label);
  }

  drawNode(svg, cx, cy, label) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    node.setAttribute("cx", cx);
    node.setAttribute("cy", cy);
    node.setAttribute("r", "8");
    node.setAttribute("fill", "#4F46E5");
    node.setAttribute("stroke", "#E2E8F0");
    node.setAttribute("stroke-width", "2");
    svg.appendChild(node);
  }

  drawText(svg, x, y, textVal, color, size) {
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("fill", color);
    text.setAttribute("font-size", size);
    text.setAttribute("font-family", "monospace");
    text.setAttribute("font-weight", "bold");
    text.setAttribute("text-anchor", "middle");
    text.textContent = textVal;
    svg.appendChild(text);
  }

  resetElectrons() {
    const group = this.svg.querySelector("#electron-particles");
    group.innerHTML = ""; // Clear existing

    // We can define individual electron loops as SVG `<animateMotion>` animations
    // so they slide down the paths.
    // Speed factor: standard duration is inversely proportional to current
    // If current is high (e.g., I=10), duration is short (e.g., 2s)
    const baseDuration = 15; // default slow duration in seconds

    // 1. Entering path (Loop 1: from x=100,y=360 -> x=100,y=200 -> x=300,y=200)
    // Duration: baseDuration / I_masuk
    const durIn = baseDuration / Math.max(0.5, this.I_masuk);
    this.createElectronsAlongPath(group, "M 100,360 L 100,200 L 300,200", durIn, "#F59E0B", "glow-orange", 8);

    // 2. Branch 1 path (Upper loop: x=300,y=200 -> Upper -> x=500,y=200)
    const dur1 = baseDuration / Math.max(0.5, this.I1);
    this.createElectronsAlongPath(group, "M 300,200 L 300,100 L 500,100 L 500,200", dur1, "#10B981", "glow-green", 5);

    // 3. Branch 2 path (Lower loop: x=300,y=200 -> Lower -> x=500,y=200)
    const dur2 = baseDuration / Math.max(0.5, this.I2);
    this.createElectronsAlongPath(group, "M 300,200 L 300,300 L 500,300 L 500,200", dur2, "#8B5CF6", "glow-violet", 5);

    // 4. Return path (Loop return: x=500,y=200 -> x=700,y=200 -> x=700,y=360 -> x=100,y=360)
    this.createElectronsAlongPath(group, "M 500,200 L 700,200 L 700,360 L 100,360", durIn, "#F59E0B", "glow-orange", 8);
  }

  createElectronsAlongPath(containerGroup, pathD, duration, color, filterId, count) {
    // Generate 'count' electrons evenly spaced in timing offset
    for (let i = 0; i < count; i++) {
      const delay = (i * (duration / count)).toFixed(2);

      // Create electron circle
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("r", "5");
      dot.setAttribute("fill", color);
      dot.setAttribute("filter", `url(#${filterId})`);

      // Add SVG motion animate tag
      const anim = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
      anim.setAttribute("path", pathD);
      anim.setAttribute("dur", `${duration.toFixed(2)}s`);
      anim.setAttribute("begin", `-${delay}s`); // Negative delay creates immediate motion state
      anim.setAttribute("repeatCount", "indefinite");

      dot.appendChild(anim);
      containerGroup.appendChild(dot);
    }
  }

  play() {
    this.isPlaying = true;
    // SVGs start/resume automatically, or we can control SMIL timing via DOM
    try {
      this.svg.unpauseAnimations();
    } catch (e) {}
  }

  pause() {
    this.isPlaying = false;
    try {
      this.svg.pauseAnimations();
    } catch (e) {}
  }

  reset() {
    this.pause();
    this.resetElectrons();
  }
}
