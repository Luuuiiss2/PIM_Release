document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'autoflow_colaboradores';
    const ITENS_POR_PAGINA = 10;
    let paginaAtual = 1;

    // Dados iniciais de exemplo
    const dadosIniciais = [
        {
            id: 1,
            nome: 'Admin Principal',
            email: 'admin@autoflow.com',
            cargo: 'Administrador',
            status: 'Ativo',
            senha: '********',
            observacao: 'Conta master do sistema.'
        },
        {
            id: 2,
            nome: 'Carlos Eduardo Lima',
            email: 'carlos.lima@autoflow.com',
            cargo: 'Gerente',
            status: 'Ativo',
            senha: '********',
            observacao: 'Responsável pela aprovação de pedidos de reposição.'
        },
        {
            id: 3,
            nome: 'Mariana Souza',
            email: 'mariana.souza@autoflow.com',
            cargo: 'Estoquista',
            status: 'Ativo',
            senha: '********',
            observacao: ''
        },
        {
            id: 4,
            nome: 'Lucas Fernandes',
            email: 'lucas.vendas@autoflow.com',
            cargo: 'Vendedor',
            status: 'Ativo',
            senha: '********',
            observacao: ''
        },
        {
            id: 5,
            nome: 'Fernanda Alves',
            email: 'fernanda.alves@autoflow.com',
            cargo: 'Estoquista',
            status: 'Inativo',
            senha: '********',
            observacao: 'Acesso suspenso temporariamente (férias).'
        }
    ];

    function carregarColaboradores() {
        const salvos = localStorage.getItem(STORAGE_KEY);
        if (!salvos) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosIniciais));
            return [...dadosIniciais];
        }
        return JSON.parse(salvos);
    }

    function salvarColaboradores(lista) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
    }

    let colaboradores = carregarColaboradores();

    // Elementos da Tabela e Filtros
    const tabelaBody = document.getElementById('tabelaColaboradores');
    const buscaGlobal = document.getElementById('buscaGlobalColaborador');
    const filtroCargo = document.getElementById('filtroCargo');
    const filtroStatus = document.getElementById('filtroStatus');
    const paginacaoInfo = document.getElementById('paginacaoInfo');
    const paginacaoControles = document.getElementById('paginacaoControles');

    // Elementos Modal Colaborador (Criar / Editar)
    const modalColaborador = document.getElementById('modalColaborador');
    const formColaborador = document.getElementById('formColaborador');
    const modalTitulo = document.getElementById('modalTitulo');
    const modalSubtitulo = document.getElementById('modalSubtitulo');
    const btnSalvarTexto = document.getElementById('btnSalvarTexto');
    const inputId = document.getElementById('colaboradorId');
    const inputNome = document.getElementById('inputNome');
    const inputEmail = document.getElementById('inputEmail');
    const inputCargo = document.getElementById('inputCargo');
    const inputStatus = document.getElementById('inputStatus');
    const grupoSenhasCadastro = document.getElementById('grupoSenhasCadastro');
    const inputSenha = document.getElementById('inputSenha');
    const inputConfirmarSenha = document.getElementById('inputConfirmarSenha');
    const erroSenhaCadastro = document.getElementById('erroSenhaCadastro');

    // Elementos Modal Modificar Senha
    const modalSenha = document.getElementById('modalSenha');
    const formModificarSenha = document.getElementById('formModificarSenha');
    const senhaColaboradorId = document.getElementById('senhaColaboradorId');
    const senhaColaboradorNome = document.getElementById('senhaColaboradorNome');
    const novaSenhaInput = document.getElementById('novaSenhaInput');
    const confirmarNovaSenhaInput = document.getElementById('confirmarNovaSenhaInput');
    const erroNovaSenha = document.getElementById('erroNovaSenha');

    // Elementos Modal Observação
    const modalObservacao = document.getElementById('modalObservacao');
    const formObservacao = document.getElementById('formObservacao');
    const obsColaboradorId = document.getElementById('obsColaboradorId');
    const obsColaboradorNome = document.getElementById('obsColaboradorNome');
    const inputObservacao = document.getElementById('inputObservacao');

    // Gera iniciais para o avatar (Ex: "Carlos Eduardo" -> "CE")
    function gerarIniciais(nome) {
        const partes = nome.trim().split(' ').filter(Boolean);
        if (partes.length === 0) return 'CL';
        if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
        return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }

    function obterColaboradoresFiltrados() {
        const termo = buscaGlobal.value.trim().toLowerCase();
        const cargo = filtroCargo.value;
        const status = filtroStatus.value;

        return colaboradores.filter(c => {
            const matchBusca =
                !termo ||
                c.nome.toLowerCase().includes(termo) ||
                c.email.toLowerCase().includes(termo) ||
                c.cargo.toLowerCase().includes(termo);

            const matchCargo = !cargo || c.cargo === cargo;
            const matchStatus = !status || c.status === status;

            return matchBusca && matchCargo && matchStatus;
        });
    }

    function renderizarTabela() {
        const filtrados = obterColaboradoresFiltrados();
        const totalItens = filtrados.length;
        const totalPaginas = Math.max(1, Math.ceil(totalItens / ITENS_POR_PAGINA));

        if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;

        const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
        const fim = inicio + ITENS_POR_PAGINA;
        const itensPagina = filtrados.slice(inicio, fim);

        tabelaBody.innerHTML = '';

        if (itensPagina.length === 0) {
            tabelaBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 36px; color: #6b7280;">
                        Nenhum colaborador encontrado com os filtros selecionados.
                    </td>
                </tr>
            `;
        } else {
            itensPagina.forEach(c => {
                const temObs = c.observacao && c.observacao.trim() !== '';
                const statusClass = c.status === 'Ativo' ? 'status-ativo' : 'status-inativo';
                const tr = document.createElement('tr');

                tr.innerHTML = `
                    <td>
                        <div class="colaborador-info-cell">
                            <div class="colaborador-avatar">${gerarIniciais(c.nome)}</div>
                            <div class="colaborador-nome-wrapper">
                                <span class="colaborador-nome-titulo">${c.nome}</span>
                                ${temObs ? `<span class="badge-obs-ativa" title="${c.observacao}">Com observação</span>` : ''}
                            </div>
                        </div>
                    </td>
                    <td>${c.email}</td>
                    <td>${c.cargo}</td>
                    <td>
                        <span class="status-badge ${statusClass}">${c.status}</span>
                    </td>
                    <td>
                        <div class="acoes-cell">
                            <!-- Botão Observação -->
                            <button type="button" class="btn-acao-icon btn-obs ${temObs ? 'tem-obs' : ''}" 
                                data-id="${c.id}" title="${temObs ? 'Ver/Editar observação' : 'Adicionar observação'}">
                                <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                                    <path d="M3 3.5H15C15.5523 3.5 16 3.94772 16 4.5V12.5C16 13.0523 15.5523 13.5 15 13.5H6L2.5 16V4.5C2.5 3.94772 2.94772 3.5 3.5 3.5Z" 
                                        stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M6 7.5H12M6 10.5H9.5" stroke="#374151" stroke-width="1.5" stroke-linecap="round"/>
                                </svg>
                            </button>

                            <!-- Botão Modificar Senha -->
                            <button type="button" class="btn-acao-icon btn-senha" data-id="${c.id}" title="Modificar senha">
                                <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                                    <rect x="3" y="8" width="12" height="8" rx="2" stroke="#2563eb" stroke-width="1.5" />
                                    <path d="M6 8V5.5C6 3.84315 7.34315 2.5 9 2.5C10.6569 2.5 12 3.84315 12 5.5V8"
                                        stroke="#2563eb" stroke-width="1.5" stroke-linecap="round" />
                                </svg>
                            </button>

                            <!-- Botão Editar Dados -->
                            <button type="button" class="btn-acao-icon btn-editar" data-id="${c.id}" title="Editar colaborador">
                                <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                                    <path d="M10.5 3.5L14.5 7.5M2.5 15.5H6.5L15 7C15.5523 6.44772 15.5523 5.55228 15 5L13 3C12.4477 2.44772 11.5523 2.44772 11 3L2.5 11.5V15.5Z" 
                                        stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>

                            <!-- Botão Excluir -->
                            <button type="button" class="btn-acao-icon btn-excluir" data-id="${c.id}" title="Excluir colaborador">
                                <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
                                    <path d="M3 5H15M6.5 5V3.5C6.5 2.94772 6.94772 2.5 7.5 2.5H10.5C11.0523 2.5 11.5 2.94772 11.5 3.5V5M4.5 5L5.2 14.5C5.24 15.05 5.7 15.5 6.25 15.5H11.75C12.3 15.5 12.76 15.05 12.8 14.5L13.5 5" 
                                        stroke="#bf2626" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </td>
                `;
                tabelaBody.appendChild(tr);
            });
        }

        const mostrandoDe = totalItens === 0 ? 0 : inicio + 1;
        const mostrandoAte = Math.min(fim, totalItens);
        paginacaoInfo.textContent = `Mostrando ${mostrandoDe} a ${mostrandoAte} de ${totalItens} resultados`;

        renderizarControlesPaginacao(totalPaginas);
    }

    function renderizarControlesPaginacao(totalPaginas) {
        paginacaoControles.innerHTML = '';

        const btnAnterior = document.createElement('button');
        btnAnterior.className = 'page-btn';
        btnAnterior.textContent = '<';
        btnAnterior.disabled = paginaAtual === 1;
        btnAnterior.onclick = () => {
            if (paginaAtual > 1) {
                paginaAtual--;
                renderizarTabela();
            }
        };
        paginacaoControles.appendChild(btnAnterior);

        for (let i = 1; i <= totalPaginas; i++) {
            const btn = document.createElement('button');
            btn.className = `page-btn ${i === paginaAtual ? 'active' : ''}`;
            btn.textContent = i;
            btn.onclick = () => {
                paginaAtual = i;
                renderizarTabela();
            };
            paginacaoControles.appendChild(btn);
        }

        const btnProximo = document.createElement('button');
        btnProximo.className = 'page-btn';
        btnProximo.textContent = '>';
        btnProximo.disabled = paginaAtual === totalPaginas;
        btnProximo.onclick = () => {
            if (paginaAtual < totalPaginas) {
                paginaAtual++;
                renderizarTabela();
            }
        };
        paginacaoControles.appendChild(btnProximo);
    }

    // ==========================================
    // CONTROLE DOS MODAIS
    // ==========================================

    function abrirModalNovo() {
        formColaborador.reset();
        inputId.value = '';
        modalTitulo.textContent = 'Novo colaborador';
        modalSubtitulo.textContent = 'Preencha os dados abaixo para criar o acesso de um colaborador.';
        btnSalvarTexto.textContent = 'Criar colaborador';

        // Exibe e exige senhas no cadastro
        grupoSenhasCadastro.classList.remove('hidden');
        inputSenha.required = true;
        inputConfirmarSenha.required = true;
        erroSenhaCadastro.classList.add('hidden');

        modalColaborador.classList.remove('hidden');
    }

    function abrirModalEditar(id) {
        const colab = colaboradores.find(c => c.id === id);
        if (!colab) return;

        inputId.value = colab.id;
        inputNome.value = colab.nome;
        inputEmail.value = colab.email;
        inputCargo.value = colab.cargo;
        inputStatus.value = colab.status;

        modalTitulo.textContent = 'Editar colaborador';
        modalSubtitulo.textContent = 'Atualize os dados cadastrais e o cargo deste colaborador.';
        btnSalvarTexto.textContent = 'Salvar alterações';

        // Oculta campos de senha na edição (há um botão próprio para modificar senha)
        grupoSenhasCadastro.classList.add('hidden');
        inputSenha.required = false;
        inputConfirmarSenha.required = false;
        erroSenhaCadastro.classList.add('hidden');

        modalColaborador.classList.remove('hidden');
    }

    function abrirModalModificarSenha(id) {
        const colab = colaboradores.find(c => c.id === id);
        if (!colab) return;

        formModificarSenha.reset();
        senhaColaboradorId.value = colab.id;
        senhaColaboradorNome.textContent = `Colaborador: ${colab.nome} (${colab.email})`;
        erroNovaSenha.classList.add('hidden');
        modalSenha.classList.remove('hidden');
    }

    function abrirModalObservacao(id) {
        const colab = colaboradores.find(c => c.id === id);
        if (!colab) return;

        obsColaboradorId.value = colab.id;
        obsColaboradorNome.textContent = `Colaborador: ${colab.nome}`;
        inputObservacao.value = colab.observacao || '';
        modalObservacao.classList.remove('hidden');
    }

    function excluirColaborador(id) {
        const colab = colaboradores.find(c => c.id === id);
        if (!colab) return;

        if (confirm(`Deseja realmente excluir o colaborador "${colab.nome}"?`)) {
            colaboradores = colaboradores.filter(c => c.id !== id);
            salvarColaboradores(colaboradores);
            renderizarTabela();
        }
    }

    // Salvar Novo Colaborador ou Edição
    formColaborador.addEventListener('submit', (e) => {
        e.preventDefault();
        const idExistente = inputId.value ? Number(inputId.value) : null;

        if (!idExistente) {
            // Validação de senha igual à tela de Criar Nova Conta
            if (inputSenha.value !== inputConfirmarSenha.value) {
                erroSenhaCadastro.classList.remove('hidden');
                return;
            }
            erroSenhaCadastro.classList.add('hidden');

            const novoColab = {
                id: Date.now(),
                nome: inputNome.value.trim(),
                email: inputEmail.value.trim(),
                cargo: inputCargo.value,
                status: inputStatus.value,
                senha: inputSenha.value,
                observacao: ''
            };

            colaboradores.unshift(novoColab);
            paginaAtual = 1;
        } else {
            colaboradores = colaboradores.map(c =>
                c.id === idExistente
                    ? {
                          ...c,
                          nome: inputNome.value.trim(),
                          email: inputEmail.value.trim(),
                          cargo: inputCargo.value,
                          status: inputStatus.value
                      }
                    : c
            );
        }

        salvarColaboradores(colaboradores);
        modalColaborador.classList.add('hidden');
        renderizarTabela();
    });

    // Salvar Nova Senha
    formModificarSenha.addEventListener('submit', (e) => {
        e.preventDefault();

        if (novaSenhaInput.value !== confirmarNovaSenhaInput.value) {
            erroNovaSenha.classList.remove('hidden');
            return;
        }
        erroNovaSenha.classList.add('hidden');

        const id = Number(senhaColaboradorId.value);
        colaboradores = colaboradores.map(c =>
            c.id === id ? { ...c, senha: novaSenhaInput.value } : c
        );

        salvarColaboradores(colaboradores);
        modalSenha.classList.add('hidden');
        alert('Senha atualizada com sucesso!');
    });

    // Salvar Observação
    formObservacao.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = Number(obsColaboradorId.value);
        const textoObs = inputObservacao.value.trim();

        colaboradores = colaboradores.map(c =>
            c.id === id ? { ...c, observacao: textoObs } : c
        );

        salvarColaboradores(colaboradores);
        modalObservacao.classList.add('hidden');
        renderizarTabela();
    });

    // Botões de mostrar/ocultar senha (olho)
    document.querySelectorAll('.btn-toggle-eye').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                btn.style.opacity = '0.55';
            } else {
                input.type = 'password';
                btn.style.opacity = '1';
            }
        });
    });

    // Delegação de eventos nos botões de ação da tabela
    tabelaBody.addEventListener('click', (e) => {
        const btnObs = e.target.closest('.btn-obs');
        const btnSenha = e.target.closest('.btn-senha');
        const btnEditar = e.target.closest('.btn-editar');
        const btnExcluir = e.target.closest('.btn-excluir');

        if (btnObs) abrirModalObservacao(Number(btnObs.dataset.id));
        if (btnSenha) abrirModalModificarSenha(Number(btnSenha.dataset.id));
        if (btnEditar) abrirModalEditar(Number(btnEditar.dataset.id));
        if (btnExcluir) excluirColaborador(Number(btnExcluir.dataset.id));
    });

    // Abertura e fechamento dos modais
    document.getElementById('btnNovoColaborador').addEventListener('click', abrirModalNovo);
    document.getElementById('btnFecharModalColaborador').addEventListener('click', () => modalColaborador.classList.add('hidden'));
    document.getElementById('btnCancelarColaborador').addEventListener('click', () => modalColaborador.classList.add('hidden'));

    document.getElementById('btnFecharModalSenha').addEventListener('click', () => modalSenha.classList.add('hidden'));
    document.getElementById('btnCancelarSenha').addEventListener('click', () => modalSenha.classList.add('hidden'));

    document.getElementById('btnFecharModalObs').addEventListener('click', () => modalObservacao.classList.add('hidden'));
    document.getElementById('btnCancelarObs').addEventListener('click', () => modalObservacao.classList.add('hidden'));

    [modalColaborador, modalSenha, modalObservacao].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    });

    // Filtros em tempo real
    [buscaGlobal, filtroCargo, filtroStatus].forEach(el => {
        el.addEventListener('input', () => {
            paginaAtual = 1;
            renderizarTabela();
        });
        el.addEventListener('change', () => {
            paginaAtual = 1;
            renderizarTabela();
        });
    });

    // Inicializa a listagem
    renderizarTabela();
});