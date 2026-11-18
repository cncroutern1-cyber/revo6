// A full page (not a pop-up window): title plus content, scrolls on its own.
export default function Page({ title, children }) {
  return (
    <div className="page">
      <div className="page-inner">
        <h2 className="page-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}
