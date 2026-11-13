import { PromotionList } from '@/components/Promotions';
import BreadcrumbData from '@/components/BreadcrumbData';
import { PageIntro } from '@/components/Sections';
import { pageMetadata } from '@/lib/seo';

const title = 'Promociones de alquiler de autos en Lima';
const description = 'Consulte las campañas vigentes, los modelos incluidos y las condiciones para cotizar su vehículo.';
const path = '/promociones/';
export const metadata = pageMetadata(title, description, path);

export default function PromotionsPage() {
  return <><BreadcrumbData trail={[{ name: 'Promociones', path }]}/>
    <PageIntro label="Alquiler de vehículos" title={title} description={description}/>
    <section className="section container"><PromotionList/></section></>;
}
