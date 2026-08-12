// ============================================================
// KapivaTermo — Lógica Principal do Jogo (script.js)
// ============================================================

/** Configurações Globais e Constantes */
const TOTAL_TENTATIVAS = 6;
const TAMANHO_PALAVRA = 5;
const DATA_INICIAL_ISO = "2024-01-01T00:00:00Z"; // Data base para cálculo da palavra semanal

// Variável para testes de desenvolvimento (deixe null em produção)
// Exemplo: const PALAVRA_TESTE = "TERMO";
const PALAVRA_TESTE = null;

/** Chaves do LocalStorage */
const CHAVE_ESTADO = "kapivaTermo_estado";
const CHAVE_STATS = "kapivaTermo_stats";
const CHAVE_TEMA = "kapivaTermo_tema";

/** Estado Atual da Partida */
let estadoJogo = {
  semanaAtual: 0,
  palavraSecreta: "",
  tentativas: [],        // Ex: ["AMIGO", "TERMO"]
  resultados: [],        // Ex: [["correta", "ausente", ...], ...]
  linhaAtual: 0,
  status: "jogando",     // "jogando", "ganhou", "perdeu"
  tecladoEstado: {}      // Ex: { A: "correta", B: "ausente" }
};

/** Estado Atual do Teclado Físico / Trava de Animação */
let digitacaoBloqueada = false;

// ============================================================
// 1. INICIALIZAÇÃO
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  inicializarAnoRodape();
  inicializarTema();
  inicializarModais();

  const numeroSemana = calcularNumeroSemana();
  const palavraDaSemana = obterPalavraDaSemana(numeroSemana);

  carregarOuIniciarJogo(numeroSemana, palavraDaSemana);
  construirTabuleiro();
  construirTeclado();
  restaurarInterface();
  configurarEventosTecladoFisico();
});

function inicializarAnoRodape() {
  const elAno = document.getElementById("ano-atual");
  if (elAno) elAno.textContent = new Date().getFullYear();
}

// ============================================================
// 2. PALAVRA SEMANAL
// ============================================================
function calcularNumeroSemana() {
  const inicio = new Date(DATA_INICIAL_ISO).getTime();
  const agora = new Date().getTime();
  const milissegundosPorSemana = 1000 * 60 * 60 * 24 * 7;
  return Math.floor((agora - inicio) / milissegundosPorSemana);
}

function obterPalavraDaSemana(numeroSemana) {
  if (PALAVRA_TESTE && PALAVRA_TESTE.length === TAMANHO_PALAVRA) {
    return PALAVRA_TESTE.toUpperCase();
  }
  const indice = numeroSemana % PALAVRAS_RESPOSTA.length;
  return PALAVRAS_RESPOSTA[indice];
}

// ============================================================
// 3. ESTRUTURA E MONTAGEM DA INTERFACE
// ============================================================
function construirTabuleiro() {
  const tabuleiro = document.getElementById("tabuleiro");
  tabuleiro.innerHTML = "";

  for (let l = 0; l < TOTAL_TENTATIVAS; l++) {
    const linha = document.createElement("div");
    linha.className = "linha-tabuleiro";
    linha.setAttribute("role", "row");
    linha.setAttribute("data-linha", l);

    for (let c = 0; c < TAMANHO_PALAVRA; c++) {
      const celula = document.createElement("div");
      celula.className = "celula";
      celula.setAttribute("role", "gridcell");
      celula.setAttribute("data-coluna", c);
      celula.setAttribute("aria-label", `Linha ${l + 1}, Letra ${c + 1}: vazia`);
      linha.appendChild(celula);
    }

    tabuleiro.appendChild(linha);
  }
}

