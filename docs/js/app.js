// Utility functions
const showScreen = (screenId) => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');

    // Update navbar active state
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    const navMap = {
        'home-section': 'nav-home',
        'jogadores-section': 'nav-jogadores',
        'avaliacao-section': 'nav-avaliacao',
        'gerar-times-section': 'nav-gerar-times',
        'historico-section': 'nav-historico',
    };
    if (navMap[screenId]) {
        const btn = document.getElementById(navMap[screenId]);
        if (btn) btn.classList.add('active');
    }
};

const showToast = (message, type = 'info') => {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
};

const showLoading = (show = true) => {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
};

// App initialization
document.addEventListener('DOMContentLoaded', async () => {
    Auth.init();

    // Setup navbar buttons
    document.getElementById('nav-home')?.addEventListener('click', () => {
        showScreen('home-section');
    });

    document.getElementById('nav-jogadores')?.addEventListener('click', () => {
        showScreen('jogadores-section');
        carregarJogadores();
    });

    document.getElementById('nav-avaliacao')?.addEventListener('click', () => {
        showScreen('avaliacao-section');
        carregarAvaliacao();
    });

    document.getElementById('nav-gerar-times')?.addEventListener('click', () => {
        showScreen('gerar-times-section');
        carregarGerarTimes();
    });

    document.getElementById('nav-historico')?.addEventListener('click', () => {
        showScreen('historico-section');
        carregarHistorico();
    });

    document.getElementById('nav-perfil')?.addEventListener('click', () => {
        showScreen('perfil-section');
        carregarPerfil();
    });

    document.getElementById('nav-logout')?.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja sair?')) {
            Auth.logout();
        }
    });

    // Setup quick menu buttons
    document.getElementById('quick-jogadores')?.addEventListener('click', () => {
        showScreen('jogadores-section');
        carregarJogadores();
    });

    document.getElementById('quick-historico')?.addEventListener('click', () => {
        showScreen('historico-section');
        carregarHistorico();
    });

    document.getElementById('quick-avaliacao')?.addEventListener('click', () => {
        showScreen('avaliacao-section');
        carregarAvaliacao();
    });

    document.getElementById('quick-gerar')?.addEventListener('click', () => {
        showScreen('gerar-times-section');
        carregarGerarTimes();
    });

    // Setup screen event listeners
    document.getElementById('search-jogadores')?.addEventListener('input', filtrarJogadores);
    document.getElementById('sort-jogadores')?.addEventListener('change', filtrarJogadores);
});

// ===== JOGADORES =====
let jogadores = [];

