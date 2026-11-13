import type { Metadata } from 'next';
import Editor from './editor';

export const metadata: Metadata = { title: 'Administración del sitio' };

export default function AdminPage() { return <Editor/>; }
