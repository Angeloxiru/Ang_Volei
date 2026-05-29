// ===== CONFIGURAÇÃO =====
const SPREADSHEET_ID = '1ikma_OmmPKwaHN2b1JlSeIHEmzMgLwzZq39WwyyRiGk';
const DECAY_FACTOR = 0.8;

const TEAM_ALGORITHM_WEIGHTS = {
  sexo: 2.0,
  scoreGeral: 2.0,
};

// ===== INITIALIZE =====
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const token = data.token;

    let response;

    switch (action) {
      case 'login':
        response = login(data.login, data.senha);
        break;
      case 'registrarJogador':
        verificarAdministrador(token);
        response = registrarJogador(data);
        break;
      case 'listarJogadores':
        verificarAdministrador(token);
        response = listarJogadores();
        break;
      case 'avaliar':
        verificarAdministrador(token);
        response = avaliar(data.id_jogador, data.habilidades);
        break;
      case 'gerarTimes':
        verificarAdministrador(token);
        response = gerarTimes(data.jogadores_ids);
        break;
      case 'salvarMontagem':
        verificarAdministrador(token);
        response = salvarMontagem(data.id_montagem, data.data, data.times);
        break;
      case 'listarHistorico':
        verificarAdministrador(token);
        response = listarHistorico();
        break;
      default:
        throw new Error('Ação desconhecida: ' + action);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: response,
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message,
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return doPost({ postData: { contents: JSON.stringify({ action: e.parameter.action }) } });
}

// ===== UTILIDADES =====
function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(name);
}

function initializeSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const sheetNames = ['Jogadores', 'Avaliacoes', 'Scores', 'Times_Historico', 'Sessoes', 'Administradores'];

  sheetNames.forEach(name => {
    if (!ss.getSheetByName(name)) {
      ss.insertSheet(name);
    }
  });

  // Initialize Jogadores sheet
  const jogadores = ss.getSheetByName('Jogadores');
  if (jogadores.getLastRow() < 2) {
    jogadores.appendRow(['id', 'nome', 'sexo']);
  }

  // Initialize Scores sheet
  const scores = ss.getSheetByName('Scores');
  if (scores.getLastRow() < 2) {
    scores.appendRow(['id_jogador', 'saque', 'ataque', 'recepcao', 'bloqueio', 'levantamento', 'score_geral', 'atualizado_em']);
  }

  // Initialize Avaliacoes sheet
  const avaliacoes = ss.getSheetByName('Avaliacoes');
  if (avaliacoes.getLastRow() < 2) {
    avaliacoes.appendRow(['id_avaliacao', 'id_jogador', 'saque', 'ataque', 'recepcao', 'bloqueio', 'levantamento', 'data']);
  }

  const timesHistorico = ss.getSheetByName('Times_Historico');
  if (timesHistorico.getLastRow() < 2) {
    timesHistorico.appendRow(['id_montagem', 'data', 'time', 'id_jogador', 'score_geral_time']);
  }

  const sessoes = ss.getSheetByName('Sessoes');
  if (sessoes.getLastRow() < 2) {
    sessoes.appendRow(['token', 'id_admin', 'criada_em', 'expira_em']);
  }

  // Initialize Administradores sheet
  const administradores = ss.getSheetByName('Administradores');
  if (administradores.getLastRow() < 2) {
    administradores.appendRow(['id', 'nome', 'login', 'senha']);
  }
}

function generateId() {
  return Utilities.getUuid();
}

// ===== AUTENTICAÇÃO =====
function login(login, senha) {
  const administradores = getSheet('Administradores');
  const rows = administradores.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][2].toLowerCase() === login.toLowerCase() && rows[i][3] === parseInt(senha)) {
      const usuario = {
        id: rows[i][0],
        nome: rows[i][1],
      };

      const token = generateId();
      const sessoes = getSheet('Sessoes');
      const expiracao = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      sessoes.appendRow([token, usuario.id, new Date(), expiracao]);

      return {
        token,
        usuario,
      };
    }
  }

  throw new Error('Login ou senha incorretos');
}

function verificarAdministrador(token) {
  const sessoes = getSheet('Sessoes');
  const rows = sessoes.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === token && new Date(rows[i][3]) > new Date()) {
      return rows[i][1];
    }
  }

  throw new Error('Token inválido ou expirado');
}