function construirTeclado() {
  const teclado = document.getElementById("teclado");
  teclado.innerHTML = "";

  const layoutQWERTY = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Apagar", "Z", "X", "C", "V", "B", "N", "M", "Enter"]
  ];

  layoutQWERTY.forEach((linhaTeclas) => {
    const linhaEl = document.createElement("div");
    linhaEl.className = "linha-teclado";

    linhaTeclas.forEach((tecla) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tecla";
      btn.setAttribute("data-tecla", tecla);

      if (tecla === "Enter") {
        btn.classList.add("tecla-wide");
        btn.textContent = "ENTER";
        btn.setAttribute("aria-label", "Confirmar tentativa");
      } else if (tecla === "Apagar") {
        btn.classList.add("tecla-wide");
        btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><line x1="18" y1="9" x2="12" y2="15"/><line x1="12" y1="9" x2="18" y2="15"/></svg>`;
        btn.setAttribute("aria-label", "Apagar letra");
      } else {
        btn.textContent = tecla;
        btn.setAttribute("aria-label", `Letra ${tecla}`);
      }

      btn.addEventListener("click", () => processarEntradaTeclado(tecla));
      linhaEl.appendChild(btn);
    });

    teclado.appendChild(linhaEl);
  });
}

// ============================================================
// 4. RESTAURAÇÃO DE ESTADO SALVO
// ============================================================
function carregarOuIniciarJogo(numeroSemana, palavraDaSemana) {
  const salvo = localStorage.getItem(CHAVE_ESTADO);

  if (salvo) {
    try {
      const parsed = JSON.parse(salvo);
      // Se for a mesma semana, carrega o progresso salvo
      if (parsed.semanaAtual === numeroSemana) {
        estadoJogo = parsed;
        return;
      }
    } catch (e) {
      console.error("Erro ao carregar estado do localStorage", e);
    }
  }

  // Novo jogo para uma nova semana (ou sem estado salvo)
  estadoJogo = {
    semanaAtual: numeroSemana,
    palavraSecreta: palavraDaSemana,
    tentativas: [],
    resultados: [],
    linhaAtual: 0,
    status: "jogando",
    tecladoEstado: {}
  };

  salvarProgresso();
}

function restaurarInterface() {
  const linhas = document.querySelectorAll(".linha-tabuleiro");

  // Marca linha ativa
  linhas.forEach((linha, l) => {
    if (l === estadoJogo.linhaAtual && estadoJogo.status === "jogando") {
      linha.classList.add("linha-ativa");
    } else {
      linha.classList.remove("linha-ativa");
    }
  });

  // Preenche tentativas passadas
  estadoJogo.tentativas.forEach((palavra, l) => {
    const celulas = linhas[l].children;
    const resultadoLinha = estadoJogo.resultados[l];

    for (let c = 0; c < TAMANHO_PALAVRA; c++) {
      const celula = celulas[c];
      const letra = palavra[c];
      const res = resultadoLinha[c];

      celula.textContent = letra;
      celula.classList.add("preenchida", "revelada", res);
      
      let resTexto = res === "correta" ? "correta" : res === "presente" ? "posição errada" : "inexistente";
      celula.setAttribute("aria-label", `Linha ${l + 1}, Letra ${c + 1}: ${letra}, ${resTexto}`);
    }
  });

  // Atualiza cores do teclado
  atualizarCoresTeclado();

  // Caso o jogo já tenha terminado previamente
  if (estadoJogo.status !== "jogando") {
    bloquearJogo();
    exibirModalResultadoFinal(estadoJogo.status === "ganhou");
  }
}

// ============================================================
// 5. PROCESSAMENTO DE ENTRADA (TECLADO FÍSICO E VIRTUAL)
// ============================================================
function configurarEventosTecladoFisico() {
  window.addEventListener("keydown", (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;

    if (e.key === "Enter") {
      processarEntradaTeclado("Enter");
    } else if (e.key === "Backspace") {
      processarEntradaTeclado("Apagar");
    } else {
      const tecla = e.key.toUpperCase();
      if (/^[A-Z]$/.test(tecla)) {
        processarEntradaTeclado(tecla);
      }
    }
  });
}

function processarEntradaTeclado(tecla) {
  if (estadoJogo.status !== "jogando" || digitacaoBloqueada) return;

  if (tecla === "Enter") {
    confirmarTentativa();
  } else if (tecla === "Apagar") {
    apagarLetra();
  } else if (/^[A-Z]$/.test(tecla)) {
    receberLetra(tecla);
  }
}

function obterLinhaAtualElemento() {
  return document.querySelector(`.linha-tabuleiro[data-linha="${estadoJogo.linhaAtual}"]`);
}

function receberLetra(letra) {
  const linhaEl = obterLinhaAtualElemento();
  if (!linhaEl) return;

  const celulas = linhaEl.children;
  // Encontra a primeira célula vazia
  for (let c = 0; c < TAMANHO_PALAVRA; c++) {
    if (!celulas[c].textContent) {
      celulas[c].textContent = letra;
      celulas[c].classList.add("preenchida", "anim-pop");
      celulas[c].setAttribute("aria-label", `Linha ${estadoJogo.linhaAtual + 1}, Letra ${c + 1}: ${letra}`);
      
      // Remove animação de pop após execução
      setTimeout(() => celulas[c].classList.remove("anim-pop"), 150);
      break;
    }
  }
}

function apagarLetra() {
  const linhaEl = obterLinhaAtualElemento();
  if (!linhaEl) return;

  const celulas = linhaEl.children;
  // Apaga da direita para a esquerda
  for (let c = TAMANHO_PALAVRA - 1; c >= 0; c--) {
    if (celulas[c].textContent) {
      celulas[c].textContent = "";
      celulas[c].classList.remove("preenchida");
      celulas[c].setAttribute("aria-label", `Linha ${estadoJogo.linhaAtual + 1}, Letra ${c + 1}: vazia`);
      break;
    }
  }
}

// ============================================================
// 6. CONFIRMAÇÃO E VALIDAÇÃO DA TENTATIVA (DICIONÁRIO ABERTO API)
// ============================================================
const CHAVE_CACHE_API = "kapivaTermo_cache_palavras";
let cachePalavrasAPI = {};

try {
  const salvo = localStorage.getItem(CHAVE_CACHE_API);
  if (salvo) cachePalavrasAPI = JSON.parse(salvo);
} catch (e) {
  console.warn("Erro ao ler cache do LocalStorage", e);
}

function salvarCacheAPI(palavra, ehValida) {
  cachePalavrasAPI[palavra] = ehValida;
  try {
    localStorage.setItem(CHAVE_CACHE_API, JSON.stringify(cachePalavrasAPI));
  } catch (e) {}
}

/**
 * Valida se a palavra digitada pelo jogador existe no idioma português.
 * 1. Soluções oficiais (PALAVRAS_RESPOSTA).
 * 2. Cache local prévio (LocalStorage).
 * 3. Dicionário Aberto API (/word e /prefix).
 * 4. Fallback local (PALAVRAS_EXTRAS) se offline.
 */
async function validarPalavraNoDicionarioAPI(palavra) {
  const palavraUpper = palavra.toUpperCase();
  const palavraLower = palavra.toLowerCase();

  // 1. Solução garantida / Palavra da lista oficial de respostas
  if (PALAVRAS_RESPOSTA.includes(palavraUpper)) {
    return true;
  }

  // 2. Cache prévio
  if (cachePalavrasAPI[palavraUpper] !== undefined) {
    return cachePalavrasAPI[palavraUpper];
  }

  // 3. Consulta à Dicionário Aberto API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const resWord = await fetch(`https://api.dicionario-aberto.net/word/${palavraLower}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (resWord.ok) {
      const dataWord = await resWord.json();
      if (Array.isArray(dataWord) && dataWord.length > 0) {
        salvarCacheAPI(palavraUpper, true);
        return true;
      }
    }

    // Busca por prefixo para termos com normalização/acentuação
    const controllerPrefix = new AbortController();
    const timeoutIdPrefix = setTimeout(() => controllerPrefix.abort(), 3000);

    const resPrefix = await fetch(`https://api.dicionario-aberto.net/prefix/${palavraLower}`, {
      signal: controllerPrefix.signal
    });
    clearTimeout(timeoutIdPrefix);

    if (resPrefix.ok) {
      const dataPrefix = await resPrefix.json();
      if (Array.isArray(dataPrefix) && dataPrefix.length > 0) {
        const existeMatch = dataPrefix.some((item) => {
          if (!item.word) return false;
          const normalizado = (item.normalized || item.word).toLowerCase();
          return normalizado === palavraLower || normalizado.startsWith(palavraLower);
        });

        if (existeMatch) {
          salvarCacheAPI(palavraUpper, true);
          return true;
        }
      }
    }

    // Não encontrada na API
    salvarCacheAPI(palavraUpper, false);
    return false;
  } catch (erro) {
    console.warn("Dicionário Aberto API offline ou com falha, utilizando fallback local:", erro);
    return PALAVRAS_VALIDAS.includes(palavraUpper);
  }
}

function obterPalavraDigitada() {
  const linhaEl = obterLinhaAtualElemento();
  if (!linhaEl) return "";

  let palavra = "";
  for (let celula of linhaEl.children) {
    palavra += celula.textContent || "";
  }
  return palavra;
}

async function confirmarTentativa() {
  const palavra = obterPalavraDigitada();

  // 1. Verifica tamanho
  if (palavra.length < TAMANHO_PALAVRA) {
    animarLinhaInvalida("Letras insuficientes");
    return;
  }

  if (digitacaoBloqueada) return;

  const btnEnter = document.querySelector('.tecla[data-tecla="Enter"]');
  if (btnEnter) {
    btnEnter.classList.add("tecla-carregando");
  }
  digitacaoBloqueada = true;

  // 2. Verifica se a palavra existe via API
  const ehValida = await validarPalavraNoDicionarioAPI(palavra);

  if (btnEnter) {
    btnEnter.classList.remove("tecla-carregando");
  }

  if (!ehValida) {
    digitacaoBloqueada = false;
    animarLinhaInvalida("Palavra não encontrada");
    return;
  }

  // 3. Avalia o resultado (Verde / Laranja / Cinza) com tratamento de letras repetidas
  const resultado = avaliarPalavra(palavra, estadoJogo.palavraSecreta);

  // Registra no estado
  estadoJogo.tentativas.push(palavra);
  estadoJogo.resultados.push(resultado);

  // Revela visualmente célula a célula
  revelarResultadoLinha(resultado, () => {
    // Atualiza o estado das teclas
    atualizarEstadoTeclado(palavra, resultado);
    atualizarCoresTeclado();

    // Checa Vitória ou Derrota
    const acertou = palavra === estadoJogo.palavraSecreta;

    if (acertou) {
      estadoJogo.status = "ganhou";
      salvarProgresso();
      atualizarEstatísticas(true, estadoJogo.linhaAtual + 1);
      animarVitoria(() => {
        exibirModalResultadoFinal(true);
        digitacaoBloqueada = false;
      });
    } else if (estadoJogo.linhaAtual + 1 >= TOTAL_TENTATIVAS) {
      estadoJogo.status = "perdeu";
      salvarProgresso();
      atualizarEstatísticas(false, 0);
      exibirToast(`A palavra era: ${estadoJogo.palavraSecreta}`, 4000);
      setTimeout(() => {
        exibirModalResultadoFinal(false);
        digitacaoBloqueada = false;
      }, 1500);
    } else {
      // Continua o jogo
      estadoJogo.linhaAtual++;
      salvarProgresso();
      
      // Atualiza destaques da linha ativa
      document.querySelectorAll(".linha-tabuleiro").forEach((linha, l) => {
        if (l === estadoJogo.linhaAtual) linha.classList.add("linha-ativa");
        else linha.classList.remove("linha-ativa");
      });

      digitacaoBloqueada = false;
    }
  });
}

function animarLinhaInvalida(mensagem) {
  const linhaEl = obterLinhaAtualElemento();
  if (linhaEl) {
    linhaEl.classList.add("anim-shake");
    setTimeout(() => linhaEl.classList.remove("anim-shake"), 500);
  }
  exibirToast(mensagem);
}

// ============================================================
// 7. REGRA DE VALIDAÇÃO DE LETRAS REPETIDAS (2 PASSES)
// ============================================================
function avaliarPalavra(tentativa, secreta) {
  const resultado = new Array(TAMANHO_PALAVRA).fill("ausente");
  const contagemSecreta = {};

  // Contabiliza ocorrências de cada letra na palavra secreta
  for (let char of secreta) {
    contagemSecreta[char] = (contagemSecreta[char] || 0) + 1;
  }

  // 1º PASSE: Valida letras em posições corretas (VERDE)
  for (let i = 0; i < TAMANHO_PALAVRA; i++) {
    if (tentativa[i] === secreta[i]) {
      resultado[i] = "correta";
      contagemSecreta[tentativa[i]]--;
    }
  }

  // 2º PASSE: Valida letras em posições erradas (LARANJA)
  for (let i = 0; i < TAMANHO_PALAVRA; i++) {
    if (resultado[i] !== "correta") {
      const char = tentativa[i];
      if (contagemSecreta[char] && contagemSecreta[char] > 0) {
        resultado[i] = "presente";
        contagemSecreta[char]--;
      }
    }
  }

  return resultado;
}

// ============================================================
// 8. ANIMAÇÕES E ATUALIZAÇÕES VISUAIS DE REVELAÇÃO
// ============================================================
function revelarResultadoLinha(resultado, aoConcluir) {
  const linhaEl = obterLinhaAtualElemento();
  const celulas = linhaEl.children;

  resultado.forEach((res, c) => {
    setTimeout(() => {
      const celula = celulas[c];
      celula.classList.add("revelada", res);

      const letra = celula.textContent;
      let resTexto = res === "correta" ? "correta" : res === "presente" ? "posição errada" : "inexistente";
      celula.setAttribute("aria-label", `Linha ${estadoJogo.linhaAtual + 1}, Letra ${c + 1}: ${letra}, ${resTexto}`);

      if (c === TAMANHO_PALAVRA - 1 && aoConcluir) {
        setTimeout(aoConcluir, 300);
      }
    }, c * 250); // Revelação sequencial (250ms por letra)
  });
}

function animarVitoria(aoConcluir) {
  const linhaEl = obterLinhaAtualElemento();
  const celulas = linhaEl.children;

  exibirToast("Excelente!", 2500);

  for (let c = 0; c < TAMANHO_PALAVRA; c++) {
    setTimeout(() => {
      celulas[c].classList.add("anim-bounce");
    }, c * 100);
  }

  setTimeout(aoConcluir, 1200);
}

// ============================================================
// 9. ATUALIZAÇÃO DO TECLADO E PRECEDÊNCIA DE CORES
// ============================================================
function atualizarEstadoTeclado(palavra, resultado) {
  const prioridade = { correta: 3, presente: 2, ausente: 1 };

  for (let i = 0; i < TAMANHO_PALAVRA; i++) {
    const letra = palavra[i];
    const res = resultado[i];
    const estadoAtual = estadoJogo.tecladoEstado[letra];

    if (!estadoAtual || prioridade[res] > prioridade[estadoAtual]) {
      estadoJogo.tecladoEstado[letra] = res;
    }
  }
}

function atualizarCoresTeclado() {
  Object.keys(estadoJogo.tecladoEstado).forEach((letra) => {
    const cor = estadoJogo.tecladoEstado[letra];
    const btn = document.querySelector(`.tecla[data-tecla="${letra}"]`);
    if (btn) {
      btn.classList.remove("correta", "presente", "ausente");
      btn.classList.add(cor);
    }
  });
}

function bloquearJogo() {
  document.querySelectorAll(".linha-tabuleiro").forEach((linha) => {
    linha.classList.remove("linha-ativa");
  });
}

// ============================================================
// 10. MENSAGENS TOAST
// ============================================================
function exibirToast(mensagem, duracao = 2000) {
  const container = document.getElementById("area-mensagem");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = mensagem;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-saindo");
    toast.addEventListener("animationend", () => toast.remove());
  }, duracao);
}

