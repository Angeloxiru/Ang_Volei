// Utility functions
const showScreen = (screenId) => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');

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

const setupNavbarToggle = () => {
    const toggle = document.getElementById('navbar-toggle');
    const menu = document.getElementById('navbar-menu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            menu.classList.add('hidden');
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
            menu.classList.add('hidden');
        }
    });
};

// App initialization
document.addEventListener('DOMContentLoaded', async () => {
    Auth.init();
    setupNavbarToggle();

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

    document.getElementById('quick-avaliacao')?.addEventListener('click', () => {
        showScreen('avaliacao-section');
        carregarAvaliacao();
    });

    document.getElementById('quick-gerar')?.addEventListener('click', () => {
        showScreen('gerar-times-section');
        carregarGerarTimes();
    });

    document.getElementById('quick-historico')?.addEventListener('click', () => {
        showScreen('historico-section');
        carregarHistorico();
    });

    // Setup jogadores form
    document.getElementById('form-registrar-jogador')?.addEventListener('submit', registrarJogador);

    // Setup avaliacao change
    document.getElementById('select-jogador-avaliacao')?.addEventListener('change', carregarFormAvaliacao);

    // Setup screen event listeners
    document.getElementById('search-jogadores')?.addEventListener('input', filtrarJogadores);
    document.getElementById('sort-jogadores')?.addEventListener('change', filtrarJogadores);
});

// ===== JOGADORES =====
let jogadores = [];
let jogadoresFiltrados = [];

