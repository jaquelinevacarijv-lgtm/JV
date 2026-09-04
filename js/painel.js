/**
 * painel.js
 * -----------------------------------------------------------------------
 * Lógica exclusiva do hub do evento (evento.html): busca os dados reais
 * do evento pelo id da URL e preenche o cabeçalho, e monta o link real
 * do card "Convidados". Os outros módulos (Checklist, Menu Degustação
 * etc.) ainda não têm tela própria — ficam marcados como "em breve".
 * -----------------------------------------------------------------------
 */

const Painel = {
  idEvento: new URLSearchParams(window.location.search).get('id'),

  async carregar() {
    if (!Painel.idEvento) {
      UI.mostrarErro('Nenhum evento selecionado.');
      return;
    }

    const { eventos } = await UI.executar(() => Api.get('listarEventos'));
    const evento = eventos.find(e => e.id_evento === Painel.idEvento);

    if (!evento) {
      UI.mostrarErro('Evento não encontrado.');
      return;
    }

    document.getElementById('event-name').textContent = evento.nome_evento;
    document.getElementById('event-meta').innerHTML =
      `${UI.formatarData(evento.data_evento)}${evento.local ? '<span class="divider"></span>' + evento.local : ''}`;

    const linkConvidados = `convidados.html?id=${Painel.idEvento}`;
    document.getElementById('menu-convidados').href = linkConvidados;
    document.getElementById('card-convidados').href = linkConvidados;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Painel.carregar();
});
