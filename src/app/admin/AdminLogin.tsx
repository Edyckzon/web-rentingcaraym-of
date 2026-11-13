'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import SiteSignature from '@/components/SiteSignature';
import brandLogo from '@/lib/img/RENTING-CAR.png';
import { validateAdminCredentials } from '@/lib/admin-credentials.mjs';

export default function AdminLogin({ busy, message, onSignIn }: {
  busy: boolean;
  message: string;
  onSignIn: (email: string, password: string) => void;
}) {
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  function check(field: keyof typeof errors) {
    const result = validateAdminCredentials(email.current?.value, password.current?.value);
    setErrors(current => ({ ...current, [field]: result.errors[field] }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const result = validateAdminCredentials(email.current?.value, password.current?.value);
    setErrors(result.errors);
    if (result.errors.email || result.errors.password) {
      (result.errors.email ? email : password).current?.focus();
      return;
    }
    setVisible(false);
    onSignIn(result.email, result.password);
  }

  return <div className="studio login admin-login">
    <div className="admin-login-panel">
      <aside className="admin-login-brand" aria-label="Renting Car A&M">
        <img src={brandLogo.src} width={brandLogo.width} height={brandLogo.height} alt="Renting Car A&M"/>
        <p>Gestión de flota, tarifas y contenido.</p>
        <Link href="/"><ArrowLeft size={16} aria-hidden="true"/> Volver al sitio</Link>
      </aside>
      <form className="admin-login-form" method="post" onSubmit={submit} noValidate aria-labelledby="login-title">
        <div><h1 id="login-title">Administración del sitio</h1><p>Ingresa con tu cuenta autorizada.</p></div>
        <fieldset disabled={busy}>
          <div className="admin-login-field">
            <label htmlFor="admin-login-email">Correo autorizado</label>
            <div className="admin-login-input"><Mail size={18} aria-hidden="true"/>
              <input ref={email} id="admin-login-email" name="email" type="email" autoComplete="username" maxLength={254} required
                aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'admin-login-email-error' : undefined}
                onBlur={() => check('email')} onChange={() => { if (errors.email) check('email'); }}/>
            </div>
            {errors.email && <p className="admin-login-error" id="admin-login-email-error">{errors.email}</p>}
          </div>
          <div className="admin-login-field">
            <label htmlFor="admin-login-password">Contraseña</label>
            <div className="admin-login-input admin-login-password"><LockKeyhole size={18} aria-hidden="true"/>
              <input ref={password} id="admin-login-password" name="password" type={visible ? 'text' : 'password'} autoComplete="current-password" maxLength={4096} required
                aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'admin-login-password-error' : undefined}
                onBlur={() => check('password')} onChange={() => { if (errors.password) check('password'); }}/>
              <button type="button" className="admin-login-visibility" aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setVisible(value => !value)}>{visible ? <EyeOff size={18} aria-hidden="true"/> : <Eye size={18} aria-hidden="true"/>}</button>
            </div>
            {errors.password && <p className="admin-login-error" id="admin-login-password-error">{errors.password}</p>}
          </div>
          <button className="gold admin-login-submit" type="submit">{busy ? 'Verificando acceso…' : 'Ingresar'} <ArrowRight size={17} aria-hidden="true"/></button>
        </fieldset>
        {message && <p className="admin-login-notice" role="alert">{message}</p>}
        <SiteSignature admin/>
      </form>
    </div>
  </div>;
}
