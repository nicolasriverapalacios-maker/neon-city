import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CYAN = "#6df9e7",
  AMBER = "#ffad68",
  PINK = "#f284ce";
const dummy = new THREE.Object3D();
const color = new THREE.Color();
const box = (p, s, c = "#142c37", r = 0) => ({ p, s, c, r });
const noise = (n) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

function facadeTexture(seed) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#101e28";
  ctx.fillRect(0, 0, 256, 512);
  for (let y = 9; y < 501; y += 16) {
    ctx.fillStyle = "#1b303b";
    ctx.fillRect(0, y + 11, 256, 2);
    for (let x = 10; x < 250; x += 20) {
      const n = noise(x + y * 3 + seed * 87);
      ctx.fillStyle =
        n > 0.78
          ? "#c8a778"
          : n > 0.53
            ? "#75aca9"
            : n > 0.3
              ? "#304951"
              : "#152630";
      ctx.fillRect(x, y, 9, 7);
      if (n > 0.9) {
        ctx.fillStyle = "#e6cc9d";
        ctx.fillRect(x, y, 9, 2);
      }
    }
  }
  ctx.fillStyle = "#314a55";
  for (let x = 0; x < 256; x += 64) ctx.fillRect(x, 0, 3, 512);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function signTexture(title, subtitle, hue) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 384;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#07171f";
  ctx.fillRect(0, 0, 1024, 384);
  ctx.strokeStyle = hue;
  ctx.lineWidth = 5;
  ctx.strokeRect(12, 12, 1000, 360);
  ctx.fillStyle = hue;
  ctx.fillRect(38, 36, 12, 35);
  ctx.font = "500 24px monospace";
  ctx.fillText("NEON CITY / OPEN ALL NIGHT", 72, 63);
  ctx.font = "700 114px sans-serif";
  ctx.fillText(title, 38, 208, 946);
  ctx.fillStyle = "#e2eae7";
  ctx.font = "30px monospace";
  ctx.fillText(subtitle, 42, 301, 920);
  ctx.fillStyle = hue;
  for (let i = 0; i < 22; i++)
    ctx.fillRect(700 + i * 11, 279, i % 3 ? 3 : 6, 37);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function Batch({ items, neon = false, texture, dark = false }) {
  const ref = useRef();
  useLayoutEffect(() => {
    items.forEach((item, i) => {
      dummy.position.set(...item.p);
      dummy.rotation.set(0, item.r, 0);
      dummy.scale.set(...item.s);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
      ref.current.setColorAt(i, color.set(item.c));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [items]);
  if (!items.length) return null;
  return (
    <instancedMesh ref={ref} args={[null, null, items.length]} frustumCulled>
      <boxGeometry args={[1, 1, 1]} />
      {neon ? (
        <meshBasicMaterial toneMapped={false} />
      ) : (
        <meshStandardMaterial
          map={texture}
          emissiveMap={texture}
          emissive={texture ? "#c7f1e8" : "#000000"}
          emissiveIntensity={texture ? 0.62 : 0}
          roughness={dark ? 0.7 : 0.48}
          metalness={0.5}
        />
      )}
    </instancedMesh>
  );
}

function makeArchitecture() {
  const shell = [],
    lights = [],
    windows = [[], [], []],
    streets = [],
    details = [];
  const towers = [
    [-36, -26, 8, 7, 21],
    [-24, -28, 7, 8, 29],
    [-12, -29, 7, 7, 23],
    [0, -30, 9, 7, 33],
    [13, -27, 8, 8, 28],
    [26, -28, 8, 8, 24],
    [37, -23, 7, 7, 17],
    [-37, -10, 7, 8, 18],
    [-26, -12, 8, 8, 25],
    [-14, -13, 6, 7, 17],
    [13, -12, 7, 8, 23],
    [25, -12, 8, 7, 31],
    [37, -8, 7, 8, 20],
    [-37, 4, 7, 7, 13],
    [-25, 3, 7, 7, 17],
    [-14, 1, 5, 6, 12],
    [13, 2, 6, 7, 16],
    [26, 2, 8, 7, 20],
    [38, 5, 6, 7, 11],
    [-39, 16, 5, 7, 8],
    [-13, 15, 6, 6, 7],
    [1, 15, 7, 7, 9],
    [12, 15, 5, 7, 6],
    [38, 18, 5, 6, 8],
    [-39, -38, 5, 5, 9],
    [-28, -39, 6, 5, 13],
    [-17, -39, 6, 5, 10],
    [-5, -41, 6, 6, 14],
    [8, -40, 5, 5, 12],
    [20, -39, 6, 6, 11],
    [33, -37, 6, 5, 13],
  ];
  towers.forEach(([x, z, w, d, h], i) => {
    const tint = i % 4 === 0 ? "#c5d0d0" : i % 4 === 1 ? "#9bb4b9" : "#aec5ca";
    const palette = i % 5 === 0 ? AMBER : i % 5 === 2 ? PINK : CYAN;
    shell.push(box([x, 0.55, z], [w + 1.5, 1.1, d + 1.5], "#1b3540"));
    windows[i % 3].push(box([x, h * 0.38 + 1, z], [w, h * 0.76, d], tint));
    windows[(i + 1) % 3].push(
      box(
        [x + 0.35, h * 0.86 + 1, z - 0.2],
        [w * 0.72, h * 0.24, d * 0.72],
        tint,
      ),
    );
    shell.push(
      box([x + 0.35, h + 1.2, z - 0.2], [w * 0.75, 0.5, d * 0.75], "#29434d"),
    );
    if (i !== 1 && i !== 11)
      shell.push(
        box([x + 0.35, h + 1.7, z - 0.2], [w * 0.4, 0.7, d * 0.4], "#10252e"),
      );
    lights.push(
      box([x, h * 0.76 + 1.1, z + d * 0.5 + 0.025], [w, 0.075, 0.07], palette),
    );
    lights.push(
      box(
        [x + w * 0.5 + 0.02, h * 0.38 + 1, z + d * 0.46],
        [0.075, h * 0.76, 0.09],
        palette,
      ),
    );
    if (i % 3 === 0) {
      shell.push(box([x - w * 0.22, h + 2.4, z], [0.12, 3, 0.12], "#48616a"));
      lights.push(box([x - w * 0.22, h + 4, z], [0.18, 0.18, 0.18], PINK));
    }
    for (let rib = -1; rib <= 1; rib++)
      shell.push(
        box(
          [x + rib * w * 0.31, h * 0.38 + 1, z + d * 0.5 + 0.07],
          [0.13, h * 0.76, 0.2],
          "#182f39",
        ),
      );
    details.push(
      box(
        [x + w * 0.28, 1.1, z + d * 0.5 + 0.55],
        [w * 0.25, 1.6, 0.55],
        "#2b464e",
      ),
    );
  });
  // Twin service fins make the northern communications tower legible in silhouette.
  [-1, 1].forEach((side) => {
    shell.push(box([13 + side * 4.8, 19, -27], [0.8, 25, 5.4], "#264a58"));
    lights.push(box([13 + side * 5.23, 19, -24.28], [0.07, 25, 0.08], AMBER));
    shell.push(box([13 + side * 4.8, 32.5, -27], [0.35, 2, 0.35], "#456472"));
  });
  // The boulevard grid stays open between the towers and the three landmarks.
  [-20, -4, 11, 23, 39].forEach((z) => {
    streets.push(box([0, 0.045, z], [88, 0.08, z === 23 ? 5 : 3.5], "#0a1921"));
    for (let x = -43; x < 44; x += 3.8)
      lights.push(box([x, 0.1, z], [1.5, 0.018, 0.045], "#737c72"));
    lights.push(box([0, 0.11, z + 1.6], [88, 0.02, 0.045], "#3c7879"));
  });
  [-32, -19, 7, 20, 33].forEach((x) => {
    streets.push(box([x, 0.05, -8], [3.5, 0.08, 64], "#0a1921"));
    for (let z = -39; z < 25; z += 4)
      lights.push(box([x, 0.11, z], [0.05, 0.02, 1.8], "#637d76"));
  });
  for (let x = -40; x < 43; x += 5) {
    details.push(box([x, 0.3, 22], [1.2, 0.5, 1], "#253f46"));
    lights.push(box([x, 0.58, 22.1], [0.75, 0.035, 0.1], CYAN));
    details.push(box([x, 1.5, 24], [0.07, 3, 0.07], "#53666d"));
    lights.push(box([x, 3, 24], [0.65, 0.08, 0.24], AMBER));
  }
  [-34, 0, 34].forEach((x) => {
    shell.push(box([x, 0.6, 29], [5, 1, 15], "#16313b"));
    streets.push(box([x, 1.13, 29], [4, 0.09, 15], "#0c202b"));
    [-2.4, 2.4].forEach((dx) => {
      shell.push(box([x + dx, 1.6, 29], [0.16, 1, 15], "#254751"));
      lights.push(box([x + dx, 2.12, 29], [0.1, 0.08, 15], CYAN));
      [-5, 5].forEach((dz) =>
        shell.push(box([x + dx, -0.75, 29 + dz], [0.6, 2.6, 0.8], "#112b34")),
      );
    });
  });
  for (let x = -43; x < 44; x += 2) {
    shell.push(box([x, 0.7, 35.4], [0.08, 1.3, 0.08], "#38545a"));
    shell.push(box([x, 0.7, 22.7], [0.08, 1.3, 0.08], "#38545a"));
  }
  shell.push(box([0, 1.26, 35.4], [90, 0.07, 0.07], "#3f686b"));
  lights.push(box([0, -0.2, 22.8], [92, 0.08, 0.12], CYAN));
  lights.push(box([0, -0.2, 35.3], [92, 0.08, 0.12], "#286d76"));
  // Smaller services on the near quay preserve the skyline's negative space.
  [-26, -17, 14, 24].forEach((x, i) => {
    windows[i % 3].push(box([x, 2.1, 41], [7, 4.2, 5], "#9cb2b5"));
    shell.push(box([x, 4.4, 41], [7.6, 0.4, 5.6], "#1d3540"));
    lights.push(box([x, 4.65, 43.6], [6.8, 0.07, 0.08], i % 2 ? AMBER : CYAN));
  });
  return { shell, lights, windows, streets, details };
}

function Sign({ position, rotation = [0, 0, 0], size = [7, 2.65], texture }) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        map={texture}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Core({ facade, sign, onSelect }) {
  const parts = useMemo(() => {
    const shell = [],
      lights = [];
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      shell.push(
        box(
          [Math.sin(a) * 5.3, 18, Math.cos(a) * 5.3],
          [0.38, 34, 0.38],
          "#285260",
          a,
        ),
      );
      lights.push(
        box(
          [Math.sin(a) * 5.52, 18, Math.cos(a) * 5.52],
          [0.055, 33, 0.055],
          CYAN,
        ),
      );
      shell.push(
        box(
          [Math.sin(a) * 7.1, 3, Math.cos(a) * 7.1],
          [1.5, 5.2, 1.5],
          "#203e47",
          a,
        ),
      );
    }
    return { shell, lights };
  }, []);
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.("core");
      }}
    >
      <mesh position={[0, 1, 0]} rotation={[0, Math.PI / 8, 0]}>
        <cylinderGeometry args={[8.5, 9.5, 2, 8]} />
        <meshStandardMaterial
          color="#25434c"
          metalness={0.65}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, 19, 0]} rotation={[0, Math.PI / 8, 0]}>
        <cylinderGeometry args={[4.8, 5.6, 34, 8]} />
        <meshStandardMaterial
          map={facade}
          color="#a5c8cf"
          emissiveMap={facade}
          emissive="#a2dedc"
          emissiveIntensity={0.7}
          metalness={0.65}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 37.6, 0]} rotation={[0, Math.PI / 8, 0]}>
        <cylinderGeometry args={[2.8, 4.8, 3.5, 8]} />
        <meshStandardMaterial color="#264953" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 41.2, 0]}>
        <cylinderGeometry args={[0.12, 1.25, 6.5, 8]} />
        <meshBasicMaterial color={CYAN} toneMapped={false} />
      </mesh>
      <Batch items={parts.shell} />
      <Batch items={parts.lights} neon />
      {[
        [33, 7.1, 0.1],
        [38.7, 5.4, 0.09],
        [42.5, 3.1, 0.06],
      ].map(([y, r, t]) => (
        <group key={y} position={[0, y, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r, t, 6, 96]} />
            <meshBasicMaterial color={CYAN} toneMapped={false} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r + 0.35, 0.025, 4, 96]} />
            <meshBasicMaterial color="#2b696e" />
          </mesh>
        </group>
      ))}
      <Sign position={[0, 29.2, 5.62]} texture={sign} size={[7.6, 2.85]} />
      <mesh position={[0, 4.3, 6.8]}>
        <boxGeometry args={[5, 3, 0.15]} />
        <meshStandardMaterial
          color="#07171f"
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0, 4.3, 6.9]}>
        <boxGeometry args={[0.08, 2.6, 0.04]} />
        <meshBasicMaterial color={CYAN} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Market({ sign, onSelect }) {
  const parts = useMemo(() => {
    const shell = [],
      lights = [],
      awnings = [];
    [-1, 0, 1].forEach((row) => {
      [-1, 0, 1].forEach((col) => {
        const x = col * 3.8,
          z = row * 3.3;
        shell.push(box([x, 1.3, z], [3.1, 2.6, 2.4], "#42382f"));
        awnings.push(
          box(
            [x, 2.9, z + 0.4],
            [3.6, 0.18, 3.4],
            col === 0 ? "#825231" : "#884439",
          ),
        );
        lights.push(box([x, 2.7, z + 2.1], [3.4, 0.09, 0.1], AMBER));
        for (let i = -1; i <= 1; i++) {
          shell.push(
            box([x + i * 0.8, 1.1, z + 1.35], [0.55, 1, 0.35], "#3a3e38"),
          );
          lights.push(
            box(
              [x + i * 0.8, 1.62, z + 1.35],
              [0.46, 0.05, 0.3],
              i === 0 ? PINK : AMBER,
            ),
          );
        }
      });
    });
    [-6, 6].forEach((x) => {
      shell.push(box([x, 3.8, 0], [0.24, 7.6, 0.24], "#39515a"));
      lights.push(box([x, 6.6, 0.15], [0.08, 1.2, 0.08], AMBER));
    });
    shell.push(box([0, 6.8, 0], [12.4, 0.3, 0.45], "#4b5050"));
    return { shell, lights, awnings };
  }, []);
  return (
    <group
      position={[25, 0, 17]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.("market");
      }}
    >
      <Batch items={parts.shell} />
      <Batch items={parts.awnings} />
      <Batch items={parts.lights} neon />
      <Sign position={[0, 5.2, 1]} size={[8.1, 3.1]} texture={sign} />
      {[-4, -2, 0, 2, 4].map((x, i) => (
        <group key={x} position={[x, 4.7 + Math.sin(i) * 0.2, 5]}>
          <mesh>
            <sphereGeometry args={[0.26, 8, 8]} />
            <meshBasicMaterial
              color={i % 2 ? PINK : AMBER}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 1.1, 4]} />
            <meshBasicMaterial color="#66645a" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Harbor({ sign, onSelect }) {
  const parts = useMemo(() => {
    const shell = [],
      lights = [];
    [-4.8, -1.6, 1.6, 4.8].forEach((x, i) => {
      shell.push(
        box([x, 0.85, 3.7], [2.8, 1.7, 2.8], i % 2 ? "#41424d" : "#263f4d"),
      );
      lights.push(
        box([x, 1.75, 5.15], [2.6, 0.045, 0.08], i % 2 ? PINK : AMBER),
      );
      for (let j = 0; j < 5; j++)
        shell.push(
          box([x - 1.2 + j * 0.6, 0.9, 5.15], [0.08, 1.5, 0.1], "#56707a"),
        );
    });
    [-5.9, 5.9].forEach((x) => {
      shell.push(box([x, 5.5, -1], [0.45, 11, 0.5], "#34525e"));
      shell.push(box([x + 1.2, 10.7, -1], [3, 0.35, 0.5], "#34525e"));
      lights.push(box([x, 7.5, -0.65], [0.08, 4, 0.08], PINK));
    });
    return { shell, lights };
  }, []);
  return (
    <group
      position={[-25, 0, 17]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.("harbor");
      }}
    >
      <mesh position={[0, 2.2, -1]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[5.2, 5.2, 12, 24, 1, true, 0, Math.PI]} />
        <meshStandardMaterial
          color="#28444f"
          side={THREE.DoubleSide}
          metalness={0.8}
          roughness={0.4}
        />
      </mesh>
      {[-5.8, -3, 0, 3, 5.8].map((x) => (
        <mesh key={x} position={[x, 2.2, -1]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[5.24, 0.065, 5, 40, Math.PI]} />
          <meshBasicMaterial color={PINK} toneMapped={false} />
        </mesh>
      ))}
      <Batch items={parts.shell} />
      <Batch items={parts.lights} neon />
      <Sign position={[0, 4.7, 4.4]} texture={sign} size={[8, 3]} />
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[14, 0.6, 13]} />
        <meshStandardMaterial
          color="#29424c"
          metalness={0.6}
          roughness={0.45}
        />
      </mesh>
    </group>
  );
}

