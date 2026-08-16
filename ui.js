/**
 * ui.js
 * -----------------------------------------------------------------------
 * Funçõezinhas de interface reaproveitadas nas telas (toast de erro,
 * loading, formatação de data). Nada de lógica de negócio aqui.
 * -----------------------------------------------------------------------
 */

const UI = {
  mostrarErro(mensagem) {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.classList.add('toast--erro', 'toast--visivel');
    setTimeout(() => toast.classList.remove('toast--visivel'), 4000);
  },

  mostrarCarregando(ativo) {
    document.getElementById('loading')?.classList.toggle('loading--visivel', ativo);
  },

  formatarData(valorData) {
    if (!valorData) return '—';
    const data = new Date(valorData);
    if (isNaN(data.getTime())) return valorData;
    return data.toLocaleDateString('pt-BR');
  },

  // Roda uma ação assíncrona já cuidando de loading + erro, pra não repetir
  // try/catch em toda tela.
  async executar(acaoAsync) {
    UI.mostrarCarregando(true);
    try {
      return await acaoAsync();
    } catch (erro) {
      UI.mostrarErro(erro.message);
      throw erro;
    } finally {
      UI.mostrarCarregando(false);
    }
  }
};
