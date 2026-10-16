import { useCallback, useEffect, useRef, useState } from "react";
import Scene from "./Scene.jsx";
import { DISTRICTS, restoreSignals, tuneSignal } from "./cityData.js";
import { useCityAudio } from "./useCityAudio.js";

function Icon({ name, size = 20, ...props }) {
  const paths = {
    arrow: "M4 12h16m-6-6 6 6-6 6",
    close: "m6 6 12 12M6 18 18 6",
    sound: "M11 4 5 9H2v6h3l6 5V4Zm4 4c3 2 3 6 0 8m3-11c5 4 5 10 0 14",
    mute: "M11 4 5 9H2v6h3l6 5V4Zm5 5 6 6m0-6-6 6",
    settings: "M4 7h16M4 17h16M8 4v6m8 4v6",
    map: "m2 6 6-3 8 3 6-3v15l-6 3-8-3-6 3V6Zm6-3v15m8-12v15",
    camera: "M3 7h4l2-3h6l2 3h4v13H3V7Zm13 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    pause: "M8 5v14M16 5v14",
    play: "m8 4 12 8-12 8V4Z",
    orbit:
      "M20 5c3 3-1 9-6 13S3 23 2 19s2-9 7-13 9-4 11-1ZM14 10a3 3 0 1 1-4 4 3 3 0 0 1 4-4Z",
    reset: "M3 10a9 9 0 1 1 2 8M3 3v7h7",
    check: "m5 12 4 4L19 6",
    help: "M9 8a3 3 0 1 1 4 3c-1 0-1 1-1 3m0 3h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
    signal: "M4 17v3m5-7v7m6-12v12m5-17v17",
    lock: "M6 10h12v11H6V10Zm3 0V6a3 3 0 0 1 6 0v4",
    globe:
      "M2 12h20M12 2c6 5 6 15 0 20-6-5-6-15 0-20Zm10 10a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.globe} />
    </svg>
  );
}

function Skyline({ id }) {
  return (
    <svg
      className="district-art"
      viewBox="0 0 100 60"
      fill="none"
      aria-hidden="true"
    >
      <path d="M0 55h100" stroke="currentColor" opacity=".25" />
      {id === "core" ? (
        <>
          <path
            d="M42 53V13h16v40M46 13V5h8v8M50 5V0M34 53V29h8m16-6h9v30M27 53V37h7M46 20h8m-8 6h8m-8 6h8m-8 6h8m-8 6h8"
            stroke="currentColor"
          />
          <ellipse cx="50" cy="21" rx="29" ry="7" stroke="currentColor" />
          <ellipse
            cx="50"
            cy="24"
            rx="29"
            ry="7"
            stroke="currentColor"
            opacity=".35"
          />
        </>
      ) : id === "market" ? (
        <>
          <path
            d="M12 53V28h22v25m3 0V20h26v33m5 0V31h20v22M6 28l17-12 17 12m-7-8L50 6l17 14m-5 11 16-12 16 12M17 34h12m-12 6h12m13-13h16m-16 8h16m-16 8h16m15-6h10m-10 7h10"
            stroke="currentColor"
          />
        </>
      ) : id === "harbor" ? (
        <>
          <path
            d="M9 49V25a16 16 0 0 1 32 0v24m3 0V25a16 16 0 0 1 32 0v24M15 49V27a10 10 0 0 1 20 0v22m15 0V27a10 10 0 0 1 20 0v22M0 54h100M0 58h100M84 45V5h5v40m-5-35H60v4h24"
            stroke="currentColor"
          />
        </>
      ) : (
        <>
          <path
            d="M5 53V38h11V25h12v28m3 0V18h10v35m2 0V8h14v45m2 0V24h12v29m3 0V15h11v38m3 0V37h8v16M50 8V0M8 43h5m6-13h5m23-16h6m-6 8h6m-6 8h6m10 0h5m9-9h5"
            stroke="currentColor"
          />
          <ellipse cx="50" cy="20" rx="19" ry="4" stroke="currentColor" />
        </>
      )}
    </svg>
  );
}