// ===== JOGADORES =====
function registrarJogador(data) {
  const jogadores = getSheet('Jogadores');
  const id = generateId();

  jogadores.appendRow([
    id,
    data.nome,
    data.sexo,
  ]);

  const scores = getSheet('Scores');
  scores.appendRow([id, 0, 0, 0, 0, 0, 0, new Date()]);

  return { id, nome: data.nome };
}

function listarJogadores() {
  const jogadores = getSheet('Jogadores');
  const scores = getSheet('Scores');

  const jogadoresRows = jogadores.getDataRange().getValues();
  const scoresRows = scores.getDataRange().getValues();

  const result = [];

  for (let i = 1; i < jogadoresRows.length; i++) {
    const jogadorId = jogadoresRows[i][0];
    let scoreData = {};

    for (let j = 1; j < scoresRows.length; j++) {
      if (scoresRows[j][0] === jogadorId) {
        scoreData = {
          saque: scoresRows[j][1],
          ataque: scoresRows[j][2],
          recepcao: scoresRows[j][3],
          bloqueio: scoresRows[j][4],
          levantamento: scoresRows[j][5],
          score_geral: scoresRows[j][6],
        };
        break;
      }
    }

    result.push({
      id: jogadorId,
      nome: jogadoresRows[i][1],
      sexo: jogadoresRows[i][2],
      ...scoreData,
    });
  }

  return result;
}

// ===== AVALIAÇÕES =====
function avaliar(id_jogador, habilidades) {
  const avaliacoes = getSheet('Avaliacoes');
  const id = generateId();

  avaliacoes.appendRow([
    id,
    id_jogador,
    habilidades.saque || 0,
    habilidades.ataque || 0,
    habilidades.recepcao || 0,
    habilidades.bloqueio || 0,
    habilidades.levantamento || 0,
    new Date(),
  ]);

  recalcularScore(id_jogador);

  return { id_avaliacao: id };
}

function recalcularScore(id_jogador) {
  const avaliacoes = getSheet('Avaliacoes');
  const rows = avaliacoes.getDataRange().getValues();

  const habilidades = ['saque', 'ataque', 'recepcao', 'bloqueio', 'levantamento'];
  const scores = {
    saque: [],
    ataque: [],
    recepcao: [],
    bloqueio: [],
    levantamento: [],
  };

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === id_jogador) {
      scores.saque.push({ valor: rows[i][2], data: new Date(rows[i][7]) });
      scores.ataque.push({ valor: rows[i][3], data: new Date(rows[i][7]) });
      scores.recepcao.push({ valor: rows[i][4], data: new Date(rows[i][7]) });
      scores.bloqueio.push({ valor: rows[i][5], data: new Date(rows[i][7]) });
      scores.levantamento.push({ valor: rows[i][6], data: new Date(rows[i][7]) });
    }
  }

  const scoreMedios = {};
  let somaScores = 0;
  let countScores = 0;

  for (const habilidade of habilidades) {
    scoreMedios[habilidade] = calcularScorePonderado(scores[habilidade]);
    somaScores += scoreMedios[habilidade];
    countScores++;
  }

  const scoreGeral = countScores > 0 ? somaScores / countScores : 0;

  const scoresSheet = getSheet('Scores');
  const scoresRows = scoresSheet.getDataRange().getValues();

  for (let i = 1; i < scoresRows.length; i++) {
    if (scoresRows[i][0] === id_jogador) {
      scoresSheet.getRange(i + 1, 1, 1, 8).setValues([[
        id_jogador,
        scoreMedios.saque,
        scoreMedios.ataque,
        scoreMedios.recepcao,
        scoreMedios.bloqueio,
        scoreMedios.levantamento,
        scoreGeral,
        new Date(),
      ]]);
      return;
    }
  }
}

function calcularScorePonderado(avaliacoes) {
  if (avaliacoes.length === 0) return 0;

  avaliacoes.sort((a, b) => b.data - a.data);

  let soma = 0;
  let somaPesos = 0;

  for (let i = 0; i < avaliacoes.length; i++) {
    const peso = Math.pow(DECAY_FACTOR, i);
    soma += avaliacoes[i].valor * peso;
    somaPesos += peso;
  }

  return somaPesos > 0 ? soma / somaPesos : 0;
}

