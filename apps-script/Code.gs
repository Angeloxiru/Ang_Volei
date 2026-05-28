// ===== CONFIGURAÇÃO =====
const SPREADSHEET_ID = '1ikma_OmmPKwaHN2b1JlSeIHEmzMgLwzZq39WwyyRiGk';
const DECAY_FACTOR = 0.8;

const TEAM_ALGORITHM_WEIGHTS = {
  sexo: 2.0,
  scoreGeral: 2.0,
  defesa: 1.0,
};

// ===== INITIALIZE =====
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const token = data.token;

    let response;

    switch (action) {
      case 'registrar':
        response = registrar(data);
        break;
      case 'login':
        response = login(data.login, data.senha);
        break;
      case 'listarJogadores':
        verificarAutenticacao(token);
        response = listarJogadores();
        break;
      case 'criarJogo':
        verificarAdministrador(token);
        response = criarJogo(data.data, data.jogadores_presentes);
        break;
      case 'listarJogos':
        verificarAutenticacao(token);
        response = listarJogos();
        break;
      case 'avaliar':
        verificarAdministrador(token);
        response = avaliar(data.id_jogo, data.id_avaliado, data.habilidades);
        break;
      case 'fecharJogo':
        verificarAdministrador(token);
        response = fecharJogo(data.id_jogo);
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
        verificarAutenticacao(token);
        response = listarHistorico();
        break;
      case 'atualizarPerfil':
        verificarAutenticacao(token);
        response = atualizarPerfil(data.id_jogador, data);
        break;
      case 'atualizarStatusJogo':
        verificarAdministrador(token);
        response = atualizarStatusJogo(data.id_jogo, data.status);
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

function getAllSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheets();
}

function initializeSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const sheetNames = ['Jogadores', 'Jogos', 'Avaliacoes', 'Scores', 'Times_Historico', 'Sessoes'];

  sheetNames.forEach(name => {
    if (!ss.getSheetByName(name)) {
      ss.insertSheet(name);
    }
  });

  // Initialize Jogadores sheet
  const jogadores = ss.getSheetByName('Jogadores');
  if (jogadores.getLastRow() < 2) {
    jogadores.appendRow(['id', 'nome', 'login', 'senha', 'papel', 'sexo', 'altura_cm', 'idade', 'peso_kg', 'ativo', 'data_cadastro']);
  }

  // Initialize Scores sheet
  const scores = ss.getSheetByName('Scores');
  if (scores.getLastRow() < 2) {
    scores.appendRow(['id_jogador', 'saque', 'ataque', 'bloqueio', 'defesa', 'levantamento', 'recepcao', 'score_geral', 'atualizado_em']);
  }

  // Initialize other sheets...
  const jogos = ss.getSheetByName('Jogos');
  if (jogos.getLastRow() < 2) {
    jogos.appendRow(['id_jogo', 'data', 'jogadores_presentes', 'status']);
  }

  const avaliacoes = ss.getSheetByName('Avaliacoes');
  if (avaliacoes.getLastRow() < 2) {
    avaliacoes.appendRow(['id_avaliacao', 'id_jogo', 'id_avaliador', 'id_avaliado', 'saque', 'ataque', 'bloqueio', 'defesa', 'levantamento', 'recepcao', 'data']);
  }

  const timesHistorico = ss.getSheetByName('Times_Historico');
  if (timesHistorico.getLastRow() < 2) {
    timesHistorico.appendRow(['id_montagem', 'data', 'time', 'id_jogador', 'score_geral_time', 'defesa_media_time']);
  }

  const sessoes = ss.getSheetByName('Sessoes');
  if (sessoes.getLastRow() < 2) {
    sessoes.appendRow(['token', 'id_jogador', 'criada_em', 'expira_em']);
  }
}

function generateId() {
  return Utilities.getUuid();
}

// ===== AUTENTICAÇÃO =====
function registrar(data) {
  const jogadores = getSheet('Jogadores');
  const rows = jogadores.getDataRange().getValues();

  // Check if login exists
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][2] === data.login) {
      throw new Error('Login já existe');
    }
  }

  // Validate password is numeric
  const senha = parseInt(data.senha);
  if (isNaN(senha) || senha < 1000 || senha > 999999) {
    throw new Error('Senha deve ser um número entre 1000 e 999999');
  }

  const id = generateId();

  jogadores.appendRow([
    id,
    data.nome,
    data.login,
    senha,
    'JOGADOR',
    data.sexo,
    data.altura_cm,
    data.idade,
    data.peso_kg,
    true,
    new Date(),
  ]);

  // Initialize score entry
  const scores = getSheet('Scores');
  scores.appendRow([id, 0, 0, 0, 0, 0, 0, 0, new Date()]);

  return { id, nome: data.nome };
}

