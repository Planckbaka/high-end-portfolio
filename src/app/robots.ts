import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/'],
        },
        sitemap: 'https://high-end-portfolio.1229773363.workers.dev/sitemap.xml', // Update with your actual domain
    };
}
