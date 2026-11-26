const turma = [
  { nome: "Ana Souza", media: 8.5 },
  { nome: "Bruno Lima", media: 5.2 },
  { nome: "Camila Rocha", media: 9.0 }
];

const form = document.querySelector("#form-aluno");
const campoNome = document.querySelector("#nome");
const campoNota = document.querySelector("#nota");
const busca = document.querySelector("#busca");
const corpoTabela = document.querySelector("#corpo-tabela");
const mensagemForm = document.querySelector("#mensagem-form");
const avisoBusca = document.querySelector("#aviso-busca");
const totalAlunos = document.querySelector("#total-alunos");
const totalAprovados = document.querySelector("#total-aprovados");
const notaMinima = 6;

function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

function formatarMedia(media) {
  return media.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}

function removerAluno(aluno) {
  const posicao = turma.indexOf(aluno);
  if (posicao === -1) {
    return;
  }

  turma.splice(posicao, 1);
  filtrarTurma();
  avisoBusca.textContent = aluno.nome + " foi removido da turma.";
}

function criarCelula(texto, classe) {
  const celula = document.createElement("td");
  celula.textContent = texto;
  if (classe) {
    celula.className = classe;
  }
  return celula;
}

function mostrarTurma(alunos) {
  const lista = alunos || turma;
  corpoTabela.replaceChildren();

  totalAlunos.textContent = String(turma.length);
  totalAprovados.textContent = String(
    turma.filter(function (aluno) {
      return aluno.media >= notaMinima;
    }).length
  );

  if (lista.length === 0) {
    const linhaVazia = document.createElement("tr");
    linhaVazia.className = "linha-vazia";
    const celulaVazia = document.createElement("td");
    celulaVazia.colSpan = 4;
    celulaVazia.textContent = "Nenhum aluno encontrado. Tente outro nome.";
    linhaVazia.append(celulaVazia);
    corpoTabela.append(linhaVazia);
    return;
  }

  lista.forEach(function (aluno) {
    const linha = document.createElement("tr");
    const situacao = aluno.media >= notaMinima ? "Aprovado" : "Em recuperação";
    const classeSituacao = aluno.media >= notaMinima ? "situacao aprovado" : "situacao reprovado";

    linha.append(
      criarCelula(aluno.nome),
      criarCelula(formatarMedia(aluno.media), "nota-aluno")
    );

    const celulaSituacao = document.createElement("td");
    const etiquetaSituacao = document.createElement("span");
    etiquetaSituacao.className = classeSituacao;
    etiquetaSituacao.textContent = situacao;
    celulaSituacao.append(etiquetaSituacao);
    linha.append(celulaSituacao);

    const celulaAcao = document.createElement("td");
    const botaoRemover = document.createElement("button");
    botaoRemover.className = "botao-remover";
    botaoRemover.type = "button";
    botaoRemover.textContent = "Remover";
    botaoRemover.setAttribute("aria-label", "Remover " + aluno.nome);
    botaoRemover.addEventListener("click", function (evento) {
      evento.stopPropagation();
      removerAluno(aluno);
    });
    celulaAcao.append(botaoRemover);
    linha.append(celulaAcao);

    linha.addEventListener("dblclick", function (evento) {
      if (!evento.target.closest("button")) {
        removerAluno(aluno);
      }
    });

    corpoTabela.append(linha);
  });
}

function filtrarTurma() {
  const termo = normalizar(busca.value.trim());
  const encontrados = turma.filter(function (aluno) {
    return normalizar(aluno.nome).includes(termo);
  });

  mostrarTurma(encontrados);

  if (termo && encontrados.length === 0) {
    avisoBusca.textContent = 'Nenhum aluno com "' + busca.value.trim() + '".';
  } else if (termo) {
    avisoBusca.textContent = encontrados.length + " aluno(s) encontrado(s).";
  } else {
    avisoBusca.textContent = "Dê dois cliques em uma linha para remover o aluno.";
  }
}

function limparErros() {
  [campoNome, campoNota].forEach(function (campo) {
    campo.classList.remove("campo-erro");
    campo.setAttribute("aria-invalid", "false");
  });
  mensagemForm.classList.remove("erro");
}

function mostrarErro(campo, texto) {
  campo.classList.add("campo-erro");
  campo.setAttribute("aria-invalid", "true");
  mensagemForm.classList.add("erro");
  mensagemForm.textContent = texto;
  campo.focus();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  limparErros();

  const nome = campoNome.value.trim();
  const textoNota = campoNota.value.trim();
  const nota = Number(textoNota);

  if (nome === "") {
    mostrarErro(campoNome, "Digite o nome do aluno.");
    return;
  }

  if (nome.length < 3) {
    mostrarErro(campoNome, "O nome precisa ter pelo menos 3 caracteres.");
    return;
  }

  if (textoNota === "" || !Number.isFinite(nota) || nota < 0 || nota > 10) {
    mostrarErro(campoNota, "Digite uma nota válida entre 0 e 10.");
    return;
  }

  turma.push({ nome: nome, media: nota });
  filtrarTurma();
  form.reset();
  limparErros();
  mensagemForm.textContent = nome + " foi cadastrado com sucesso.";
  campoNome.focus();
});

busca.addEventListener("input", function () {
  filtrarTurma();
});

busca.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    event.preventDefault();
    busca.value = "";
    filtrarTurma();
    avisoBusca.textContent = "Busca limpa; turma completa exibida.";
    busca.focus();
  }
});

mostrarTurma();