function Modal({ title, eyebrow, children, onClose, wide = false }) {
  const ref = useRef();
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "wide" : ""}`}
      aria-labelledby="modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-inner">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2 id="modal-title">{title}</h2>
          </div>
          <button
            className="icon-button"
            aria-label="Cerrar ventana"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

function CityMap({ selected, collected, onSelect }) {
  return (
    <div className="map-wrap">
      <svg
        viewBox="0 0 640 360"
        className="city-map"
        role="img"
        aria-label="Mapa de los tres distritos de NEON CITY"
      >
        <defs>
          <pattern
            id="map-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M24 0H0v24"
              fill="none"
              stroke="#214044"
              strokeWidth=".5"
            />
          </pattern>
        </defs>
        <rect width="640" height="360" fill="url(#map-grid)" />
        <path
          d="M0 280 140 280 185 230 450 230 500 280H640"
          fill="none"
          stroke="#245a60"
          strokeWidth="42"
        />
        <path
          d="M0 280 140 280 185 230 450 230 500 280H640"
          fill="none"
          stroke="#75cabb"
          strokeWidth="1"
          strokeDasharray="5 8"
        />
        {Array.from({ length: 35 }, (_, i) => {
          const x = 75 + (i % 7) * 72;
          const y = 45 + Math.floor(i / 7) * 49;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={i % 3 === 0 ? 42 : 26}
              height="25"
              fill="#163337"
              stroke="#31595c"
              transform={`rotate(-12 ${x} ${y})`}
            />
          );
        })}
        <ellipse
          cx="320"
          cy="150"
          rx="205"
          ry="92"
          stroke="#6c8984"
          strokeDasharray="3 6"
          fill="none"
        />
        <path
          d="m143 190 177-90 177 90"
          fill="none"
          stroke="#a3d4c7"
          strokeWidth="1"
          strokeDasharray="4 5"
        />
        <text x="20" y="28" fill="#89a3a4" fontSize="10" fontFamily="monospace">
          N ↑
        </text>
        <text
          x="520"
          y="337"
          fill="#89a3a4"
          fontSize="10"
          fontFamily="monospace"
        >
          ESCALA 1:2400
        </text>
      </svg>
      {DISTRICTS.filter((d) => d.marker).map((d, index) => (
        <button
          key={d.id}
          className={`map-pin ${selected === d.id ? "active" : ""}`}
          style={{
            left: `${[50, 77.7, 22.3][index]}%`,
            top: `${[27.8, 52.8, 52.8][index]}%`,
            "--marker-color": d.color,
          }}
          onClick={() => onSelect(d.id)}
        >
          <b>{collected.includes(d.id) ? "✓" : d.number}</b>
          <span>{d.name}</span>
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState("overview");
  const [entered, setEntered] = useState(false);
  const [modal, setModal] = useState(null);
  const [ready, setReady] = useState(null);
  const [quality, setQuality] = useState(() =>
    matchMedia("(max-width: 700px)").matches ? "low" : "high",
  );
  const [paused, setPaused] = useState(false);
  const [tour, setTour] = useState(false);
  const [sound, setSound] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [collected, setCollected] = useState(() => {
    try {
      return restoreSignals(localStorage.getItem("neon-city-signals"));
    } catch {
      return [];
    }
  });
  const [scanning, setScanning] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [toast, setToast] = useState("");
  const [metrics, setMetrics] = useState({ fps: 0, calls: 0 });
  const canvasRef = useRef();
  const scanTimer = useRef();
  const district = DISTRICTS.find((d) => d.id === selected);
  const found = collected.includes(selected);
  const { supported: audioSupported, error: audioError } = useCityAudio(
    sound,
    paused,
  );
  const stopTour = useCallback(() => setTour(false), []);
  const selectDistrict = useCallback((id) => {
    if (!DISTRICTS.some((d) => d.id === id)) return;
    clearTimeout(scanTimer.current);
    setScanning(false);
    setSelected(id);
    setTour(false);
    setEntered(true);
    setModal(null);
    setResetKey((key) => key + 1);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("neon-city-signals", JSON.stringify(collected));
    } catch {
      setToast(
        "El navegador no permite guardar el archivo. Las señales durarán esta visita.",
      );
    }
  }, [collected]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (audioError) {
      setSound(false);
      setToast(audioError);
    }
  }, [audioError]);
  useEffect(() => () => clearTimeout(scanTimer.current), []);
  useEffect(() => {
    if (reducedMotion) setTour(false);
  }, [reducedMotion]);
  const closeModal = () => setModal(null);
  function tune() {
    if (scanning || found || !district.marker) return;
    setScanning(true);
    scanTimer.current = setTimeout(
      () => {
        setCollected((previous) => tuneSignal(previous, selected));
        setScanning(false);
        setToast(`Señal de ${district.name} recuperada`);
        if (collected.length === 2) setModal("complete");
      },
      reducedMotion ? 150 : 1500,
    );
  }
  function capture() {
    try {
      if (!canvasRef.current || !ready) throw new Error();
      const snapshot = document.createElement("canvas");
      snapshot.width = canvasRef.current.width;
      snapshot.height = canvasRef.current.height;
      const context = snapshot.getContext("2d");
      context.fillStyle = "#102a32";
      context.fillRect(0, 0, snapshot.width, snapshot.height);
      context.drawImage(canvasRef.current, 0, 0);
      snapshot.toBlob((blob) => {
        if (!blob) {
          setToast("No se pudo guardar la captura. Vuelve a intentarlo.");
          return;
        }
        const url = URL.createObjectURL(blob),
          link = document.createElement("a");
        link.href = url;
        link.download = `neon-city-${selected}.png`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setToast("Captura de la ciudad descargada");
      });
    } catch {
      setToast("La escena debe estar conectada para guardar una captura.");
    }
  }
  return (
    <main
      className={`experience ${entered ? "entered" : ""}`}
      style={{ "--district-color": district.color }}
    >
      <div className="sky-glow" aria-hidden="true" />
      <div className="scene-container">
        <Scene
          {...{
            district,
            resetKey,
            tour,
            paused,
            reducedMotion,
            quality,
            collected,
            canvasRef,
          }}
          onSelect={selectDistrict}
          onReady={setReady}
          onMetrics={setMetrics}
          onTourStop={stopTour}
        />
      </div>
      <div className="scene-shade" aria-hidden="true" />
      <header className="topbar">
        <button
          className="brand"
          aria-label="NEON CITY, volver a panorámica"
          onClick={() => {
            selectDistrict("overview");
            setEntered(false);
          }}
        >
          <svg
            width="34"
            height="37"
            viewBox="0 0 34 37"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 33V4h7l16 29h7V4h-7v16L16 4H2m7 29V17l9 16"
              fill="currentColor"
            />
          </svg>
          <span>
            NEON<span className="brand-city">CITY</span>
          </span>
          <i>Interactive world</i>
        </button>
        <nav aria-label="Navegación principal">
          <button
            className={!modal ? "active" : ""}
            onClick={() => {
              closeModal();
            }}
          >
            Explorar
          </button>
          <button
            className={modal === "archive" ? "active" : ""}
            onClick={() => setModal("archive")}
          >
            Archivo <span className="nav-count">{collected.length}/3</span>
          </button>
          <button
            className={modal === "map" ? "active" : ""}
            onClick={() => setModal("map")}
          >
            Mapa <Icon name="map" size={15} />
          </button>
        </nav>
        <div className="header-actions">
          <button
            className={`icon-button ${sound ? "is-on" : ""}`}
            disabled={!audioSupported}
            aria-label={sound ? "Desactivar sonido" : "Activar sonido"}
            aria-pressed={sound}
            onClick={() => setSound(!sound)}
          >
            <Icon name={sound ? "sound" : "mute"} />
          </button>
          <span className="action-divider" />
          <button
            className="icon-button"
            aria-label="Abrir ajustes"
            onClick={() => setModal("settings")}
          >
            <Icon name="settings" />
          </button>
        </div>
      </header>
      <div className="world-status">
        <span className={`live-dot ${paused ? "off" : ""}`} />
        {paused ? "Tiempo detenido" : "Ciudad en directo"}
        <span className="status-line" />
        <span>Japón, 2186</span>
      </div>
      <div className="chapter-label">
        <span>35° 40′ N &nbsp; 139° 42′ E</span>
        <span>Sector 07 / Distrito autónomo</span>
      </div>
      <section
        className={`story-panel ${selected !== "overview" ? "district-story" : ""}`}
        aria-label="Exploración y señales"
      >
        {selected === "overview" ? (
          <>
            <div className="story-kicker">
              <span className="little-line" />
              Una historia por descubrir
            </div>
            <h1>
              EL ÚLTIMO
              <br />
              <span>AMANECER.</span>
            </h1>
            <p className="intro-copy">
              La ciudad lo recuerda todo.
              <br />
              Excepto quiénes éramos.
            </p>
            <p className="intro-detail">
              Adéntrate en sus distritos. Sigue las señales.
              <br />
              Encuentra lo que la red intentó borrar.
            </p>
            <button
              className="primary explore-button"
              disabled={!ready}
              onClick={() => selectDistrict("core")}
            >
              Explorar la ciudad <Icon name="arrow" />
            </button>
            <div className="chapter-index">
              <span>01</span>
              <span>
                Una ciudad. Tres señales.
                <br />
                Tu propia ruta.
              </span>
            </div>
          </>
        ) : (
          <>
            <button
              className="back-link"
              onClick={() => selectDistrict("overview")}
            >
              ← Volver a la ciudad
            </button>
            <div className="story-kicker">
              <span className="little-line" />
              Distrito {district.number}{" "}
              <span className="frequency">{district.frequency} MHz</span>
            </div>
            <h1>
              {district.name.split(" ")[0]}
              <br />
              <span>{district.name.split(" ").slice(1).join(" ")}</span>
            </h1>
            <p className="district-subtitle">{district.subtitle}</p>
            <p className="district-description">{district.story}</p>
            {found ? (
              <div className="recovered">
                <span>
                  <Icon name="check" size={16} /> Señal recuperada
                </span>
                <blockquote>{district.fragment}</blockquote>
                <button onClick={() => setModal("archive")}>
                  Leer el archivo <Icon name="arrow" size={16} />
                </button>
              </div>
            ) : (
              <>
                <button
                  className={`primary tune-button ${scanning ? "scanning" : ""}`}
                  onClick={tune}
                  disabled={scanning || !ready}
                >
                  <Icon name="signal" />
                  {scanning ? "Sintonizando…" : "Sintonizar señal"}
                  <span aria-hidden="true" />
                </button>
                <p className="signal-hint">
                  {scanning
                    ? "Aislando la voz entre las frecuencias"
                    : "Hay un recuerdo esperando en esta frecuencia."}
                </p>
              </>
            )}
          </>
        )}
      </section>
      <div className="scene-caption" aria-hidden="true">
        <span>NEON CITY</span>
        <i>夜明けの向こうへ</i>
      </div>
      <aside
        className="mission-tracker"
        aria-label={`${collected.length} de 3 señales recuperadas`}
      >
        <div className="tracker-top">
          <span className="signal-glyph">
            <Icon name="signal" size={16} />
          </span>
          <span>Recupera la memoria</span>
          <b>
            {collected.length}
            <span>/03</span>
          </b>
        </div>
        <div className="tracker-bars">
          {DISTRICTS.filter((d) => d.marker).map((d) => (
            <button
              key={d.id}
              aria-label={`Buscar señal: ${d.name}`}
              className={collected.includes(d.id) ? "complete" : ""}
              onClick={() => selectDistrict(d.id)}
              style={{ "--signal-color": d.color }}
            />
          ))}
        </div>
      </aside>
      <div
        className="camera-tools"
        role="group"
        aria-label="Controles de la ciudad"
      >
        <button
          className={tour ? "is-on" : ""}
          aria-label={
            tour
              ? "Detener órbita cinematográfica"
              : "Iniciar órbita cinematográfica"
          }
          aria-pressed={tour}
          disabled={reducedMotion || !ready}
          onClick={() => setTour(!tour)}
        >
          <Icon name="orbit" />
          <span>Órbita</span>
        </button>
        <button
          aria-label={paused ? "Reanudar ciudad" : "Pausar ciudad"}
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          <Icon name={paused ? "play" : "pause"} />
          <span>{paused ? "Reanudar" : "Pausar"}</span>
        </button>
        <button
          aria-label="Restablecer cámara"
          onClick={() => {
            setResetKey((key) => key + 1);
            setTour(false);
          }}
        >
          <Icon name="reset" />
          <span>Recentrar</span>
        </button>
        <span className="tool-divider" />
        <button
          aria-label="Descargar captura de la ciudad"
          disabled={!ready}
          onClick={capture}
        >
          <Icon name="camera" />
          <span>Capturar</span>
        </button>
      </div>
      <section className="districts" aria-label="Elegir distrito">
        <div className="districts-heading">
          <span>Elige tu destino</span>
          <span>
            Exploración libre <Icon name="globe" size={12} />
          </span>
        </div>
        <div className="district-list">
          {DISTRICTS.map((d) => (
            <button
              key={d.id}
              className={`district-card ${selected === d.id ? "active" : ""}`}
              aria-pressed={selected === d.id}
              onClick={() => selectDistrict(d.id)}
              style={{ "--card-color": d.color }}
            >
              <span className="district-number">{d.number}</span>
              <Skyline id={d.id} />
              <span className="district-card-copy">
                <strong>{d.name}</strong>
                <span>
                  {d.id === "overview"
                    ? "Todo comienza aquí"
                    : collected.includes(d.id)
                      ? "Señal recuperada"
                      : d.subtitle}
                </span>
              </span>
              <span className="district-card-icon">
                {collected.includes(d.id) ? (
                  <Icon name="check" size={15} />
                ) : (
                  <Icon name="arrow" size={15} />
                )}
              </span>
            </button>
          ))}
        </div>
      </section>
      <footer className="bottom-bar">
        <span className="desktop-hint">
          <span className="mouse-icon" /> Arrastra para explorar <i /> Scroll
          para acercarte
        </span>
        <span className="mobile-hint">
          Un dedo para girar · Pellizca para acercarte
        </span>
        <button className="help-button" onClick={() => setModal("help")}>
          <Icon name="help" size={15} />
          <span>Cómo explorar</span>
        </button>
        <span className="render-status">
          <span className="live-dot" />
          {ready
            ? `${quality === "high" ? "Alta" : "Ligera"} · ${metrics.fps ? metrics.fps + " fps" : "Conectado"}`
            : "Conectando…"}
        </span>
      </footer>
      {ready === null && (
        <div className="loading-state" role="status">
          <span className="loader-ring" />
          <strong>Conectando con NEON CITY</strong>
          <span>Construyendo el próximo recuerdo</span>
        </div>
      )}
      {ready === false && (
        <div className="connection-lost" role="alert">
          <strong>No se pudo conectar con la ciudad.</strong>
          <p>
            Comprueba que WebGL y la aceleración gráfica estén activos en tu
            navegador.
          </p>
          <button onClick={() => location.reload()}>Reconectar</button>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <span className="live-dot" />
          {toast}
        </div>
      )}
      {modal === "map" && (
        <Modal
          wide
          title="La ciudad, conectada."
          eyebrow="Cartografía / Sector 07"
          onClose={closeModal}
        >
          <p className="modal-description">
            Elige una señal para viajar a su distrito.
          </p>
          <CityMap {...{ collected, selected }} onSelect={selectDistrict} />
          <div className="map-legend">
            <span>
              <i /> Red de transporte
            </span>
            <span>
              <i /> Canal Umbral
            </span>
            <span>{collected.length}/3 señales recuperadas</span>
          </div>
        </Modal>
      )}
      {modal === "archive" && (
        <Modal
          title="Lo que aún recordamos."
          eyebrow={`Archivo de memoria / ${collected.length} de 3 señales`}
          onClose={closeModal}
        >
          <p className="modal-description">
            Tres voces sobrevivieron al apagón. Recupéralas para reconstruir su
            mensaje.
          </p>
          <div className="archive-list">
            {DISTRICTS.filter((d) => d.marker).map((d) => (
              <article
                key={d.id}
                className={collected.includes(d.id) ? "unlocked" : ""}
              >
                <div className="archive-number">
                  {collected.includes(d.id) ? (
                    <Icon name="signal" />
                  ) : (
                    <Icon name="lock" />
                  )}
                </div>
                <div>
                  <span className="eyebrow">
                    {d.name} / {d.frequency} MHz
                  </span>
                  <h3>
                    {collected.includes(d.id)
                      ? d.title
                      : "Frecuencia desconocida"}
                  </h3>
                  {collected.includes(d.id) ? (
                    <p>{d.fragment}</p>
                  ) : (
                    <button
                      className="text-button"
                      onClick={() => selectDistrict(d.id)}
                    >
                      Localizar señal <Icon name="arrow" size={14} />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
          {collected.length === 3 && (
            <button
              className="primary full-width"
              onClick={() => setModal("complete")}
            >
              Escuchar el último mensaje <Icon name="arrow" />
            </button>
          )}
          <p className="storage-note">
            Tu archivo se guarda en este navegador, en este dispositivo.
          </p>
        </Modal>
      )}
      {modal === "settings" && (
        <Modal
          title="Tu forma de habitarla."
          eyebrow="Ajustes de la experiencia"
          onClose={closeModal}
        >
          <div className="setting-row">
            <div>
              <strong>Calidad gráfica</strong>
              <p>La opción ligera reduce partículas y resolución.</p>
            </div>
            <select
              aria-label="Calidad gráfica"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            >
              <option value="high">Alta</option>
              <option value="low">Ligera</option>
            </select>
          </div>
          <label className="setting-row">
            <div>
              <strong>Sonido de la ciudad</strong>
              <p>Atmósfera sintetizada. Mejor con auriculares.</p>
            </div>
            <input
              type="checkbox"
              checked={sound}
              disabled={!audioSupported}
              onChange={(e) => setSound(e.target.checked)}
            />
          </label>
          <label className="setting-row">
            <div>
              <strong>Reducir movimiento</strong>
              <p>Detiene el tráfico, la lluvia y la órbita automática.</p>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
            />
          </label>
          <label className="setting-row">
            <div>
              <strong>Pausar el tiempo</strong>
              <p>Congela el ambiente y silencia la ciudad.</p>
            </div>
            <input
              type="checkbox"
              checked={paused}
              onChange={(e) => setPaused(e.target.checked)}
            />
          </label>
          <div className="settings-note">
            <span className="live-dot" />
            {metrics.fps} fps · {metrics.calls} llamadas de dibujo por fotograma
            <span>Sin descargas de modelos. Todo el mundo se genera aquí.</span>
          </div>
        </Modal>
      )}
      {modal === "help" && (
        <Modal
          title="Encuentra tu propia ruta."
          eyebrow="Guía de exploración"
          onClose={closeModal}
        >
          <div className="help-list">
            <article>
              <b>01</b>
              <div>
                <h3>Mira alrededor</h3>
                <p>
                  Arrastra para orbitar y usa la rueda para acercarte. En
                  pantalla táctil, gira con un dedo y acerca con dos.
                </p>
              </div>
            </article>
            <article>
              <b>02</b>
              <div>
                <h3>Sigue las señales</h3>
                <p>
                  Elige un distrito en la barra inferior, en el mapa o en los
                  puntos de la ciudad. Pulsa «Sintonizar señal» para recuperar
                  su recuerdo.
                </p>
              </div>
            </article>
            <article>
              <b>03</b>
              <div>
                <h3>Deja que la ciudad te lleve</h3>
                <p>
                  Activa la órbita cinematográfica o guarda una captura. Tu
                  archivo conserva cada señal entre visitas.
                </p>
              </div>
            </article>
          </div>
          <div className="keyboard-help">
            <span>También con teclado</span>
            <p>
              <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> Girar &nbsp;{" "}
              <kbd>+</kbd> <kbd>−</kbd> Zoom &nbsp; <kbd>Tab</kbd> Controles
              &nbsp; <kbd>Esc</kbd> Cerrar
            </p>
          </div>
        </Modal>
      )}
      {modal === "complete" && (
        <Modal
          title="El amanecer somos nosotros."
          eyebrow="Transmisión recuperada / 03 de 03"
          onClose={closeModal}
        >
          <div className="complete-art">
            <span />
            <Icon name="signal" size={40} />
            <span />
          </div>
          <p className="final-message">
            «Si puedes oírme, todavía hay algo humano en esta red. No somos los
            datos que guardan de nosotros. Somos lo que elegimos recordar.»
          </p>
          <p className="final-message muted">
            «Nos vemos al otro lado del amanecer. Trae tus recuerdos.»
          </p>
          <p className="modal-description">
            La ciudad sigue ahí. Pero ahora sabes que no estás solo.
          </p>
          <button
            className="primary full-width"
            onClick={() => {
              selectDistrict("overview");
              setTour(!reducedMotion);
            }}
          >
            Volver a mirar la ciudad <Icon name="arrow" />
          </button>
        </Modal>
      )}
    </main>
  );
}
