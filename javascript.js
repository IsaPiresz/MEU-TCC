// script.js - comportamento: navegação suave, protótipo pictograma, síntese de voz e submissão de feedback

document.addEventListener('DOMContentLoaded', function () {
    // Atualiza ano no rodapé
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  
    // Navegação suave para âncoras internas
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.focus({ preventScroll: true });
        }
      });
    });
  
    // Protótipo: construir frase e síntese de voz
    const pictograms = document.querySelectorAll('.pictogram');
    const phraseEl = document.getElementById('phrase');
    const speakBtn = document.getElementById('speakBtn');
    const clearBtn = document.getElementById('clearBtn');
    const messageParts = []; // armazena textos selecionados
  
    function updatePhraseDisplay() {
      phraseEl.textContent = messageParts.join(' ');
      // Ajusta aria-live se necessário
    }
  
    // Verifica suporte a síntese de voz
    const speechSupported = 'speechSynthesis' in window && !!window.speechSynthesis;
    if (!speechSupported) {
      speakBtn.disabled = true;
      speakBtn.title = 'Síntese de voz não suportada neste dispositivo/navegador.';
    }
  
    pictograms.forEach(btn => {
      btn.addEventListener('click', function () {
        const text = btn.getAttribute('data-text') || btn.textContent.trim();
        messageParts.push(text);
        updatePhraseDisplay();
        // feedback tátil/visual
        btn.classList.add('active');
        setTimeout(()=> btn.classList.remove('active'),120);
        // opcional: ler a palavra imediatamente (configurável)
        // speakText(text);
      });
      // permissão de teclado: ativar com Enter/Space
      btn.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          btn.click();
        }
      });
    });
  
    function speakText(text){
      if(!speechSupported) return;
      // cancel previous
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      // configuração básica (pode ser expandida ao adicionar UI para escolher voz/velocidade)
      utter.lang = 'pt-BR';
      utter.rate = 0.95;
      window.speechSynthesis.speak(utter);
    }
  
    speakBtn.addEventListener('click', function(){
      const phrase = messageParts.join(' ').trim();
      if(!phrase){
        // dar foco e retorno acessível
        phraseEl.focus();
        return;
      }
      speakText(phrase);
    });
  
    clearBtn.addEventListener('click', function(){
      messageParts.length = 0;
      updatePhraseDisplay();
      window.speechSynthesis.cancel();
    });
  
    // Formulário de feedback: validação simples e resposta simulada (não envia a servidor)
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackResponse = document.getElementById('feedbackResponse');
  
    feedbackForm.addEventListener('submit', function(e){
      e.preventDefault();
      const role = document.getElementById('role').value;
      const comentario = document.getElementById('comentario').value.trim();
      if(!role || comentario.length < 3){
        feedbackResponse.style.color = 'var(--red)';
        feedbackResponse.textContent = 'Por favor, preencha seu papel e um comentário válido.';
        return;
      }
      // Simular armazenamento local (ex.: localStorage) - útil durante testes
      const fb = {
        nome: document.getElementById('nome').value.trim(),
        role,
        comentario,
        ts: new Date().toISOString()
      };
      const stored = JSON.parse(localStorage.getItem('tcc_feedback') || '[]');
      stored.push(fb);
      localStorage.setItem('tcc_feedback', JSON.stringify(stored));
  
      feedbackResponse.style.color = 'var(--green)';
      feedbackResponse.textContent = 'Obrigado pelo feedback! Ele foi registrado localmente para testes.';
      feedbackForm.reset();
    });
  
    // Acessibilidade: permitir limpar frase com Backspace quando focado
    phraseEl.addEventListener('keydown', function(e){
      if(e.key === 'Backspace'){
        // remove último elemento
        messageParts.pop();
        updatePhraseDisplay();
      }
    });
  
  });
  