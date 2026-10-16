# Graph Report - src  (2026-10-15)

## Corpus Check
- Corpus is ~7,216 words - fits in a single context window. You may not need a graph.

## Summary
- 51 nodes · 107 edges · 8 communities (5 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Scene and Camera Controls
- Interface and Signal Recovery
- Textures and Rain
- Procedural City Architecture
- Animated City Environment
- District Metadata and Persistence
- Ambient Audio Integration

## God Nodes (most connected - your core abstractions)
1. `City()` - 17 edges
2. `App()` - 12 edges
3. `Scene()` - 8 edges
4. `box()` - 6 edges
5. `Batch()` - 6 edges
6. `Sign()` - 5 edges
7. `Core()` - 5 edges
8. `Market()` - 5 edges
9. `Harbor()` - 5 edges
10. `SceneBoundary` - 5 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `restoreSignals()`  [EXTRACTED]
  App.jsx → cityData.js
- `App()` --calls--> `Scene()`  [EXTRACTED]
  App.jsx → Scene.jsx
- `App()` --calls--> `useCityAudio()`  [EXTRACTED]
  App.jsx → useCityAudio.js
- `Scene()` --calls--> `City()`  [EXTRACTED]
  Scene.jsx → City.jsx
- `App()` --calls--> `tuneSignal()`  [EXTRACTED]
  App.jsx → cityData.js

## Import Cycles
- None detected.

## Communities (8 total, 3 thin omitted)

### Community 0 - "Scene and Camera Controls"
Cohesion: 0.22
Nodes (5): CameraRig(), MarkerProjection(), Scene(), SceneBoundary, Unsupported()

### Community 1 - "Interface and Signal Recovery"
Cohesion: 0.32
Nodes (7): App(), tune(), CityMap(), Icon(), Modal(), Skyline(), tuneSignal()

### Community 2 - "Textures and Rain"
Cohesion: 0.32
Nodes (5): color, dummy, facadeTexture(), noise(), Rain()

### Community 3 - "Procedural City Architecture"
Cohesion: 0.43
Nodes (8): Batch(), box(), Core(), Harbor(), makeArchitecture(), Market(), Rail(), Sign()

### Community 4 - "Animated City Environment"
Cohesion: 0.33
Nodes (6): Canal(), City(), Selection(), signTexture(), SkylineCrowns(), Traffic()

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `City()` connect `Animated City Environment` to `Scene and Camera Controls`, `Textures and Rain`, `Procedural City Architecture`, `District Metadata and Persistence`?**
  _High betweenness centrality (0.241) - this node is a cross-community bridge._
- **Why does `Scene()` connect `Scene and Camera Controls` to `Interface and Signal Recovery`, `Animated City Environment`, `District Metadata and Persistence`, `Ambient Audio Integration`?**
  _High betweenness centrality (0.207) - this node is a cross-community bridge._
- **Why does `App()` connect `Interface and Signal Recovery` to `Scene and Camera Controls`, `District Metadata and Persistence`, `Ambient Audio Integration`, `Application Bootstrap`?**
  _High betweenness centrality (0.138) - this node is a cross-community bridge._
## Extraction limitations

Code-only AST extraction used 0 LLM input tokens and 0 LLM output tokens. This excludes the host session tokens used to install, run, inspect, and label the graph. CSS is not structurally parsed; its import appears as a reference. main.jsx contains no symbol declarations. Graph health found 1 dangling-endpoint edge and 1 same-endpoint relationship collapse in the undirected view; see GRAPH_HEALTH.txt. External library references are not dependency internals.
