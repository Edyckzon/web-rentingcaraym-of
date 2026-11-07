import type {ContentBlock} from '@/lib/content-blocks';

export function ContentText({text}:{text:string}) {
  return <>{text.split(/\n\s*\n/).filter(Boolean).map((paragraph,i)=><p key={i} style={{whiteSpace:'pre-line'}}>{paragraph}</p>)}</>;
}
export function ContentLink({block,fallbackUrl}:{block:ContentBlock;fallbackUrl?:string}) {
  const href=block.linkUrl||fallbackUrl;
  if(!block.linkLabel||!href)return null;
  // Plain text only; reject unsafe protocols even if data was edited outside the admin.
  if(!/^(https:\/\/|\/(?!\/))/.test(href)||/[\\\s]/.test(href))return null;
  return <a className="text-link" href={href} {...(href.startsWith('https://')?{target:'_blank',rel:'noopener noreferrer'}:{})}>{block.linkLabel} →</a>;
}
