import React, { useState, useEffect, useRef } from 'react';
import { LandingHeader } from '../../components/layout';
import { Link } from 'react-router-dom';
import '../../styles/base/globals.css';

import {
  FaRocket, FaChartLine, FaCogs, FaShieldAlt, FaUsers, FaCheckCircle,
  FaArrowRight, FaStar, FaQuoteLeft, FaLinkedin, FaTwitter, FaInstagram, FaGithub
} from 'react-icons/fa';

// Hook para scroll reveal
const useScrollReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

// Hook para contador animado
const useCountUp = (end: number, duration: number = 2000, start: boolean = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);

  return count;
};

// Hook para efeito de digitação
const useTypewriter = (text: string, speed: number = 30, start: boolean = false) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!start) {
      setDisplayText('');
      setIsComplete(false);
      return;
    }

    let index = 0;
    setDisplayText('');
    setIsComplete(false);

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, start]);

  return { displayText, isComplete };
};

// Componente de estatística com contador
const StatCounter: React.FC<{ number: string; label: string; isVisible: boolean }> = ({ number, label, isVisible }) => {
  // Extrair número e sufixo (ex: "500+" -> 500, "+")
  const match = number.match(/^([\d.]+)(.*)$/);
  const numValue = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : '';
  const isDecimal = number.includes('.');
  
  const count = useCountUp(isDecimal ? numValue * 10 : numValue, 2000, isVisible);
  const displayCount = isDecimal ? (count / 10).toFixed(1) : count;

  return (
    <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-2xl hover:bg-white/20 transition">
      <div className="text-4xl md:text-5xl font-bold mb-2 text-white">
        {displayCount}{suffix}
      </div>
      <div className="text-sm md:text-base text-white/90">{label}</div>
    </div>
  );
};

// Componente de card de depoimento com efeito de digitação
interface Testimonial {
  name: string;
  role: string;
  company: string;
  photo: string;
  text: string;
  rating: number;
}

