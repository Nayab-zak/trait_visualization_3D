# Three.js Trait Visualization App

## Demo

<video src="Trait Visualization 3D ‑ Made with RecordCast.mp4" controls width="600"></video>

## Overview
This project is an interactive 3D visualization app built with TypeScript, React, and Three.js. It features a central neon node ("sun") and outer nodes orbiting in a galaxy/starfield background. The app includes physics-based animation, velocity arrows, interactive tooltips, day/night mode, a floating control panel, and real-time parameter adjustment.

## Features
- Neon-glowing spheres for nodes and sun
- Unified node data model: each node has both `traits` and `preferences` (editable in real time)
- Hooke-law spring force between central and outer nodes, modulated by trait/preference compatibility
- **Spring Connections Mode:** Toggle to show/hide spring lines between nodes, with color intensity based on force
- Draggable nodes (including the sun) with physics-based movement
- Real-time physics simulation with velocity arrows (toggleable)
- Interactive, neomorphic tooltips on hover/click showing node name, traits, and preferences
- Day/night mode toggle
- Floating, compact, neomorphic control panel with icon buttons and collapsible UI
- Real-time adjustment of node count, traits, preferences, force constants, node/sun size and color, and angular speed
- Central node (sun) selection and customization
- Node orbit initialization (randomized or even)
- Camera lock/unlock, reset, and pan/zoom controls
- Performance optimization for up to 20 nodes
- Neon starfield background with interactive glow effect

## Usage
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm start
   ```
3. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Controls
- Use the floating control panel (top right) to adjust all simulation parameters in real time.
- **Show Spring Connections:** Toggle to display or hide spring lines between the central and outer nodes.
- **Show Force Arrows:** Toggle to display or hide velocity/force arrows for debugging.
- Drag any node (including the sun) to reposition it. Dragging the sun moves all nodes with a springy effect.
- Click nodes to view tooltips. Only one tooltip is shown at a time.
- Use the camera controls to pan, zoom, lock/unlock, and reset the view.
- Toggle day/night mode with the button at the top right of the control panel.

## File Structure
- `src/ThreeSceneComponent.tsx` — Main React component, UI logic, drag/tooltip logic
- `src/ThreeSceneCore.ts` — Three.js scene setup, animation, node creation, orbit logic, physics, spring line rendering
- `src/ThreeSceneUtils.ts` — Utility functions, tooltips
- `src/ControlsPanel.tsx` — Neomorphic control panel, spring/force toggles
- `src/PerformanceService.ts` — Performance optimization
- `src/node.interface.ts`, `src/node-mock-data.ts`, `src/PhysicsService.ts` — Node data model and physics logic (traits/preferences, spring force)
- `public/index.html`, `package.json`, `tsconfig.json`, `webpack.config.js` — Project config

## Customization
- All simulation and visual parameters can be adjusted in real time via the control panel.
- The code is modular and easy to extend for new features or visual styles.

## License
MIT
