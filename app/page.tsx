"use client";

import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function Home() {
  const formRef = useRef<HTMLDivElement>(null);
  const sigRef = useRef<SignatureCanvas>(null);

  const generatePDF = async () => {
    if (!formRef.current) return;

    const canvas = await html2canvas(formRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);

    const pdfBlob = pdf.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);

    const whatsappUrl = `https://wa.me/?text=Segue o questionário preenchido: ${pdfUrl}`;
    window.open(whatsappUrl, "_blank");
  };

  const clearSignature = () => {
    sigRef.current?.clear();
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <div ref={formRef}>
        <h1>Ficha de Cadastro</h1>
        <h2>Robur Jiu Jitsu – Vila Laura</h2>

        <h3>Informações Pessoais</h3>

        <input placeholder="Nome completo" />
        <input type="date" />
        <input placeholder="Idade" />
        <input placeholder="Peso (kg)" />
        <input placeholder="Endereço" />
        <input placeholder="Telefone" />
        <input placeholder="Responsável (se menor)" />
        <input placeholder="Contato de emergência" />
        <input placeholder="Dia de vencimento" />

        <h3>Saúde</h3>

        <input placeholder="Possui restrição médica? Se sim, qual?" />
        <input placeholder="Uso contínuo de medicamentos? Se sim, quais?" />
        <input placeholder="Já praticou atividade física? Se sim, qual?" />

        <h3>Assinatura</h3>

        <SignatureCanvas
          ref={sigRef}
          penColor="black"
          canvasProps={{
            width: 400,
            height: 150,
            style: { border: "1px solid black" }
          }}
        />

        <button onClick={clearSignature} style={{ marginTop: 10 }}>
          Limpar Assinatura
        </button>

        <p>Data: {new Date().toLocaleDateString()}</p>
      </div>

      <button
        onClick={generatePDF}
        style={{
          marginTop: 20,
          padding: 10,
          backgroundColor: "green",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer"
        }}
      >
        Gerar PDF e Enviar via WhatsApp
      </button>
    </div>
  );
}