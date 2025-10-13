import React, { useState } from 'react';
import { LandingHeader } from '../../components/layout';
import { Link } from 'react-router-dom';
import '../../styles/base/globals.css';
import Carrosel from "../../components/carrosel/carrossel";

import {
  FaRocket, FaChartLine, FaCogs, FaShieldAlt, FaUsers, FaCheckCircle,
  FaArrowRight, FaPlay, FaStar, FaQuoteLeft, FaLinkedin, FaTwitter, FaInstagram, FaGithub
} from 'react-icons/fa';

const LandingPage: React.FC = () => {
  const [bgReady, setBgReady] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Preloader cobrindo o site até o vídeo começar a tocar (ou fallback) */}
      {!bgReady && (
        <div className="fixed inset-0 z-[100]" style={{ background: 'var(--bg-gradient)' }}></div>
      )}
      <LandingHeader />
       
  <div className={`relative w-full h-screen overflow-hidden ${bgReady ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
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
        height: '56.25vw', // 16:9 aspect ratio
        minHeight: '100vh',
        minWidth: '177.78vh' // 16:9 aspect ratio
      }}
      onLoad={() => setBgReady(true)}
      frameBorder={0}
    />
  </div>

  {/* Overlay opcional para escurecer o vídeo */}
  <div className="absolute inset-0 bg-black/50 z-10"></div>

  {/* Conteúdo acima do vídeo */}
  <section className="relative z-20 flex flex-col items-center justify-start w-full h-full text-center px-4 pt-32">
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium border border-white/30">
        <FaRocket className="text-white" />
        <span>Nova versão disponível</span>
      </div>

            {/* Título */}
            <div className=' bg-black/30 px-8 py-4 rounded-3xl leading-snug'>

      <h1 className="text-5xl md:text-7xl font-bold text-white">
        Automação Industrial
        <span className="block text-[var(--primary)] mt-2">do Futuro</span>
      </h1>

      {/* Parágrafo */}
      <p className="text-xl md:text-2xl text-white px-6 py-4 rounded-2xl max-w-3xl mx-auto leading-relaxed">
        Transforme sua produção com tecnologia de ponta.
        <span className="text-[var(--primary)] font-semibold">
          {" "}Eficiência, controle e resultados
        </span>{" "}
        em uma única plataforma.
      </p>

            </div>
      {/* Botões */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <Link
          to="/login"
          className="group bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white px-8 py-4 rounded-3xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
        >
          Começar Agora
          <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
        </Link>

        <button className="flex items-center gap-3 text-white hover:text-[var(--primary)] transition-colors duration-300">
          <div className="w-12 h-12 bg-transparent backdrop-blur-md border border-white rounded-full flex items-center justify-center shadow-lg">
            <FaPlay className="text-white ml-1" />
          </div>
          <span className="font-medium">Ver demonstração</span>
        </button>
      </div>

      {/* Benefícios */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-white mt-6">
        <div className="flex items-center gap-2">
          <FaCheckCircle className="text-green-500" />
          <span>Setup em 5 minutos</span>
        </div>
        <div className="flex items-center gap-2">
          <FaCheckCircle className="text-green-500" />
          <span>Suporte 24/7</span>
        </div>
        <div className="flex items-center gap-2">
          <FaCheckCircle className="text-green-500" />
          <span>99.9% uptime</span>
        </div>
      </div>

    </div>
  </section>
</div>

  

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-6">
              Por que escolher a <span className="text-[var(--primary)]">Sync</span>?
            </h2>
            <p className="text-xl text-[var(--muted)] max-w-3xl mx-auto">
              Nossa plataforma oferece tudo que você precisa para modernizar sua operação industrial
            </p>
          </div>
          
          <div className="grid grid-cols-1 md-grid-cols-2 lg:grid-cols-3 gap-8">
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
                className="group p-8 rounded-2xl border border-gray-200 bg-white hover:border-[var(--primary)] hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[var(--text)] mb-4">{feature.title}</h3>
                <p className="text-[var(--muted)] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      




      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "500+", label: "Empresas Atendidas" },
              { number: "40%", label: "Aumento Médio de Produtividade" },
              { number: "99.9%", label: "Uptime Garantido" },
              { number: "24/7", label: "Suporte Técnico" }
            ].map((stat, index) => (
              <div key={index} className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-2xl hover:bg-white/20 transition">
                <div className="text-4xl md:text-5xl font-bold mb-2 text-white">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-white/90">{stat.label}</div>
              </div>
              ))}
            </div>
        </div>
      </section>

      


{/* Features Section */}
<section className="py-24">
  {/* Conteúdo da seção */}
</section>

      
{/* Carrossel */}
<Carrosel />

{/* Stats Section */}
<section className="py-20 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white">
  ...
</section>



      {/* Testimonials Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--text)] mb-6">
              O que nossos clientes dizem
          </h2>
            <p className="text-xl text-[var(--muted)]">
              Empresas que transformaram suas operações com a Sync
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Carla Mendes",
                role: "Gerente de Produção",
                company: "Indústria XY",
                photo: "https://randomuser.me/api/portraits/women/68.jpg",
                text: "Desde que implementamos a Sync, nossa produção aumentou 30% e conseguimos reduzir custos operacionais significativamente.",
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
              <div
                key={index}
                className="p-8 rounded-2xl border border-gray-200 bg-white shadow-lg hover:shadow-2xl hover:border-[var(--primary)] transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 w-4 h-4" />
                ))}
            </div>
                
                <FaQuoteLeft className="text-[var(--primary)] text-2xl mb-4" />
                
                <p className="text-[var(--text)] mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.photo}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-[var(--text)]">{testimonial.name}</div>
                    <div className="text-sm text-[var(--muted)]">{testimonial.role} • {testimonial.company}</div>
                  </div>
                </div>
            </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pronto para transformar sua produção?
          </h2>
          <p className="text-xl mb-8 opacity-90">
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
            
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-[var(--primary)] transition-all duration-300">
              Falar com Especialista
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--text)] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white">
                    <path fillRule="evenodd" clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" />
                    <path fillRule="evenodd" clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Sync</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Transformando a indústria com tecnologia de ponta e automação inteligente.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <FaLinkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <FaTwitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <FaInstagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  <FaGithub className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Imprensa</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Sync. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
