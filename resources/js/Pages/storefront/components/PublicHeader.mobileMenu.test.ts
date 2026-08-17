import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const publicHeaderSource = readFileSync(new URL('./PublicHeader.tsx', import.meta.url), 'utf8');
const headerIconButtonSource = readFileSync(new URL('./HeaderIconButton.tsx', import.meta.url), 'utf8');

test('mobile navigation trigger controls an accessible foldable menu', () => {
    assert.match(publicHeaderSource, /const \[isMobileMenuOpen, setIsMobileMenuOpen\] = useState\(false\);/);
    assert.match(publicHeaderSource, /ariaLabel=\{isMobileMenuOpen \? 'Tutup menu' : 'Buka menu'\}/);
    assert.match(publicHeaderSource, /isActive=\{isMobileMenuOpen\}/);
    assert.match(publicHeaderSource, /onClick=\{\(\) => setIsMobileMenuOpen\(\(current\) => !current\)\}/);
    assert.match(publicHeaderSource, /isMobileMenuOpen \? \(/);
    assert.match(publicHeaderSource, /href=\{storefrontShopHref\}/);
    assert.match(publicHeaderSource, /href="\/lacak-pesanan"/);
    assert.match(publicHeaderSource, /href="#kontak"/);
    assert.match(publicHeaderSource, /<Link href="\/login" onClick=\{\(\) => setIsMobileMenuOpen\(false\)\}/);
    assert.match(publicHeaderSource, /<LogIn size=\{18\} strokeWidth=\{1\.8\} \/>\s*Masuk/);
    assert.match(headerIconButtonSource, /aria-expanded=\{isActive\}/);
});