function Rail() {
  const geometry = useMemo(() => {
    const points = Array.from({ length: 129 }, (_, i) => {
      const a = (i / 128) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * 40, 6.4, Math.sin(a) * 22 - 2);
    });
    return new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points, true),
      192,
      0.2,
      5,
      true,
    );
  }, []);
  const supports = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => {
        const a = (i / 20) * Math.PI * 2;
        return box(
          [Math.cos(a) * 40, 3.1, Math.sin(a) * 22 - 2],
          [0.45, 6.2, 0.45],
          "#29464f",
        );
      }),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#3c626b"
          metalness={0.7}
          roughness={0.35}
        />
      </mesh>
      <mesh
        geometry={geometry}
        position={[0, 0.3, 0]}
        scale={[1.012, 1, 1.012]}
      >
        <meshBasicMaterial color="#3faeae" toneMapped={false} />
      </mesh>
      <Batch items={supports} />
    </group>
  );
}

function SkylineCrowns() {
  return (
    <group>
      {[
        [-24, 30.6, -28, 2.65, CYAN],
        [25, 32.6, -12, 3.05, AMBER],
      ].map(([x, y, z, r, hue]) => (
        <group key={x} position={[x, y, z]}>
          <mesh>
            <cylinderGeometry args={[r * 0.75, r, 2.2, 12]} />
            <meshStandardMaterial
              color="#29434e"
              metalness={0.72}
              roughness={0.42}
            />
          </mesh>
          <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r, 0.07, 5, 48]} />
            <meshBasicMaterial color={hue} toneMapped={false} />
          </mesh>
          <mesh position={[0, 1.6, 0]}>
            <cylinderGeometry args={[r * 0.3, r * 0.55, 1, 12]} />
            <meshStandardMaterial
              color="#152e39"
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.06, 0.09, 1.2, 5]} />
            <meshBasicMaterial color={hue} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Rain({ paused, reducedMotion, quality }) {
  const count = quality === "low" ? 150 : 650;
  const geometry = useMemo(() => {
    const vertices = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      const x = (noise(i * 3 + 1) - 0.5) * 104,
        y = noise(i * 3 + 2) * 58,
        z = (noise(i * 3 + 3) - 0.5) * 98;
      vertices.set([x, y, z, x + 0.12, y + 0.85, z], i * 6);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(vertices, 3).setUsage(THREE.DynamicDrawUsage),
    );
    return g;
  }, [count]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    if (paused || reducedMotion) return;
    const positions = geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const index = i * 6;
      let y = positions.array[index + 1] - Math.min(delta, 0.05) * 20;
      if (y < 0.5) y += 58;
      positions.array[index + 1] = y;
      positions.array[index + 4] = y + 0.85;
    }
    positions.needsUpdate = true;
  });
  return (
    <lineSegments
      geometry={geometry}
      visible={!reducedMotion}
      frustumCulled={false}
    >
      <lineBasicMaterial
        color="#95b6c3"
        transparent
        opacity={quality === "low" ? 0.13 : 0.2}
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  );
}

