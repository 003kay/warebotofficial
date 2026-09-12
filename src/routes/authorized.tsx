import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
export const Route = createFileRoute("/authorized")({
  head: () => ({ meta: [{ title: "Authorized — ware" }] }),
  component: AuthorizedPage,
});
function AuthorizedPage() {
  return (
    <PublicLayout>
      <section className="pub-status">
        <p className="pub-label">Authorization complete</p>
        <h1>You're all set.</h1>
        <p>You can close this tab and return to Discord.</p>
        <div className="pub-actions">
          <a href="/commands" className="pub-button">
            Browse commands
          </a>
          <a href="/" className="pub-text-link">
            Back to Ware
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
