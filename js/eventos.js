/**
 * eventos.js
 * -----------------------------------------------------------------------
 * Lógica exclusiva da tela inicial (index.html): listar eventos e criar
 * um evento novo. Não sabe nada sobre checklist — isso é lá em checklist.js
 * -----------------------------------------------------------------------
 */

const Eventos = {
  async carregarLista() {
    const { eventos } = await UI.executar(() => Api.get('listarEventos'));
    Eventos._renderizarLista(eventos);
  },

  _renderizarLista(eventos) {
    const container = document.getElementById('lista-eventos');
    container.innerHTML = '';

    if (eventos.length === 0) {
      container.innerHTML = '<p class="texto-vazio">Nenhum evento cadastrado ainda.</p>';
      return;
    }

    eventos
      .sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao))
      .forEach(evento => {
        const card = document.createElement('a');
        card.href = `evento.html?id=${evento.id_evento}`;
        card.className = 'card-evento';
        card.innerHTML = `
          <div class="card-evento__topo">
            <h3>${evento.nome_evento}</h3>
            <span class="badge badge--${evento.status === 'Finalizado' ? 'finalizado' : 'ativo'}">
              ${evento.status}
            </span>
          </div>
          <p>${UI.formatarData(evento.data_evento)}${evento.local ? ' · ' + evento.local : ''}</p>
        `;
        container.appendChild(card);
      });
  },

  async criar(nomeEvento, dataEvento, local) {
    const { evento } = await UI.executar(() => Api.post('criarEvento', { nomeEvento, dataEvento, local }));
    window.location.href = `evento.html?id=${evento.id_evento}`;
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
    document.getElementById('modal-novo-evento').classList.add('modal--visivel');
  });
  document.getElementById('btn-fechar-modal').addEventListener('click', () => {
    document.getElementById('modal-novo-evento').classList.remove('modal--visivel');
  });
});
