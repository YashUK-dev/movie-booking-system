import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container flex-col items-center gap-4 text-center">
        <p className="text-secondary">© {new Date().getFullYear()} CineRed. All rights reserved.</p>
        <p className="text-muted text-sm">Experience the magic of cinema with our premium booking system.</p>
      </div>
    </footer>
  );
};

export default Footer;
