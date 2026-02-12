"use client";

import { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";

export default function Home() {
  const sigRef = useRef<SignatureCanvas>(null);

  const todayBR = new Date().toLocaleDateString("pt-BR");

  const [form, setForm] = useState({
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

  const nomeRegex = /^[A-Za-zÀ-ÿ]+(\s[A-Za-zÀ-ÿ]+)+$/;

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10)
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  };

  const handleChange = (e: any) => {
    let { name, value } = e.target;

    if (name === "telefone" || name === "telefoneResponsavel") {
      value = formatPhone(value);
    }

    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    if (!nomeRegex.test(form.nome)) {
      alert("Digite nome completo (nome e sobrenome)");
      return false;
    }

    if (Number(form.vencimento) < 1 || Number(form.vencimento) > 31) {
      alert("Dia de vencimento deve ser entre 1 e 31");
      return false;
    }

    return true;
  };

  const generatePDF = async () => {
    if (!validateForm()) return;

    const pdf = new jsPDF("p", "mm", "a4");

    const img = new Image();
    img.src = "/logo.png";
    await new Promise((resolve) => (img.onload = resolve));

    pdf.addImage(img, "PNG", 40, 10, 130, 45);
    pdf.setFontSize(16);
    pdf.text("Ficha de Cadastro", 105, 65, { align: "center" });

    pdf.setFontSize(11);
    let y = 80;

    const addField = (label: string, value: string) => {
      pdf.text(`${label}: ${value}`, 20, y);
      y += 7;
    };

    addField("Nome completo", form.nome);
    addField(
      "Data de nascimento",
      new Date(form.nascimento).toLocaleDateString("pt-BR")
    );
    addField("Idade", form.idade);
    addField("Peso (kg)", form.peso);
    addField("Endereço", form.endereco);
    addField("Telefone", form.telefone);
    addField("Responsável", form.responsavel || "-");
    addField("Telefone responsável", form.telefoneResponsavel || "-");
    addField("Contato emergência", form.emergencia);
    addField("Dia vencimento mensalidade", form.vencimento);

    y += 5;
    pdf.setFontSize(13);
    pdf.text("Saúde", 20, y);
    y += 8;
    pdf.setFontSize(11);

    addField(
      "Restrição médica",
      form.restricao === "Sim"
        ? `Sim - ${form.restricaoDesc}`
        : "Não"
    );

    addField(
      "Medicamentos contínuos",
      form.medicamentos === "Sim"
        ? `Sim - ${form.medicamentosDesc}`
        : "Não"
    );

    addField(
      "Atividade anterior",
      form.atividade === "Sim"
        ? `Sim - ${form.atividadeDesc}`
        : "Não"
    );

    const signature = sigRef.current?.getTrimmedCanvas().toDataURL("image/png");

    if (signature) {
      y += 10;
      pdf.text("Assinatura:", 20, y);
      y += 5;
      pdf.addImage(signature, "PNG", 20, y, 70, 25);
    }

    y += 35;
    pdf.text(`Data: ${form.dataHoje}`, 20, y);

    pdf.save(`Ficha-${form.nome}.pdf`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 rounded-2xl p-6 space-y-4">

        <img src="/logo.png" className="mx-auto w-44" />

        <h1 className="text-xl font-bold text-center">
          Ficha de Cadastro
        </h1>

        <hr />
        <h2 className="text-xl font-bold text-center">
          Informações Pessoais
        </h2>

        <div>
          <label className="label">Nome completo</label>
          <input required name="nome" onChange={handleChange} className="input" />
        </div>

        <div>
          <label className="label">Data de nascimento</label>
          <input required type="date" name="nascimento" onChange={handleChange} className="input" />
        </div>

        <div>
          <label className="label">Idade</label>
          <input required name="idade" onChange={handleChange} className="input" />
        </div>

        <div>
          <label className="label">Peso (kg)</label>
          <input required name="peso" onChange={handleChange} className="input" />
        </div>

        <div>
          <label className="label">Endereço</label>
          <input required name="endereco" onChange={handleChange} className="input" />
        </div>

        <div>
          <label className="label">Telefone</label>
          <input name="telefone" onChange={handleChange} className="input" />
        </div>

        <div>
          <label className="label">Responsável (se menor)</label>
          <input name="responsavel" onChange={handleChange} className="input" />
        </div>

        <div>
          <label className="label">Telefone responsável</label>
          <input name="telefoneResponsavel" onChange={handleChange} className="input" />
        </div>

        <div>
          <label className="label">Contato emergência</label>
          <input required name="emergencia" onChange={handleChange} className="input" />
        </div>

        <div>
          <label className="label">
            Dia de vencimento (1 a 31) - data de pagamento da mensalidade
          </label>
          <input required type="number" min="1" max="31" name="vencimento" onChange={handleChange} className="input" />
        </div>

        <hr />
        <h2 className="text-xl font-bold text-center">
          Saúde
        </h2>

        <div>
          <p className="font-semibold">1. Possui alguma restrição médica?</p>
          <div className="flex gap-4">
            <label><input required type="radio" name="restricao" value="Sim" onChange={handleChange}/> Sim</label>
            <label><input required type="radio" name="restricao" value="Não" onChange={handleChange}/> Não</label>
          </div>
          {form.restricao === "Sim" && (
            <div>
              <label className="label">Qual restrição?</label>
              <input required name="restricaoDesc" onChange={handleChange} className="input"/>
            </div>
          )}
        </div>

        <div>
          <p className="font-semibold">2. Faz uso contínuo de medicamentos?</p>
          <div className="flex gap-4">
            <label><input required type="radio" name="medicamentos" value="Sim" onChange={handleChange}/> Sim</label>
            <label><input required type="radio" name="medicamentos" value="Não" onChange={handleChange}/> Não</label>
          </div>
          {form.medicamentos === "Sim" && (
            <div>
              <label className="label">Quais medicamentos?</label>
              <input required name="medicamentosDesc" onChange={handleChange} className="input"/>
            </div>
          )}
        </div>

        <div>
          <p className="font-semibold">3. Já praticou outra atividade física ou arte marcial?</p>
          <div className="flex gap-4">
            <label><input required type="radio" name="atividade" value="Sim" onChange={handleChange}/> Sim</label>
            <label><input required type="radio" name="atividade" value="Não" onChange={handleChange}/> Não</label>
          </div>
          {form.atividade === "Sim" && (
            <div>
              <label className="label">Qual atividade?</label>
              <input required name="atividadeDesc" onChange={handleChange} className="input"/>
            </div>
          )}
        </div>

        <div>
          <p className="font-semibold">Assinatura</p>
          <div className="bg-white rounded-lg">
            <SignatureCanvas
              ref={sigRef}
              penColor="black"
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
        }

        .label {
          display: block;
          font-size: 14px;
          margin-top: 14px;
          margin-bottom: 6px;
          color: #ccc;
        }
      `}</style>
    </div>
  );
}