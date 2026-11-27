import type { Metadata } from "next";

import styles from "@/components/content-stage/content-stage.module.css";
import { ProgettoBody } from "@/components/progetto/progetto-body";
import { ProgettoHero } from "@/components/progetto/progetto-hero";
import { getSiteSettings } from "@/lib/site-settings/get-site-settings";
import {
  formatSchoolLocation,
  formatTeachers,
} from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "Il progetto",
    description: `Chi siamo: il progetto scolastico ${settings.siteName} su ONU e Agenda 2030 (Obiettivi 16 e 17).`,
  };
}

export default async function ProgettoPage() {
  const settings = await getSiteSettings();
  const location = formatSchoolLocation(settings);

  const schoolBlock = (
    <section
      className={`rounded-2xl border px-5 py-6 sm:px-7 ${styles.contentPanel}`}
    >
      <h2 className="font-heading text-2xl font-semibold tracking-tight">
        Scuola e classe
      </h2>
      <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-foreground">Scuola</dt>
          <dd className="mt-1 text-muted-foreground">{settings.schoolName}</dd>
        </div>
        {location ? (
          <div>
            <dt className="font-semibold text-foreground">Indirizzo</dt>
            <dd className="mt-1 text-muted-foreground">{location}</dd>
          </div>
        ) : null}
        <div>
          <dt className="font-semibold text-foreground">Classe</dt>
          <dd className="mt-1 text-muted-foreground">{settings.className}</dd>
        </div>
        <div>
          <dt className="font-semibold text-foreground">Anno scolastico</dt>
          <dd className="mt-1 text-muted-foreground">{settings.schoolYear}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-semibold text-foreground">Docenti</dt>
          <dd className="mt-1 text-muted-foreground">
            {formatTeachers(settings)}
          </dd>
        </div>
        {settings.contactEmail ? (
          <div className="sm:col-span-2">
            <dt className="font-semibold text-foreground">Email</dt>
            <dd className="mt-1 text-muted-foreground">
              <a
                href={`mailto:${settings.contactEmail}`}
                className="text-primary underline-offset-2 hover:underline"
                data-cursor="link"
              >
                {settings.contactEmail}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );

  return (
    <div className={styles.contentAtmosphere}>
      <ProgettoHero title="Il progetto" description={settings.description} />
      <ProgettoBody
        projectHtml={settings.projectHtml}
        schoolBlock={schoolBlock}
      />
    </div>
  );
}