const Auth = (() => {
    let usuarioAtual = null;

    const init = () => {
        const loginForm = document.getElementById('login-form');
        loginForm.addEventListener('submit', handleLogin);
        verificarSessaoExistente();
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        const login = document.getElementById('login-username').value;
        const senha = document.getElementById('login-password').value;

        showLoading(true);

        try {
            const response = await API.login(login, senha);

            localStorage.setItem('token', response.token);
            localStorage.setItem('usuario', JSON.stringify(response.usuario));

            usuarioAtual = response.usuario;

            showToast('Login realizado com sucesso!', 'success');
            showScreen('home-section');
            atualizarUI();

            document.getElementById('login-form').reset();
        } catch (error) {
            showToast(error.message || 'Erro ao fazer login', 'error');
        } finally {
            showLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        usuarioAtual = null;
        showToast('Desconectado com sucesso', 'success');
        showScreen('login-section');
        atualizarUI();
    };

    const verificarSessaoExistente = () => {
        const token = localStorage.getItem('token');
        const usuario = localStorage.getItem('usuario');

        if (token && usuario) {
            usuarioAtual = JSON.parse(usuario);
            showScreen('home-section');
            atualizarUI();
        } else {
            showScreen('login-section');
        }
    };

    const isAuthenticated = () => !!localStorage.getItem('token');

    const getUsuario = () => usuarioAtual;

    const atualizarUI = () => {
        const authenticated = isAuthenticated();

        // Atualizar navbar (todos os botões aparecem para ADM autenticado)
        document.getElementById('nav-home').style.display = authenticated ? 'block' : 'none';
        document.getElementById('nav-jogadores').style.display = authenticated ? 'block' : 'none';
        document.getElementById('nav-avaliacao').style.display = authenticated ? 'block' : 'none';
        document.getElementById('nav-gerar-times').style.display = authenticated ? 'block' : 'none';
        document.getElementById('nav-historico').style.display = authenticated ? 'block' : 'none';
        document.getElementById('nav-logout').style.display = authenticated ? 'block' : 'none';

        // Atualizar home
        if (authenticated) {
            document.getElementById('welcome-name').textContent = usuarioAtual.nome.split(' ')[0];
            document.getElementById('user-role-info').textContent = 'Você é Administrador';
        }
    };

    return {
        init,
        logout,
        isAuthenticated,
        getUsuario,
        atualizarUI,
    };
})();
