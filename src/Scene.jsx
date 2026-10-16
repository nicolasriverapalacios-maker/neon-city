import { Component, Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import City from "./City.jsx";
import { DISTRICTS } from "./cityData.js";

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError(false);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Unsupported({ onReady }) {
  useEffect(() => {
    onReady(false);
  }, [onReady]);
  return null;
}

function MarkerProjection({ markerRefs }) {
  const { camera, size } = useThree();
  const point = useRef(new THREE.Vector3());
  useFrame(() => {
    DISTRICTS.filter((d) => d.marker).forEach((d) => {
      const element = markerRefs.current[d.id];
      if (!element) return;
      point.current.fromArray(d.marker).project(camera);
      const x = (point.current.x * 0.5 + 0.5) * size.width;
      const y = (-point.current.y * 0.5 + 0.5) * size.height;
      const visible =
        point.current.z < 1 &&
        x > 20 &&
        x < size.width - 20 &&
        y > 20 &&
        y < size.height - 20;
      element.hidden = !visible;
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
    });
  });
  return null;
}

function CameraRig({
  district,
  resetKey,
  tour,
  paused,
  reducedMotion,
  onReady,
  onMetrics,
  controlsRef,
  onTourStop,
}) {
  const { camera, gl, scene } = useThree();
  const moving = useRef(true);
  const elapsed = useRef(0);
  const frames = useRef({ count: 0, elapsed: 0 });
  const destination = useRef(new THREE.Vector3());
  const focus = useRef(new THREE.Vector3());
  useEffect(() => {
    destination.current.fromArray(district.position);
    focus.current.fromArray(district.target);
    moving.current = true;
    elapsed.current = 0;
    if (reducedMotion && controlsRef.current) {
      camera.position.copy(destination.current);
      controlsRef.current.target.copy(focus.current);
      controlsRef.current.update();
      moving.current = false;
    }
  }, [district, resetKey, reducedMotion, camera, controlsRef]);
  useEffect(() => {
    const canvas = gl.domElement;
    const stop = () => {
      moving.current = false;
      onTourStop();
    };
    const lost = (event) => {
      event.preventDefault();
      onReady(false);
    };
    canvas.addEventListener("pointerdown", stop);
    canvas.addEventListener("wheel", stop, { passive: true });
    canvas.addEventListener("webglcontextlost", lost);
    return () => {
      canvas.removeEventListener("pointerdown", stop);
      canvas.removeEventListener("wheel", stop);
      canvas.removeEventListener("webglcontextlost", lost);
    };
  }, [gl, onTourStop, onReady]);
  useEffect(() => {
    function key(event) {
      if (
        event.target.closest('button, input, select, textarea, [role="dialog"]')
      )
        return;
      const controls = controlsRef.current;
      if (!controls) return;
      const offset = camera.position.clone().sub(controls.target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      if (event.key === "ArrowLeft") spherical.theta += 0.12;
      else if (event.key === "ArrowRight") spherical.theta -= 0.12;
      else if (event.key === "ArrowUp")
        spherical.phi = Math.max(0.28, spherical.phi - 0.08);
      else if (event.key === "ArrowDown")
        spherical.phi = Math.min(1.4, spherical.phi + 0.08);
      else if (event.key === "+" || event.key === "=")
        spherical.radius = Math.max(14, spherical.radius * 0.9);
      else if (event.key === "-")
        spherical.radius = Math.min(185, spherical.radius * 1.1);
      else return;
      event.preventDefault();
      moving.current = false;
      onTourStop();
      camera.position
        .copy(controls.target)
        .add(offset.setFromSpherical(spherical));
      controls.update();
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [camera, controlsRef, onTourStop]);
  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;
    if (moving.current) {
      const alpha = 1 - Math.exp(-Math.min(delta, 0.1) * 2.7);
      camera.position.lerp(destination.current, alpha);
      controls.target.lerp(focus.current, alpha);
      if (camera.position.distanceTo(destination.current) < 0.06)
        moving.current = false;
      controls.update();
    } else if (tour && !paused && !reducedMotion) {
      elapsed.current += Math.min(delta, 0.05) * 0.09;
      const radius = Math.hypot(
        district.position[0] - district.target[0],
        district.position[2] - district.target[2],
      );
      const angle =
        Math.atan2(
          district.position[0] - district.target[0],
          district.position[2] - district.target[2],
        ) + elapsed.current;
      camera.position.set(
        district.target[0] + Math.sin(angle) * radius,
        district.position[1] + Math.sin(elapsed.current * 0.8) * 2,
        district.target[2] + Math.cos(angle) * radius,
      );
      controls.target.fromArray(district.target);
      controls.update();
    }
    frames.current.count++;
    frames.current.elapsed += delta;
    if (frames.current.elapsed > 1.5) {
      onMetrics({
        fps: Math.round(frames.current.count / frames.current.elapsed),
        calls: gl.info.render.calls,
      });
      frames.current = { count: 0, elapsed: 0 };
    }
    if (scene.userData.ready !== true) {
      scene.userData.ready = true;
      onReady(true);
    }
  });
  return null;
}

export default function Scene({
  district,
  resetKey,
  tour,
  paused,
  reducedMotion,
  quality,
  collected,
  onSelect,
  onReady,
  onMetrics,
  onTourStop,
  canvasRef,
}) {
  const controlsRef = useRef();
  const markerRefs = useRef({});
  return (
    <SceneBoundary onError={onReady}>
      <div className="scene-root">
        <Canvas
          camera={{
            position: DISTRICTS[0].position,
            fov: 43,
            near: 0.5,
            far: 400,
          }}
          dpr={quality === "high" ? [1, 1.5] : 1}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            preserveDrawingBuffer: true,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor("#071418", 0);
            canvasRef.current = gl.domElement;
          }}
          tabIndex={0}
          role="region"
          fallback={<Unsupported onReady={onReady} />}
          aria-label="Ciudad 3D interactiva. Arrastra para girar, usa la rueda para acercarte o elige un distrito."
        >
          <fog attach="fog" args={["#102a32", 95, 240]} />
          <ambientLight intensity={1.1} color="#9dc3d1" />
          <hemisphereLight args={["#a4e6f2", "#172226", 1.9]} />
          <directionalLight
            position={[30, 65, 30]}
            intensity={2.4}
            color="#b2d5e5"
          />
          <directionalLight
            position={[-45, 25, -25]}
            intensity={2.8}
            color="#618cbb"
          />
          <pointLight
            position={[0, 25, 20]}
            intensity={200}
            distance={80}
            color="#61f5e8"
          />
          <Suspense fallback={null}>
            <City
              quality={quality}
              paused={paused}
              reducedMotion={reducedMotion}
              selectedId={district.id}
              collected={collected}
              onSelect={onSelect}
            />
            {quality === "high" && (
              <Stars
                radius={150}
                depth={80}
                count={450}
                factor={1.2}
                saturation={0.1}
                fade
                speed={0}
              />
            )}
          </Suspense>
          <OrbitControls
            ref={controlsRef}
            makeDefault
            target={DISTRICTS[0].target}
            enablePan={false}
            minDistance={14}
            maxDistance={185}
            minPolarAngle={0.25}
            maxPolarAngle={1.43}
            enableDamping
            dampingFactor={0.07}
            rotateSpeed={0.5}
            zoomSpeed={0.65}
          />
          <CameraRig
            {...{
              district,
              resetKey,
              tour,
              paused,
              reducedMotion,
              onReady,
              onMetrics,
              controlsRef,
              onTourStop,
            }}
          />
          <MarkerProjection markerRefs={markerRefs} />
        </Canvas>
        <div className="scene-markers">
          {DISTRICTS.filter((d) => d.marker).map((d) => (
            <button
              key={d.id}
              ref={(element) => {
                markerRefs.current[d.id] = element;
              }}
              className={`world-marker ${district.id === d.id ? "selected" : ""} ${collected.includes(d.id) ? "found" : ""}`}
              style={{ "--marker-color": d.color }}
              aria-label={`Explorar ${d.name}`}
              onClick={() => onSelect(d.id)}
            >
              <span>{collected.includes(d.id) ? "✓" : d.number}</span>
              <i>{d.name}</i>
            </button>
          ))}
        </div>
      </div>
    </SceneBoundary>
  );
}
