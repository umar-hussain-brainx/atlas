import { Shopify } from '@shopify/shopify-api';
import { MemorySessionStorage } from '@shopify/shopify-api/adapters/memory-session-storage';
import { restResources } from '@shopify/shopify-api/rest/admin/2023-04';

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(','),
  HOST_NAME: process.env.HOST.replace(/https?:\/\//, ''),
  API_VERSION: '2023-04',
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: new MemorySessionStorage(),
});

export const authenticate = {
  admin: async (request) => {
    const sessionId = await Shopify.Utils.loadCurrentSession(request);
    if (!sessionId) {
      return null;
    }
    const session = await Shopify.Context.SESSION_STORAGE.loadSession(sessionId);
    if (!session || !session.isActive()) {
      return null;
    }
    return session;
  },
};