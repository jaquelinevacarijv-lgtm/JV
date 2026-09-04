<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Jaqueline Vacari — Convidados</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500,600;1,400&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="manifest" href="manifest.json">
<style>
  :root{
    --sage-deep:   #7C8B72;
    --sage:        #A9B79E;
    --sage-light:  #E1E8DA;
    --cream:       #FBF9F4;
    --white:       #FFFFFF;
    --ink:         #3B3C32;
    --ink-soft:    #8A8B7C;
    --gold:        #BFA06A;
    --gold-soft:   #F1E9D6;
    --green:       #6E9575;
    --border:      #EAE6DC;
    --shadow:      0 10px 26px rgba(60,64,45,0.07);
    --shadow-hover:0 16px 32px rgba(60,64,45,0.13);
  }

  *{ box-sizing:border-box; margin:0; padding:0; }

  body{
    font-family:'Jost', sans-serif;
    background:var(--cream);
    color:var(--ink);
    min-height:100vh;
  }

  header{
    display:flex;
    align-items:center;
    gap:16px;
    padding:22px 48px;
    border-bottom:1px solid var(--border);
    background:var(--cream);
  }

  .voltar{
    color:var(--sage-deep);
    text-decoration:none;
    font-size:0.86rem;
    display:flex;
    align-items:center;
    gap:6px;
    flex-shrink:0;
  }

  .voltar:hover{ text-decoration:underline; }

  .header-textos{ min-width:0; }

  #nome-evento{
    font-family:'Cormorant Garamond', serif;
    font-weight:600;
    font-size:1.3rem;
    color:var(--ink);
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }

  #info-evento{
    font-size:0.8rem;
    color:var(--ink-soft);
  }

  main{
    max-width:640px;
    margin:0 auto;
    padding:40px 24px 60px;
  }

  h2.secao{
    font-family:'Cormorant Garamond', serif;
    font-weight:600;
    font-size:1.15rem;
    color:var(--sage-deep);
    margin-bottom:14px;
  }

  .painel{
    background:var(--white);
    border:1px solid var(--border);
    border-radius:20px;
    padding:22px 24px;
    margin-bottom:24px;
    box-shadow:var(--shadow);
  }

  #form-convidado-manual{
    display:flex;
    gap:8px;
    flex-wrap:wrap;
  }

  #form-convidado-manual input[name="nome"]{ flex:1; min-width:160px; }
  #form-convidado-manual input[name="mesa"]{ width:90px; }

  input[type="text"]{
    padding:11px 14px;
    border:1px solid var(--border);
    border-radius:10px;
    font-family:'Jost', sans-serif;
    font-size:0.9rem;
    color:var(--ink);
  }

  .btn-primario{
    background:var(--sage-deep);
    color:var(--white);
    border:none;
    padding:11px 20px;
    border-radius:100px;
    font-family:'Jost', sans-serif;
    font-size:0.86rem;
    font-weight:500;
    cursor:pointer;
    white-space:nowrap;
  }

  .btn-primario:hover{ background:#6d7c64; }

  .linha-importar{
    display:flex;
    align-items:center;
    gap:12px;
    margin-top:14px;
    padding-top:14px;
    border-top:1px solid var(--border);
    flex-wrap:wrap;
    font-size:0.86rem;
    color:var(--ink-soft);
  }

  .btn-arquivo{
    background:var(--sage-light);
    color:var(--sage-deep);
    padding:9px 16px;
    border-radius:100px;
    font-size:0.84rem;
    font-weight:500;
    cursor:pointer;
  }

  #input-importar{ display:none; }

  .btn-link{
    background:none;
    border:none;
    color:var(--sage-deep);
    font-size:0.86rem;
    font-weight:500;
    cursor:pointer;
    display:flex;
    align-items:center;
    gap:6px;
    margin-left:auto;
  }

  .lista-topo{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:14px;
  }

  #resumo-lista{
    font-size:0.84rem;
    color:var(--green);
    font-weight:500;
  }

  .texto-vazio{
    color:var(--ink-soft);
    font-size:0.88rem;
    padding:18px 4px;
  }

  .linha-convidado{
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:14px 4px;
    border-bottom:1px solid var(--border);
  }

  .linha-convidado:last-child{ border-bottom:none; }

  .linha-convidado__nome{ font-size:0.92rem; }

  .linha-convidado__mesa{
    font-size:0.78rem;
    color:var(--ink-soft);
    margin-left:8px;
  }

  .linha-convidado__acoes{
    display:flex;
    align-items:center;
    gap:12px;
  }

  .badge{
    padding:5px 12px;
    border-radius:100px;
    font-size:0.72rem;
    font-weight:500;
    white-space:nowrap;
  }

  .badge--presente{ background:var(--sage-light); color:var(--sage-deep); }
  .badge--aguardando{ background:var(--gold-soft); color:#8C6D3E; }

  .botao-remover{
    background:none;
    border:none;
    color:var(--ink-soft);
    cursor:pointer;
    font-size:0.9rem;
  }

  @media (max-width:560px){
    header{ padding:16px 20px; }
    main{ padding:28px 16px 48px; }
  }
</style>
</head>
<body>

  <header>
    <a class="voltar" href="#" id="link-voltar">← Voltar</a>
    <div class="header-textos">
      <div id="nome-evento">Carregando...</div>
      <div id="info-evento"></div>
    </div>
  </header>

  <main>
    <h2 class="secao">Adicionar convidados</h2>
    <div class="painel">
      <form id="form-convidado-manual">
        <input type="text" name="nome" placeholder="Nome do convidado" required>
        <input type="text" name="mesa" placeholder="Mesa">
        <button type="submit" class="btn-primario">+ Adicionar</button>
      </form>

      <div class="linha-importar">
        <label class="btn-arquivo" for="input-importar">📎 Importar planilha (xlsx/csv)</label>
        <input type="file" id="input-importar" accept=".xlsx,.xls,.csv">
        <button type="button" class="btn-link" id="btn-copiar-link-checkin">🔗 Copiar link de check-in</button>
      </div>
    </div>

    <div class="lista-topo">
      <h2 class="secao" style="margin-bottom:0;">Lista de convidados</h2>
      <span id="resumo-lista"></span>
    </div>
    <div class="painel" id="lista-convidados">
      <p class="texto-vazio">Carregando convidados...</p>
    </div>
  </main>

  <script src="js/config.js"></script>
  <script src="js/api.js"></script>
  <script src="js/ui.js"></script>
  <script src="js/convidados.js"></script>
  <script>
    document.getElementById('link-voltar').href =
      `evento.html?id=${new URLSearchParams(window.location.search).get('id') || ''}`;
  </script>
</body>
</html>
