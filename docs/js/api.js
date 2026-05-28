const API = (() => {
     // Configure this with your Google Apps Script Web App URL
    const APPS_SCRIPT_URL = localStorage.getItem('https://script.google.com/macros/s/AKfycby6TsP3GbXtMuEvjz7TBb2PmvcnUFr9mHDP5XgS3msXYsQO3sMW2vGSHGsptonu36yXAw/exec') || '';

    const request = async (action, data = {}, method = 'POST') => {
        if (!APPS_SCRIPT_URL) {
            throw new Error('Apps Script URL not configured. Please set it in settings.');
        }

        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'text/plain',
                },
            };

            if (method === 'POST' || method === 'PUT') {
                const token = localStorage.getItem('token');
                const payload = { action, ...data };
                if (token) payload.token = token;
                options.body = JSON.stringify(payload);
            }

            const url = method === 'GET' ?
                `${APPS_SCRIPT_URL}?action=${action}` :
                APPS_SCRIPT_URL;

            const response = await fetch(url, options);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Erro desconhecido');
            }

            return result.data;
        } catch (error) {
            console.error(`API Error (${action}):`, error);
            throw error;
        }
    };

    return {
        setAppsScriptUrl(url) {
            localStorage.setItem('appsScriptUrl', url);
        },

        // Auth endpoints
        registrar(dados) {
            return request('registrar', dados);
        },

        login(login, senha) {
            return request('login', { login, senha });
        },

        // Player endpoints
        listarJogadores() {
            return request('listarJogadores');
        },

        // Game endpoints
        criarJogo(data, jogadores_presentes) {
            return request('criarJogo', { data, jogadores_presentes });
        },

        listarJogos() {
            return request('listarJogos');
        },

        // Evaluation endpoints
        avaliar(id_jogo, id_avaliado, habilidades) {
            return request('avaliar', { id_jogo, id_avaliado, habilidades });
        },

        fecharJogo(id_jogo) {
            return request('fecharJogo', { id_jogo });
        },

        // Team generation
        gerarTimes(jogadores_ids) {
            return request('gerarTimes', { jogadores_ids });
        },

        salvarMontagem(id_montagem, data, times) {
            return request('salvarMontagem', { id_montagem, data, times });
        },

        // History
        listarHistorico() {
            return request('listarHistorico');
        },
    };
})();