const carregarJogadores = async () => {
    showLoading(true);
    try {
        jogadores = await API.listarJogadores();
        exibirJogadores(jogadores);
    } catch (error) {
        showToast('Erro ao carregar jogadores: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
};

let chartsAtivos = {};

const exibirJogadores = (lista) => {
    const container = document.getElementById('jogadores-list');
    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #7f8c8d;">Nenhum jogador encontrado</p>';
        return;
    }

    lista.forEach(jogador => {
        const card = document.createElement('div');
        card.className = 'jogador-card';
        card.dataset.jogadorId = jogador.id;
        card.innerHTML = `
            <h4>${jogador.nome}</h4>
            <div class="jogador-info">
                ${jogador.sexo === 'F' ? '👩' : '👨'} ${jogador.altura_cm}cm · ${jogador.idade} anos
            </div>
            <div class="score">
                <div class="score-item">
                    <div class="score-label">Geral</div>
                    <div class="score-value">${(jogador.score_geral || 0).toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">Saque</div>
                    <div class="score-value">${(jogador.saque || 0).toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">Ataque</div>
                    <div class="score-value">${(jogador.ataque || 0).toFixed(1)}</div>
                </div>
            </div>
            <div class="score">
                <div class="score-item">
                    <div class="score-label">Bloqueio</div>
                    <div class="score-value">${(jogador.bloqueio || 0).toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">Defesa</div>
                    <div class="score-value">${(jogador.defesa || 0).toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">Recepção</div>
                    <div class="score-value">${(jogador.recepcao || 0).toFixed(1)}</div>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            expandirJogador(card, jogador, container);
        });

        container.appendChild(card);
    });
};

const expandirJogador = (card, jogador, container) => {
    // Se já está expandido, contrair
    if (card.classList.contains('expanded')) {
        if (chartsAtivos[jogador.id]) {
            chartsAtivos[jogador.id].destroy();
            delete chartsAtivos[jogador.id];
        }
        card.classList.remove('expanded');
        card.innerHTML = `
            <h4>${jogador.nome}</h4>
            <div class="jogador-info">
                ${jogador.sexo === 'F' ? '👩' : '👨'} ${jogador.altura_cm}cm · ${jogador.idade} anos
            </div>
            <div class="score">
                <div class="score-item">
                    <div class="score-label">Geral</div>
                    <div class="score-value">${(jogador.score_geral || 0).toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">Saque</div>
                    <div class="score-value">${(jogador.saque || 0).toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">Ataque</div>
                    <div class="score-value">${(jogador.ataque || 0).toFixed(1)}</div>
                </div>
            </div>
            <div class="score">
                <div class="score-item">
                    <div class="score-label">Bloqueio</div>
                    <div class="score-value">${(jogador.bloqueio || 0).toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">Defesa</div>
                    <div class="score-value">${(jogador.defesa || 0).toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">Recepção</div>
                    <div class="score-value">${(jogador.recepcao || 0).toFixed(1)}</div>
                </div>
            </div>
        `;
        return;
    }

    // Contrair outros cards expandidos
    document.querySelectorAll('.jogador-card.expanded').forEach(c => {
        if (c !== card) {
            c.classList.remove('expanded');
            const id = c.dataset.jogadorId;
            if (chartsAtivos[id]) {
                chartsAtivos[id].destroy();
                delete chartsAtivos[id];
            }
        }
    });

    // Expandir este card
    card.classList.add('expanded');
    card.innerHTML = `
        <div class="jogador-info-left">
            <h4>${jogador.nome}</h4>
            <div class="jogador-info">
                ${jogador.sexo === 'F' ? '👩' : '👨'} ${jogador.altura_cm}cm · ${jogador.idade} anos
            </div>
            <div class="score">
                <div class="score-item">
                    <div class="score-label">Score Geral</div>
                    <div class="score-value">${(jogador.score_geral || 0).toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">Saque</div>
                    <div class="score-value">${(jogador.saque || 0).toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">Ataque</div>
                    <div class="score-value">${(jogador.ataque || 0).toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">Bloqueio</div>
                    <div class="score-value">${(jogador.bloqueio || 0).toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">Defesa</div>
                    <div class="score-value">${(jogador.defesa || 0).toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">Levantamento</div>
                    <div class="score-value">${(jogador.levantamento || 0).toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">Recepção</div>
                    <div class="score-value">${(jogador.recepcao || 0).toFixed(1)}</div>
                </div>
            </div>
        </div>
        <div class="jogador-chart">
            <canvas id="chart-${jogador.id}"></canvas>
        </div>
    `;

    // Criar gráfico de radar
    setTimeout(() => {
        criarGraficoRadar(jogador);
    }, 100);
};

const criarGraficoRadar = (jogador) => {
    const ctx = document.getElementById(`chart-${jogador.id}`);
    if (!ctx) return;

    if (chartsAtivos[jogador.id]) {
        chartsAtivos[jogador.id].destroy();
    }

    chartsAtivos[jogador.id] = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Saque', 'Ataque', 'Bloqueio', 'Defesa', 'Levantamento', 'Recepção'],
            datasets: [{
                label: jogador.nome,
                data: [
                    jogador.saque || 0,
                    jogador.ataque || 0,
                    jogador.bloqueio || 0,
                    jogador.defesa || 0,
                    jogador.levantamento || 0,
                    jogador.recepcao || 0
                ],
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                borderWidth: 2,
                fill: true,
                pointBackgroundColor: '#e74c3c',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#34495e',
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#7f8c8d',
                        stepSize: 20
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    pointLabels: {
                        color: '#34495e',
                        font: { size: 12 }
                    }
                }
            }
        }
    });
};

const filtrarJogadores = () => {
    const search = document.getElementById('search-jogadores').value.toLowerCase();
    const sort = document.getElementById('sort-jogadores').value;

    let filtrada = jogadores.filter(j => j.nome.toLowerCase().includes(search));

    switch (sort) {
        case 'score_geral':
            filtrada.sort((a, b) => (b.score_geral || 0) - (a.score_geral || 0));
            break;
        case 'altura':
            filtrada.sort((a, b) => b.altura_cm - a.altura_cm);
            break;
        default: // nome
            filtrada.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    exibirJogadores(filtrada);
};

// ===== AVALIAÇÃO =====
let jogosParaAvaliacao = [];

const carregarAvaliacao = async () => {
    if (!Auth.isADM()) {
        showToast('Acesso restrito a administradores', 'error');
        showScreen('home-section');
        return;
    }

    showLoading(true);
    try {
        const todos = await API.listarJogadores();
        jogadores = todos;

        const jogos = await API.listarJogos();
        jogosParaAvaliacao = jogos.filter(j => j.status === 'avaliacao');

        const selectJogo = document.getElementById('select-jogo-avaliacao');
        selectJogo.innerHTML = '<option value="">Escolha um jogo em avaliação...</option>';

        jogosParaAvaliacao.forEach(jogo => {
            const option = document.createElement('option');
            option.value = jogo.id_jogo;
            option.textContent = `Jogo de ${new Date(jogo.data).toLocaleDateString('pt-BR')}`;
            selectJogo.appendChild(option);
        });

        selectJogo.addEventListener('change', () => {
            if (selectJogo.value) {
                exibirFormAvaliacao(selectJogo.value);
            }
        });
    } catch (error) {
        showToast('Erro ao carregar avaliações: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
};

const exibirFormAvaliacao = (id_jogo) => {
    const container = document.getElementById('avaliacao-container');
    const jogo = jogosParaAvaliacao.find(j => j.id_jogo === id_jogo);

    if (!jogo) return;

    const jogadoresPresentes = jogo.jogadores_presentes || [];
    const jogadoresPresentesObj = jogadores.filter(j => jogadoresPresentes.includes(j.id));

    let html = '<form id="form-avaliacao" class="avaliacao-form">';

    jogadoresPresentesObj.forEach(jogador => {
        html += `
            <div class="avaliacao-jogador">
                <h4>${jogador.nome}</h4>
                <div class="avaliacao-grid">
                    <div class="avaliacao-input">
                        <label>Saque</label>
                        <input type="number" class="saque" min="0" max="100" value="0" data-jogador="${jogador.id}">
                    </div>
                    <div class="avaliacao-input">
                        <label>Ataque</label>
                        <input type="number" class="ataque" min="0" max="100" value="0" data-jogador="${jogador.id}">
                    </div>
                    <div class="avaliacao-input">
                        <label>Bloqueio</label>
                        <input type="number" class="bloqueio" min="0" max="100" value="0" data-jogador="${jogador.id}">
                    </div>
                    <div class="avaliacao-input">
                        <label>Defesa</label>
                        <input type="number" class="defesa" min="0" max="100" value="0" data-jogador="${jogador.id}">
                    </div>
                    <div class="avaliacao-input">
                        <label>Levantamento</label>
                        <input type="number" class="levantamento" min="0" max="100" value="0" data-jogador="${jogador.id}">
                    </div>
                    <div class="avaliacao-input">
                        <label>Recepção</label>
                        <input type="number" class="recepcao" min="0" max="100" value="0" data-jogador="${jogador.id}">
                    </div>
                </div>
            </div>
        `;
    });

    html += `
        <div class="form-actions">
            <button type="submit" class="btn btn-success">Salvar Avaliações</button>
            <button type="button" class="btn btn-danger" id="btn-fechar-jogo">Fechar Jogo</button>
        </div>
    </form>
    `;

    container.innerHTML = html;

    document.getElementById('form-avaliacao').addEventListener('submit', (e) => {
        e.preventDefault();
        salvarAvaliacoes(id_jogo);
    });

    document.getElementById('btn-fechar-jogo')?.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja fechar este jogo?')) {
            fecharJogo(id_jogo);
        }
    });
};

const salvarAvaliacoes = async (id_jogo) => {
    showLoading(true);
    try {
        const inputs = document.querySelectorAll('.avaliacao-jogador input');
        const avaliacoesPorJogador = {};

        inputs.forEach(input => {
            const jogadorId = input.dataset.jogador;
            const habilidade = input.className;
            const valor = parseInt(input.value) || 0;

            if (!avaliacoesPorJogador[jogadorId]) {
                avaliacoesPorJogador[jogadorId] = {};
            }
            avaliacoesPorJogador[jogadorId][habilidade] = valor;
        });

        for (const [jogadorId, habilidades] of Object.entries(avaliacoesPorJogador)) {
            await API.avaliar(id_jogo, jogadorId, habilidades);
        }

        showToast('Avaliações salvas com sucesso!', 'success');
    } catch (error) {
        showToast('Erro ao salvar avaliações: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
};

const fecharJogo = async (id_jogo) => {
    showLoading(true);
    try {
        await API.fecharJogo(id_jogo);
        showToast('Jogo fechado com sucesso!', 'success');
        carregarAvaliacao();
    } catch (error) {
        showToast('Erro ao fechar jogo: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
};

// ===== GERAR TIMES =====
let todosJogadores = [];
let jogadoresSelecionados = [];

const carregarGerarTimes = async () => {
    if (!Auth.isADM()) {
        showToast('Acesso restrito a administradores', 'error');
        showScreen('home-section');
        return;
    }

    showLoading(true);
    try {
        todosJogadores = await API.listarJogadores();
        exibirSelecaoJogadores();
    } catch (error) {
        showToast('Erro ao carregar jogadores: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
};

const exibirSelecaoJogadores = () => {
    const container = document.getElementById('select-presentes');
    container.innerHTML = '';

    todosJogadores.forEach(jogador => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = jogador.id;
        checkbox.addEventListener('change', (e) => {
            atualizarSelecao();
            if (e.target.checked) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
        });

        const textSpan = document.createElement('label');
        textSpan.textContent = `${jogador.nome} (${jogador.altura_cm}cm)`;
        textSpan.style.marginLeft = '0.5rem';
        textSpan.style.cursor = 'pointer';
        textSpan.style.flex = '1';

        label.appendChild(checkbox);
        label.appendChild(textSpan);
        container.appendChild(label);
    });
};

const atualizarSelecao = () => {
    const checkboxes = document.querySelectorAll('#select-presentes input[type="checkbox"]:checked');
    jogadoresSelecionados = Array.from(checkboxes).map(cb => cb.value);

    const countSpan = document.querySelector('#select-presentes').parentElement.querySelector('label');
    if (countSpan) {
        countSpan.textContent = `Jogadores Presentes (${jogadoresSelecionados.length}/18)`;
    }
};

document.getElementById('btn-gerar-times')?.addEventListener('click', async () => {
    if (jogadoresSelecionados.length !== 18) {
        showToast('Selecione exatamente 18 jogadores', 'error');
        return;
    }

    showLoading(true);
    try {
        const times = await API.gerarTimes(jogadoresSelecionados);
        exibirTimesGerados(times);
    } catch (error) {
        showToast('Erro ao gerar times: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
});

const exibirTimesGerados = (times) => {
    const container = document.getElementById('times-resultado');
    container.innerHTML = '';

    const timesArray = times.times || [[], [], []];
    const montagemId = times.id_montagem || `mt_${Date.now()}`;

    let html = '<div class="times-container">';

    timesArray.forEach((time, idx) => {
        const timeNum = idx + 1;
        const jogadoresTime = time.jogadores || [];
        const stats = time.stats || {};

        const jogadoresNomes = jogadoresTime.map(id => {
            const j = todosJogadores.find(jog => jog.id === id);
            return j ? j.nome : id;
        });

        html += `
            <div class="time-card time-${timeNum}">
                <h3>Time ${timeNum}</h3>
                <div class="time-stats">
                    <div class="time-stat">
                        <span>Score Geral:</span>
                        <strong>${(stats.score_geral || 0).toFixed(1)}</strong>
                    </div>
                    <div class="time-stat">
                        <span>Defesa Média:</span>
                        <strong>${(stats.defesa_media || 0).toFixed(1)}</strong>
                    </div>
                    <div class="time-stat">
                        <span>Mulheres:</span>
                        <strong>${stats.mulheres || 0}</strong>
                    </div>
                    <div class="time-stat">
                        <span>Altura Média:</span>
                        <strong>${(stats.altura_media || 0).toFixed(0)}cm</strong>
                    </div>
                </div>
                <div class="time-jogadores">
                    <ol>
                        ${jogadoresNomes.map(nome => `<li>${nome}</li>`).join('')}
                    </ol>
                </div>
            </div>
        `;
    });

    html += '</div>';

    html += `
        <div class="form-actions">
            <button class="btn btn-success" id="btn-salvar-montagem">Salvar Montagem</button>
            <button class="btn btn-secondary" id="btn-regerar-times">Re-gerar</button>
        </div>
    `;

    container.innerHTML = html;

    document.getElementById('btn-salvar-montagem')?.addEventListener('click', async () => {
        showLoading(true);
        try {
            await API.salvarMontagem(montagemId, new Date().toISOString().split('T')[0], times.times || []);
            showToast('Montagem salva com sucesso!', 'success');
            container.innerHTML = '<p style="text-align: center; color: #27ae60; font-weight: bold;">✓ Montagem salva!</p>';
        } catch (error) {
            showToast('Erro ao salvar montagem: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    });

    document.getElementById('btn-regerar-times')?.addEventListener('click', () => {
        carregarGerarTimes();
    });
};

// ===== HISTÓRICO =====
const carregarHistorico = async () => {
    showLoading(true);
    try {
        const historico = await API.listarHistorico();
        exibirHistorico(historico);
    } catch (error) {
        showToast('Erro ao carregar histórico: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
};

const exibirHistorico = (montagens) => {
    const container = document.getElementById('historico-list');
    container.innerHTML = '';

    if (!montagens || montagens.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #7f8c8d;">Nenhuma montagem salva ainda</p>';
        return;
    }

    montagens.forEach(montagem => {
        const card = document.createElement('div');
        card.className = 'montagem-card';

        const dataFormatada = new Date(montagem.data).toLocaleDateString('pt-BR');
        const times = montagem.times || [];

        let timesHtml = '';
        times.forEach((time, idx) => {
            const jogadores = time.jogadores || [];
            const stats = time.stats || {};

            const jogadoresNomes = jogadores.map(id => {
                const j = todosJogadores.find(jog => jog.id === id);
                return j ? j.nome : id;
            });

            timesHtml += `
                <div class="montagem-time">
                    <h5>Time ${idx + 1}</h5>
                    <div class="montagem-time-stats">
                        Score: ${(stats.score_geral || 0).toFixed(1)} |
                        Defesa: ${(stats.defesa_media || 0).toFixed(1)}
                    </div>
                    <div class="montagem-time-jogadores">
                        ${jogadoresNomes.map(nome => `<div>• ${nome}</div>`).join('')}
                    </div>
                </div>
            `;
        });

        card.innerHTML = `
            <h4>📅 ${dataFormatada}</h4>
            <div class="montagem-times">
                ${timesHtml}
            </div>
        `;

        container.appendChild(card);
    });
}

// ===== PERFIL =====
const carregarPerfil = () => {
    const usuario = Auth.getUsuario();
    if (!usuario) {
        showToast('Erro ao carregar perfil', 'error');
        return;
    }

    document.getElementById('perfil-nome').value = usuario.nome || '';
    document.getElementById('perfil-login').value = usuario.login || '';
    document.getElementById('perfil-altura').value = usuario.altura_cm || '';
    document.getElementById('perfil-peso').value = usuario.peso_kg || '';
    document.getElementById('perfil-idade').value = usuario.idade || '';
    document.getElementById('perfil-senha').value = '';

    document.getElementById('form-perfil').addEventListener('submit', salvarPerfil);
    document.getElementById('btn-cancelar-perfil').addEventListener('click', () => {
        showScreen('home-section');
    });
};

const salvarPerfil = async (e) => {
    e.preventDefault();

    const usuario = Auth.getUsuario();
    const senha = document.getElementById('perfil-senha').value;
    const altura_cm = parseInt(document.getElementById('perfil-altura').value);
    const peso_kg = parseInt(document.getElementById('perfil-peso').value);
    const idade = parseInt(document.getElementById('perfil-idade').value);

    // Validar altura
    if (altura_cm < 140 || altura_cm > 220) {
        showToast('Altura deve estar entre 140 e 220 cm', 'error');
        return;
    }

    // Validar peso
    if (peso_kg < 40 || peso_kg > 200) {
        showToast('Peso deve estar entre 40 e 200 kg', 'error');
        return;
    }

    // Validar idade
    if (idade < 15 || idade > 100) {
        showToast('Idade deve estar entre 15 e 100 anos', 'error');
        return;
    }

    // Se senha foi preenchida, validar
    if (senha) {
        const senhaNum = parseInt(senha);
        if (isNaN(senhaNum) || senhaNum < 1000 || senhaNum > 999999) {
            showToast('Senha deve ser um número entre 1000 e 999999', 'error');
            return;
        }
    }

    showLoading(true);
    try {
        await API.atualizarPerfil(usuario.id, {
            senha: senha ? parseInt(senha) : null,
            altura_cm,
            peso_kg,
            idade,
        });

        // Atualizar dados locais
        if (senha) {
            usuario.password = senha;
        }
        usuario.altura_cm = altura_cm;
        usuario.peso_kg = peso_kg;
        usuario.idade = idade;
        localStorage.setItem('usuario', JSON.stringify(usuario));

        showToast('Perfil atualizado com sucesso!', 'success');
        showScreen('home-section');
    } catch (error) {
        showToast('Erro ao atualizar perfil: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
};
