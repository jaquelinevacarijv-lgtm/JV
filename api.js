/**
 * api.js
 * -----------------------------------------------------------------------
 * Única camada que fala com o backend (Apps Script). Nenhum outro arquivo
 * deve usar `fetch` diretamente — sempre passa por aqui. Assim, se um dia
 * a forma de conectar mudar, só mexe neste arquivo.
 * -----------------------------------------------------------------------
 */

const Api = {
  async get(acao, parametros = {}) {
    const query = new URLSearchParams({ acao, ...parametros }).toString();
    const resposta = await fetch(`${CONFIG.API_URL}?${query}`);
    return Api._tratarResposta(resposta);
  },

  async post(acao, dados = {}) {
    const resposta = await fetch(CONFIG.API_URL, {
      method: 'POST',
      // text/plain evita o preflight de CORS que o Apps Script não trata bem —
      // o backend lê e.postData.contents normalmente, não depende do header.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ acao, ...dados })
    });
    return Api._tratarResposta(resposta);
  },

  async _tratarResposta(resposta) {
    const json = await resposta.json();
    if (!json.sucesso) throw new Error(json.erro || 'Erro desconhecido no servidor.');
    return json;
  }
};
