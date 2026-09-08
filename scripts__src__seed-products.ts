import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) throw new Error("STRIPE_SECRET_KEY is required");
const stripe = new Stripe(secretKey);

const packs = [
  { name: "Starter Pack",    analyses: 1,   amount: 199,   metadata: { credits: "1" } },
  { name: "Growth Pack",     analyses: 20,  amount: 3499,  metadata: { credits: "20" } },
  { name: "Team Pack",       analyses: 50,  amount: 7999,  metadata: { credits: "50" } },
  { name: "Scale Pack",      analyses: 100, amount: 13999, metadata: { credits: "100" } },
  { name: "Enterprise Pack", analyses: 500, amount: 49999, metadata: { credits: "500" } },
];

async function seed() {
  for (const pack of packs) {
    const existing = await stripe.products.search({ query: `name:'${pack.name}' AND active:'true'` });
    if (existing.data.length > 0) {
      console.log(`Already exists: ${pack.name} (${existing.data[0].id})`);
      continue;
    }
    const product = await stripe.products.create({
      name: pack.name,
      metadata: pack.metadata,
    });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: pack.amount,
      currency: "usd",
    });
    console.log(`Created: ${pack.name} — product ${product.id}, price ${price.id}`);
  }
  console.log("Done.");
}

seed().catch((err) => { console.error(err); process.exit(1); });