const TestimonialCard: React.FC<{ 
  testimonial: Testimonial; 
  isVisible: boolean;
  isActive: boolean;
  hasCompleted: boolean;
  isDarkMode: boolean;
  onComplete: () => void;
}> = ({ testimonial, isVisible, isActive, hasCompleted, isDarkMode, onComplete }) => {
  const [showStars, setShowStars] = useState(hasCompleted);
  const [showQuote, setShowQuote] = useState(hasCompleted);
  const [showAuthor, setShowAuthor] = useState(hasCompleted);
  const [showRole, setShowRole] = useState(hasCompleted);
  const [showCompany, setShowCompany] = useState(hasCompleted);
  const [canStartTyping, setCanStartTyping] = useState(hasCompleted);
  
  // Digitação só começa após os elementos aparecerem (inclui aspas)
  const { displayText, isComplete } = useTypewriter(`"${testimonial.text}"`, 50, canStartTyping && isActive);

  useEffect(() => {
    if (isActive && !hasCompleted) {
      // Primeiro: aparecem os elementos (autor, estrelas, citação)
      setShowStars(false);
      setShowQuote(false);
      setShowAuthor(false);
      setShowRole(false);
      setShowCompany(false);
      setCanStartTyping(false);
      
      // Foto e nome aparecem primeiro
      const authorTimer = setTimeout(() => setShowAuthor(true), 300);
      // Depois o role
      const roleTimer = setTimeout(() => setShowRole(true), 500);
      // Depois a company
      const companyTimer = setTimeout(() => setShowCompany(true), 700);
      // Depois as estrelas
      const starsTimer = setTimeout(() => setShowStars(true), 900);
      // Depois o ícone de citação
      const quoteTimer = setTimeout(() => setShowQuote(true), 1100);
      // Por último, começa a digitação
      const typingTimer = setTimeout(() => setCanStartTyping(true), 1400);
      
      return () => {
        clearTimeout(authorTimer);
        clearTimeout(roleTimer);
        clearTimeout(companyTimer);
        clearTimeout(starsTimer);
        clearTimeout(quoteTimer);
        clearTimeout(typingTimer);
      };
    }
  }, [isActive, hasCompleted]);
  
  // Garantir que tudo apareça quando hasCompleted muda para true
  useEffect(() => {
    if (hasCompleted) {
      setShowStars(true);
      setShowQuote(true);
      setShowAuthor(true);
      setShowRole(true);
      setShowCompany(true);
      setCanStartTyping(true);
    }
  }, [hasCompleted]);

  useEffect(() => {
    if (isComplete && isActive) {
      const timer = setTimeout(onComplete, 1000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, isActive, onComplete]);

  // Card só aparece quando é sua vez
  if (!isVisible) {
    return null;
  }

  // Texto a mostrar: se já completou, mostra texto completo com aspas
  const fullTextWithQuotes = `"${testimonial.text}"`;
  const textToShow = hasCompleted ? fullTextWithQuotes : displayText;

  return (
    <div
      className={`testimonial-card p-4 md:p-8 rounded-xl md:rounded-2xl border shadow-lg transition-all duration-700 animate-fadeInUp min-h-[200px] md:min-h-[350px] flex flex-col ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } ${
        isActive 
          ? 'border-[var(--primary)] shadow-2xl md:-translate-y-3 ring-2 ring-[var(--primary)]/30' 
          : ''
      }`}
    >
      {/* Estrelas com animação */}
      <div className={`flex items-center gap-1 mb-4 transition-all duration-500 ${
        showStars || hasCompleted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}>
        {[...Array(testimonial.rating)].map((_, i) => (
          <FaStar 
            key={i} 
            className={`text-yellow-400 w-4 h-4 transition-all duration-300 ${
              showStars || hasCompleted ? 'scale-100' : 'scale-0'
            }`}
            style={{ transitionDelay: hasCompleted ? '0ms' : `${i * 100}ms` }}
          />
        ))}
      </div>

      {/* Ícone de citação com animação */}
      <FaQuoteLeft className={`text-[var(--primary)] text-2xl mb-4 transition-all duration-500 ${
        showQuote || hasCompleted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      }`} />

      {/* Texto com efeito de digitação */}
      <p className="text-[var(--text)] mb-6 leading-relaxed flex-1">
        {textToShow}
      </p>

      {/* Autor com animação */}
      <div className={`flex items-center gap-4 transition-all duration-500 pt-4 border-t border-gray-200 dark:border-gray-700 ${
        showAuthor || hasCompleted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
      }`}>
        <img
          src={testimonial.photo}
          alt={testimonial.name}
          className="w-14 h-14 rounded-full object-cover ring-2 ring-[var(--primary)]"
        />
        <div>
          <div className="font-semibold text-lg" style={{ color: isDarkMode ? '#ffffff' : '#1e293b' }}>{testimonial.name}</div>
          <div className={`font-medium transition-all duration-300 ${showRole || hasCompleted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`} style={{ fontSize: '0.875rem', color: isDarkMode ? '#d1d5db' : '#64748b' }}>{testimonial.role}</div>
          <div className={`font-medium transition-all duration-300 ${showCompany || hasCompleted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`} style={{ fontSize: '0.875rem', color: isDarkMode ? '#60a5fa' : '#2563eb' }}>{testimonial.company}</div>
        </div>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const [bgReady, setBgReady] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(-1); // Começa em -1 (nenhum ativo)
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [visibleFeatures, setVisibleFeatures] = useState<number[]>([]);
  const [featuresInView, setFeaturesInView] = useState(false);
  const [nextFeatureIndex, setNextFeatureIndex] = useState(0);
  const testimonialsSectionRef = useRef<HTMLDivElement>(null);
  const testimonialsGridRef = useRef<HTMLDivElement>(null);
  const featuresSectionRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll para o próximo testimonial no mobile quando completar
  useEffect(() => {
    if (activeTestimonial > 0 && activeTestimonial <= 2 && testimonialsGridRef.current) {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        const cardWidth = 280 + 12; // largura do card + gap
        const scrollPosition = (activeTestimonial) * cardWidth;
        testimonialsGridRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [activeTestimonial]);
  
  // Detectar modo dark
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  
  // Refs para scroll reveal
  const featuresReveal = useScrollReveal();
  const statsReveal = useScrollReveal();
  const testimonialsReveal = useScrollReveal();
  const ctaReveal = useScrollReveal();
  
  // Observar quando a seção de features entra/sai da visão
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setFeaturesInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (featuresSectionRef.current) {
      observer.observe(featuresSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);
  
  // Controlar a cascata dos features - pausa quando sai da visão
  useEffect(() => {
    if (featuresInView && nextFeatureIndex < 6) {
      const timer = setTimeout(() => {
        setVisibleFeatures(prev => [...prev, nextFeatureIndex]);
        setNextFeatureIndex(prev => prev + 1);
      }, nextFeatureIndex === 0 ? 500 : 800); // 800ms entre cada card (~4.5s total)
      
      return () => clearTimeout(timer);
    }
  }, [featuresInView, nextFeatureIndex]);
  
  // Iniciar animação dos testimonials apenas quando a seção estiver visível
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && activeTestimonial === -1) {
          setTimeout(() => setActiveTestimonial(0), 300);
        }
      },
      { threshold: 0.2 }
    );

    if (testimonialsSectionRef.current) {
      observer.observe(testimonialsSectionRef.current);
    }

    return () => observer.disconnect();
  }, [activeTestimonial]);
  
  

  // Fallback: mostrar conteúdo após 2 segundos mesmo se o vídeo não carregar
  useEffect(() => {
    const timer = setTimeout(() => {
      setBgReady(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Placeholder elegante enquanto o vídeo carrega */}
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-700 ${bgReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)'
        }}
      >
        {/* Efeito de partículas/grid animado */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(243, 130, 32, 0.3) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(243, 130, 32, 0.2) 0%, transparent 50%)`,
            animation: 'pulse 4s ease-in-out infinite'
          }} />
        </div>

        {/* Logo ou texto centralizado */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <h2 
              className="text-4xl md:text-5xl mb-4"
              style={{ 
                color: '#ffffff',
                fontFamily: "'Orbitron', 'Rajdhani', 'Roboto Mono', monospace",
                fontWeight: 700,
                letterSpacing: '0.2em'
              }}
            >
              SYNC
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#3b82f6', animationDelay: '0ms' }}></div>
              <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#3b82f6', animationDelay: '150ms' }}></div>
              <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ backgroundColor: '#3b82f6', animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
      <LandingHeader />

      <div className={`landing-hero relative w-full h-screen overflow-hidden ${bgReady ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
        {/* Vídeo de fundo */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Vídeo background YouTube */}
          <iframe
            title="Background Video"
            src="https://www.youtube.com/embed/Q27W738SGsg?start=19&autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=Q27W738SGsg&modestbranding=1&playsinline=1&vq=hd1080"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: '100vw',
              height: '56.25vw',
              minHeight: '100vh',
              minWidth: '177.78vh'
            }}
            onLoad={() => setBgReady(true)}
            frameBorder={0}
          />
        </div>

        {/* Overlay opcional para escurecer o vídeo */}
        <div className="absolute inset-0 bg-black/50 z-10"></div>

        {/* Conteúdo acima do vídeo */}
        <section className="relative z-20 flex flex-col items-center justify-start w-full h-full text-center px-4 pt-20 md:pt-32">
          <div className="max-w-7xl mx-auto space-y-3 md:space-y-6">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium border border-white/30">
              <FaRocket className="text-white text-xs md:text-sm" />
              <span>Nova versão disponível</span>
            </div>

            {/* Título */}
            <div className='bg-black/30 px-4 py-3 md:px-8 md:py-4 rounded-2xl md:rounded-3xl leading-snug'>
              <h1 className="text-2xl md:text-7xl font-bold !text-white">
                Automação Industrial
                <span className="block text-[var(--primary)] mt-1 md:mt-2">do Futuro</span>
              </h1>

              {/* Parágrafo */}
              <p className="text-sm md:text-2xl text-white px-2 py-2 md:px-6 md:py-4 rounded-2xl max-w-3xl mx-auto leading-relaxed">
                Transforme sua produção com tecnologia de ponta.
                <span className="text-[var(--primary)] font-semibold">
                  {" "}Eficiência, controle e resultados
                </span>{" "}
                em uma única plataforma.
              </p>

            </div>
            {/* Botões */}
            <div className="flex flex-row gap-3 md:gap-6 justify-center items-center">
              <Link
                to="/login"
                className="group bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white px-4 py-2 md:px-8 md:py-4 rounded-2xl md:rounded-3xl font-semibold text-sm md:text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 md:gap-3"
              >
                Começar Agora
                <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>

            {/* Benefícios */}
            <div className="flex flex-row flex-wrap items-center justify-center gap-3 md:gap-8 text-xs md:text-sm text-white mt-3 md:mt-6">
              <div className="flex items-center gap-1 md:gap-2">
                <FaCheckCircle className="text-green-500 text-xs md:text-sm" />
                <span>Setup em 5 min</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <FaCheckCircle className="text-green-500 text-xs md:text-sm" />
                <span>Suporte 24/7</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <FaCheckCircle className="text-green-500 text-xs md:text-sm" />
                <span>99.9% uptime</span>
              </div>
            </div>

          </div>
        </section>
      </div>



      {/* Features Section */}
      <section className="py-12 md:py-24 landing-features" ref={featuresSectionRef}>
        <div 
          ref={featuresReveal.ref}
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-reveal ${featuresReveal.isVisible ? 'visible' : ''}`}
        >
          <div className="text-center mb-6 md:mb-16">
            <h2 className="text-2xl md:text-5xl font-bold mb-3 md:mb-6 text-white">
              Por que escolher a <span className="sync-logo-light" style={{ color: '#308cc9d6' }}>SYNC</span>?
            </h2>
            <p className="text-sm md:text-xl max-w-3xl mx-auto text-white">
              Nossa plataforma oferece tudo que você precisa para modernizar sua operação industrial
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {[
              {
                icon: <FaChartLine className="w-8 h-8" />,
                title: "Monitoramento em Tempo Real",
                description: "Acompanhe todos os indicadores da sua produção em tempo real, de qualquer lugar."
              },
              {
                icon: <FaCogs className="w-8 h-8" />,
                title: "Automação Inteligente",
                description: "Automatize processos complexos com IA e machine learning para máxima eficiência."
              },
              {
                icon: <FaShieldAlt className="w-8 h-8" />,
                title: "Segurança Industrial",
                description: "Proteção completa dos seus dados e equipamentos com criptografia de ponta."
              },
              {
                icon: <FaUsers className="w-8 h-8" />,
                title: "Gestão de Equipes",
                description: "Gerencie equipes, permissões e responsabilidades de forma centralizada."
              },
              {
                icon: <FaRocket className="w-8 h-8" />,
                title: "Implementação Rápida",
                description: "Comece a usar em minutos, sem necessidade de infraestrutura complexa."
              },
              {
                icon: <FaCheckCircle className="w-8 h-8" />,
                title: "Resultados Comprovados",
                description: "Mais de 500 empresas já aumentaram sua produtividade em média 40%."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className={`group p-3 md:p-8 rounded-xl md:rounded-2xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-[var(--primary)] hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 ${
                  visibleFeatures.includes(index) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
              >
                <div className="w-10 h-10 md:w-16 md:h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-lg md:rounded-xl flex items-center justify-center text-white mb-2 md:mb-6 group-hover:scale-110 transition-transform duration-300 text-sm md:text-base">
                  {feature.icon}
                </div>
                <h3 className="text-xs md:text-xl font-bold text-[var(--text)] mb-1 md:mb-4 line-clamp-2">{feature.title}</h3>
                <p className="text-[var(--muted)] leading-relaxed text-[10px] md:text-base line-clamp-3 md:line-clamp-none">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>






      {/* Stats Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white landing-stats">
        <div 
          ref={statsReveal.ref}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8 text-center">
            {[
              { number: "500+", label: "Empresas Atendidas" },
              { number: "40%", label: "Aumento Médio de Produtividade" },
              { number: "99.9%", label: "Uptime Garantido" },
              { number: "24/7", label: "Suporte Técnico" }
            ].map((stat, index) => (
              <StatCounter 
                key={index} 
                number={stat.number} 
                label={stat.label} 
                isVisible={statsReveal.isVisible} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-24 landing-testimonials" ref={testimonialsSectionRef}>
        <div 
          ref={testimonialsReveal.ref}
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-reveal ${testimonialsReveal.isVisible ? 'visible' : ''}`}
        >
          <div className="text-center mb-6 md:mb-16">
            <h2 className="text-2xl md:text-5xl font-bold text-[var(--text)] mb-3 md:mb-6">
              O que nossos clientes dizem...
            </h2>
            <p className="text-sm md:text-xl text-white" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
              Empresas que transformaram suas operações com a <span className="sync-logo-light" style={{ color: '#308cc9d6' }}>SYNC</span>
              !</p>
          </div>

          <div ref={testimonialsGridRef} className="testimonials-grid grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-8">
            {[
              {
                name: "Carla Mendes",
                role: "Gerente de Produção",
                company: "Indústria XY",
                photo: "https://randomuser.me/api/portraits/women/68.jpg",
                text: "Desde que implementamos a SYNC, nossa produção aumentou 30% e conseguimos reduzir custos operacionais significativamente.",
                rating: 5
              },
              {
                name: "Marcos Lima",
                role: "Diretor Industrial",
                company: "Fábrica Zeta",
                photo: "https://randomuser.me/api/portraits/men/45.jpg",
                text: "A plataforma é intuitiva e nos dá controle total da operação. O suporte da equipe é excepcional.",
                rating: 5
              },
              {
                name: "Fernanda Dias",
                role: "Supervisora de Qualidade",
                company: "Metalúrgica Alfa",
                photo: "https://randomuser.me/api/portraits/women/65.jpg",
                text: "A implantação foi rápida e o ROI foi visível no primeiro mês. Recomendo fortemente.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <TestimonialCard
                key={index}
                testimonial={testimonial}
                isVisible={activeTestimonial >= index}
                isActive={activeTestimonial === index}
                hasCompleted={activeTestimonial > index}
                isDarkMode={isDarkMode}
                onComplete={() => setActiveTestimonial(prev => prev + 1)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white">
        <div 
          ref={ctaReveal.ref}
          className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center scroll-reveal ${ctaReveal.isVisible ? 'visible' : ''}`}
        >
          <h2 className="text-2xl md:text-5xl font-bold mb-3 md:mb-6">
            Pronto para transformar sua produção?
          </h2>
          <p className="text-sm md:text-xl mb-4 md:mb-8 opacity-90">
            Junte-se a centenas de empresas que já estão aproveitando os benefícios da automação industrial
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="bg-transparent backdrop-blur-md border border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3"
            >
              Começar Gratuitamente
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white">
                    <path fillRule="evenodd" clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="text-xl sync-logo" style={{ color: '#60a5fa' }}>SYNC</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Transformando a indústria com tecnologia de ponta e automação inteligente.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-[var(--primary)] transition-colors">
                  <FaLinkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[var(--primary)] transition-colors">
                  <FaTwitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[var(--primary)] transition-colors">
                  <FaInstagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-[var(--primary)] transition-colors">
                  <FaGithub className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Produto</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-[var(--primary)] transition-colors">Recursos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[var(--primary)] transition-colors">Preços</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[var(--primary)] transition-colors">Integrações</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[var(--primary)] transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-[var(--primary)] transition-colors">Sobre</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[var(--primary)] transition-colors">Carreiras</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[var(--primary)] transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[var(--primary)] transition-colors">Imprensa</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Suporte</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-[var(--primary)] transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[var(--primary)] transition-colors">Documentação</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[var(--primary)] transition-colors">Contato</a></li>
                <li><a href="#" className="text-gray-400 hover:text-[var(--primary)] transition-colors">Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400">&copy; 2024 <span className="sync-logo" style={{ color: '#60a5fa' }}>SYNC</span>. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
