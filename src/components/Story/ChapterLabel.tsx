export default function ChapterLabel({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <p className="chapter-label">
      <span>{number}</span>
      <span className="label-rule" />
      {children}
    </p>
  );
}