function login(login, senha) {
  const jogadores = getSheet('Jogadores');
  const rows = jogadores.getDataRange().getValues();

  const senhaNum = parseInt(senha);
  if (isNaN(senhaNum)) {
    throw new Error('Senha deve ser numérica');
  }

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][2] === login && rows[i][3] === senhaNum && rows[i][9]) { // Check ativo
      const usuario = {
        id: rows[i][0],
        nome: rows[i][1],
        login: rows[i][2],
        papel: rows[i][4],
        sexo: rows[i][5],
        altura_cm: rows[i][6],
      };

      const token = generateId();
      const sessoes = getSheet('Sessoes');
      const expiracao = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      sessoes.appendRow([token, usuario.id, new Date(), expiracao]);

      return {
        token,
        usuario,
      };
    }
  }

  throw new Error('Login ou senha incorretos');
}

function verificarAutenticacao(token) {
  const sessoes = getSheet('Sessoes');
  const rows = sessoes.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === token && new Date(rows[i][3]) > new Date()) {
      return rows[i][1]; // Return jogador ID
    }
  }

  throw new Error('Token inválido ou expirado');
}

function verificarAdministrador(token) {
  const jogadorId = verificarAutenticacao(token);
  const jogadores = getSheet('Jogadores');
  const rows = jogadores.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === jogadorId && rows[i][4] === 'ADM') {
      return jogadorId;
    }
  }

  throw new Error('Acesso restrito a administradores');
}

// ===== JOGADORES =====
function listarJogadores() {
  const jogadores = getSheet('Jogadores');
  const scores = getSheet('Scores');

  const jogadoresRows = jogadores.getDataRange().getValues();
  const scoresRows = scores.getDataRange().getValues();

  const result = [];

  for (let i = 1; i < jogadoresRows.length; i++) {
    if (jogadoresRows[i][9]) { // Only active players
      const jogadorId = jogadoresRows[i][0];
      let scoreData = {};

      // Find score for this player
      for (let j = 1; j < scoresRows.length; j++) {
        if (scoresRows[j][0] === jogadorId) {
          scoreData = {
            saque: scoresRows[j][1],
            ataque: scoresRows[j][2],
            bloqueio: scoresRows[j][3],
            defesa: scoresRows[j][4],
            levantamento: scoresRows[j][5],
            recepcao: scoresRows[j][6],
            score_geral: scoresRows[j][7],
          };
          break;
        }
      }

      result.push({
        id: jogadorId,
        nome: jogadoresRows[i][1],
        sexo: jogadoresRows[i][5],
        altura_cm: jogadoresRows[i][6],
        idade: jogadoresRows[i][7],
        peso_kg: jogadoresRows[i][8],
        ...scoreData,
      });
    }
  }

  return result;
}

// ===== JOGOS =====
function criarJogo(data, jogadores_ids) {
  const jogos = getSheet('Jogos');
  const id = generateId();

  jogos.appendRow([
    id,
    data,
    JSON.stringify(jogadores_ids),
    'aberto',
  ]);

  return { id_jogo: id };
}

function listarJogos() {
  const jogos = getSheet('Jogos');
  const rows = jogos.getDataRange().getValues();

  const result = [];

  for (let i = 1; i < rows.length; i++) {
    try {
      result.push({
        id_jogo: rows[i][0],
        data: rows[i][1],
        jogadores_presentes: JSON.parse(rows[i][2]),
        status: rows[i][3],
      });
    } catch (e) {
      Logger.log('Error parsing jogadores_presentes for jogo ' + rows[i][0]);
    }
  }

  return result;
}

// ===== AVALIAÇÕES =====
function avaliar(id_jogo, id_avaliado, habilidades) {
  const avaliacoes = getSheet('Avaliacoes');
  const id = generateId();

  avaliacoes.appendRow([
    id,
    id_jogo,
    'system', // id_avaliador - should come from token
    id_avaliado,
    habilidades.saque || 0,
    habilidades.ataque || 0,
    habilidades.bloqueio || 0,
    habilidades.defesa || 0,
    habilidades.levantamento || 0,
    habilidades.recepcao || 0,
    new Date(),
  ]);

  // Recalculate player score
  recalcularScore(id_avaliado);

  return { id_avaliacao: id };
}

