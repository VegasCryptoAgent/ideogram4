/**
 * stripe-setup.ts
 * Creates Shielded subscription products + prices in Stripe and
 * writes the resulting price IDs back into .env automatically.
 *
 * Run: npx tsx scripts/stripe-setup.ts
 */

import Stripe from 'stripe'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const key = process.env.STRIPE_SECRET_KEY
if (!key) {
  console.error('❌  STRIPE_SECRET_KEY not set in .env')
  process.exit(1)
}

const stripe = new Stripe(key, { apiVersion: '2024-10-28.acacia', typescript: true })

const ENV_PATH = path.resolve(__dirname, '../.env')

const PRODUCTS = [
  {
    envKey: 'STRIPE_PRICE_STARTER',
    name: 'Shielded Starter',
    description: 'Basic privacy protection — monthly scans, 50+ brokers, 1 virtual phone, 5 email aliases',
    unitAmount: 499,
    metadata: { plan: 'starter' },
  },
  {
    envKey: 'STRIPE_PRICE_PRO',
    name: 'Shielded Pro',
    description: 'Weekly scans, 200+ brokers, 3 virtual phones, 20 email aliases, breach monitoring',
    unitAmount: 999,
    metadata: { plan: 'pro' },
  },
  {
    envKey: 'STRIPE_PRICE_ULTIMATE',
    name: 'Shielded Ultimate',
    description: 'Daily scans, 200+ brokers, unlimited phones & aliases, AI spam blocking',
    unitAmount: 1999,
    metadata: { plan: 'ultimate' },
  },
]

function updateEnvFile(key: string, value: string): void {
  let content = fs.readFileSync(ENV_PATH, 'utf8')
  const regex = new RegExp(`^${key}=.*$`, 'm')
  const newLine = `${key}="${value}"`

  if (regex.test(content)) {
    content = content.replace(regex, newLine)
  } else {
    content += `\n${newLine}`
  }

  fs.writeFileSync(ENV_PATH, content, 'utf8')
}

async function findExistingPrice(productName: string, unitAmount: number): Promise<string | null> {
  const products = await stripe.products.list({ limit: 100, active: true })
  const existing = products.data.find((p) => p.name === productName)
  if (!existing) return null

  const prices = await stripe.prices.list({ product: existing.id, active: true, limit: 10 })
  const match = prices.data.find(
    (p) => p.unit_amount === unitAmount && p.recurring?.interval === 'month'
  )
  return match?.id ?? null
}

async function main() {
  console.log('\n🛡️  Shielded — Stripe Setup\n')

  // Verify key works
  try {
    await stripe.balance.retrieve()
    console.log('✅  Stripe key verified\n')
  } catch (err: any) {
    if (err?.code === 'api_key_expired' || err?.statusCode === 401) {
      console.error('❌  Stripe key is invalid or expired. Please check your STRIPE_SECRET_KEY.')
    } else if (err?.statusCode === 403) {
      console.error('❌  Stripe restricted key is missing the "Balance" read permission.')
      console.error('    Go to Stripe → Developers → Restricted keys and add: Balance (read)')
      console.error('    Or use your full secret key (sk_live_...) instead.')
    } else {
      console.error('❌  Stripe error:', err?.message)
    }
    process.exit(1)
  }

  const results: Record<string, string> = {}

  for (const plan of PRODUCTS) {
    process.stdout.write(`   Creating "${plan.name}"... `)

    try {
      // Check if already exists to be idempotent
      const existingPriceId = await findExistingPrice(plan.name, plan.unitAmount)
      if (existingPriceId) {
        console.log(`already exists → ${existingPriceId}`)
        results[plan.envKey] = existingPriceId
        updateEnvFile(plan.envKey, existingPriceId)
        continue
      }

      // Create product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: plan.metadata,
      })

      // Create monthly recurring price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.unitAmount,
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: plan.metadata,
      })

      results[plan.envKey] = price.id
      updateEnvFile(plan.envKey, price.id)
      console.log(`✅  ${price.id}`)
    } catch (err: any) {
      if (err?.statusCode === 403) {
        console.error(`\n❌  Permission denied creating "${plan.name}".`)
        console.error(
          '    Your restricted key needs: Products (write) + Prices (write) permissions.'
        )
        console.error(
          '    Go to Stripe → Developers → Restricted keys → edit your key → add those permissions.'
        )
        process.exit(1)
      }
      console.error(`\n❌  Failed: ${err?.message}`)
      process.exit(1)
    }
  }

  // Also configure billing portal (needed for "Manage Billing" button)
  try {
    process.stdout.write('   Configuring billing portal... ')
    await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Shielded Privacy — Manage your subscription',
      },
      features: {
        subscription_cancel: { enabled: true },
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price'],
          proration_behavior: 'create_prorations',
          products: PRODUCTS.map((p, i) => ({
            product: '', // filled below — skipping for now
            prices: [],
          })),
        },
        payment_method_update: { enabled: true },
        invoice_history: { enabled: true },
      },
    })
    console.log('✅')
  } catch {
    // Non-fatal — portal can be configured manually
    console.log('⚠️  (skipped — configure manually in Stripe dashboard if needed)')
  }

  console.log('\n✅  Done! Your .env has been updated with:\n')
  for (const [key, val] of Object.entries(results)) {
    console.log(`   ${key}="${val}"`)
  }
  console.log('\n   Next: npm run db:migrate && npm run db:seed && npm run dev\n')
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
