import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { renderToString } from 'react-dom/server';
import type { ComponentType } from 'react';

type PageModule = { default: ComponentType };

const pages = import.meta.glob<PageModule>('./Pages/**/*.tsx', { eager: true });

createServer((page) => createInertiaApp({
    page,
    render: renderToString,
    resolve: (name) => pages[`./Pages/${name}.tsx`],
    setup: ({ App, props }) => <App {...props} />,
}));
