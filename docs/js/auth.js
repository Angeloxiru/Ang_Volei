const Auth = (() => {
    let usuarioAtual = null;

    const init = () => {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const toggleRegisterLink = document.getElementById('toggle-register');
        const toggleLoginLink = document.getElementById('toggle-login');

        loginForm.addEventListener('submit', handleLogin);
        registerForm.addEventListener('submit', handleRegister);
        toggleRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('register-section');
        });
        toggleLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('login-section');
        });

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

    const handleRegister = async (e) => {
        e.preventDefault();

        const nome = document.getElementById('register-name').value;
        const login = document.getElementById('register-username').value;
        const senha = document.getElementById('register-password').value;
        const senhaConfirm = document.getElementById('register-password-confirm').value;
        const sexo = document.getElementById('register-sexo').value;
        const altura_cm = parseInt(document.getElementById('register-altura').value);
        const idade = parseInt(document.getElementById('register-idade').value);
        const peso_kg = parseInt(document.getElementById('register-peso').value);

        if (senha !== senhaConfirm) {
            showToast('As senhas não coincidem', 'error');
            return;
        }

        showLoading(true);

        try {
            await API.registrar({
                nome,
                login,
                senha,
                sexo,
                altura_cm,
                idade,
                peso_kg,
            });

            showToast('Cadastro realizado! Você pode fazer login agora.', 'success');
            document.getElementById('register-form').reset();
            showScreen('login-section');
        } catch (error) {
            showToast(error.message || 'Erro ao registrar', 'error');
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

    const isADM = () => usuarioAtual && usuarioAtual.papel === 'ADM';

    const getUsuario = () => usuarioAtual;

    const atualizarUI = () => {
        const authenticated = isAuthenticated();
        const isAdmin = isADM();

        // Atualizar navbar
        document.getElementById('nav-home').style.display = authenticated ? 'block' : 'none';
        document.getElementById('nav-jogadores').style.display = authenticated ? 'block' : 'none';
        document.getElementById('nav-avaliacao').style.display = isAdmin ? 'block' : 'none';
        document.getElementById('nav-gerar-times').style.display = isAdmin ? 'block' : 'none';
        document.getElementById('nav-historico').style.display = authenticated ? 'block' : 'none';
        document.getElementById('nav-logout').style.display = authenticated ? 'block' : 'none';

        // Atualizar home
        if (authenticated) {
            document.getElementById('welcome-name').textContent = usuarioAtual.nome.split(' ')[0];
            document.getElementById('user-role-info').textContent = isAdmin ?
                'Você é Administrador' :
                'Você é um Jogador';

            document.getElementById('quick-avaliacao').style.display = isAdmin ? 'block' : 'none';
            document.getElementById('quick-gerar').style.display = isAdmin ? 'block' : 'none';
        }
    };

    return {
        init,
        logout,
        isAuthenticated,
        isADM,
        getUsuario,
        atualizarUI,
    };
})();
