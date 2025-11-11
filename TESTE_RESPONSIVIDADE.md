# 🧪 Guia de Teste de Responsividade

## 🚀 Inicio Rápido

### 1. Abra o Chrome DevTools
- **Windows/Linux**: `F12` ou `Ctrl + Shift + I`
- **Mac**: `Cmd + Option + I`

### 2. Ative o Device Mode
- **Windows/Linux**: `Ctrl + Shift + M`
- **Mac**: `Cmd + Shift + M`

## 📱 Dispositivos para Testar

### Mobile (Prioridade Alta)
```
✅ iPhone SE - 375 x 667
✅ iPhone 12 Pro - 390 x 844
✅ iPhone 14 Pro Max - 430 x 932
✅ Samsung Galaxy S21 - 360 x 800
✅ Google Pixel 5 - 393 x 851
```

### Tablet (Prioridade Média)
```
✅ iPad Mini - 768 x 1024
✅ iPad Air - 820 x 1180
✅ iPad Pro 11" - 834 x 1194
✅ Samsung Galaxy Tab - 800 x 1280
```

### Desktop (Prioridade Alta)
```
✅ Laptop 1366px (HD)
✅ MacBook Air 13" - 1280 x 800 (Retina: 2560 x 1600)
✅ MacBook Pro 14" - 1512 x 982 (Retina: 3024 x 1964)
✅ Desktop 1080p - 1920 x 1080
✅ Desktop 1440p - 2560 x 1440
```

## ✅ Checklist de Teste

### Página Funcionários (`/management/funcionarios`)
- [ ] Cards mostram 1 coluna em mobile
- [ ] Cards mostram 2 colunas em tablet
- [ ] Cards mostram 3-4 colunas em desktop
- [ ] Filtros não quebram em mobile
- [ ] Botões são tocáveis (44x44px mínimo)
- [ ] Modal de detalhes fica fullscreen em mobile
- [ ] Scroll suave com virtualização
- [ ] Imagens carregam com lazy loading

### Página Máquinas (`/management/maquinas`)
- [ ] Grid responsivo funciona
- [ ] KPI cards empilham em mobile
- [ ] Métricas (OEE, vazão) visíveis
- [ ] Operadores aparecem corretamente
- [ ] Modal fullscreen em mobile

### Página Departamentos (`/management/departamentos`)
- [ ] Grid adaptável
- [ ] Setores aparecem corretamente
- [ ] Contador de funcionários visível
- [ ] Modal responsivo

### Formulários (CUDModal)
- [ ] Fullscreen em mobile (< 768px)
- [ ] Botões empilhados verticalmente em mobile
- [ ] Campos de formulário com tamanho adequado
- [ ] Labels legíveis
- [ ] Botão X (fechar) grande o suficiente

### Header & Sidebar
- [ ] Menu mobile funcional
- [ ] Notificações acessíveis
- [ ] Logo não quebra
- [ ] Links de navegação tocáveis

## 🎯 Pontos Críticos para Verificar

### ❌ Problemas Comuns
1. **Texto cortado**: Verifique se textos cabem sem quebrar layout
2. **Botões pequenos**: Mínimo 44x44px para toque
3. **Scroll horizontal**: Nunca deve aparecer (exceto em tabelas)
4. **Imagens distorcidas**: Manter aspect ratio
5. **Overlaps**: Elementos não devem sobrepor

### ✅ Boas Práticas
1. **Espaçamento adequado**: Mínimo 16px entre elementos tocáveis
2. **Contraste**: Texto legível em fundos coloridos
3. **Feedback visual**: Hover/active states funcionam
4. **Performance**: Scroll suave, sem lag
5. **Gestos**: Swipe, pinch-to-zoom funcionam quando apropriado

## 🔍 Teste de Performance

