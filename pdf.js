/**
 * pdf.js
 * -----------------------------------------------------------------------
 * Só cuida de gerar o PDF do relatório no navegador (usando jsPDF) e
 * disparar o download. Não fala com a API nem mexe na tela — recebe os
 * dados prontos e devolve um arquivo baixado.
 * -----------------------------------------------------------------------
 */

const Pdf = {
  gerar(evento, checklistPorFase) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const corDestaque = [205, 134, 128]; // #CD8680

    let y = 20;

    doc.setFontSize(18);
    doc.setTextColor(...corDestaque);
    doc.text(evento.nome_evento, 15, y);
    y += 8;

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    const dataTexto = evento.data_evento ? new Date(evento.data_evento).toLocaleDateString('pt-BR') : '—';
    doc.text(`Data: ${dataTexto}${evento.local ? '  ·  Local: ' + evento.local : ''}`, 15, y);
    y += 12;

    Object.keys(checklistPorFase).forEach(fase => {
      if (y > 270) { doc.addPage(); y = 20; }

      doc.setFontSize(13);
      doc.setTextColor(...corDestaque);
      doc.text(fase, 15, y);
      y += 7;

      checklistPorFase[fase].forEach(item => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        const marca = item.status === 'Concluído' ? '[x]' : '[ ]';
        doc.text(`${marca}  ${item.tarefa}`, 20, y);
        y += 6;
      });

      y += 4;
    });

    const nomeArquivo = `relatorio-${evento.nome_evento.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    doc.save(nomeArquivo);
  }
};