// ============================================================
// 11. LOCALSTORAGE E ESTATÍSTICAS
// ============================================================
function salvarProgresso() {
  localStorage.setItem(CHAVE_ESTADO, JSON.stringify(estadoJogo));
}

function obterEstatísticas() {
  const padrao = {
    jogos: 0,
    vitorias: 0,
    sequenciaAtual: 0,
    maiorSequencia: 0,
    distribuicao: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  };

  const salvo = localStorage.getItem(CHAVE_STATS);
  if (!salvo) return padrao;

  try {
    return { ...padrao, ...JSON.parse(salvo) };
  } catch (e) {
    return padrao;
  }
}

function atualizarEstatísticas(ganhou, tentativasUsadas) {
  const stats = obterEstatísticas();

  stats.jogos++;

  if (ganhou) {
    stats.vitorias++;
    stats.sequenciaAtual++;
    if (stats.sequenciaAtual > stats.maiorSequencia) {
      stats.maiorSequencia = stats.sequenciaAtual;
    }
    if (tentativasUsadas >= 1 && tentativasUsadas <= TOTAL_TENTATIVAS) {
      stats.distribuicao[tentativasUsadas]++;
    }
  } else {
    stats.sequenciaAtual = 0;
  }

  localStorage.setItem(CHAVE_STATS, JSON.stringify(stats));
}

