/**
 * checklist.js
 * -----------------------------------------------------------------------
 * Lógica exclusiva da tela de detalhe do evento (evento.html): mostrar o
 * checklist, adicionar itens (manual/modelo/importado), marcar concluído.
 * A geração do PDF fica em pdf.js — este arquivo só chama Pdf.gerar().
 * -----------------------------------------------------------------------
 */

const Checklist = {
  idEvento: new URLSearchParams(window.location.search).get('id'),

  async carregar() {
    const [{ eventos }, { itens }] = await UI.executar(() => Promise.all([
      Api.get('listarEventos'),
      Api.get('listarItens', { idEvento: Checklist.idEvento })
    ]));

    const evento = eventos.find(e => e.id_evento === Checklist.idEvento);
    if (!evento) {
      UI.mostrarErro('Evento não encontrado.');
      return;
    }

    Checklist._renderizarCabecalho(evento);
    Checklist._renderizarItens(itens);
    Checklist._controlarAcoesPorStatus(evento);
  },

  _renderizarCabecalho(evento) {
    document.getElementById('nome-evento').textContent = evento.nome_evento;
    document.getElementById('info-evento').textContent =
      `${UI.formatarData(evento.data_evento)}${evento.local ? ' · ' + evento.local : ''}`;
  },

  _renderizarItens(itens) {
    const container = document.getElementById('lista-checklist');
    container.innerHTML = '';

    if (itens.length === 0) {
      container.innerHTML = '<p class="texto-vazio">Nenhuma tarefa ainda. Use uma das opções acima.</p>';
      return;
    }

    const porFase = {};
    itens.forEach(item => {
      if (!porFase[item.fase]) porFase[item.fase] = [];
      porFase[item.fase].push(item);
    });

    Object.keys(porFase).forEach(fase => {
      const bloco = document.createElement('div');
      bloco.className = 'fase-bloco';
      bloco.innerHTML = `<h4>${fase}</h4>`;

      porFase[fase].forEach(item => {
        const linha = document.createElement('label');
        linha.className = 'item-checklist';
        linha.innerHTML = `
          <input type="checkbox" ${item.status === 'Concluído' ? 'checked' : ''} data-id="${item.id_item}">
          <span>${item.tarefa}</span>
        `;
        linha.querySelector('input').addEventListener('change', (e) => {
          Checklist.alternarStatus(e.target.dataset.id);
        });
        bloco.appendChild(linha);
      });

      container.appendChild(bloco);
    });
  },

  _controlarAcoesPorStatus(evento) {
    const finalizado = evento.status === 'Finalizado';
    document.getElementById('acoes-checklist').style.display = finalizado ? 'none' : 'flex';
    document.getElementById('btn-finalizar').style.display = finalizado ? 'none' : 'inline-flex';
    if (finalizado) {
      document.getElementById('aviso-finalizado').style.display = 'block';
    }
  },

  async alternarStatus(idItem) {
    await UI.executar(() => Api.post('alternarStatusItem', { idItem }));
    Checklist.carregar();
  },

  async adicionarManual(fase, tarefa) {
    await UI.executar(() => Api.post('adicionarItemManual', { idEvento: Checklist.idEvento, fase, tarefa }));
    Checklist.carregar();
  },

  async usarModeloPadrao() {
    await UI.executar(() => Api.post('usarChecklistModelo', { idEvento: Checklist.idEvento }));
    Checklist.carregar();
  },

  async importarArquivo(arquivo) {
    const conteudoBase64 = await Checklist._arquivoParaBase64(arquivo);
    await UI.executar(() => Api.post('importarChecklist', {
      idEvento: Checklist.idEvento,
      nomeArquivo: arquivo.name,
      mimeType: arquivo.type,
      conteudoBase64
    }));
    Checklist.carregar();
  },

  _arquivoParaBase64(arquivo) {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(leitor.result.split(',')[1]);
      leitor.onerror = reject;
      leitor.readAsDataURL(arquivo);
    });
  },

  async finalizarEExportar() {
    if (!confirm('Isso vai gerar o PDF e apagar o checklist deste evento da planilha. Confirma?')) return;

    const dados = await UI.executar(() => Api.get('relatorioEvento', { idEvento: Checklist.idEvento }));
    Pdf.gerar(dados.evento, dados.checklistPorFase);

    await UI.executar(() => Api.post('finalizarEvento', { idEvento: Checklist.idEvento }));
    Checklist.carregar();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Checklist.carregar();

  document.getElementById('form-item-manual').addEventListener('submit', (e) => {
    e.preventDefault();
    const dados = new FormData(e.target);
    Checklist.adicionarManual(dados.get('fase'), dados.get('tarefa'));
    e.target.reset();
  });

  document.getElementById('btn-modelo-padrao').addEventListener('click', () => {
    Checklist.usarModeloPadrao();
  });

  document.getElementById('input-importar').addEventListener('change', (e) => {
    if (e.target.files[0]) Checklist.importarArquivo(e.target.files[0]);
  });

  document.getElementById('btn-finalizar').addEventListener('click', () => {
    Checklist.finalizarEExportar();
  });
});
