# Cricket Game UI Explorer — Design Ideas

<response>
<idea>

## Idea 1: "Stadium Night Mode" — Broadcast Control Room Aesthetic

**Design Movement**: Inspired by live sports broadcast graphics and stadium control room interfaces — think ESPN/Sky Sports overlays meets developer tooling.

**Core Principles**:
1. Deep dark backgrounds with vivid accent pops that mimic stadium floodlight contrast
2. Information density balanced with breathing room — every pixel earns its place
3. Kinetic energy — subtle ambient animations that evoke a live broadcast feel
4. Component isolation through luminous card borders and glass panels

**Color Philosophy**: A near-black base (`#0d1117`) with electric green (`#22c55e`) as the primary accent — evoking the cricket pitch under floodlights. Gold (`#f59e0b`) for highlights and teal (`#14b8a6`) for secondary accents. The emotional intent is "premium sports broadcast at night."

**Layout Paradigm**: Split-screen asymmetric layout. Left sidebar (280px) acts as a component navigator with a vertical list of component cards. The right area (flex-1) is the "stage" — a large preview zone where the selected component renders at full scale, with an interactive controls drawer that slides up from the bottom.

**Signature Elements**:
1. A glowing green "live" dot indicator that pulses next to the currently active component
2. Frosted glass panels with 1px luminous borders that shift color based on the active component's accent
3. Subtle scan-line texture overlay on the preview stage, reminiscent of broadcast monitors

**Interaction Philosophy**: Click a component in the sidebar to "tune in" — the stage transitions with a smooth crossfade. Controls appear contextually: sliders, toggles, and number inputs that modify component props in real-time. Every interaction produces immediate visual feedback.

**Animation**: Entrance animations use `framer-motion` with staggered fade-up (delay 0.05s per item). Component transitions use `layoutId` for shared-element morphing. The timing bar cursor and power meter needle animate continuously as ambient motion. Hover states use scale(1.02) with a 150ms spring.

**Typography System**: `Space Grotesk` for headings (700 weight, tight tracking) paired with `Inter` for body text (400/500). Monospace `JetBrains Mono` for code snippets and prop values. Heading sizes follow a 1.25 modular scale.

</idea>
<probability>0.07</probability>
<text>A broadcast control room aesthetic with deep blacks, electric green accents, and a split-screen layout that feels like tuning into a live cricket match.</text>
</response>

<response>
<idea>

## Idea 2: "Pitch Blueprint" — Technical Schematic Aesthetic

**Design Movement**: Engineering blueprint / technical drawing style — precise, measured, analytical. Think architectural CAD drawings meets modern developer documentation.

**Core Principles**:
1. Grid-based precision with visible construction lines and measurement annotations
2. Monochromatic base with selective color coding for different component categories
3. Educational clarity — every component is presented as a "specimen" with labeled anatomy
4. Paper-like texture on a dark navy canvas

**Color Philosophy**: Dark navy (`#0f172a`) base with a warm off-white (`#f8fafc`) for "blueprint paper" cards. Cyan (`#06b6d4`) for construction lines and annotations. Each component category gets a distinct hue: Scoreboard = amber, Controls = emerald, Gauges = violet. The intent is "technical precision with warmth."

**Layout Paradigm**: Full-page scrollable vertical layout with a sticky top navigation bar showing component categories as tabs. Each component occupies a full-width "specimen card" — left side shows the live component, right side shows an annotated diagram with dimension lines, color swatches, and a collapsible code block.

**Signature Elements**:
1. Dashed construction lines with dimension annotations (e.g., "160px", "gap: 24px") that appear on hover
2. A dot-grid background pattern on specimen cards, like engineering graph paper
3. Color swatch pills next to every colored element, showing the hex value

**Interaction Philosophy**: Hover over any sub-element to see its dimensions and styling highlighted with cyan construction lines. Click to isolate and expand. Sliders and inputs in
