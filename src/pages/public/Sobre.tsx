import React from 'react';
import LandingHeader from '../../components/layout/LandingHeader';
import { FaArrowRight, FaLinkedin, FaRegCalendarAlt } from 'react-icons/fa';

const team = [
  {
    name: 'Karine Costa',
    role: 'Scrum Master & Banco De Dados',
    avatar: 'src/assets/images/Imagem do WhatsApp de 2025-09-08 à(s) 08.23.49_1e7c5b33.jpg',
    desc: 'Apaixonada por inovação e indústria 4.0.',
    linkedin: 'https://linkedin.com/in/ana-martins-sync'
  },
  {
    name: 'Gustavo Scarabelli',
    role: 'TechLead & Banco De Dados',
    avatar: 'src/assets/images/Imagem do WhatsApp de 2025-09-08 à(s) 08.23.48_c9fc3fa5.jpg',
    desc: 'Transformando tecnologia em soluções reais.',
    linkedin: 'https://linkedin.com/in/lucas-almeida-sync'
  },
  
  {
    name: 'Arthur Sena',
    role: 'TechLead & Backend',
    avatar: 'src/assets/images/Imagem do WhatsApp de 2025-09-08 à(s) 08.23.49_b4ee71a6.jpg',
    desc: 'Foco total na experiência do usuário.',
    linkedin: 'https://linkedin.com/in/marina-souza-sync'
  },

  {
    name: 'Rafael Cremasco',
    role: 'Backend ',
    avatar:'src/assets/images/Imagem do WhatsApp de 2025-09-08 à(s) 08.23.48_beef8bd6.jpg',
    desc: 'Código limpo, produto robusto.',
    linkedin: 'https://linkedin.com/in/carlos-pereira-sync'
  },
  
  {
    name: 'Júlio César',
    role: 'UX/UI Designer & Frontend',
    avatar: 'src/assets/images/Imagem do WhatsApp de 2025-09-08 à(s) 08.23.49_c7f723f0.jpg',
    desc: 'Design que conecta pessoas e tecnologia.',
    linkedin: 'https://linkedin.com/in/fernanda-dias-sync'
  },

  {
    name: 'Kauã Rytchelle',
    role: 'Project Owner & Frontend',
    avatar: 'src/assets/images/Imagem do WhatsApp de 2025-09-08 à(s) 09.11.45_1ae6dee6.jpg',
    desc: 'Dados são o novo petróleo.',
    linkedin: 'https://linkedin.com/in/pedro-santos-sync'
  },

];

const timeline = [
  { year: '2021', event: 'Fundação do projeto Sync' },
  { year: '2022', event: 'Primeiro piloto em indústria de médio porte' },
  { year: '2022', event: 'Lançamento do dashboard em tempo real' },
  { year: '2023', event: 'Integração com ERPs e IoT' },
  { year: '2023', event: 'Reconhecimento em prêmio de inovação industrial' },
  { year: '2024', event: 'Expansão para novos segmentos e ODS' },
];

