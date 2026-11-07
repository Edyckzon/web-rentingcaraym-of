import type { WebPage } from './page-content';
import type { ContentBlock } from './content-blocks';
import content from 'marketing-content';
export type Listing = {id:string; name:string; category:string; description:string; images:string[]; featured:boolean; seoTitle?:string; seoDescription?:string; idealFor?:string; updatedAt?:string};
export type Marketing = {
  title: string; accent: string; slogan: string; hero: string;
  firstLabel: string; firstUrl: string; secondLabel: string; secondUrl: string;
  phone: string; whatsapp: string; maps: string; waze: string; hours?: string;
  email?: string; adminEmail?: string; address?: string; groupUrl?: string;
  blocks?: ContentBlock[];
  listings?: Listing[];
  pages?: WebPage[];
  covers: Record<string,string>;
};
export const edits = content as Partial<Marketing>;
export const home = content;
