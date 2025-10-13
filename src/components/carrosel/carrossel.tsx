import React, { useEffect, useRef, useState } from "react";

interface Slide {
  src: string;
  alt: string;
  text: string;
  isVideo?: boolean;
}

// Primeiro slide é vídeo (YouTube embed), seguido de duas imagens externas
const slides: Slide[] = [
  {
    src: "https://www.youtube.com/embed/29ysx8wGeyQ?start=24&autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&showinfo=0&fs=0&cc_load_policy=0&disablekb=1&color=white",
    alt: "Vídeo de automação industrial",
    text: "Automação e inovação industrial em destaque",
    isVideo: true,
  },
  {
    src: "https://static.portaldaindustria.com.br/media/filer_public/ef/04/ef040f7e-4e98-43f0-a8d5-591f9023cc48/indicadores_industriais_2025.jpg", // Nova imagem
    alt: "Indicadores Industriais 2025",
    text: "Visão estratégica para o futuro da indústria",
  },
  {
    src: "https://images.pexels.com/photos/257700/pexels-photo-257700.jpeg?auto=compress&cs=tinysrgb&w=1920",
    alt: "Linha de produção automotiva",
    text: "Integração de CLPs e SCADA",
  },
];

const Carrosel: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [userUnmuted, setUserUnmuted] = useState(false);
  const length = slides.length;
  const playerRef = useRef<any | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  const nextSlide = () => setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrent((prev) => (prev === 0 ? length - 1 : prev - 1));

  // Carrega YouTube Iframe API e inicia player (autoplay mudo)
  useEffect(() => {
    const isVideoSlide = slides[0]?.isVideo;
    if (!isVideoSlide) return;

    const onYouTubeIframeAPIReady = () => {
      const YT = (window as any).YT;
      if (!YT || !iframeRef.current) return;
      playerRef.current = new YT.Player(iframeRef.current, {
        events: {
          onReady: () => {
            try {
              playerRef.current && playerRef.current.playVideo && playerRef.current.playVideo();
            } catch {}
          },
          onStateChange: (event: any) => {
            // 0 = ENDED: avança para o próximo slide visual
            if (event?.data === 0) {
              setCurrent(1);
            }
          },
        },
      });
    };

    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    } else {
      onYouTubeIframeAPIReady();
    }

    return () => {
      try {
        if (playerRef.current && playerRef.current.destroy) {
          playerRef.current.destroy();
        }
      } catch {}
    };
  }, []);

  // Mantém volume quando usuário ativar áudio
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (userUnmuted) {
        playerRef.current.unMute && playerRef.current.unMute();
        playerRef.current.setVolume && playerRef.current.setVolume(100);
      }
    } catch {}
  }, [userUnmuted]);

  // Auto avanço para imagens (4s). Não interfere no vídeo/áudio
  useEffect(() => {
    if (current === 0 && slides[current]?.isVideo) return; // não auto-avança durante o vídeo
    const id = setInterval(() => {
      setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(id);
  }, [current, length]);

  // Pausar o vídeo quando a seção sair do campo de visão; retomar quando voltar
  useEffect(() => {
    if (!sectionRef.current) return;
    const el = sectionRef.current;

    const handle = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      const visible = entry.isIntersecting && entry.intersectionRatio >= 0.3;
      if (!playerRef.current) return;
      try {
        if (visible) {
          playerRef.current.playVideo && playerRef.current.playVideo();
          if (userUnmuted) {
            playerRef.current.unMute && playerRef.current.unMute();
            playerRef.current.setVolume && playerRef.current.setVolume(100);
          }
        } else {
          playerRef.current.pauseVideo && playerRef.current.pauseVideo();
        }
      } catch {}
    };

    const observer = new IntersectionObserver(handle, { threshold: [0, 0.3, 1] });
    observer.observe(el);
    return () => observer.disconnect();
  }, [userUnmuted]);

  const handleUnmuteClick = () => {
    try {
      if (playerRef.current) {
        playerRef.current.unMute && playerRef.current.unMute();
        playerRef.current.setVolume && playerRef.current.setVolume(100);
        playerRef.current.playVideo && playerRef.current.playVideo();
        setUserUnmuted(true);
      }
    } catch {}
  };

  return (
    <section ref={sectionRef} className="py-24 bg-gray-50">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-2">
          NOSSOS SERVIÇOS
        </h2>
        <p className="text-xl text-[var(--muted)] max-w-3xl mx-auto">
          Soluções Abrangentes para o seu Sucesso empresarial!
        </p>
      </div>

      <div className="relative w-full max-w-6xl mx-auto h-[28rem] overflow-hidden rounded-3xl bg-black">
        {/* Slides (vídeo é escondido visualmente quando não é o slide atual; áudio é controlado pela visibilidade da seção) */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === current ? "opacity-100 z-20" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {slide.isVideo ? (
              <div className="absolute inset-0">
                {/* 16:9 cover para eliminar faixas pretas */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78%] h-full">
                  <iframe
                    ref={iframeRef}
                    title={slide.alt}
                    src={`${slide.src}&origin=${window.location.origin}`}
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    className="w-full h-full"
                    frameBorder={0}
                    style={{ transform: "scale(1.5)", objectFit: "cover" }} // Zoom no vídeo
                  />
                </div>
                {!userUnmuted && (
                  <button
                    onClick={handleUnmuteClick}
                    className="absolute bottom-6 right-6 z-40 bg-white/90 text-[var(--text)] px-4 py-2 rounded-xl shadow hover:bg-white"
                  >
                    Ativar áudio
                  </button>
                )}
              </div>
            ) : (
              <img
                src={slide.src}
                alt={slide.alt}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                loading={index === 0 ? "eager" : "lazy"}
              />
            )}
            <div className="absolute bottom-6 left-6 bg-black/60 text-white px-4 py-2 rounded-2xl">
              {slide.text}
            </div>
          </div>
        ))}

        {/* Botões de navegação */}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition z-40"
          aria-label="Anterior"
        >
          &#10094;
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition z-40"
          aria-label="Próximo"
        >
          &#10095;
        </button>
      </div>
    </section>
  );
};

export default Carrosel;
