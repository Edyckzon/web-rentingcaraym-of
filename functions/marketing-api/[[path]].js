import { marketingAPI } from '../../server/marketing-api.mjs';
export const onRequest=({request,env})=>marketingAPI(request,env);
