import test from 'node:test';
import assert from 'node:assert/strict';
import { imageDownloadUrl, imageDownloadName, downloadImage } from '../src/lib/image-download.mjs';

const origin = 'https://rentingcaraym.com';
const storage = 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/';

test('allows uploaded photos and packaged cover assets', () => {
  assert.equal(imageDownloadUrl(storage + 'photo.webp', origin), storage + 'photo.webp');
  assert.equal(imageDownloadUrl('/images/portada-lima/portada-lima.webp', origin), origin + '/images/portada-lima/portada-lima.webp');
  assert.equal(imageDownloadUrl('/brand/logo.png', origin), origin + '/brand/logo.png');
});

test('rejects private pages, traversal, foreign hosts and executable URLs', () => {
  for (const src of ['/marketing-api/content/', '/images/../admin/', '//example.com/image.jpg',
    'javascript:alert(1)', 'data:image/png;base64,abc', storage.replace('.co/', '.co.evil.test/') + 'photo.webp',
    storage.replace('/public/', '/authenticated/') + 'photo.webp',
    storage.replace('https://', 'https://user:password@') + 'photo.webp']) {
    assert.throws(() => imageDownloadUrl(src, origin));
  }
});

test('uses image type for the extension, sanitizes filenames and rejects HTML errors', () => {
  assert.equal(imageDownloadName('../Camión: foto 1.png', 'image/webp'), 'camion-foto-1.webp');
  assert.equal(imageDownloadName('Portada', 'image/png; charset=binary'), 'portada.png');
  assert.throws(() => imageDownloadName('Portada', 'text/html'));
});

test('downloads remote photos as blobs without cookies and releases temporary links', async t => {
  const calls = [];
  let cleanup;
  const link = { click() { calls.push('click'); }, remove() { calls.push('remove'); } };
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, storage + 'photo.webp');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.redirect, 'error');
    return new Response(new Blob(['image'], { type: 'image/webp' }));
  });
  t.mock.method(URL, 'createObjectURL', () => 'blob:test');
  t.mock.method(URL, 'revokeObjectURL', url => calls.push(url));
  globalThis.window = { location: { origin }, setTimeout(fn) { cleanup = fn; } };
  globalThis.document = { createElement: () => link, body: { append() { calls.push('append'); } } };
  t.after(() => { delete globalThis.window; delete globalThis.document; });
  await downloadImage(storage + 'photo.webp', 'Auto 1');
  assert.equal(link.download, 'auto-1.webp');
  assert.equal(link.href, 'blob:test');
  assert.deepEqual(calls, ['append', 'click', 'remove']);
  cleanup();
  assert.equal(calls.at(-1), 'blob:test');
});