function renderizarEstatísticas() {
  const container = document.getElementById("conteudo-stats");
  if (!container) return;

  const stats = obterEstatísticas();
  const percVitorias = stats.jogos > 0 ? Math.round((stats.vitorias / stats.jogos) * 100) : 0;
  const maxDistribuicao = Math.max(...Object.values(stats.distribuicao), 1);

  let htmlDist = "";
  for (let i = 1; i <= TOTAL_TENTATIVAS; i++) {
    const qtd = stats.distribuicao[i] || 0;
    const largura = Math.max((qtd / maxDistribuicao) * 100, 8);
    const classeAtual = estadoJogo.status === "ganhou" && estadoJogo.linhaAtual + 1 === i ? "dist-barra-atual" : "";

    htmlDist += `
      <div class="dist-linha">
        <span class="dist-numero">${i}</span>
        <div class="dist-barra-wrapper">
          <div class="dist-barra ${classeAtual}" style="width: ${largura}%;">${qtd}</div>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="stats-resumo">
      <div class="stat-item">
        <span class="stat-valor">${stats.jogos}</span>
        <span class="stat-label">Jogos</span>
      </div>
      <div class="stat-item">
        <span class="stat-valor">${percVitorias}%</span>
        <span class="stat-label">Vitórias</span>
      </div>
      <div class="stat-item">
        <span class="stat-valor">${stats.sequenciaAtual}</span>
        <span class="stat-label">Seq. Atual</span>
      </div>
      <div class="stat-item">
        <span class="stat-valor">${stats.maiorSequencia}</span>
        <span class="stat-label">Maior Seq.</span>
      </div>
    </div>

    <h3 class="dist-titulo">Distribuição de Tentativas</h3>
    <div class="distribuicao">
      ${htmlDist}
    </div>
  `;
}

// ============================================================
// 12. MODAIS (GERENCIAMENTO, EXIBIÇÃO E ACESSIBILIDADE)
// ============================================================
function inicializarModais() {
  const overlay = document.getElementById("modal-overlay");

  // Botões de abertura
  document.getElementById("btn-ajuda")?.addEventListener("click", () => abrirModal("modal-ajuda"));
  document.getElementById("btn-stats")?.addEventListener("click", () => {
    renderizarEstatísticas();
    abrirModal("modal-stats");
  });

  // Botões de fechar
  document.querySelectorAll(".btn-fechar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-modal");
      fecharModal(targetId);
    });
  });

  // Fechar ao clicar no overlay
  overlay?.addEventListener("click", () => {
    document.querySelectorAll(".modal:not([hidden])").forEach((m) => fecharModal(m.id));
  });

  // Fechar ao pressionar Escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal:not([hidden])").forEach((m) => fecharModal(m.id));
    }
  });

  // Botões dentro do modal de resultado
  document.getElementById("btn-ver-stats")?.addEventListener("click", () => {
    fecharModal("modal-resultado");
    renderizarEstatísticas();
    abrirModal("modal-stats");
  });

  document.getElementById("btn-compartilhar")?.addEventListener("click", compartilharResultado);
}

