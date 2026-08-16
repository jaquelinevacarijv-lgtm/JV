/**
 * checkin.js
 * -----------------------------------------------------------------------
 * Lógica exclusiva da tela pública de check-in (checkin.html), aberta
 * pelo link compartilhado no dia do evento. Qualquer pessoa com o link
 * acessa direto (sem senha) e marca presença; a lista se atualiza
 * sozinha a cada poucos segundos pra refletir o que outras pessoas
 * estão marcando ao mesmo tempo.
 * -----------------------------------------------------------------------
 */

const INTERVALO_ATUALIZACAO_MS = 5000;

const CheckIn = {
  idEvento: new URLSearchParams(window.location.search).get('id'),
  termoBusca: '',
  atualizandoAgora: false,

  async iniciar() {
    if (!CheckIn.idEvento) {
      await CheckIn._carregarSeletorEventos();
      return;
    }

    document.getElementById('tela-selecionar-evento').style.display = 'none';
    document.getElementById('tela-checkin').style.display = 'block';

    await CheckIn._atualizar({ primeiraVez: true });
    setInterval(() => CheckIn._atualizar({}), INTERVALO_ATUALIZACAO_MS);
  },

  // Tela 1: sem ?id na URL — lista os eventos pra escolher qual trabalhar.
  async _carregarSeletorEventos() {
    const { eventos } = await UI.executar(() => Api.get('listarEventos'));
    const container = document.getElementById('lista-selecionar-evento');
    container.innerHTML = '';

    if (eventos.length === 0) {
      container.innerHTML = '<p class="texto-vazio">Nenhum evento cadastrado ainda.</p>';
      return;
    }

    eventos
      .sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao))
      .forEach(evento => {
        const card = document.createElement('a');
        card.href = `checkin.html?id=${evento.id_evento}`;
        card.className = 'card-evento';
        card.innerHTML = `
          <div class="card-evento__topo">
            <h3>${evento.nome_evento}</h3>
          </div>
          <p>${UI.formatarData(evento.data_evento)}${evento.local ? ' · ' + evento.local : ''}</p>
          <div class="resumo-convidados">
            <span class="resumo-convidados__item">👥 ${evento.totalConvidados ?? 0} convidados</span>
          </div>
        `;
        container.appendChild(card);
      });
  },

  async _atualizar({ primeiraVez = false } = {}) {
    if (CheckIn.atualizandoAgora) return;
    CheckIn.atualizandoAgora = true;

    try {
      const executarOpcoes = primeiraVez ? {} : { silencioso: true };
      const [{ eventos }, { convidados }] = await UI.executar(() => Promise.all([
        Api.get('listarEventos'),
        Api.get('listarConvidados', { idEvento: CheckIn.idEvento })
      ]), executarOpcoes);

      const evento = eventos.find(e => e.id_evento === CheckIn.idEvento);
      if (!evento) {
        UI.mostrarErro('Evento não encontrado.');
        return;
      }

      if (primeiraVez) {
        document.getElementById('nome-evento').textContent = evento.nome_evento;
        document.getElementById('info-evento').textContent =
          `${UI.formatarData(evento.data_evento)}${evento.local ? ' · ' + evento.local : ''}`;
      }

      CheckIn._renderizar(convidados);
    } catch (erro) {
      // Falha silenciosa nas atualizações automáticas — não interrompe
      // quem já está usando a tela; o erro já aparece via toast.
    } finally {
      CheckIn.atualizandoAgora = false;
    }
  },

  _renderizar(convidados) {
    const filtrados = CheckIn.termoBusca
      ? convidados.filter(c => c.nome.toLowerCase().includes(CheckIn.termoBusca.toLowerCase()))
      : convidados;

    const total = convidados.length;
    const presentes = convidados.filter(c => c.status === 'Presente').length;
    document.getElementById('contador-presenca').textContent = `${presentes} / ${total} presentes`;

    const container = document.getElementById('lista-checkin');

    if (filtrados.length === 0) {
      container.innerHTML = `<p class="texto-vazio">${convidados.length === 0 ? 'Nenhum convidado cadastrado.' : 'Nenhum convidado encontrado com esse nome.'}</p>`;
      return;
    }

    container.innerHTML = '';
    filtrados
      .slice()
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      .forEach(convidado => {
        const presente = convidado.status === 'Presente';
        const linha = document.createElement('div');
        linha.className = `linha-checkin ${presente ? 'linha-checkin--presente' : ''}`;
        linha.innerHTML = `
          <span class="linha-checkin__info">
            <span class="linha-checkin__nome">${convidado.nome}</span>
            ${convidado.mesa ? `<span class="linha-checkin__mesa">Mesa ${convidado.mesa}</span>` : ''}
          </span>
          <button type="button" class="botao-checkin ${presente ? 'botao-checkin--feito' : ''}">
            ${presente ? '✓ Presente' : 'Fazer check-in'}
          </button>
        `;
        linha.querySelector('.botao-checkin').addEventListener('click', () => {
          CheckIn.alternarPresenca(convidado.id_convidado, linha, presente);
        });
        container.appendChild(linha);
      });
  },

  async alternarPresenca(idConvidado, linhaEl, estavaPresente) {
    // Atualização otimista: pinta a linha na hora, sem esperar o servidor.
    // Isso deixa o toque instantâneo pro usuário; a sincronização real
    // com outros aparelhos continua acontecendo no polling de 5s.
    const ficaPresente = !estavaPresente;
    const botao = linhaEl.querySelector('.botao-checkin');

    linhaEl.classList.toggle('linha-checkin--presente', ficaPresente);
    botao.classList.toggle('botao-checkin--feito', ficaPresente);
    botao.textContent = ficaPresente ? '✓ Presente' : 'Fazer check-in';
    botao.disabled = true;

    const total = parseInt(document.getElementById('contador-presenca').textContent.split(' / ')[1], 10) || 0;
    const presentesAtual = document.querySelectorAll('.linha-checkin--presente').length;
    document.getElementById('contador-presenca').textContent = `${presentesAtual} / ${total} presentes`;

    try {
      await Api.post('alternarPresencaConvidado', { idConvidado });
    } catch (erro) {
      // Deu errado — desfaz visualmente e avisa.
      linhaEl.classList.toggle('linha-checkin--presente', estavaPresente);
      botao.classList.toggle('botao-checkin--feito', estavaPresente);
      botao.textContent = estavaPresente ? '✓ Presente' : 'Fazer check-in';
      UI.mostrarErro('Não foi possível salvar. Tente de novo.');
    } finally {
      botao.disabled = false;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  CheckIn.iniciar();

  document.getElementById('busca-convidado').addEventListener('input', (e) => {
    CheckIn.termoBusca = e.target.value;
    CheckIn._atualizar({});
  });
});
