import snapshot from './marketing-public.json';
export type WebPage = {path:string; title:string; description:string; heading:string; intro:string; updatedAt?:string};
export const webPages: WebPage[] = (snapshot as unknown as {pages?:WebPage[]}).pages ?? [];
export function pageContent(path:string) { return webPages.find(page=>page.path===path); }
