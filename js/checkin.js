/**
 * checkin.js
 * -----------------------------------------------------------------------
 * Lógica exclusiva da tela pública de check-in (checkin.html), aberta
 * pelo link compartilhado no dia do evento. Qualquer pessoa com o link
 * acessa direto (sem senha) e marca presença; a lista se atualiza
 * sozinha a cada poucos segundos pra refletir o que outras pessoas
 * estão marcando ao mesmo tempo.
 *
 * IMPORTANTE (correção): a lista de convidados agora vive numa variável
 * local (CheckIn.convidados), não só no DOM. O polling de 5s SEMPRE
 * redesenha a partir dela. Enquanto um convidado tem uma marcação em
 * andamento (CheckIn.pendentes), o polling não sobrescreve o status dele
 * com o que vier do servidor — isso evita que uma atualização automática
 * "desfaça" visualmente um clique que ainda não terminou de salvar.
 * -----------------------------------------------------------------------
 */

const INTERVALO_ATUALIZACAO_MS = 5000;

const CheckIn = {
  idEvento: new URLSearchParams(window.location.search).get('id'),
  termoBusca: '',
  atualizandoAgora: false,
  convidados: [],
  pendentes: new Set(), // ids de convidados com uma marcação em andamento

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

      // Funde o que veio do servidor com o cache local: qualquer convidado
      // que está com marcação pendente MANTÉM o status local (otimista) —
      // o servidor ainda não é a fonte da verdade pra ele até a resposta
      // do POST confirmar (ou desfazer, em caso de erro).
      CheckIn.convidados = convidados.map(convidadoServidor => {
        if (CheckIn.pendentes.has(convidadoServidor.id_convidado)) {
          const local = CheckIn.convidados.find(c => c.id_convidado === convidadoServidor.id_convidado);
          if (local) return { ...convidadoServidor, status: local.status };
        }
        return convidadoServidor;
      });

      CheckIn._renderizar();
    } catch (erro) {
      // Falha silenciosa nas atualizações automáticas — não interrompe
      // quem já está usando a tela; o erro já aparece via toast.
    } finally {
      CheckIn.atualizandoAgora = false;
    }
  },

  _renderizar() {
    const convidados = CheckIn.convidados;
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
        const pendente = CheckIn.pendentes.has(convidado.id_convidado);

        const linha = document.createElement('div');
        linha.className = `linha-checkin ${presente ? 'linha-checkin--presente' : ''}`;
        linha.innerHTML = `
          <span class="linha-checkin__info">
            <span class="linha-checkin__nome">${convidado.nome}</span>
            ${convidado.mesa ? `<span class="linha-checkin__mesa">Mesa ${convidado.mesa}</span>` : ''}
          </span>
          <button type="button" class="botao-checkin ${presente ? 'botao-checkin--feito' : ''}" ${pendente ? 'disabled' : ''}>
            ${presente ? '✓ Presente' : 'Fazer check-in'}
          </button>
        `;
        linha.querySelector('.botao-checkin').addEventListener('click', () => {
          CheckIn.alternarPresenca(convidado.id_convidado);
        });
        container.appendChild(linha);
      });
  },

  async alternarPresenca(idConvidado) {
    const convidado = CheckIn.convidados.find(c => c.id_convidado === idConvidado);
    if (!convidado) return;

    const statusAnterior = convidado.status;
    const ficaPresente = statusAnterior !== 'Presente';

    // Atualização otimista: já reflete no cache local e redesenha na hora,
    // sem esperar o servidor. Marca como "pendente" pra o polling (que
    // pode disparar nesse meio-tempo) não sobrescrever com o dado antigo.
    convidado.status = ficaPresente ? 'Presente' : 'Aguardando';
    CheckIn.pendentes.add(idConvidado);
    CheckIn._renderizar();

    try {
      const { status } = await Api.post('alternarPresencaConvidado', { idConvidado });
      // Usa o status que o servidor confirmou como verdade final (cobre
      // o raro caso de dois cliques quase simultâneos no mesmo convidado
      // em aparelhos diferentes).
      convidado.status = status;
    } catch (erro) {
      // Deu errado — desfaz e avisa.
      convidado.status = statusAnterior;
      UI.mostrarErro('Não foi possível salvar. Tente de novo.');
    } finally {
      CheckIn.pendentes.delete(idConvidado);
      CheckIn._renderizar();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  CheckIn.iniciar();

  document.getElementById('busca-convidado').addEventListener('input', (e) => {
    CheckIn.termoBusca = e.target.value;
    CheckIn._renderizar();
  });
});
