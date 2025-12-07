"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

const getInitialTheme = (): boolean => {
  try {
    const saved = localStorage.getItem("theme")
    if (saved) return saved === "dark"
    // Padrão: modo dark
    return true
  } catch {
    return false
  }
}

interface HeaderProps {
  onMenuClick?: () => void;
}

const AuthenticatedHeader: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialTheme)
  const [userAvatar, setUserAvatar] = useState<string>('')
  const [userName, setUserName] = useState<string>('')

  // Remove o efeito inicial que sobrescrevia o estado
  // Aplica/Salva tema sempre que isDarkMode muda
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [isDarkMode])

  // Buscar dados do usuário do token
  useEffect(() => {
    const token = localStorage.getItem('user_token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        const email = payload.sub || payload.email || ''
        
        // Extrair nome do email (parte antes do @)
        const name = email.split('@')[0] || 'Usuário'
        setUserName(name)
        
        // Gerar avatar com inicial do nome
        setUserAvatar(`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=128`)
      } catch (err) {
        console.error('Erro ao decodificar token:', err)
        setUserName('Usuário')
        setUserAvatar('https://ui-avatars.com/api/?name=U&background=3b82f6&color=fff&size=128')
      }
    }
  }, [])

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev)
  }

  return (
    <header
      role="banner"
      className={`header-nav fixed top-0 left-0 right-0 flex items-center justify-between ${isDarkMode ? "bg-gray-900 border-gray-700" : "bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] border-gray-700"} border-b px-3 sm:px-4 md:px-6 notebook:px-10 py-2 sm:py-3 w-full transition-colors duration-300 z-40 shadow-md`}
    >
      <div className={`flex items-center gap-2 sm:gap-4 ${isDarkMode ? "text-white" : "text-white"}`}>
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Abrir menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        
        <div className="size-3 sm:size-4" aria-hidden="true">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
              fill="currentColor"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h1 className="text-base sm:text-lg sync-logo-light">SYNC</h1>
      </div>
      {/* Área central - pode adicionar navegação aqui se necessário */}
      <div className="flex-1" />
      
      {/* Área direita - Dark Mode e Perfil */}
      <nav aria-label="Navegação do usuário" className="flex items-center gap-2 sm:gap-3">
        
        {/* Botão Dark Mode */}
        <button
          onClick={toggleTheme}
          className={`flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isDarkMode
              ? "bg-gray-700 text-yellow-400 hover:bg-gray-600 focus:ring-yellow-400"
              : "bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20 focus:ring-white"
          }`}
          aria-label={isDarkMode ? "Alternar para modo claro" : "Alternar para modo escuro"}
          aria-pressed={isDarkMode}
          type="button"
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
              <path d="M120,40V16a8,8,0,0,1,16,0V40a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,1,69.66,58.34l16,16a8,8,0,0,1-11.32,11.32Zm0,116.68-16-16a8,8,0,0,1,11.32-11.32l16,16a8,8,0,0,1-11.32,11.32ZM192,72a8,8,0,0,1,5.66-2.34l16-16a8,8,0,0,1,11.32,11.32l-16,16A8,8,0,0,1,192,72Zm5.66,114.34a8,8,0,0,1-11.32,11.32l-16-16a8,8,0,0,1,11.32-11.32ZM48,128a8,8,0,0,1-8-8H16a8,8,0,0,1,0-16H40A8,8,0,0,1,48,128Zm80,80a8,8,0,0,1-8,8v24a8,8,0,0,1-16,0V216A8,8,0,0,1,128,208Zm112-88a8,8,0,0,1-8,8H208a8,8,0,0,1,0-16h24A8,8,0,0,1,240,120Z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
              <path d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56A104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z" />
            </svg>
          )}
          <span className="sr-only">{isDarkMode ? "Modo escuro ativado" : "Modo claro ativado"}</span>
        </button>
        
        {/* Perfil */}
        <Link
          to="/perfil"
          className="size-8 sm:size-10 rounded-full bg-center bg-cover cursor-pointer transition-transform duration-200 hover:scale-110 hover:shadow-lg border-2 border-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          style={{
            backgroundImage: userAvatar ? `url("${userAvatar}")` : 'url("https://ui-avatars.com/api/?name=U&background=3b82f6&color=fff&size=128")',
          }}
          aria-label={userName ? `Ir para perfil de ${userName}` : "Ir para meu perfil"}
          role="img"
        >
          <span className="sr-only">{userName || "Usuário"}</span>
        </Link>
      </nav>
    </header>
  )
}

export default AuthenticatedHeader
