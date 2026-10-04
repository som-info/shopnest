export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        © {new Date().getFullYear()} ShopNest · Built by Amir Namvar with React &amp; Django
      </div>
    </footer>
  );
}
