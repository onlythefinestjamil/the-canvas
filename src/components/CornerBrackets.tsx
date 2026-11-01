export default function CornerBrackets({ color = '#38B6FF' }: { color?: string }) {
  return (
    <>
      <span className="bracket tl" style={{ borderColor: color }} />
      <span className="bracket tr" style={{ borderColor: color }} />
      <span className="bracket bl" style={{ borderColor: color }} />
      <span className="bracket br" style={{ borderColor: color }} />
    </>
  );
}