function recalcularScore(id_jogador) {
  const avaliacoes = getSheet('Avaliacoes');
  const rows = avaliacoes.getDataRange().getValues();

  const habilidades = ['saque', 'ataque', 'bloqueio', 'defesa', 'levantamento', 'recepcao'];
  const scores = {
    saque: [],
    ataque: [],
    bloqueio: [],
    defesa: [],
    levantamento: [],
    recepcao: [],
  };

  // Collect all evaluations for this player
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][3] === id_jogador) {
      scores.saque.push({ valor: rows[i][4], data: new Date(rows[i][10]) });
      scores.ataque.push({ valor: rows[i][5], data: new Date(rows[i][10]) });
      scores.bloqueio.push({ valor: rows[i][6], data: new Date(rows[i][10]) });
      scores.defesa.push({ valor: rows[i][7], data: new Date(rows[i][10]) });
      scores.levantamento.push({ valor: rows[i][8], data: new Date(rows[i][10]) });
      scores.recepcao.push({ valor: rows[i][9], data: new Date(rows[i][10]) });
    }
  }

  // Calculate weighted scores
  const scoreMedios = {};
  let somaScores = 0;
  let countScores = 0;

  for (const habilidade of habilidades) {
    scoreMedios[habilidade] = calcularScorePonderado(scores[habilidade]);
    somaScores += scoreMedios[habilidade];
    countScores++;
  }

  const scoreGeral = countScores > 0 ? somaScores / countScores : 0;

  // Update Scores sheet
  const scoresSheet = getSheet('Scores');
  const scoresRows = scoresSheet.getDataRange().getValues();

  for (let i = 1; i < scoresRows.length; i++) {
    if (scoresRows[i][0] === id_jogador) {
      scoresSheet.getRange(i + 1, 1, 1, 9).setValues([[
        id_jogador,
        scoreMedios.saque,
        scoreMedios.ataque,
        scoreMedios.bloqueio,
        scoreMedios.defesa,
        scoreMedios.levantamento,
        scoreMedios.recepcao,
        scoreGeral,
        new Date(),
      ]]);
      return;
    }
  }
}

function calcularScorePonderado(avaliacoes) {
  if (avaliacoes.length === 0) return 0;

  // Sort by date descending (most recent first)
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

function fecharJogo(id_jogo) {
  const jogos = getSheet('Jogos');
  const rows = jogos.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id_jogo) {
      jogos.getRange(i + 1, 4).setValue('fechado');
      return { id_jogo };
    }
  }

  throw new Error('Jogo não encontrado');
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

  // Fase 1: Snake draft by height
  const orderedByHeight = jogadoresPresentes.sort((a, b) => b.altura_cm - a.altura_cm);

  const times = [[], [], []];
  const timesUp = [0, 1, 2];
  const timesDown = [2, 1, 0];
  let direcao = 1; // 1 para cima (0,1,2), -1 para baixo (2,1,0)

  orderedByHeight.forEach((jogador, idx) => {
    const posicao = idx % 3;
    const timeIdx = direcao === 1 ? timesUp[posicao] : timesDown[posicao];
    times[timeIdx].push(jogador.id);

    if (posicao === 2) {
      direcao *= -1; // Muda direção a cada 3
    }
  });

  // Fase 2: Otimização local (hill climbing)
  otimizarTimes(times, jogadoresPresentes);

  // Calculate team stats
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