function abrirModal(idModal) {
  const modal = document.getElementById(idModal);
  const overlay = document.getElementById("modal-overlay");

  if (modal && overlay) {
    overlay.removeAttribute("hidden");
    overlay.setAttribute("aria-hidden", "false");
    modal.removeAttribute("hidden");
    modal.focus();
  }
}

function fecharModal(idModal) {
  const modal = document.getElementById(idModal);
  const overlay = document.getElementById("modal-overlay");

  if (modal) {
    modal.setAttribute("hidden", "true");
  }

  // Se nenhum modal estiver visível, oculta o overlay
  const modaisAbertos = document.querySelectorAll(".modal:not([hidden])");
  if (modaisAbertos.length === 0 && overlay) {
    overlay.setAttribute("hidden", "true");
    overlay.setAttribute("aria-hidden", "true");
  }
}

function exibirModalResultadoFinal(ganhou) {
  const titulo = document.getElementById("titulo-resultado");
  const mensagem = document.getElementById("resultado-mensagem");
  const palavra = document.getElementById("resultado-palavra");
  const containerEmojis = document.getElementById("resultado-emojis");

  if (ganhou) {
    titulo.textContent = "Parabéns! 🎉";
    mensagem.textContent = `Você acertou a palavra semanal em ${estadoJogo.tentativas.length}/${TOTAL_TENTATIVAS} tentativas!`;
    palavra.textContent = "";
  } else {
    titulo.textContent = "Fim de Jogo 😔";
    mensagem.textContent = "Não foi desta vez!";
    palavra.innerHTML = `A palavra secreta era: <strong>${estadoJogo.palavraSecreta}</strong>`;
  }

  // Gera matriz de emojis
  containerEmojis.innerHTML = "";
  estadoJogo.resultados.forEach((linhaRes) => {
    const divLinha = document.createElement("div");
    divLinha.className = "emoji-linha";
    divLinha.textContent = linhaRes.map((r) => (r === "correta" ? "🟩" : r === "presente" ? "🟧" : "⬛")).join("");
    containerEmojis.appendChild(divLinha);
  });

  abrirModal("modal-resultado");
}

