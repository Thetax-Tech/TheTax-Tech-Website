/** Page transition: re-mounts on every navigation; pure CSS so it never delays first paint. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