function otimizarTimes(times, jogadoresPresentes) {
  const jogadoresMap = {};
  jogadoresPresentes.forEach(j => { jogadoresMap[j.id] = j; });

  let improved = true;
  let iterations = 0;
  const maxIterations = 100;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    // Try swapping players between teams
    for (let i = 0; i < times[0].length && !improved; i++) {
      for (let j = i + 1; j < times[0].length && !improved; j++) {
        for (let t1 = 0; t1 < 3 && !improved; t1++) {
          for (let t2 = t1 + 1; t2 < 3; t2++) {
            for (let p1 = 0; p1 < times[t1].length; p1++) {
              for (let p2 = 0; p2 < times[t2].length; p2++) {
                const custoBefore = calcularCustoTimes(times, jogadoresMap);

                // Swap
                [times[t1][p1], times[t2][p2]] = [times[t2][p2], times[t1][p1]];

                const custoAfter = calcularCustoTimes(times, jogadoresMap);

                if (custoAfter < custoBefore) {
                  improved = true;
                  break;
                } else {
                  // Reverse swap
                  [times[t1][p1], times[t2][p2]] = [times[t2][p2], times[t1][p1]];
                }
              }
              if (improved) break;
            }
            if (improved) break;
          }
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
  const defensas = stats.map(s => s.defesa_media);
  const mulheres = stats.map(s => s.mulheres);

  const desvioScore = Math.max(...scoreGerais) - Math.min(...scoreGerais);
  const desvioDefesa = Math.max(...defensas) - Math.min(...defensas);
  const desvioSexo = Math.max(...mulheres) - Math.min(...mulheres);

  return (
    TEAM_ALGORITHM_WEIGHTS.scoreGeral * desvioScore +
    TEAM_ALGORITHM_WEIGHTS.defesa * desvioDefesa +
    TEAM_ALGORITHM_WEIGHTS.sexo * desvioSexo
  );
}

function calcularStatsTime(jogadores) {
  if (jogadores.length === 0) {
    return {
      score_geral: 0,
      defesa_media: 0,
      mulheres: 0,
      altura_media: 0,
    };
  }

  const scoreGeralSum = jogadores.reduce((sum, j) => sum + (j.score_geral || 0), 0);
  const defesaSum = jogadores.reduce((sum, j) => sum + (j.defesa || 0), 0);
  const alturaSum = jogadores.reduce((sum, j) => sum + (j.altura_cm || 0), 0);
  const mulheres = jogadores.filter(j => j.sexo === 'F').length;

  return {
    score_geral: scoreGeralSum / jogadores.length,
    defesa_media: defesaSum / jogadores.length,
    mulheres,
    altura_media: alturaSum / jogadores.length,
  };
}

// ===== HISTÓRICO =====
function salvarMontagem(id_montagem, data, times) {
  const timesHistorico = getSheet('Times_Historico');
  const jogadores = listarJogadores();
  const jogadoresMap = {};
  jogadores.forEach(j => { jogadoresMap[j.id] = j; });

  times.forEach((time, idx) => {
    const timeNum = idx + 1;
    time.jogadores.forEach(jogadorId => {
      const jogador = jogadoresMap[jogadorId];
      timesHistorico.appendRow([
        id_montagem,
        data,
        timeNum,
        jogadorId,
        time.stats.score_geral,
        time.stats.defesa_media,
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
    const defensaMedia = rows[i][5];

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
        stats: {
          score_geral: scoreGeral,
          defesa_media: defensaMedia,
        },
      };
    }

    montagens[montagemId].times[timeNum - 1].jogadores.push(jogadorId);
  }

  return Object.values(montagens);
}

// ===== JOGOS =====
function atualizarStatusJogo(id_jogo, status) {
  const jogos = getSheet('Jogos');
  const rows = jogos.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id_jogo) {
      jogos.getRange(i + 1, 4).setValue(status);
      return { id_jogo, status };
    }
  }

  throw new Error('Jogo não encontrado');
}

// ===== PERFIL =====
function atualizarPerfil(id_jogador, dados) {
  const jogadores = getSheet('Jogadores');
  const rows = jogadores.getDataRange().getValues();

  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === id_jogador) {
      // Atualizar senha se fornecida
      if (dados.senha) {
        jogadores.getRange(i + 1, 4).setValue(dados.senha);
      }

      // Atualizar altura
      if (dados.altura_cm) {
        jogadores.getRange(i + 1, 7).setValue(dados.altura_cm);
      }

      // Atualizar idade
      if (dados.idade) {
        jogadores.getRange(i + 1, 8).setValue(dados.idade);
      }

      // Atualizar peso
      if (dados.peso_kg) {
        jogadores.getRange(i + 1, 9).setValue(dados.peso_kg);
      }

      return { id_jogador, success: true };
    }
  }

  throw new Error('Jogador não encontrado');
}

// ===== DEBUG =====
function debugJogadores() {
  const jogadores = getSheet('Jogadores');
  const rows = jogadores.getDataRange().getValues();

  Logger.log('=== JOGADORES NA PLANILHA ===');
  rows.forEach((row, idx) => {
    Logger.log(`Linha ${idx}: ${JSON.stringify(row)}`);
  });

  return rows;
}
}
