import defaults from './content-defaults.json';
export type ContentBlock={id:string;group:string;label:string;title:string;body:string;linkLabel:string;linkUrl:string};
export const defaultBlocks:ContentBlock[]=defaults;
