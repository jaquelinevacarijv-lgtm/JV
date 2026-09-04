/**
 * eventos.js
 * -----------------------------------------------------------------------
 * Lógica exclusiva da tela inicial (index.html): listar eventos (com
 * resumo de convidados) e criar um evento novo, já com a lista de
 * convidados (digitada à mão ou importada de planilha). Não sabe nada
 * sobre a tela de detalhe/check-in — isso é lá em convidados.js
 * -----------------------------------------------------------------------
 */

const Eventos = {
  // Linhas de convidados adicionadas manualmente no modal de criação,
  // antes de o evento existir no servidor.
  linhasConvidadosNovoEvento: [],
  arquivoImportadoNovoEvento: null,

  async carregarLista() {
    const { eventos } = await UI.executar(() => Api.get('listarEventos'));
    Eventos._renderizarLista(eventos);
  },

  _renderizarLista(eventos) {
    const container = document.getElementById('lista-eventos');
    container.innerHTML = '';

    if (eventos.length === 0) {
      container.innerHTML = '<p class="texto-vazio">Nenhum evento cadastrado ainda. Toque em "+ Novo evento" pra começar.</p>';
      return;
    }

    eventos
      .sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao))
      .forEach(evento => {
        const total = evento.totalConvidados ?? 0;
        const presentes = evento.totalPresentes ?? 0;

        const card = document.createElement('a');
        card.href = `evento.html?id=${evento.id_evento}`;
        card.className = 'card-evento';
        card.innerHTML = `
          <div class="card-evento__topo">
            <h3>${evento.nome_evento}</h3>
            <span class="badge badge--${evento.status === 'Finalizado' ? 'finalizado' : 'ativo'}">
              ${evento.status || 'Ativo'}
            </span>
          </div>
          <p>${UI.formatarData(evento.data_evento)}${evento.local ? ' · ' + evento.local : ''}</p>
          <div class="resumo-convidados">
            <span class="resumo-convidados__item">👥 ${total} convidado${total === 1 ? '' : 's'}</span>
            <span class="resumo-convidados__item resumo-convidados__item--presente">✓ ${presentes} presente${presentes === 1 ? '' : 's'}</span>
          </div>
        `;
        container.appendChild(card);
      });
  },

  async criar(nomeEvento, dataEvento, local) {
    const { evento } = await UI.executar(() => Api.post('criarEvento', { nomeEvento, dataEvento, local }));

    // Depois que o evento existe, envia a lista de convidados — manual
    // e/ou importada, o que tiver sido preenchido no modal.
    if (Eventos.linhasConvidadosNovoEvento.length > 0) {
      await UI.executar(() => Api.post('adicionarConvidadosManual', {
        idEvento: evento.id_evento,
        convidados: Eventos.linhasConvidadosNovoEvento
      }));
    }

    if (Eventos.arquivoImportadoNovoEvento) {
      const conteudoBase64 = await Eventos._arquivoParaBase64(Eventos.arquivoImportadoNovoEvento);
      await UI.executar(() => Api.post('importarConvidados', {
        idEvento: evento.id_evento,
        nomeArquivo: Eventos.arquivoImportadoNovoEvento.name,
        mimeType: Eventos.arquivoImportadoNovoEvento.type,
        conteudoBase64
      }));
    }

    window.location.href = `evento.html?id=${evento.id_evento}`;
  },

  _arquivoParaBase64(arquivo) {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(leitor.result.split(',')[1]);
      leitor.onerror = reject;
      leitor.readAsDataURL(arquivo);
    });
  },

  // --- Linhas de convidados dentro do modal de criação ---------------

  adicionarLinhaConvidado(nome = '', mesa = '') {
    const id = `novo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    Eventos.linhasConvidadosNovoEvento.push({ id, nome, mesa });
    Eventos._renderizarLinhasConvidados();
  },

  removerLinhaConvidado(id) {
    Eventos.linhasConvidadosNovoEvento = Eventos.linhasConvidadosNovoEvento.filter(l => l.id !== id);
    Eventos._renderizarLinhasConvidados();
  },

  _renderizarLinhasConvidados() {
    const container = document.getElementById('linhas-convidados');
    container.innerHTML = '';

    Eventos.linhasConvidadosNovoEvento.forEach(linha => {
      const div = document.createElement('div');
      div.className = 'linha-convidado-novo';
      div.innerHTML = `
        <input type="text" placeholder="Nome do convidado" value="${linha.nome}" data-campo="nome" data-id="${linha.id}">
        <input type="text" placeholder="Mesa" value="${linha.mesa}" data-campo="mesa" data-id="${linha.id}" class="linha-convidado-novo__mesa">
        <button type="button" class="botao-remover" data-id="${linha.id}" aria-label="Remover convidado">✕</button>
      `;
      container.appendChild(div);
    });

    container.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', (e) => {
        const linha = Eventos.linhasConvidadosNovoEvento.find(l => l.id === e.target.dataset.id);
        if (linha) linha[e.target.dataset.campo] = e.target.value;
      });
    });

    container.querySelectorAll('.botao-remover').forEach(botao => {
      botao.addEventListener('click', (e) => {
        Eventos.removerLinhaConvidado(e.target.dataset.id);
      });
    });
  },

  resetarModal() {
    Eventos.linhasConvidadosNovoEvento = [];
    Eventos.arquivoImportadoNovoEvento = null;
    document.getElementById('linhas-convidados').innerHTML = '';
    document.getElementById('input-importar-novo-evento').value = '';
    document.getElementById('nome-arquivo-selecionado').textContent = '';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Eventos.carregarLista();

  const form = document.getElementById('form-novo-evento');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const dados = new FormData(form);
    Eventos.criar(dados.get('nomeEvento'), dados.get('dataEvento'), dados.get('local'));
  });

  document.getElementById('btn-abrir-modal').addEventListener('click', () => {
    Eventos.resetarModal();
    document.getElementById('modal-novo-evento').classList.add('modal--visivel');
  });
  document.getElementById('btn-fechar-modal').addEventListener('click', () => {
    document.getElementById('modal-novo-evento').classList.remove('modal--visivel');
    form.reset();
  });

  document.getElementById('btn-add-linha-convidado').addEventListener('click', () => {
    Eventos.adicionarLinhaConvidado();
  });

  document.getElementById('input-importar-novo-evento').addEventListener('change', (e) => {
    Eventos.arquivoImportadoNovoEvento = e.target.files[0] || null;
    document.getElementById('nome-arquivo-selecionado').textContent =
      Eventos.arquivoImportadoNovoEvento ? `📎 ${Eventos.arquivoImportadoNovoEvento.name}` : '';
  });
});
