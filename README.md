# Robur Jiu-Jitsu Registration Form

A modern, mobile-friendly registration form built with **Next.js (App Router)** and **TypeScript**, designed for gyms/schools to collect student information and generate a **PDF registration sheet** with an embedded **signature**.

**Live Demo (Vercel):** https://robur-jiujitsu-form.vercel.app/

---

## Features

- **Responsive UI** optimized for mobile and desktop
- **Client-side form validation** with clear error feedback
- **Automatic age calculation** based on date of birth
- **Brazilian phone masking** format: `(xx) xxxxx-xxxx`
- **PDF generation** (A4 layout) with:
  - academy logo header
  - structured sections (Personal Info / Health)
  - signature image embedded into the document
- **Loading overlay** while generating PDF (prevents accidental interactions)
- **Success screen** with an option to open the generated PDF

---

## Tech Stack

- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**
- **jsPDF** (PDF creation)
- **react-signature-canvas** (signature capture)

---

## Author
- **Rafael Costa**