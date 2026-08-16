/**
 * convidados.js
 * -----------------------------------------------------------------------
 * Lógica exclusiva da tela de detalhe do evento (evento.html): mostrar a
 * lista de convidados, adicionar (manual/importado), remover, e montar o
 * link público de check-in pra compartilhar no dia do evento. A tela de
 * check-in em si (pra quem recebe o link) fica em checkin.js.
 * -----------------------------------------------------------------------
 */

const Convidados = {
  idEvento: new URLSearchParams(window.location.search).get('id'),

  async carregar() {
    const [{ eventos }, { convidados }] = await UI.executar(() => Promise.all([
      Api.get('listarEventos'),
      Api.get('listarConvidados', { idEvento: Convidados.idEvento })
    ]));

    const evento = eventos.find(e => e.id_evento === Convidados.idEvento);
    if (!evento) {
      UI.mostrarErro('Evento não encontrado.');
      return;
    }

    Convidados._renderizarCabecalho(evento);
    Convidados._renderizarLinkCompartilhar();
    Convidados._renderizarLista(convidados);
  },

  _renderizarCabecalho(evento) {
    document.getElementById('nome-evento').textContent = evento.nome_evento;
    document.getElementById('info-evento').textContent =
      `${UI.formatarData(evento.data_evento)}${evento.local ? ' · ' + evento.local : ''}`;
  },

  _renderizarLinkCompartilhar() {
    const url = new URL('checkin.html', window.location.href);
    url.searchParams.set('id', Convidados.idEvento);
    document.getElementById('link-checkin').value = url.toString();
  },

  _renderizarLista(convidados) {
    const container = document.getElementById('lista-convidados');
    container.innerHTML = '';

    const total = convidados.length;
    const presentes = convidados.filter(c => c.status === 'Presente').length;
    document.getElementById('resumo-lista').textContent =
      total === 0 ? '' : `${presentes} de ${total} presente${total === 1 ? '' : 's'}`;

    if (total === 0) {
      container.innerHTML = '<p class="texto-vazio">Nenhum convidado ainda. Adicione um por um ou importe uma planilha acima.</p>';
      return;
    }

    convidados
      .slice()
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      .forEach(convidado => {
        const linha = document.createElement('div');
        linha.className = 'linha-convidado';
        linha.innerHTML = `
          <div class="linha-convidado__info">
            <span class="linha-convidado__nome">${convidado.nome}</span>
            ${convidado.mesa ? `<span class="linha-convidado__mesa">Mesa ${convidado.mesa}</span>` : ''}
          </div>
          <div class="linha-convidado__acoes">
            <span class="badge badge--${convidado.status === 'Presente' ? 'presente' : 'aguardando'}">
              ${convidado.status === 'Presente' ? '✓ Presente' : 'Aguardando'}
            </span>
            <button type="button" class="botao-remover" data-id="${convidado.id_convidado}" aria-label="Remover convidado">✕</button>
          </div>
        `;
        linha.querySelector('.botao-remover').addEventListener('click', () => {
          Convidados.remover(convidado.id_convidado, convidado.nome);
        });
        container.appendChild(linha);
      });
  },

  async adicionarManual(nome, mesa) {
    await UI.executar(() => Api.post('adicionarConvidadosManual', {
      idEvento: Convidados.idEvento,
      convidados: [{ nome, mesa }]
    }));
    Convidados.carregar();
  },

  async importarArquivo(arquivo) {
    const conteudoBase64 = await Convidados._arquivoParaBase64(arquivo);
    await UI.executar(() => Api.post('importarConvidados', {
      idEvento: Convidados.idEvento,
      nomeArquivo: arquivo.name,
      mimeType: arquivo.type,
      conteudoBase64
    }));
    Convidados.carregar();
  },

  async remover(idConvidado, nome) {
    if (!confirm(`Remover "${nome}" da lista de convidados?`)) return;
    await UI.executar(() => Api.post('removerConvidado', { idConvidado }));
    Convidados.carregar();
  },

  _arquivoParaBase64(arquivo) {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(leitor.result.split(',')[1]);
      leitor.onerror = reject;
      leitor.readAsDataURL(arquivo);
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Convidados.carregar();

  document.getElementById('form-convidado-manual').addEventListener('submit', (e) => {
    e.preventDefault();
    const dados = new FormData(e.target);
    Convidados.adicionarManual(dados.get('nome'), dados.get('mesa'));
    e.target.reset();
  });

  document.getElementById('input-importar').addEventListener('change', (e) => {
    if (e.target.files[0]) Convidados.importarArquivo(e.target.files[0]);
  });

  document.getElementById('btn-copiar-link').addEventListener('click', () => {
    UI.copiarLink(document.getElementById('link-checkin').value);
  });
});
