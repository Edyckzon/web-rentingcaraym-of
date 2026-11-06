import { business } from '@/lib/business';

export default function SiteSignature({ admin = false }: { admin?: boolean }) {
  return <div className={admin ? 'admin-signature' : undefined}>
    {admin && <p>© {new Date().getFullYear()} <a href={business.groupUrl}>Grupo A&amp;M</a></p>}
    <p className="footer-signature" lang="en">
      <span>Designed &amp; powered by <a href="https://onesecurezone.com/">onesecurezone.com</a></span>
      <span className="footer-developer">Edixon PB</span>
    </p>
  </div>;
}
