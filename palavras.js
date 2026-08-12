// ============================================================
// KapivaTermo — Banco de Palavras
// ============================================================
//
// REGRAS para adicionar palavras:
//  - Exatamente 5 letras
//  - Sem acentos (ex: SAUDE, não SAÚDE)
//  - Sem cedilha (ex: PRACA, não PRAÇA)
//  - Somente letras de A a Z
//  - Todas em MAIÚSCULAS
//
// PALAVRAS_RESPOSTA:
//  → Palavras sorteadas para a solução semanal (curadas)
//
// PALAVRAS_EXTRAS:
//  → Palavras de fallback válidas para tentativas caso a API do
//    Dicionário Aberto esteja offline ou indisponível
// ============================================================

/** Lista de palavras que podem ser a resposta semanal (curadas) */
const PALAVRAS_RESPOSTA = [
  // A
  "ABRIR", "ACASO", "AGORA", "AJUDA", "AMIGO", "AINDA",
  // B
  "BANCO", "BARCO", "BARRO", "BEIJO", "BLOCO", "BOLSA",
  "BOMBA", "BRAVO", "BRISA", "BURRO",
  // C
  "CAMPO", "CANTO", "CARTA", "CERTO", "CHAVE", "CHUVA",
  "CLARA", "CLARO", "CLUBE", "COBRA", "COISA", "CONTA",
  "CORTE", "COURO", "CRISE", "CULPA", "CURVA",
  // D
  "DOBRO", "DRAMA",
  // F
  "FALAR", "FALTA", "FERRO", "FESTA", "FILHO", "FILME",
  "FOLHA", "FORMA", "FORTE", "FRUTA",
  // G
  "GERAL", "GORDO", "GRADE", "GRUPO",
  // H
  "HUMOR",
  // I
  "IDEIA",
  // J
  "JOGAR",
  // L
  "LEITE", "LETRA", "LINHA", "LIVRO", "LUGAR", "LUTAR",
  // M
  "MANGA", "MANHA", "MARCA", "MASSA", "METAL", "MILHO",
  "MUNDO", "MUSEU",
  // N
  "NADAR", "NARIZ", "NAVIO", "NOITE", "NOSSO", "NUVEM",
  // P
  "PADRE", "PEDRA", "PEIXE", "PERTO", "PLANO", "PONTE",
  "PONTO", "PORTA", "POUCO", "PRACA", "PRAZO", "PRECO",
  "PRETO", "PROVA", "PULSO",
  // Q
  "QUEDA", "QUERO",
  // R
  "RADIO", "REGRA", "REINO", "RISCO", "ROCHA", "ROSTO",
  // S
  "SABOR", "SALDO", "SAUDE", "SENHA", "SIGNO", "SONHO", "SORTE",
  // T
  "TARDE", "TEMPO", "TERRA", "TERMO", "TIGRE", "TODOS", "TROCA", "TURMA",
  // V
  "VALOR", "VAPOR", "VERDE", "VENTO", "VERSO", "VIOLA", "VISTA", "VOLTA",
  // Z
  "ZEBRA", "ZINCO"
];

