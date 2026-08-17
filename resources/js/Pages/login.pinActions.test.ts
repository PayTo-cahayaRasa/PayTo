import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const loginPageSource = readFileSync(new URL('./login.tsx', import.meta.url), 'utf8');

test('PIN recovery and return-to-home actions have clear visual hierarchy', () => {
    assert.match(loginPageSource, /<Link href="\/lupa-pin" className="mt-5 flex w-full max-w-\[220px\] items-center gap-3 rounded-2xl border border-\[#dfcfbb\] bg-white p-3/);
    assert.match(loginPageSource, /<Lock size=\{17\} aria-hidden="true" \/>/);
    assert.match(loginPageSource, /<p className="text-sm font-bold text-\[#3d281b\]">Lupa PIN\?<\/p>/);
    assert.match(loginPageSource, /Atur ulang PIN lewat email/);
    assert.match(loginPageSource, /Kembali ke beranda/);
    assert.match(loginPageSource, /bg-\[#fff8ef\] px-3 py-2/);
});
