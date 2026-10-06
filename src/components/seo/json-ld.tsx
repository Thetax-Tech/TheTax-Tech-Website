/** Renders one or more JSON-LD blocks. `<` is escaped to prevent script injection from CMS content. */
export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const items = (Array.isArray(data) ? data : [data]).filter(Boolean);
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\u003c") }}
        />
      ))}
    </>
  );
}
