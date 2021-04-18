require('isomorphic-fetch');
const dotenv = require('dotenv');
dotenv.config();
const Koa = require('koa');
const next = require('next');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');
const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy');
const { ApiVersion } = require('@shopify/koa-shopify-graphql-proxy');
const Router = require('koa-router');
const { receiveWebhook, registerWebhook } = require('@shopify/koa-shopify-webhooks');

const { Pool } = require("pg");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const {
  SHOPIFY_API_SECRET_KEY,
  SHOPIFY_API_KEY,
  HOST,
} = process.env;
  
app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();

  server.use(session({ sameSite: 'none', secure: true }, server));
  server.keys = [SHOPIFY_API_SECRET_KEY];

  server.pool = new Pool({
    user: 'prrsbxxhpdgjwi',
    host: 'ec2-52-23-45-36.compute-1.amazonaws.com',
    database: 'd3nb7unse3sq4u',
    password: 'b470a762490ee281efa562d75def798a019c3b4dac411bb2737f2eeb4cc77965', 
    port: 5432,
    ssl: { rejectUnauthorized: false }
  });

  server.use(
    createShopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET_KEY,
      scopes: ['read_products', 'write_products'],
      async afterAuth(ctx) {
        const { shop, accessToken } = ctx.session;
        ctx.cookies.set("shopOrigin", shop, {
          httpOnly: false,
          secure: true,
          sameSite: 'none'
        });
      }
    })
  );

  const webhook = receiveWebhook({ secret: SHOPIFY_API_SECRET_KEY });

  router.post('/webhooks/products/create', webhook, (ctx) => {
    console.log('received webhook: ', ctx.state.webhook);
  });

  router.get("/api/rates", async (ctx) => {
    const { rows } = await ctx.app.pool.query("SELECT * FROM exchange_rates")
    ctx.body = JSON.stringify(rows);
  })

  router.post("/api/rates", (ctx) => {
    var usdeur = ctx.request.query["USDEUR"];
    var usdgbp = ctx.request.query["USDGBP"];
    
    ctx.body = "UPDATE exchange_rates SET value=" + usdeur + " WHERE key='USDEUR'";

    ctx.app.pool.query("UPDATE exchange_rates SET value=" + usdeur + " WHERE key='USDEUR'");
    ctx.app.pool.query("UPDATE exchange_rates SET value=" + usdgbp + " WHERE key='USDGBP'");
  })

  server.use(graphQLProxy({ version: ApiVersion.July20 }));

  router.get('(.*)', verifyRequest(), async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  });

  server.use(router.allowedMethods());
  server.use(router.routes());

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
