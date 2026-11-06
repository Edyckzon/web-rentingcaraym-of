import content from 'marketing-content';
export type Listing = {id:string; name:string; category:string; description:string; images:string[]; featured:boolean};
export type Marketing = {
  title: string; accent: string; slogan: string; hero: string;
  firstLabel: string; firstUrl: string; secondLabel: string; secondUrl: string;
  phone: string; whatsapp: string; maps: string; waze: string;
  listings?: Listing[];
  covers: Record<string,string>;
};
export const edits = content as Partial<Marketing>;
export const home = content;
