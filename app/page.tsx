"use client";

import { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

type FormState = {
  nome: string;
  nascimento: string;
  idade: string;
  peso: string;
  endereco: string;
  telefone: string;
  responsavel: string;
  telefoneResponsavel: string;
  emergencia: string;
  vencimento: string;
  restricao: string;
  restricaoDesc: string;
  medicamentos: string;
  medicamentosDesc: string;
  atividade: string;
  atividadeDesc: string;
  dataHoje: string;
};

type ErrorsState = Partial<Record<keyof FormState, string>>;

export default function Home() {
  const sigRef = useRef<SignatureCanvas>(null);

  const todayBR = new Date().toLocaleDateString("pt-BR");

  const [view, setView] = useState<"form" | "success">("form");
  const [pdfInfo, setPdfInfo] = useState<{
    blob: Blob;
    url: string;
    filename: string;
  } | null>(null);

  const [form, setForm] = useState<FormState>({
    nome: "",
    nascimento: "",
    idade: "",
    peso: "",
    endereco: "",
    telefone: "",
    responsavel: "",
    telefoneResponsavel: "",
    emergencia: "",
    vencimento: "",
    restricao: "",
    restricaoDesc: "",
    medicamentos: "",
    medicamentosDesc: "",
    atividade: "",
    atividadeDesc: "",
    dataHoje: todayBR,
  });

  const [errors, setErrors] = useState<ErrorsState>({});

  const fieldRefs = useRef<
    Partial<Record<keyof FormState, HTMLInputElement | null>>
  >({});

  useEffect(() => {
    return () => {
      if (pdfInfo?.url) URL.revokeObjectURL(pdfInfo.url);
    };
  }, [pdfInfo]);

  const nomeRegex = /^[A-Za-zÀ-ÿ]+(\s[A-Za-zÀ-ÿ]+)+$/;

  const formatPhone11 = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    const ddd = numbers.slice(0, 2);
    const part1 = numbers.slice(2, 7);
    const part2 = numbers.slice(7, 11);

    if (numbers.length === 0) return "";
    if (numbers.length < 3) return `(${ddd}`;
    if (numbers.length < 8) return `(${ddd}) ${numbers.slice(2)}`;
    return `(${ddd}) ${part1}${part2 ? `-${part2}` : ""}`;
  };

  const isPhoneComplete = (masked: string) =>
    masked.replace(/\D/g, "").length === 11;

  const handleSignatureFocus = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };


  const calcAge = (isoDate: string) => {
    if (!isoDate) return "";
    const birth = new Date(isoDate);
    if (Number.isNaN(birth.getTime())) return "";

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 0) return "";
    return String(age);
  };

  const clearError = (name: keyof FormState) => {
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleChange = (e: any) => {
    let { name, value } = e.target as { name: keyof FormState; value: string };

    if (
      name === "telefone" ||
      name === "telefoneResponsavel" ||
      name === "emergencia"
    ) {
      value = formatPhone11(value);
    }

    if (name === "nascimento") {
      const idadeAuto = calcAge(value);
      setForm((prev) => ({
        ...prev,
        nascimento: value,
        idade: idadeAuto,
      }));
      clearError("nascimento");
      clearError("idade");
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    clearError(name);

    if (name === "restricao" && value === "Não") {
      setForm((prev) => ({ ...prev, restricaoDesc: "" }));
      clearError("restricaoDesc");
    }
    if (name === "medicamentos" && value === "Não") {
      setForm((prev) => ({ ...prev, medicamentosDesc: "" }));
      clearError("medicamentosDesc");
    }
    if (name === "atividade" && value === "Não") {
      setForm((prev) => ({ ...prev, atividadeDesc: "" }));
      clearError("atividadeDesc");
    }
  };

  const focusFirstError = (errs: ErrorsState) => {
    const order: (keyof FormState)[] = [
      "nome",
      "nascimento",
      "idade",
      "peso",
      "endereco",
      "telefone",
      "responsavel",
      "telefoneResponsavel",
      "emergencia",
      "vencimento",
      "restricao",
      "restricaoDesc",
      "medicamentos",
      "medicamentosDesc",
      "atividade",
      "atividadeDesc",
      "dataHoje",
    ];

    const firstKey = order.find((k) => !!errs[k]);
    if (!firstKey) return;

    const el = fieldRefs.current[firstKey];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const validateForm = () => {
    const newErrors: ErrorsState = {};

    if (!form.nome.trim()) newErrors.nome = "Campo obrigatório.";
    else if (!nomeRegex.test(form.nome.trim()))
      newErrors.nome = "Digite nome completo (nome e sobrenome).";

    if (!form.nascimento) newErrors.nascimento = "Campo obrigatório.";
    if (!form.idade.trim()) newErrors.idade = "Campo obrigatório.";
    if (!form.peso.trim()) newErrors.peso = "Campo obrigatório.";
    if (!form.endereco.trim()) newErrors.endereco = "Campo obrigatório.";

    if (!form.emergencia.trim()) newErrors.emergencia = "Campo obrigatório.";
    else if (!isPhoneComplete(form.emergencia))
      newErrors.emergencia = "Telefone incompleto. Use (xx) xxxxx-xxxx.";

    if (!form.vencimento.trim()) newErrors.vencimento = "Campo obrigatório.";
    else {
      const v = Number(form.vencimento);
      if (!Number.isFinite(v) || v < 1 || v > 31) {
        newErrors.vencimento = "Dia de vencimento deve ser entre 1 e 31.";
      }
    }

    if (form.telefone.trim() && !isPhoneComplete(form.telefone))
      newErrors.telefone = "Telefone incompleto. Use (xx) xxxxx-xxxx.";

    if (
      form.telefoneResponsavel.trim() &&
      !isPhoneComplete(form.telefoneResponsavel)
    )
      newErrors.telefoneResponsavel =
        "Telefone incompleto. Use (xx) xxxxx-xxxx.";

    if (!form.restricao) newErrors.restricao = "Selecione uma opção.";
    if (!form.medicamentos) newErrors.medicamentos = "Selecione uma opção.";
    if (!form.atividade) newErrors.atividade = "Selecione uma opção.";

    if (form.restricao === "Sim" && !form.restricaoDesc.trim())
      newErrors.restricaoDesc = "Descreva a restrição.";

    if (form.medicamentos === "Sim" && !form.medicamentosDesc.trim())
      newErrors.medicamentosDesc = "Informe quais medicamentos.";

    if (form.atividade === "Sim" && !form.atividadeDesc.trim())
      newErrors.atividadeDesc = "Informe qual atividade.";

    if (!sigRef.current || sigRef.current.isEmpty()) {
      alert("A assinatura é obrigatória.");
      return false;
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      focusFirstError(newErrors);
      return false;
    }
    return true;
  };

  const generatePDF = async () => {
    if (!validateForm()) return;

    // ✅ Import dinâmico (evita problemas de build/SSR)
    const { default: jsPDF } = await import("jspdf");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const contentW = pageW - margin * 2;

    let y = 0;
    const ensureSpace = (needed: number) => {
      if (y + needed > pageH - margin) {
        pdf.addPage();
        y = margin;
      }
    };

    const setText = (size: number, style: "normal" | "bold" = "normal") => {
      pdf.setFont("helvetica", style);
      pdf.setFontSize(size);
    };

    const drawSectionTitle = (title: string) => {
      ensureSpace(14);
      pdf.setDrawColor(220);
      pdf.setFillColor(245, 245, 245);
      pdf.rect(margin, y, contentW, 9, "FD");
      setText(12, "bold");
      pdf.setTextColor(20);
      pdf.text(title, margin + 3, y + 6.5);
      y += 13;
      pdf.setTextColor(0);
    };

    const safe = (v: string) => (v?.trim() ? v.trim() : "-");

    const formatDateBR = (iso: string) => {
      try {
        if (!iso) return "-";
        return new Date(iso).toLocaleDateString("pt-BR");
      } catch {
        return "-";
      }
    };

    const measureCardHeight = (label: string, value: string, w: number) => {
      setText(9, "bold");
      const labelLines = pdf.splitTextToSize(label, w - 6);
      setText(11, "normal");
      const valueLines = pdf.splitTextToSize(value, w - 6);
      return 3 + labelLines.length * 4 + 2 + valueLines.length * 5 + 3;
    };

    const drawCard = (
      x: number,
      w: number,
      label: string,
      value: string,
      h: number
    ) => {
      pdf.setDrawColor(220);
      pdf.setFillColor(255, 255, 255);
      pdf.rect(x, y, w, h, "FD");

      setText(9, "bold");
      pdf.setTextColor(80);
      const labelLines = pdf.splitTextToSize(label, w - 6);
      pdf.text(labelLines, x + 3, y + 6);

      setText(11, "normal");
      pdf.setTextColor(0);
      const valueLines = pdf.splitTextToSize(value, w - 6);
      const labelBlockH = labelLines.length * 4;
      pdf.text(valueLines, x + 3, y + 6 + labelBlockH + 4);
    };

    const drawTwoColRow = (
      left: { label: string; value: string },
      right: { label: string; value: string }
    ) => {
      const gap = 6;
      const colW = (contentW - gap) / 2;

      const hL = measureCardHeight(left.label, left.value, colW);
      const hR = measureCardHeight(right.label, right.value, colW);
      const rowH = Math.max(hL, hR);

      ensureSpace(rowH + 2);

      drawCard(margin, colW, left.label, left.value, rowH);
      drawCard(margin + colW + gap, colW, right.label, right.value, rowH);

      y += rowH + 6;
      pdf.setTextColor(0);
    };

    const drawFullRow = (item: { label: string; value: string }) => {
      const h = measureCardHeight(item.label, item.value, contentW);
      ensureSpace(h + 2);
      drawCard(margin, contentW, item.label, item.value, h);
      y += h + 6;
    };

    const img = new Image();
    img.src = "/logo.png";
    await new Promise((resolve) => (img.onload = resolve));

    const desiredLogoH = 86;
    const ratio = img.width / img.height || 3;
    let logoH = desiredLogoH;
    let logoW = logoH * ratio;

    if (logoW > contentW) {
      logoW = contentW;
      logoH = logoW / ratio;
    }

    const logoX = (pageW - logoW) / 2;

    y = margin;
    pdf.addImage(img, "PNG", logoX, y, logoW, logoH);
    y += logoH + 8;

    setText(18, "bold");
    pdf.setTextColor(10);
    pdf.text("Ficha de Cadastro", pageW / 2, y, { align: "center" });
    y += 6;

    pdf.setDrawColor(220);
    pdf.line(margin, y, pageW - margin, y);
    y += 10;
    pdf.setTextColor(0);

    drawSectionTitle("Informações Pessoais");

    drawTwoColRow(
      { label: "Nome completo", value: safe(form.nome) },
      { label: "Data de nascimento", value: formatDateBR(form.nascimento) }
    );

    drawTwoColRow(
      { label: "Idade", value: safe(form.idade) },
      { label: "Peso (kg)", value: safe(form.peso) }
    );

    drawFullRow({ label: "Endereço", value: safe(form.endereco) });

    drawTwoColRow(
      { label: "Telefone", value: safe(form.telefone) },
      { label: "Contato emergência", value: safe(form.emergencia) }
    );

    drawTwoColRow(
      { label: "Responsável (se menor de idade)", value: safe(form.responsavel) },
      { label: "Telefone responsável", value: safe(form.telefoneResponsavel) }
    );

    drawTwoColRow(
      { label: "Dia vencimento mensalidade", value: safe(form.vencimento) },
      { label: "Data do cadastro", value: safe(form.dataHoje) }
    );

    drawSectionTitle("Saúde");

    drawFullRow({
      label: "Restrição médica",
      value:
        form.restricao === "Sim"
          ? `Sim — ${safe(form.restricaoDesc)}`
          : "Não",
    });

    drawFullRow({
      label: "Medicamentos contínuos",
      value:
        form.medicamentos === "Sim"
          ? `Sim — ${safe(form.medicamentosDesc)}`
          : "Não",
    });

    drawFullRow({
      label: "Atividade anterior",
      value:
        form.atividade === "Sim"
          ? `Sim — ${safe(form.atividadeDesc)}`
          : "Não",
    });

    const signature = sigRef.current?.getTrimmedCanvas().toDataURL("image/png");
    if (signature) {
      drawSectionTitle("Assinatura");

      const boxH = 35;
      ensureSpace(boxH + 10);

      pdf.setDrawColor(220);
      pdf.setFillColor(255, 255, 255);
      pdf.rect(margin, y, contentW, boxH, "FD");

      const sigW = 90;
      const sigH = 28;
      const sigX = margin + (contentW - sigW) / 2;
      const sigY = y + (boxH - sigH) / 2;
      pdf.addImage(signature, "PNG", sigX, sigY, sigW, sigH);

      y += boxH + 8;
    }

    ensureSpace(12);
    pdf.setDrawColor(230);
    pdf.line(margin, pageH - margin, pageW - margin, pageH - margin);

    setText(9, "normal");
    pdf.setTextColor(120);
    pdf.text(`Gerado em: ${form.dataHoje}`, margin, pageH - margin + 6);
    pdf.text(`Página 1`, pageW - margin, pageH - margin + 6, {
      align: "right",
    });

    const filename = `Ficha-${form.nome}.pdf`;

    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);

    pdf.save(filename);

    setPdfInfo((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return { blob, url, filename };
    });
    setView("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleShare = async () => {
    if (!pdfInfo) return;

    const file = new File([pdfInfo.blob], pdfInfo.filename, {
      type: "application/pdf",
    });

    const canShareFiles =
      typeof navigator !== "undefined" &&
      // @ts-ignore
      typeof navigator.share === "function" &&
      // @ts-ignore
      typeof navigator.canShare === "function" &&
      // @ts-ignore
      navigator.canShare({ files: [file] });

    try {
      if (canShareFiles) {
        // @ts-ignore
        await navigator.share({
          title: "Ficha de Cadastro",
          text: "Segue o PDF da ficha de cadastro.",
          files: [file],
        });
      } else {
        window.open(pdfInfo.url, "_blank", "noopener,noreferrer");
      }
    } catch {}
  };

  const resetToForm = () => {
    setErrors({});
    sigRef.current?.clear();
    setForm({
      nome: "",
      nascimento: "",
      idade: "",
      peso: "",
      endereco: "",
      telefone: "",
      responsavel: "",
      telefoneResponsavel: "",
      emergencia: "",
      vencimento: "",
      restricao: "",
      restricaoDesc: "",
      medicamentos: "",
      medicamentosDesc: "",
      atividade: "",
      atividadeDesc: "",
      dataHoje: new Date().toLocaleDateString("pt-BR"),
    });
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const inputClass = (key: keyof FormState) =>
    `input ${errors[key] ? "inputError" : ""}`;

  if (view === "success") {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center p-4">
        <div className="w-full max-w-md bg-neutral-900 rounded-2xl p-6 space-y-4 text-center">
          <img src="/logo.png" className="mx-auto w-44" />

          <h1 className="text-2xl font-bold">PDF gerado com sucesso ✅</h1>

          {pdfInfo && (
            <p className="text-sm text-neutral-300 break-words">
              Arquivo: <span className="text-white">{pdfInfo.filename}</span>
            </p>
          )}

          <div className="bg-neutral-800 rounded-xl p-4 space-y-2">
            <p className="font-semibold">Siga a página no Instagram</p>
            <a
              href="https://www.instagram.com/roburjiujitsu/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-red-400 underline"
            >
              @roburjiujitsu
            </a>
          </div>

          <button
            onClick={handleShare}
            className="w-full bg-red-600 hover:bg-red-700 transition p-3 rounded-xl font-semibold"
          >
            Compartilhar PDF
          </button>

          {pdfInfo && (
            <a
              href={pdfInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-neutral-800 hover:bg-neutral-700 transition p-3 rounded-xl font-semibold"
            >
              Abrir PDF
            </a>
          )}

          <button
            onClick={resetToForm}
            className="w-full bg-neutral-800 hover:bg-neutral-700 transition p-3 rounded-xl font-semibold"
          >
            Voltar para o cadastro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 rounded-2xl p-6 space-y-4">
        <img src="/logo.png" className="mx-auto w-44" />

        <h1 className="text-xl font-bold text-center">Ficha de Cadastro</h1>

        <hr />
        <h2 className="text-xl font-bold text-center">Informações Pessoais</h2>

        <div>
          <label className="label">Nome completo</label>
          <input
            ref={(el) => {
              fieldRefs.current.nome = el;
            }}
            required
            name="nome"
            value={form.nome}
            onChange={handleChange}
            className={inputClass("nome")}
          />
          {errors.nome && <p className="errorText">{errors.nome}</p>}
        </div>

        <div>
          <label className="label">Data de nascimento</label>
          <input
            ref={(el) => {
              fieldRefs.current.nascimento = el;
            }}
            required
            type="date"
            name="nascimento"
            value={form.nascimento}
            onChange={handleChange}
            className={inputClass("nascimento")}
          />
          {errors.nascimento && (
            <p className="errorText">{errors.nascimento}</p>
          )}
        </div>

        <div>
          <label className="label">Idade</label>
          <input
            ref={(el) => {
              fieldRefs.current.idade = el;
            }}
            required
            name="idade"
            value={form.idade}
            onChange={handleChange}
            className={inputClass("idade")}
          />
          {errors.idade && <p className="errorText">{errors.idade}</p>}
        </div>

        <div>
          <label className="label">Peso (kg)</label>
          <input
            ref={(el) => {
              fieldRefs.current.peso = el;
            }}
            required
            name="peso"
            value={form.peso}
            onChange={handleChange}
            className={inputClass("peso")}
          />
          {errors.peso && <p className="errorText">{errors.peso}</p>}
        </div>

        <div>
          <label className="label">Endereço</label>
          <input
            ref={(el) => {
              fieldRefs.current.endereco = el;
            }}
            required
            name="endereco"
            value={form.endereco}
            onChange={handleChange}
            className={inputClass("endereco")}
          />
          {errors.endereco && <p className="errorText">{errors.endereco}</p>}
        </div>

        <div>
          <label className="label">Telefone (xx) xxxxx-xxxx</label>
          <input
            ref={(el) => {
              fieldRefs.current.telefone = el;
            }}
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
            className={inputClass("telefone")}
            inputMode="numeric"
          />
          {errors.telefone && <p className="errorText">{errors.telefone}</p>}
        </div>

        <div>
          <label className="label">Responsável (se menor)</label>
          <input
            ref={(el) => {
              fieldRefs.current.responsavel = el;
            }}
            name="responsavel"
            value={form.responsavel}
            onChange={handleChange}
            className={inputClass("responsavel")}
          />
          {errors.responsavel && (
            <p className="errorText">{errors.responsavel}</p>
          )}
        </div>

        <div>
          <label className="label">Telefone responsável (xx) xxxxx-xxxx</label>
          <input
            ref={(el) => {
              fieldRefs.current.telefoneResponsavel = el;
            }}
            name="telefoneResponsavel"
            value={form.telefoneResponsavel}
            onChange={handleChange}
            className={inputClass("telefoneResponsavel")}
            inputMode="numeric"
          />
          {errors.telefoneResponsavel && (
            <p className="errorText">{errors.telefoneResponsavel}</p>
          )}
        </div>

        <div>
          <label className="label">Contato emergência (xx) xxxxx-xxxx</label>
          <input
            ref={(el) => {
              fieldRefs.current.emergencia = el;
            }}
            required
            name="emergencia"
            value={form.emergencia}
            onChange={handleChange}
            className={inputClass("emergencia")}
            inputMode="numeric"
          />
          {errors.emergencia && (
            <p className="errorText">{errors.emergencia}</p>
          )}
        </div>

        <div>
          <label className="label">
            Dia de vencimento (1 a 31) - data de pagamento da mensalidade
          </label>
          <input
            ref={(el) => {
              fieldRefs.current.vencimento = el;
            }}
            required
            type="number"
            min="1"
            max="31"
            name="vencimento"
            value={form.vencimento}
            onChange={handleChange}
            className={inputClass("vencimento")}
          />
          {errors.vencimento && (
            <p className="errorText">{errors.vencimento}</p>
          )}
        </div>

        <hr />
        <h2 className="text-xl font-bold text-center">Saúde</h2>

        <div>
          <p className="font-semibold">1. Possui alguma restrição médica?</p>
          <div className={`flex gap-4 ${errors.restricao ? "radioError" : ""}`}>
            <label>
              <input
                ref={(el) => {
                  fieldRefs.current.restricao = el;
                }}
                required
                type="radio"
                name="restricao"
                value="Sim"
                checked={form.restricao === "Sim"}
                onChange={handleChange}
              />{" "}
              Sim
            </label>
            <label>
              <input
                required
                type="radio"
                name="restricao"
                value="Não"
                checked={form.restricao === "Não"}
                onChange={handleChange}
              />{" "}
              Não
            </label>
          </div>
          {errors.restricao && <p className="errorText">{errors.restricao}</p>}

          {form.restricao === "Sim" && (
            <div>
              <label className="label">Qual restrição?</label>
              <input
                ref={(el) => {
                  fieldRefs.current.restricaoDesc = el;
                }}
                required
                name="restricaoDesc"
                value={form.restricaoDesc}
                onChange={handleChange}
                className={inputClass("restricaoDesc")}
              />
              {errors.restricaoDesc && (
                <p className="errorText">{errors.restricaoDesc}</p>
              )}
            </div>
          )}
        </div>

        <div>
          <p className="font-semibold">2. Faz uso contínuo de medicamentos?</p>
          <div
            className={`flex gap-4 ${
              errors.medicamentos ? "radioError" : ""
            }`}
          >
            <label>
              <input
                ref={(el) => {
                  fieldRefs.current.medicamentos = el;
                }}
                required
                type="radio"
                name="medicamentos"
                value="Sim"
                checked={form.medicamentos === "Sim"}
                onChange={handleChange}
              />{" "}
              Sim
            </label>
            <label>
              <input
                required
                type="radio"
                name="medicamentos"
                value="Não"
                checked={form.medicamentos === "Não"}
                onChange={handleChange}
              />{" "}
              Não
            </label>
          </div>
          {errors.medicamentos && (
            <p className="errorText">{errors.medicamentos}</p>
          )}

          {form.medicamentos === "Sim" && (
            <div>
              <label className="label">Quais medicamentos?</label>
              <input
                ref={(el) => {
                  fieldRefs.current.medicamentosDesc = el;
                }}
                required
                name="medicamentosDesc"
                value={form.medicamentosDesc}
                onChange={handleChange}
                className={inputClass("medicamentosDesc")}
              />
              {errors.medicamentosDesc && (
                <p className="errorText">{errors.medicamentosDesc}</p>
              )}
            </div>
          )}
        </div>

        <div>
          <p className="font-semibold">
            3. Já praticou outra atividade física ou arte marcial?
          </p>
          <div className={`flex gap-4 ${errors.atividade ? "radioError" : ""}`}>
            <label>
              <input
                ref={(el) => {
                  fieldRefs.current.atividade = el;
                }}
                required
                type="radio"
                name="atividade"
                value="Sim"
                checked={form.atividade === "Sim"}
                onChange={handleChange}
              />{" "}
              Sim
            </label>
            <label>
              <input
                required
                type="radio"
                name="atividade"
                value="Não"
                checked={form.atividade === "Não"}
                onChange={handleChange}
              />{" "}
              Não
            </label>
          </div>
          {errors.atividade && <p className="errorText">{errors.atividade}</p>}

          {form.atividade === "Sim" && (
            <div>
              <label className="label">Qual atividade?</label>
              <input
                ref={(el) => {
                  fieldRefs.current.atividadeDesc = el;
                }}
                required
                name="atividadeDesc"
                value={form.atividadeDesc}
                onChange={handleChange}
                className={inputClass("atividadeDesc")}
              />
              {errors.atividadeDesc && (
                <p className="errorText">{errors.atividadeDesc}</p>
              )}
            </div>
          )}
        </div>

        <div>
          <p className="font-semibold">Assinatura</p>
          <div className="bg-white rounded-lg">
            <SignatureCanvas
              ref={sigRef}
              penColor="black"
              onBegin={handleSignatureFocus}
              canvasProps={{ className: "w-full h-40" }}
            />
          </div>
          <button
            type="button"
            onClick={() => sigRef.current?.clear()}
            className="text-sm text-red-400"
          >
            Limpar assinatura
          </button>
        </div>

        <div>
          <label className="label">Data</label>
          <input value={form.dataHoje} readOnly className="input" />
        </div>

        <button
          onClick={generatePDF}
          className="w-full bg-red-600 hover:bg-red-700 transition p-3 rounded-xl font-semibold"
        >
          Gerar PDF
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          background: #1f1f1f;
          border: 1px solid #333;
          color: white;
          margin-top: 6px;
          outline: none;
        }

        .inputError {
          border-color: #ef4444;
        }

        .label {
          display: block;
          font-size: 14px;
          margin-top: 14px;
          margin-bottom: 6px;
          color: #ccc;
        }

        .errorText {
          margin-top: 6px;
          font-size: 12px;
          color: #fca5a5;
        }

        .radioError {
          padding: 8px;
          border: 1px solid #ef4444;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}