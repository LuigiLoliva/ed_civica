export function AdminOnlyNotice({
  resource,
  showDemoHint = false,
}: {
  resource: string;
  showDemoHint?: boolean;
}) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
      Solo gli admin possono gestire {resource}.
      {showDemoHint
        ? " Usa il selettore ruolo demo nella dashboard articoli."
        : null}
    </div>
  );
}