const carregarJogadores = async () => {
    showLoading(true);
    try {
        jogadores = await API.listarJogadores();
        jogadoresFiltrados = [...jogadores];
        exibirJogadores(jogadoresFiltrados);
        carregarSelectJogadores();
    } catch (error) {
        showToast('Erro ao carregar jogadores: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
};

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
        card.innerHTML = `
            <h4>${jogador.nome}</h4>
            <div class="jogador-info">
                ${jogador.sexo === 'F' ? '👩' : '👨'} ${jogador.sexo === 'M' ? 'Masculino' : 'Feminino'}
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
                <div class="score-item">
                    <div class="score-label">Recepção</div>
                    <div class="score-value">${(jogador.recepcao || 0).toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">Bloqueio</div>
                    <div class="score-value">${(jogador.bloqueio || 0).toFixed(1)}</div>
                </div>
                <div class="score-item">
                    <div class="score-label">Levantamento</div>
                    <div class="score-value">${(jogador.levantamento || 0).toFixed(1)}</div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
};

const filtrarJogadores = () => {
    const searchTerm = document.getElementById('search-jogadores').value.toLowerCase();
    const sortBy = document.getElementById('sort-jogadores').value;

    jogadoresFiltrados = jogadores.filter(j => j.nome.toLowerCase().includes(searchTerm));

    if (sortBy === 'nome') {
        jogadoresFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (sortBy === 'score_geral') {
        jogadoresFiltrados.sort((a, b) => (b.score_geral || 0) - (a.score_geral || 0));
    } else if (sortBy === 'sexo') {
        jogadoresFiltrados.sort((a, b) => a.sexo.localeCompare(b.sexo));
    }

    exibirJogadores(jogadoresFiltrados);
};

const registrarJogador = async (e) => {
    e.preventDefault();

    const nome = document.getElementById('register-jogador-nome').value;
    const sexo = document.getElementById('register-jogador-sexo').value;

    showLoading(true);

    try {
        await API.registrarJogador(nome, sexo);
        showToast('Jogador registrado com sucesso!', 'success');
        document.getElementById('form-registrar-jogador').reset();
        await carregarJogadores();
    } catch (error) {
        showToast('Erro ao registrar jogador: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
};

// ===== AVALIAÇÃO =====
const carregarAvaliacao = async () => {
    showLoading(true);
    try {
        const jogadores = await API.listarJogadores();
        const select = document.getElementById('select-jogador-avaliacao');
        select.innerHTML = '<option value="">Escolha um jogador...</option>';

        jogadores.forEach(jogador => {
            const option = document.createElement('option');
            option.value = jogador.id;
            option.textContent = jogador.nome;
            select.appendChild(option);
        });
    } catch (error) {
        showToast('Erro ao carregar jogadores: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
};

const carregarFormAvaliacao = async () => {
    const jogadorId = document.getElementById('select-jogador-avaliacao').value;
    const container = document.getElementById('avaliacao-container');

    if (!jogadorId) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <form id="form-avaliar">
            <div class="form-group">
                <label>Saque (0-100)</label>
                <input type="number" name="saque" min="0" max="100" value="0">
            </div>
            <div class="form-group">
                <label>Ataque (0-100)</label>
                <input type="number" name="ataque" min="0" max="100" value="0">
            </div>
            <div class="form-group">
                <label>Recepção (0-100)</label>
                <input type="number" name="recepcao" min="0" max="100" value="0">
            </div>
            <div class="form-group">
                <label>Bloqueio (0-100)</label>
                <input type="number" name="bloqueio" min="0" max="100" value="0">
            </div>
            <div class="form-group">
                <label>Levantamento (0-100)</label>
                <input type="number" name="levantamento" min="0" max="100" value="0">
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Salvar Avaliação</button>
            </div>
        </form>
    `;

    document.getElementById('form-avaliar').addEventListener('submit', async (e) => {
        e.preventDefault();
        await salvarAvaliacao(jogadorId, e.target);
    });
};

const salvarAvaliacao = async (jogadorId, form) => {
    showLoading(true);

    try {
        const habilidades = {
            saque: parseInt(form.saque.value),
            ataque: parseInt(form.ataque.value),
            recepcao: parseInt(form.recepcao.value),
            bloqueio: parseInt(form.bloqueio.value),
            levantamento: parseInt(form.levantamento.value),
        };

        await API.avaliar(jogadorId, habilidades);
        showToast('Avaliação salva com sucesso!', 'success');
        document.getElementById('form-avaliar').reset();
    } catch (error) {
        showToast('Erro ao salvar avaliação: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
};

// ===== GERAR TIMES =====
let timesResultado = null;

const carregarGerarTimes = async () => {
    showLoading(true);
    try {
        const jogadores = await API.listarJogadores();
        const container = document.getElementById('select-presentes');
        container.innerHTML = '';

        jogadores.forEach(jogador => {
            const label = document.createElement('label');
            label.className = 'checkbox-item';
            label.innerHTML = `
                <input type="checkbox" value="${jogador.id}" class="jogador-checkbox">
                <span>${jogador.nome} (${jogador.sexo})</span>
            `;
            container.appendChild(label);
        });

        // Setup gerar times button
        document.getElementById('btn-gerar-times')?.addEventListener('click', gerarTimes);
    } catch (error) {
        showToast('Erro ao carregar jogadores: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
};

const gerarTimes = async () => {
    const checkboxes = document.querySelectorAll('.jogador-checkbox:checked');

    if (checkboxes.length !== 18) {
        showToast(`Selecione exatamente 18 jogadores. Selecionados: ${checkboxes.length}`, 'error');
        return;
    }

    const jogadoresIds = Array.from(checkboxes).map(cb => cb.value);

    showLoading(true);

    try {
        const resultado = await API.gerarTimes(jogadoresIds);
        timesResultado = resultado;
        exibirTimesResultado(resultado);
    } catch (error) {
        showToast('Erro ao gerar times: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
};

const exibirTimesResultado = (resultado) => {
    const container = document.getElementById('times-resultado');
    container.innerHTML = '';

    const temposDiv = document.createElement('div');
    temposDiv.style.marginBottom = '2rem';

    resultado.times.forEach((time, idx) => {
        const timeCard = document.createElement('div');
        timeCard.style.marginBottom = '1.5rem';
        timeCard.style.padding = '1rem';
        timeCard.style.border = '1px solid #ddd';
        timeCard.style.borderRadius = '8px';

        const timeName = document.createElement('h3');
        timeName.textContent = `Time ${idx + 1}`;
        timeCard.appendChild(timeName);

        const stats = document.createElement('p');
        stats.style.marginBottom = '1rem';
        stats.style.color = '#666';
        stats.textContent = `Score Geral: ${(time.stats.score_geral || 0).toFixed(2)}`;
        timeCard.appendChild(stats);

        const jogadoresList = document.createElement('div');
        jogadoresList.style.display = 'grid';
        jogadoresList.style.gridTemplateColumns = '1fr 1fr';
        jogadoresList.style.gap = '0.5rem';

        time.jogadores.forEach(jogadorId => {
            const jogador = jogadores.find(j => j.id === jogadorId);
            if (jogador) {
                const jogadorItem = document.createElement('div');
                jogadorItem.style.padding = '0.5rem';
                jogadorItem.style.backgroundColor = '#f5f5f5';
                jogadorItem.style.borderRadius = '4px';
                jogadorItem.textContent = `${jogador.nome} (${jogador.sexo})`;
                jogadoresList.appendChild(jogadorItem);
            }
        });

        timeCard.appendChild(jogadoresList);
        temposDiv.appendChild(timeCard);
    });

    container.appendChild(temposDiv);

    const salvarBtn = document.createElement('button');
    salvarBtn.className = 'btn btn-success';
    salvarBtn.textContent = 'Salvar Montagem';
    salvarBtn.style.marginTop = '1rem';
    salvarBtn.addEventListener('click', () => salvarMontagem(resultado));

    container.appendChild(salvarBtn);
};

const salvarMontagem = async (resultado) => {
    showLoading(true);

    try {
        const data = new Date().toISOString().split('T')[0];
        await API.salvarMontagem(resultado.id_montagem, data, resultado.times);
        showToast('Montagem salva com sucesso!', 'success');
        setTimeout(() => {
            showScreen('historico-section');
            carregarHistorico();
        }, 1000);
    } catch (error) {
        showToast('Erro ao salvar montagem: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
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

const exibirHistorico = (historico) => {
    const container = document.getElementById('historico-list');
    container.innerHTML = '';

    if (historico.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #7f8c8d;">Nenhuma montagem encontrada</p>';
        return;
    }

    historico.forEach(montagem => {
        const card = document.createElement('div');
        card.className = 'montagem-card';
        card.style.padding = '1.5rem';
        card.style.border = '1px solid #ddd';
        card.style.borderRadius = '8px';

        const header = document.createElement('div');
        header.innerHTML = `
            <h3>Montagem ${montagem.id_montagem.substring(0, 8)}...</h3>
            <p style="color: #666;">Data: ${montagem.data}</p>
        `;
        card.appendChild(header);

        montagem.times.forEach((time, idx) => {
            const timeDiv = document.createElement('div');
            timeDiv.style.marginTop = '1rem';
            timeDiv.style.paddingTop = '1rem';
            timeDiv.style.borderTop = '1px solid #eee';

            timeDiv.innerHTML = `
                <strong>Time ${idx + 1}</strong> (Score: ${(time.stats.score_geral || 0).toFixed(2)})
                <div style="margin-top: 0.5rem; font-size: 0.9rem; color: #666;">
                    ${time.jogadores.join(', ')}
                </div>
            `;
            card.appendChild(timeDiv);
        });

        container.appendChild(card);
    });
};

// ===== HELPERS =====
const carregarSelectJogadores = async () => {
    const select = document.getElementById('select-jogador-avaliacao');
    if (!select) return;

    select.innerHTML = '<option value="">Escolha um jogador...</option>';
    jogadores.forEach(jogador => {
        const option = document.createElement('option');
        option.value = jogador.id;
        option.textContent = jogador.nome;
        select.appendChild(option);
    });
};
