import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, sector, companySize, project } = body;

    // Validation des champs requis
    if (!name || !email) {
      return NextResponse.json(
        { error: "Nom et email sont requis" },
        { status: 400 }
      );
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // Contenu de l'email
    const emailContent = `
      <h2>Nouvelle demande de contact - SelfCamp</h2>
      
      <h3>Informations du contact :</h3>
      <ul>
        <li><strong>Nom :</strong> ${name}</li>
        <li><strong>Email :</strong> ${email}</li>
        <li><strong>Entreprise :</strong> ${company || "Non renseigné"}</li>
        <li><strong>Secteur :</strong> ${sector || "Non renseigné"}</li>
        <li><strong>Taille entreprise :</strong> ${companySize || "Non renseigné"}</li>
      </ul>
      
      <h3>Description du projet :</h3>
      <p>${project || "Aucune description fournie"}</p>
      
      <hr>
      <p><small>Envoyé depuis le formulaire de contact SelfCamp</small></p>
    `;

    // Envoi de l'email
    const { data, error } = await resend.emails.send({
      from: "SelfCamp Contact <onboarding@resend.dev>",
      to: ["gp@webbing.ch"],
      subject: `[SelfCamp] Nouvelle demande de contact - ${name}`,
      html: emailContent,
      replyTo: email,
    });

    if (error) {
      console.error("Erreur Resend:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    console.log("Email envoyé avec succès:", data);

    return NextResponse.json(
      { message: "Message envoyé avec succès", id: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