const Sobre: React.FC = () => {
  React.useEffect(() => {
    document.title = 'Sobre o Sync | Sistema Supervisório';
    document.querySelector('meta[name="description"]')?.setAttribute('content', 'Conheça o Sync, sistema supervisório (SCADA) inovador para gestão industrial, alinhado às ODS 9 e 12. Veja missão, visão, valores e equipe.');
  }, []);

  return (
    <>
      <LandingHeader />
      <main className="min-h-screen w-full flex flex-col items-center py-0 px-0">
        {/* Imagem de topo full width */}
        <section className="w-full mb-0">
          <img
            src="https://images.unsplash.com/photo-1581091014534-7af89e5cf3c4?auto=format&fit=crop&w=1920&q=80"
            alt="Ambiente industrial moderno"
            className="w-full h-[320px] md:h-[420px] object-cover object-center shadow-lg"
            style={{ maxWidth: '100vw' }}
          />
        </section>
        {/* Bloco principal centralizado */}
        <section className="max-w-4xl w-full mx-auto text-center -mt-20 mb-12 px-4">
          <div className="rounded-3xl shadow-2xl border-2 p-8 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
            <h1 className="text-4xl font-extrabold text-[var(--primary-dark)] dark:text-[var(--primary)] mb-6 animate-fadeInUp">Sobre o Sync</h1>
            <p className="text-lg mb-8 leading-relaxed animate-fadeInUp font-medium text-[var(--text)]" style={{ animationDelay: '100ms' }}>
              O Sync é um sistema supervisório (SCADA) de última geração, projetado para empresas que buscam excelência operacional, rastreabilidade e tomada de decisão baseada em dados. Integrando tecnologias de IIoT, automação industrial, analytics e dashboards em tempo real, o Sync permite o monitoramento centralizado de processos, controle de ativos, gestão de alarmes, coleta e historização de dados, além de relatórios inteligentes para manutenção preditiva e eficiência energética.<br/><br/>
              Nossa plataforma é escalável, segura e flexível, suportando protocolos industriais (Modbus, OPC, MQTT), integração com ERPs e dispositivos IoT, além de arquitetura cloud e edge computing. O Sync se adapta a diferentes segmentos industriais, promovendo interoperabilidade, redução de custos, sustentabilidade e inovação contínua.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-4 mb-8">
              <span className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-6 py-2 rounded-full text-base font-bold border-2 border-yellow-600 animate-fadeInUp shadow-md" style={{ animationDelay: '200ms' }}>
                <span className="font-extrabold">ODS 9</span> Inovação e infraestrutura
              </span>
              <span className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-full text-base font-bold border-2 border-green-700 animate-fadeInUp shadow-md" style={{ animationDelay: '300ms' }}>
                <span className="font-extrabold">ODS 12</span> Produção e consumo responsáveis
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
              <div className="rounded-2xl p-6 border-2 shadow-lg animate-fadeInUp bg-blue-50 dark:bg-gray-700/50 border-blue-300 dark:border-blue-700" style={{ animationDelay: '350ms' }}>
                <h3 className="font-extrabold text-[var(--primary-dark)] dark:text-[var(--primary)] mb-3 text-xl">Missão</h3>
                <p className="text-base font-medium leading-relaxed text-[var(--text)]">Transformar a gestão industrial por meio de tecnologia acessível, conectando pessoas, máquinas e dados para uma produção mais eficiente e sustentável.</p>
              </div>
              <div className="rounded-2xl p-6 border-2 shadow-lg animate-fadeInUp bg-blue-50 dark:bg-gray-700/50 border-blue-300 dark:border-blue-700" style={{ animationDelay: '400ms' }}>
                <h3 className="font-extrabold text-[var(--primary-dark)] dark:text-[var(--primary)] mb-3 text-xl">Visão</h3>
                <p className="text-base font-medium leading-relaxed text-[var(--text)]">Ser referência nacional em sistemas supervisórios, promovendo inovação, transparência e responsabilidade ambiental no setor industrial.</p>
              </div>
              <div className="rounded-2xl p-6 border-2 shadow-lg animate-fadeInUp bg-blue-50 dark:bg-gray-700/50 border-blue-300 dark:border-blue-700" style={{ animationDelay: '450ms' }}>
                <h3 className="font-extrabold text-[var(--primary-dark)] dark:text-[var(--primary)] mb-3 text-xl">Valores</h3>
                <p className="text-base font-medium leading-relaxed text-[var(--text)]">Inovação, ética, colaboração, sustentabilidade, excelência técnica e foco no cliente.</p>
              </div>
            </div>
          </div>
        </section>
        {/* Timeline */}
        <section className="max-w-5xl w-full mx-auto mb-12 px-4">
          <h2 className="text-3xl font-extrabold text-[var(--primary-dark)] dark:text-white mb-10 text-center animate-fadeInUp">Nossa História</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp" style={{ animationDelay: '500ms' }}>
            {timeline.map((item, idx) => (
              <div 
                key={idx} 
                className="rounded-2xl border-2 shadow-lg p-6 transition-all duration-300 group bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-700 hover:shadow-2xl hover:border-[var(--primary-dark)] hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--primary-dark)] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200">
                    <FaRegCalendarAlt className="text-xl" aria-label="Ano" />
                  </span>
                  <span className="text-2xl font-extrabold text-[var(--primary-dark)] dark:text-[var(--primary)]">{item.year}</span>
                </div>
                <p className="text-base font-semibold leading-relaxed text-[var(--text)]">{item.event}</p>
              </div>
            ))}
          </div>
        </section>
        {/* Frase de impacto */}
        <section className="max-w-2xl w-full mx-auto mb-12 px-4">
          <div className="border-l-8 border-[var(--primary-dark)] rounded-2xl p-8 flex flex-col items-start animate-fadeInUp shadow-xl bg-blue-100 dark:bg-gray-800" style={{ animationDelay: '600ms' }}>
            <p className="text-xl italic mb-4 font-medium leading-relaxed text-[var(--text)]">"Acreditamos que a tecnologia deve ser uma ponte para um futuro mais eficiente, humano e sustentável. O Sync nasceu desse propósito: simplificar o complexo e empoderar pessoas."</p>
            <span className="font-extrabold text-[var(--primary-dark)] dark:text-[var(--primary)] text-lg">— Karine Costa, CEO & Fundadora</span>
          </div>
        </section>
        {/* Time */}
        <section className="max-w-6xl w-full mx-auto px-4 mb-12">
          <h2 className="text-3xl font-extrabold text-[var(--primary-dark)]  dark:text-white mb-10 text-center animate-fadeInUp">Nosso Time</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
            {team.map((m, i) => (
              <div
                key={i}
                className="rounded-2xl border-2 shadow-xl p-8 flex flex-col items-center animate-fadeInUp group transition-all duration-200 hover:shadow-2xl hover:border-[var(--primary-dark)] hover:-translate-y-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                style={{ animationDelay: `${100 + i * 80}ms` }}
              >
                <img src={m.avatar} alt={`Foto de ${m.name}`} className="w-24 h-24 rounded-full mb-4 border-4 border-gray-300 object-cover group-hover:border-[var(--primary-dark)] transition-colors duration-200 shadow-lg" />
                <h3 className="text-xl font-extrabold text-[var(--primary-dark)] dark:text-[var(--primary)] mb-2 text-center group-hover:text-[var(--primary)] transition-colors duration-200">{m.name}</h3>
                <span className="text-sm font-bold mb-3 text-center text-[var(--text)]">{m.role}</span>
                <p className="text-sm text-center italic mb-4 font-medium text-[var(--text)]">"{m.desc}"</p>
                <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`LinkedIn de ${m.name}`} className="text-[var(--primary-dark)] hover:text-[var(--primary)] transition-colors text-2xl mt-1" tabIndex={0}>
                  <FaLinkedin />
                </a>
              </div>
            ))}
          </div>
        </section>
        {/* Botão de recursos */}
        <section className="w-full flex flex-col items-center py-12">
          <a href="/diferenciais" className="bg-[var(--primary-dark)] text-white px-12 py-5 text-xl font-extrabold rounded-2xl shadow-2xl hover-lift animate-fadeInUp transition-all duration-300 hover:bg-[var(--primary)] border-2 border-[var(--primary-dark)]" style={{ animationDelay: '700ms' }}>
            Veja nossos recursos <FaArrowRight className="inline ml-2" />
          </a>
        </section>
      </main>
    </>
  );
};

export default Sobre;