### Lighthouse Audit
1. Abra DevTools
2. Aba "Lighthouse"
3. Selecione "Mobile" ou "Desktop"
4. Marque "Performance" e "Best Practices"
5. Clique "Analyze page load"

### Métricas Alvo
```
✅ Performance Score: > 90
✅ First Contentful Paint: < 1.5s
✅ Largest Contentful Paint: < 2.5s
✅ Time to Interactive: < 3.5s
✅ Cumulative Layout Shift: < 0.1
```

## 📊 Teste de Virtualização

### Como Testar
1. Vá para Funcionários com 100+ items
2. Abra DevTools → Elements
3. Inspecione o grid
4. Observe: Apenas ~20-30 cards renderizados
5. Faça scroll e veja novos cards aparecerem

### Esperado
- ✅ DOM contém apenas items visíveis + buffer
- ✅ Scroll suave sem lag
- ✅ Memória estável (não aumenta ao scrollar)

## 🧪 Teste em Dispositivos Reais

### iOS (Safari)
```bash
# Abrir inspector remoto no Mac
Safari → Develop → [Seu iPhone] → [Página]
```

### Android (Chrome)
```bash
# No computador
chrome://inspect
# No celular, ative "USB Debugging"
```

## 🐛 Reportar Bugs

Se encontrar problemas, anote:
1. **Dispositivo/Browser**: Ex: iPhone 14, Safari 17
2. **Viewport**: Ex: 390 x 844
3. **Página**: Ex: /management/funcionarios
4. **Screenshot**: Capture o problema
5. **Passos para reproduzir**:
   - Passo 1
   - Passo 2
   - Resultado esperado vs. obtido

## 🛠️ Ferramentas Úteis

### Chrome Extensions
- **Responsive Viewer**: Testa múltiplos dispositivos simultaneamente
- **Lighthouse**: Análise de performance e acessibilidade
- **React Developer Tools**: Debug de componentes

### Online Tools
- **BrowserStack**: Teste em dispositivos reais
- **LambdaTest**: Teste cross-browser
- **Responsively App**: App desktop para teste responsivo

## 📝 Template de Teste

```markdown
## Teste em [Nome do Dispositivo]

**Data**: DD/MM/AAAA
**Testador**: [Seu nome]
**Viewport**: XXX x YYY

### Funcionários
- [ ] Grid responsivo ✅/❌
- [ ] Modal funcional ✅/❌
- [ ] Performance OK ✅/❌
- **Observações**: 

### Máquinas
- [ ] Grid responsivo ✅/❌
- [ ] KPIs legíveis ✅/❌
- **Observações**:

### Departamentos
- [ ] Layout correto ✅/❌
- **Observações**:

### Formulários
- [ ] Fullscreen mobile ✅/❌
- [ ] Campos acessíveis ✅/❌
- **Observações**:

### Bugs Encontrados
1. 
2.
3.

### Screenshots
[Adicionar screenshots dos problemas]
```

## 🎨 Visual Regression Testing

### Setup
```bash
# Instalar Playwright (opcional)
npm install -D @playwright/test

# Criar teste de screenshot
# tests/visual.spec.ts
```

### Exemplo de Teste
```typescript
import { test, expect } from '@playwright/test';

test('Funcionarios mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/management/funcionarios');
  await expect(page).toHaveScreenshot('funcionarios-mobile.png');
});

test('Funcionarios desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/management/funcionarios');
  await expect(page).toHaveScreenshot('funcionarios-desktop.png');
});
```

---

**Dica**: Teste sempre em **dispositivos reais** quando possível. Emuladores são ótimos, mas não substituem o teste real!

**Prioridade de Teste**:
1. 🔴 iPhone (Safari) - Maior base de usuários mobile
2. 🔴 Android (Chrome) - Segunda maior base
3. 🟡 iPad (Safari) - Tablets
4. 🟡 Desktop (Chrome/Firefox) - Computadores
5. 🟢 Outros navegadores - Edge, Opera, etc.
