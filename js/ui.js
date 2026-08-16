/**
 * ui.js
 * -----------------------------------------------------------------------
 * Funçõezinhas de interface reaproveitadas nas telas (toast de erro,
 * loading, formatação de data, copiar link). Nada de lógica de negócio.
 * -----------------------------------------------------------------------
 */

const UI = {
  mostrarErro(mensagem) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = mensagem;
    toast.classList.add('toast--erro', 'toast--visivel');
    setTimeout(() => toast.classList.remove('toast--visivel'), 4000);
  },

  mostrarSucesso(mensagem) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = mensagem;
    toast.classList.remove('toast--erro');
    toast.classList.add('toast--sucesso', 'toast--visivel');
    setTimeout(() => toast.classList.remove('toast--visivel', 'toast--sucesso'), 3000);
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

  async copiarLink(url) {
    try {
      await navigator.clipboard.writeText(url);
      UI.mostrarSucesso('Link copiado!');
    } catch (erro) {
      UI.mostrarErro('Não deu pra copiar automaticamente — selecione e copie manualmente.');
    }
  },

  // Roda uma ação assíncrona já cuidando de loading + erro, pra não repetir
  // try/catch em toda tela. Passe { silencioso: true } pra não mostrar o
  // spinner de tela cheia (útil em atualizações automáticas de fundo).
  async executar(acaoAsync, opcoes = {}) {
    if (!opcoes.silencioso) UI.mostrarCarregando(true);
    try {
      return await acaoAsync();
    } catch (erro) {
      UI.mostrarErro(erro.message);
      throw erro;
    } finally {
      if (!opcoes.silencioso) UI.mostrarCarregando(false);
    }
  }
};