function Traffic({ paused, reducedMotion, quality }) {
  const bodies = useRef(),
    glow = useRef(),
    time = useRef(0);
  const count = quality === "low" ? 22 : 42;
  useFrame((_, delta) => {
    if (!paused && !reducedMotion) time.current += Math.min(delta, 0.05);
    const t = time.current;
    for (let i = 0; i < count; i++) {
      let x, y, z, angle, sx, sy, sz;
      if (i < 9) {
        const a = t * 0.055 + i * 0.048;
        x = Math.cos(a) * 40;
        y = 6.95;
        z = Math.sin(a) * 22 - 2;
        angle = -a;
        sx = 0.8;
        sy = 0.72;
        sz = 1.6;
      } else if (i < 15) {
        const a = t * 0.035 + i * 1.9;
        x = Math.sin(a) * 29;
        y = 19 + Math.sin(a * 2) * 3;
        z = Math.cos(a) * 17 - 6;
        angle = a;
        sx = 0.7;
        sy = 0.15;
        sz = 0.8;
      } else {
        const lane = i % 3;
        x = ((((t * (i % 2 ? -3 : 3) + i * 13) % 86) + 86) % 86) - 43;
        y = 0.45;
        z = [-20.7, 10.3, 39.7][lane];
        angle = Math.PI / 2;
        sx = 0.65;
        sy = 0.38;
        sz = 1.25;
      }
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, angle, 0);
      dummy.scale.set(sx, sy, sz);
      dummy.updateMatrix();
      bodies.current.setMatrixAt(i, dummy.matrix);
      dummy.position.y += sy * 0.55;
      dummy.scale.set(sx * 0.85, 0.07, sz * 0.7);
      dummy.updateMatrix();
      glow.current.setMatrixAt(i, dummy.matrix);
      if (!glow.current.instanceColor) continue;
    }
    bodies.current.instanceMatrix.needsUpdate = true;
    glow.current.instanceMatrix.needsUpdate = true;
  });
  useLayoutEffect(() => {
    for (let i = 0; i < count; i++)
      glow.current.setColorAt(
        i,
        color.set(i < 9 ? CYAN : i % 3 === 0 ? PINK : AMBER),
      );
    glow.current.instanceColor.needsUpdate = true;
  }, [count]);
  return (
    <group>
      <instancedMesh
        ref={bodies}
        args={[null, null, count]}
        frustumCulled={false}
      >
        <boxGeometry />
        <meshStandardMaterial color="#77949d" metalness={0.7} roughness={0.3} />
      </instancedMesh>
      <instancedMesh
        ref={glow}
        args={[null, null, count]}
        frustumCulled={false}
      >
        <boxGeometry />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

// shortcut: los reflejos son analíticos; usar reflexión planar si se añade un paseo a nivel del canal.
const waterVertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const waterFragment = `uniform float uTime;varying vec2 vUv;
void main(){
  vec2 uv=vUv;float ripple=sin(uv.y*240.+sin(uv.x*45.+uTime*.5)*3.+uTime)*.5+.5;
  float wav=sin(uv.y*77.-uTime*.45)*.012+sin(uv.y*188.+uTime)*.005;
  vec3 c=vec3(.012,.055,.075)+ripple*vec3(.002,.012,.014);
  float broken=smoothstep(.26,.72,sin(uv.y*213.+uTime*.4)*.5+.5);
  float core=exp(-abs(uv.x-.5+wav)*75.);float market=exp(-abs(uv.x-.773+wav)*48.);float harbor=exp(-abs(uv.x-.227+wav)*46.);
  c+=(core*vec3(.13,.7,.6)+market*vec3(.55,.22,.055)+harbor*vec3(.38,.09,.32))*broken*(.25+uv.y*.7);
  c+=vec3(.04,.14,.15)*pow(ripple,22.)*.15;
  gl_FragColor=vec4(c,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

function Canal({ paused, reducedMotion }) {
  const material = useRef(),
    boat = useRef(),
    time = useRef(0);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((_, delta) => {
    if (!paused && !reducedMotion) time.current += Math.min(delta, 0.05);
    material.current.uniforms.uTime.value = time.current;
    boat.current.position.x = Math.sin(time.current * 0.032 + 1) * 24;
    boat.current.position.y = -0.5 + Math.sin(time.current * 0.6) * 0.045;
  });
  return (
    <group>
      <mesh position={[0, -0.68, 29]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[92, 12]} />
        <shaderMaterial
          ref={material}
          vertexShader={waterVertex}
          fragmentShader={waterFragment}
          uniforms={uniforms}
        />
      </mesh>
      <group ref={boat} position={[21, -0.5, 29]}>
        <mesh>
          <boxGeometry args={[5, 0.55, 1.65]} />
          <meshStandardMaterial
            color="#213c47"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[-0.7, 0.6, 0]}>
          <boxGeometry args={[1.6, 0.9, 1.35]} />
          <meshStandardMaterial
            color="#65838a"
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[-0.6, 0.78, 0.7]}>
          <boxGeometry args={[1.2, 0.25, 0.025]} />
          <meshBasicMaterial color={AMBER} toneMapped={false} />
        </mesh>
        <mesh position={[0.6, 0.33, 0]}>
          <boxGeometry args={[2.2, 0.055, 1.5]} />
          <meshBasicMaterial color={CYAN} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

function Selection({ selectedId, collected, paused, reducedMotion }) {
  const ref = useRef(),
    time = useRef(0);
  useFrame((_, delta) => {
    if (!paused && !reducedMotion) time.current += Math.min(delta, 0.05);
    if (ref.current) ref.current.rotation.z = time.current * 0.13;
  });
  const positions = {
    core: [0, 0.15, 0],
    market: [25, 0.15, 17],
    harbor: [-25, 0.7, 17],
  };
  return (
    <group>
      {Object.entries(positions).map(([id, p]) => (
        <group key={id} position={p}>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            visible={selectedId === id || collected.includes(id)}
          >
            <ringGeometry
              args={[id === "core" ? 9.7 : 8, id === "core" ? 9.8 : 8.1, 96]}
            />
            <meshBasicMaterial
              color={id === "core" ? CYAN : id === "market" ? AMBER : PINK}
              transparent
              opacity={selectedId === id ? 0.9 : 0.32}
              toneMapped={false}
            />
          </mesh>
          {selectedId === id && (
            <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry
                args={[
                  id === "core" ? 10.4 : 8.7,
                  id === "core" ? 10.52 : 8.82,
                  64,
                  1,
                  0,
                  Math.PI * 1.35,
                ]}
              />
              <meshBasicMaterial
                color={CYAN}
                transparent
                opacity={0.7}
                toneMapped={false}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

export default function City({
  quality = "high",
  paused = false,
  reducedMotion = false,
  selectedId = "overview",
  collected = [],
  onSelect,
}) {
  const architecture = useMemo(makeArchitecture, []);
  const textures = useMemo(
    () => [
      facadeTexture(1),
      facadeTexture(2),
      facadeTexture(3),
      signTexture("AETERNA", "MEMORY SYSTEMS / 88.4 MHz", CYAN),
      signTexture("KOYO", "RECUERDOS · NIGHT MARKET", AMBER),
      signTexture("UMBRAL", "ÚLTIMO TREN / 96.7 MHz", PINK),
    ],
    [],
  );
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);
  return (
    <group>
      <mesh position={[0, -2.15, 0]}>
        <boxGeometry args={[96, 2.8, 96]} />
        <meshStandardMaterial color="#0b202b" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, -0.45, -12]}>
        <boxGeometry args={[94, 0.9, 70]} />
        <meshStandardMaterial
          color="#152b34"
          roughness={0.76}
          metalness={0.3}
        />
      </mesh>
      <mesh position={[0, -0.45, 40.6]}>
        <boxGeometry args={[94, 0.9, 10.6]} />
        <meshStandardMaterial color="#18323b" roughness={0.7} metalness={0.4} />
      </mesh>
      <Batch items={architecture.streets} dark />
      <Batch items={architecture.shell} />
      <Batch items={architecture.details} />
      {architecture.windows.map((items, i) => (
        <Batch key={i} items={items} texture={textures[i]} />
      ))}
      <Batch items={architecture.lights} neon />
      <Core facade={textures[1]} sign={textures[3]} onSelect={onSelect} />
      <Market sign={textures[4]} onSelect={onSelect} />
      <Harbor sign={textures[5]} onSelect={onSelect} />
      <Sign position={[-25, 18.5, 7]} texture={textures[5]} size={[7, 2.6]} />
      <Sign
        position={[26, 18.3, 6.1]}
        texture={textures[4]}
        size={[6.8, 2.6]}
      />
      <Rail />
      <SkylineCrowns />
      <Canal paused={paused} reducedMotion={reducedMotion} />
      <Traffic
        paused={paused}
        reducedMotion={reducedMotion}
        quality={quality}
      />
      <Rain paused={paused} reducedMotion={reducedMotion} quality={quality} />
      <Selection
        selectedId={selectedId}
        collected={collected}
        paused={paused}
        reducedMotion={reducedMotion}
      />
    </group>
  );
}
