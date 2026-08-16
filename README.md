# Front-end — App Jaqueline Vacari (GitHub Pages)

## Estrutura dos arquivos

| Arquivo | O que tem dentro | Quando mexer nele |
|---|---|---|
| `index.html` | Tela de lista/criação de eventos | Mudar layout da tela inicial |
| `evento.html` | Tela de detalhe do evento + checklist | Mudar layout da tela de checklist |
| `css/style.css` | Toda a identidade visual (cores, fontes, componentes) | Ajustar cores, espaçamentos, estilo |
| `js/config.js` | URL da API — **único lugar a editar depois do deploy do backend** | Trocar a URL do Web App |
| `js/api.js` | Única camada que fala com o backend | Nunca deveria precisar mexer |
| `js/ui.js` | Funções de interface reaproveitadas (erro, loading, formatação) | Mudar comportamento de toast/loading |
| `js/eventos.js` | Lógica da tela inicial | Regras da lista/criação de eventos |
| `js/checklist.js` | Lógica da tela de checklist | Regras do checklist |
| `js/pdf.js` | Geração do PDF no navegador | Mudar o layout do relatório em PDF |
| `manifest.json` | Configuração do PWA (nome, ícones, cor) | Trocar nome/ícone do app instalado |
| `service-worker.js` | Cache mínimo pra permitir instalar o PWA | Adicionar arquivo novo ao "shell" |
| `assets/icons/` | Ícones gerados a partir da sua logo | Trocar a logo no futuro |

**Mesma regra do backend:** cada tela (`eventos.js`, `checklist.js`) só cuida da própria tela; quem fala com o servidor é sempre o `api.js`. Se um dia mudar a forma de conectar com o backend, mexe só ali.

## Como publicar no GitHub Pages

1. Crie um repositório novo no GitHub (ex: `jv-eventos-app`)
2. Suba todos esses arquivos mantendo a mesma estrutura de pastas (`css/`, `js/`, `assets/icons/` dentro da raiz do repositório)
3. Vá em **Settings → Pages**
4. Em "Source", selecione a branch (`main`) e a pasta `/root`
5. Salve — o GitHub te dá uma URL tipo `https://seu-usuario.github.io/jv-eventos-app/`

## Antes de usar: 2 coisas obrigatórias

1. **Cole a URL do Apps Script** no `js/config.js`, no lugar de `COLE_AQUI_A_URL_DO_SEU_APP_DA_WEB`
2. **CORS**: o Apps Script Web App, quando publicado com "Quem pode acessar: Qualquer pessoa", já aceita chamadas de qualquer origem — não precisa configurar nada extra. Se aparecer erro de CORS mesmo assim, geralmente é porque o deploy não foi republicado depois de uma atualização (veja o README do backend, seção "Como atualizar").

## Instalar como app no celular/tablet

Depois de publicado no GitHub Pages, é só abrir a URL no navegador do celular/tablet e usar a opção "Adicionar à tela inicial" (Android/Chrome) ou "Adicionar à Tela de Início" (iPhone/Safari) — o manifest.json já está configurado com a logo como ícone.
