import Link from "next/link";
import { UI_COPY } from "@/lib/constants/ui-copy";

/**
 * Privacy policy page — data retention and GDPR notes.
 */
export default function PrivacyPage() {
  return (
    <main className="min-h-dvh overflow-y-auto bg-legal-navy px-4 py-10 text-slate-200 sm:px-6">
      <article className="mx-auto max-w-2xl space-y-6 text-sm leading-relaxed">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-100">
            {UI_COPY.privacyTitle}
          </h1>
          <p className="text-legal-slate">{UI_COPY.privacyUpdated}</p>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-slate-100">
            {UI_COPY.privacyDataTitle}
          </h2>
          <p>{UI_COPY.privacyDataBody}</p>
          <ul className="list-disc space-y-1 pl-5 text-legal-slate">
            <li>{UI_COPY.privacyDataAccount}</li>
            <li>{UI_COPY.privacyDataMessages}</li>
            <li>{UI_COPY.privacyDataUsage}</li>
            <li>{UI_COPY.privacyDataAudit}</li>
            <li>{UI_COPY.privacyDataFeedback}</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-slate-100">
            {UI_COPY.privacyRetentionTitle}
          </h2>
          <p>{UI_COPY.privacyRetentionBody}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-slate-100">
            {UI_COPY.privacyRightsTitle}
          </h2>
          <p>{UI_COPY.privacyRightsBody}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-slate-100">
            {UI_COPY.privacyLegalTitle}
          </h2>
          <p>{UI_COPY.privacyLegalBody}</p>
        </section>

        <p>
          <Link
            href="/"
            className="text-slate-300 underline-offset-2 hover:underline"
          >
            {UI_COPY.backToChat}
          </Link>
        </p>
      </article>
    </main>
  );
}