// ===== GERAÇÃO DE TIMES =====
function gerarTimes(jogadores_ids) {
  const jogadores = listarJogadores();
  const jogadoresMap = {};
  jogadores.forEach(j => { jogadoresMap[j.id] = j; });

  const jogadoresPresentes = jogadores_ids.map(id => jogadoresMap[id]).filter(j => j);

  if (jogadoresPresentes.length !== 18) {
    throw new Error('Devem ser exatamente 18 jogadores');
  }

  // Fase 1: Distribuir por sexo (semente)
  const homens = jogadoresPresentes.filter(j => j.sexo === 'M').sort((a, b) => (b.score_geral || 0) - (a.score_geral || 0));
  const mulheres = jogadoresPresentes.filter(j => j.sexo === 'F').sort((a, b) => (b.score_geral || 0) - (a.score_geral || 0));

  const times = [[], [], []];

  // Distribuir homens
  for (let i = 0; i < homens.length; i++) {
    times[i % 3].push(homens[i].id);
  }

  // Distribuir mulheres
  for (let i = 0; i < mulheres.length; i++) {
    times[i % 3].push(mulheres[i].id);
  }

  // Fase 2: Otimização local
  otimizarTimes(times, jogadoresMap);

  const montagemId = generateId();
  const timesComStats = times.map(timeIds => {
    const timeJogadores = timeIds.map(id => jogadoresMap[id]);
    return {
      jogadores: timeIds,
      stats: calcularStatsTime(timeJogadores),
    };
  });

  return {
    id_montagem: montagemId,
    times: timesComStats,
  };
}

function otimizarTimes(times, jogadoresMap) {
  let improved = true;
  let iterations = 0;
  const maxIterations = 100;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let t1 = 0; t1 < 3 && !improved; t1++) {
      for (let t2 = t1 + 1; t2 < 3; t2++) {
        for (let p1 = 0; p1 < times[t1].length; p1++) {
          for (let p2 = 0; p2 < times[t2].length; p2++) {
            const custoBefore = calcularCustoTimes(times, jogadoresMap);

            [times[t1][p1], times[t2][p2]] = [times[t2][p2], times[t1][p1]];

            const custoAfter = calcularCustoTimes(times, jogadoresMap);

            if (custoAfter < custoBefore) {
              improved = true;
              break;
            } else {
              [times[t1][p1], times[t2][p2]] = [times[t2][p2], times[t1][p1]];
            }
          }
          if (improved) break;
        }
      }
    }
  }
}

function calcularCustoTimes(times, jogadoresMap) {
  const stats = times.map(timeIds => {
    const timeJogadores = timeIds.map(id => jogadoresMap[id]);
    return calcularStatsTime(timeJogadores);
  });

  const scoreGerais = stats.map(s => s.score_geral);
  const desvioScore = Math.max(...scoreGerais) - Math.min(...scoreGerais);

  return TEAM_ALGORITHM_WEIGHTS.scoreGeral * desvioScore;
}

function calcularStatsTime(jogadores) {
  if (jogadores.length === 0) {
    return { score_geral: 0 };
  }

  const scoreGeralSum = jogadores.reduce((sum, j) => sum + (j.score_geral || 0), 0);
  return { score_geral: scoreGeralSum / jogadores.length };
}

// ===== HISTÓRICO =====
function salvarMontagem(id_montagem, data, times) {
  const timesHistorico = getSheet('Times_Historico');

  times.forEach((time, idx) => {
    const timeNum = idx + 1;
    time.jogadores.forEach(jogadorId => {
      timesHistorico.appendRow([
        id_montagem,
        data,
        timeNum,
        jogadorId,
        time.stats.score_geral,
      ]);
    });
  });

  return { id_montagem };
}

function listarHistorico() {
  const timesHistorico = getSheet('Times_Historico');
  const rows = timesHistorico.getDataRange().getValues();

  const montagens = {};

  for (let i = 1; i < rows.length; i++) {
    const montagemId = rows[i][0];
    const data = rows[i][1];
    const timeNum = rows[i][2];
    const jogadorId = rows[i][3];
    const scoreGeral = rows[i][4];

    if (!montagens[montagemId]) {
      montagens[montagemId] = {
        id_montagem: montagemId,
        data,
        times: [{}, {}, {}],
      };
    }

    if (!montagens[montagemId].times[timeNum - 1].jogadores) {
      montagens[montagemId].times[timeNum - 1] = {
        jogadores: [],
        stats: { score_geral: scoreGeral },
      };
    }

    montagens[montagemId].times[timeNum - 1].jogadores.push(jogadorId);
  }

  return Object.values(montagens);
}