// ============================================================
// 13. COMPARTILHAMENTO
// ============================================================
function gerarTextoCompartilhamento() {
  const tentativasUsadas = estadoJogo.status === "ganhou" ? estadoJogo.tentativas.length : "X";
  let texto = `KapivaTermo — Semana ${estadoJogo.semanaAtual}\n${tentativasUsadas}/${TOTAL_TENTATIVAS}\n\n`;

  estadoJogo.resultados.forEach((linhaRes) => {
    texto += linhaRes.map((r) => (r === "correta" ? "🟩" : r === "presente" ? "🟧" : "⬜")).join("") + "\n";
  });

  return texto;
}

function compartilharResultado() {
  const texto = gerarTextoCompartilhamento();

  if (navigator.share) {
    navigator.share({ title: "KapivaTermo", text: texto }).catch(() => {
      copiarParaTransferencia(texto);
    });
  } else {
    copiarParaTransferencia(texto);
  }
}

function copiarParaTransferencia(texto) {
  navigator.clipboard.writeText(texto).then(
    () => exibirToast("Resultado copiado!"),
    () => exibirToast("Erro ao copiar resultado.")
  );
}

// ============================================================
// 14. GERENCIAMENTO DE TEMA (CLARO / ESCURO)
// ============================================================
function inicializarTema() {
  const btnTema = document.getElementById("btn-tema");
  const temaSalvo = localStorage.getItem(CHAVE_TEMA);
  
  // Preferência do sistema ou salva no localStorage
  const prefereEscuro = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const temaInicial = temaSalvo || (prefereEscuro ? "escuro" : "claro");

  aplicarTema(temaInicial);

  btnTema?.addEventListener("click", () => {
    const temaAtual = document.documentElement.getAttribute("data-tema");
    const novoTema = temaAtual === "escuro" ? "claro" : "escuro";
    aplicarTema(novoTema);
  });
}

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-tema", tema);
  localStorage.setItem(CHAVE_TEMA, tema);

  const btnTema = document.getElementById("btn-tema");
  const iconeTema = document.getElementById("icone-tema");

  if (btnTema && iconeTema) {
    if (tema === "escuro") {
      btnTema.setAttribute("aria-label", "Ativar modo claro");
      // Ícone do Sol
      iconeTema.innerHTML = `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`;
    } else {
      btnTema.setAttribute("aria-label", "Ativar modo escuro");
      // Ícone da Lua
      iconeTema.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
    }
  }
}