// ============================================================
// Palavras extras — válidas para tentativas mas não como resposta
// Adicione novas palavras AQUI ↓
// ============================================================
const PALAVRAS_EXTRAS = [
  "ABETO", "ABUSO", "ACABA", "ACENA", "ADEGA", "AFETO", "AGUDA",
  "AGUDO", "ALUNO", "AMADA", "AMADO", "AMPLA", "AMPLO", "ANTES",
  "ARARA", "ARENA", "ARMAS", "AROMA", "ARTES", "ASTRO", "AUDIO",
  "AVISO", "BALDE", "BELAS", "BESTA", "BICHO", "BISPO", "BOCAL",
  "BOLAS", "BOLHA", "BONDE", "BREVE", "BRIGA", "BROCA", "BRUMA",
  "BUSTO", "CACHO", "CALMA", "CALMO", "CALOR", "CALVO", "CAPAZ",
  "CAPIM", "CARGO", "CARNE", "CARRO", "CASCO", "CASCA", "CAUSA",
  "CHAMA", "CINCO", "CLIMA", "CORAL", "CORES", "CREME", "CUNHA",
  "CURSO", "CURTO", "DANCA", "DISCO", "DUETO", "DUNAS", "ENTRE",
  "ERRAR", "ERROS", "FAIXA", "FALHA", "FARDA", "FAROL", "FARRA",
  "FATIA", "FECHA", "FEITA", "FEITO", "FENDA", "FIBRA", "FILHA",
  "FINAL", "FIRMA", "FLOCO", "FLORA", "FLUXO", "FOGOS", "FORCA",
  "FORJA", "FOSSO", "FRACO", "FRADE", "FRASE", "FUMAR", "FUNIL",
  "FUZIL", "GARRA", "GATOS", "GELAR", "GESSO", "GIRAR", "GRAMA",
  "GRATO", "GREVE", "GRITO", "GUETO", "GUIAR", "HAVIA", "HIENA",
  "HINOS", "HOMEM", "HOTEL", "IGUAL", "IMPAR", "IMUNE", "INCHA",
  "IRADA", "IRADO", "JAULA", "JARRA", "JATOS", "JOGOS", "JOIAS",
  "JUNTO", "JUROS", "LACOS", "LARGO", "LIGAR", "LIMPA", "LIMPO",
  "LOCAL", "LOIRO", "LONGE", "LUNAR", "LUVAS", "LUXOS", "MACHO",
  "MAIOR", "MALES", "MAMAO", "MANDA", "MANSA", "MANSO", "MANTA",
  "MARCO", "MEDIA", "MENOR", "MENOS", "MESMO", "MIRRA", "MOGNO",
  "MORAR", "MORTO", "MOSCA", "MOTOR", "MURRO", "NACAO", "NEGRO",
  "NERVO", "NOBRE", "NOVOS", "OBRAS", "OESTE", "OLHAR", "ONDAS",
  "ONTEM", "OSTRA", "OUTRO", "OUVIR", "PAGAR", "PARAR", "PARDO",
  "PARTE", "PASTA", "PATIO", "PEDAL", "PEDIR", "PERDA", "PESCA",
  "PILHA", "PISTA", "PLENO", "POMBO", "PORCO", "PORTO", "POSSE",
  "PRESA", "PRESO", "PRIMO", "PULAR", "RACAO", "RASGA", "RAZAO",
  "REAIS", "RECUO", "REMAR", "RELVA", "RESTA", "RISOS", "ROLHA",
  "RONDA", "RONCO", "RUIDO", "RUIVO", "SALTO", "SALVA", "SAPOS",
  "SARAR", "SARDA", "SARNA", "SENSO", "SERVO", "SILVA", "SIRVO",
  "SOBRA", "SOFRE", "SOGRA", "SOLAR", "SOLDA", "SONAR", "SOPRO",
  "SURDO", "SURTO", "SUSTO", "TACTO", "TALCO", "TALHA", "TAMPO",
  "TANTO", "TARSO", "TENDA", "TENHO", "TENSO", "TINTA", "TINTO",
  "TOCAR", "TOLDO", "TOMBO", "TORCE", "TORDO", "TOUCA", "TRAPO",
  "TREPA", "TRIBO", "TROCO", "TRONO", "TUTOR", "UNIDO", "UNIAO",
  "UNICO", "URNAS", "USADO", "VAGAR", "VEADO", "VELHA", "VELHO",
  "VENDA", "VIGIA", "VIGOR", "VIRAR", "VISAO", "VOTAR", "VULTO",
  "CALCA", "CANAL", "CURAR", "DENTE", "EMITE", "FOCAR", "FUSAO",
  "GENRO", "GRAMO", "GRUMO", "HULHA", "ICARO", "IMPOR", "INETO",
  "JUTAI", "KNACK", "MEDAL", "MELAR", "METAL", "MIOLO", "MOEDA",
  "MOELA", "MOITA", "MOLDE", "MOLHO", "MOSSO", "MUNIR", "NAIPE",
  "OLAVO", "ORDEM", "OURCO", "OVULO", "PAIOL", "PALCO", "PALHA",
  "PALMO", "PAPEL", "PAUSA", "PIXEL", "PLAZA", "POLPA", "POLVO",
  "PODER", "PRATO", "PREGO", "PRIMA", "PROSA", "PUBIS", "PUDOR",
  "PURGA", "QUASE", "QUOTA", "RAMPA", "RAPAZ", "RASPA", "RASTRO",
  "RECTA", "REPOR", "REPUX", "REVER", "RODAR", "RODEO", "ROMEO",
  "RONCA", "ROSCA", "RUFAR", "RUMAR", "SACAR", "SAGAZ", "SAGUE",
  "SALSA", "SAMBA", "SANAI", "SANGU", "SARAU", "SARDA", "SAXAO",
  "SEARA", "SEGUE", "SELAR", "SELVA", "SENDA", "SENAI", "SENIL",
  "SINAL", "SOLAR", "SOMAM", "SONAR", "SORVO", "SUAVE", "SUBIR",
  "SUGAR", "SUMIR", "SUPOR", "SURJA", "TAPAR", "TAQUE", "TARJA",
  "TECER", "TELOS", "TENOR", "TENUE", "TIMAO", "TIRAR", "TISER",
  "TOPAR", "TOQUE", "TORTO", "TRAIR", "TRAPO", "TRECO", "TREPA",
  "TUGIR", "TUMOR", "TURVO", "UBICO", "ULNAR", "ULTRA", "UMBRA",
  "UNGIR", "UNTAR", "URDIR", "URINA", "VAGAS", "VALER", "VANGA",
  "VAPOR", "VARCA", "VAZAR", "VELAR", "VERBO", "VERGA", "VIELA",
  "VIGOR", "VILAR", "VIOLA", "VIPER", "VIRAR", "VISOR", "VIVER",
  "VOCAL", "VOGAR", "VOLGA", "VOMIT", "VUELO", "XADRE", "XEREM",
  "XIITA", "ZARCO"
];

// ============================================================
// Lista unificada de palavras válidas para tentativas
// (resposta + extras, sem duplicatas)
// ============================================================
const PALAVRAS_VALIDAS = [...new Set([...PALAVRAS_RESPOSTA, ...PALAVRAS_EXTRAS])];
