# 3D Neural Network Prototype

This is a standalone React/Vite sketch for visualizing a neural network in WebGL. It is intentionally small: the goal is to practice graphics programming concepts before folding similar ideas back into the Vault-Web dashboard.

## Learning Context

- **Course / concept:** Computer graphics, graph visualization, and neural-network intuition.
- **What it demonstrates:** React Three Fiber scene composition, layered node layout, animated data-flow particles, bloom postprocessing, and camera controls.
- **Portfolio role:** A visual prototype for explaining connected systems, not a trained machine-learning model.

## How It Works

- `src/App.jsx` creates the full-screen Three.js canvas, lights, orbit controls, and dashboard overlay.
- `src/NeuralNetwork.jsx` defines four static layers, creates nodes with randomized depth offsets, connects adjacent layers, and animates particles along those connections.
- CSS files provide the glass-panel UI and dark visual theme around the canvas.

## Run It

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

## Known Limitations

- Node positions and displayed activation/bias values are randomized on load, so this is not deterministic.
- The visualization is conceptual only; it does not run inference or train a model.
- The production bundle is large because the prototype ships Three.js and postprocessing in one entry point.
