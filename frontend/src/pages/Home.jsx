import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getToken } from '../lib/apiClient'
import { formatKobo } from '../lib/format'

export default function Home() {
  const navigate = useNavigate()
  const isLoggedIn = !!getToken()

  // Redirect authenticated merchants to the dashboard automatically
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoggedIn, navigate])

  return (
    <div className="min-h-screen bg-[#0d0e12] text-neutral-100 font-sans selection:bg-nomba-yellow selection:text-nomba-black">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0d0e12]/80 border-b border-neutral-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-nomba-yellow font-black text-nomba-black">
              F
            </span>
            <span className="text-xl font-bold text-white tracking-tight">FluxBill</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-neutral-400 hover:text-white transition text-sm font-medium">Features</a>
            <a href="#dunning" className="text-neutral-400 hover:text-white transition text-sm font-medium">Smart Retry</a>
            <a href="#pricing" className="text-neutral-400 hover:text-white transition text-sm font-medium">Pricing</a>
            <a href="#developers" className="text-neutral-400 hover:text-white transition text-sm font-medium">Developers</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-neutral-300 hover:text-white transition">
              Log in
            </Link>
            <Link to="/register" className="btn-primary px-5 py-2 text-sm rounded-lg font-bold shadow-lg shadow-nomba-yellow/10">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 border-b border-neutral-900">
        {/* Decorative background gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-nomba-yellow/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-nomba-yellow/10 px-3 py-1 text-xs font-semibold text-nomba-yellow mb-6">
            ✨ Built on Nomba Sub-Accounts + Tokenized Cards
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            The Recurring Revenue <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-nomba-yellow via-yellow-400 to-amber-500">
              Recovery Layer
            </span> for Nigeria
          </h1>
          <p className="text-lg sm:text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto mb-10">
            FluxBill closes the billing-infrastructure gap. We automatically recover failed recurring payments by matching specific decline reasons instead of using blind, generic retry schedules.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <Link to="/register" className="btn-primary px-8 py-3.5 rounded-xl text-base font-bold shadow-xl shadow-nomba-yellow/15 hover:brightness-105 transition">
              Start Recovering Free
            </Link>
            <a href="#dunning" className="inline-flex items-center justify-center rounded-xl border border-neutral-700 hover:border-neutral-500 bg-transparent hover:bg-neutral-800/40 text-neutral-200 px-8 py-3.5 text-base font-semibold transition">
              How it works
            </a>
          </div>

          {/* Social Proof */}
          <div className="mt-16 pt-8 border-t border-neutral-800/60 max-w-lg mx-auto">
            <p className="text-xs uppercase tracking-widest text-neutral-500 font-semibold mb-4">The numbers that justify our engine</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-white">Up to 25%</p>
                <p className="text-xs text-neutral-400 mt-1">Of subscription churn is involuntary</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold text-nomba-yellow">₦5B+</p>
                <p className="text-xs text-neutral-400 mt-1">TAM lost in failed payments in NG</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions / Features Section */}
      <section id="features" className="py-20 bg-[#090a0d]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
              Engineered Specifically for Nigerian Commerce
            </h2>
            <p className="text-neutral-400 text-base leading-relaxed">
              Chargebee and Recurly are expensive, foreign, and lack bank-specific decline patterns. Stripe Billing is unavailable. FluxBill was built to solve this.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Merchant-of-Record Structure"
              desc="Financial isolation per merchant using Nomba sub-accounts. Settlement directly into isolated merchant balances with automatic platform fee routing."
              icon="💳"
            />
            <FeatureCard
              title="Predictable Customer Portals"
              desc="Passwordless, single-use, hashed magic links that let your customers manage subscriptions, review invoice logs, or easily update tokenized cards."
              icon="🔑"
            />
            <FeatureCard
              title="Partial Bank-Transfer Settlement"
              desc="Accepts virtual account transfers with custom tolerance logic. Overpayments automatically yield credits, and shortfalls are flagged without access cuts."
              icon="🏦"
            />
            <FeatureCard
              title="Prorated Plan Changes"
              desc="Calculates exact upgrades and downgrades mid-cycle. Charges immediately for upgrades and creates credits for downgrades, matching Stripe's ergonomics."
              icon="📈"
            />
            <FeatureCard
              title="Seamless Developer Experience"
              desc="Standardised error payloads with specific codes, error fields, and request IDs. Comes with a live OpenAPI interactive try-it guide."
              icon="🛠️"
            />
            <FeatureCard
              title="AI Churn Predictor & Copilot"
              desc="Uses Gemini to run risk analysis on active cohorts, returning risk ratings and actionable retention recommendation strategies."
              icon="🤖"
            />
          </div>
        </div>
      </section>

      {/* Smart Retry Engine (Hero Feature Explanation) */}
      <section id="dunning" className="py-20 border-t border-neutral-900 relative">
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <span className="text-xs uppercase tracking-widest text-nomba-yellow font-bold">The Hero Feature</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-3 mb-6">
                Our Smart Retry Engine doesn't blind-guess.
              </h2>
              <p className="text-neutral-400 leading-relaxed mb-6">
                Most billing systems retry a failed charge on a rigid, hardcoded schedule (e.g., retrying every 2 days). This wastes valuable customer goodwill and risks bank flags.
              </p>
              <p className="text-neutral-400 leading-relaxed mb-6">
                FluxBill routes recovery schedules based on **decline reason logic**. If a bank is down, we retry aggressively. If a card is expired, we do not retry—we suspend access immediately and guide the customer to update their card.
              </p>
              <div className="space-y-3 mt-8">
                <DunningListItem title="CARD_EXPIRED / FROZEN" desc="Skip grace periods entirely. Avoid dead attempts and require user intervention." />
                <DunningListItem title="BANK_UNAVAILABLE" desc="Retry aggressively every 4 hours quietly. Do not trigger alarms or customer notifications." />
                <DunningListItem title="INSUFFICIENT_FUNDS" desc="Escalate standard retries (Days 3, 5, 7) aligned with standard salary cycles." />
              </div>
            </div>

            <div className="card border-neutral-800 bg-[#121318]/90 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-[3px] w-24 bg-nomba-yellow"></div>
              <h3 className="text-lg font-bold text-white mb-4">Recovery Logic Routing</h3>
              <div className="space-y-4">
                <SimulatorRow code="CARD_EXPIRED" action="Request Card Update" badge="Access Suspended" color="bg-red-500/20 text-red-400" />
                <SimulatorRow code="BANK_UNAVAILABLE" action="Retry in 4 hours (Quiet)" badge="Retry Scheduled" color="bg-blue-500/20 text-blue-400" />
                <SimulatorRow code="INSUFFICIENT_FUNDS" action="Retry in 3 days" badge="Grace Period" color="bg-amber-500/20 text-amber-400" />
                <SimulatorRow code="DO_NOT_HONOR" action="Retry once only (+3d)" badge="Max 1 Retry" color="bg-neutral-500/20 text-neutral-400" />
              </div>
              <div className="mt-6 pt-5 border-t border-neutral-800/80 text-xs text-neutral-500 flex justify-between">
                <span>Core DunningRouter active</span>
                <span className="text-nomba-yellow font-semibold">100% automated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-[#090a0d] border-t border-neutral-900">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-neutral-400 text-base">
              Start with no monthly commitment. Scale as your subscription volume grows.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="card border-neutral-800 bg-[#0d0e12] flex flex-col justify-between hover:border-neutral-700 transition">
              <div>
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <p className="text-sm text-neutral-500 mt-1">Solo creators & small clubs</p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-white">Free</span>
                  <span className="text-sm text-neutral-500"> / month</span>
                </div>
                <ul className="space-y-3 text-sm text-neutral-400 mb-8">
                  <li>✨ 2.0% transaction fee</li>
                  <li>✨ Unlimited subscription plans</li>
                  <li>✨ Automated Smart Retries</li>
                  <li>✨ Customer portals</li>
                </ul>
              </div>
              <Link to="/register" className="w-full btn-ghost border-neutral-800 hover:bg-neutral-800 text-center py-2.5 rounded-lg text-sm font-bold transition">
                Start Free
              </Link>
            </div>

            {/* Growth */}
            <div className="card border-nomba-yellow/30 bg-[#121318] flex flex-col justify-between hover:border-nomba-yellow/50 transition relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-nomba-yellow text-nomba-black text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Popular
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Growth</h3>
                <p className="text-sm text-neutral-500 mt-1">SaaS companies & gyms</p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-white">₦15,000</span>
                  <span className="text-sm text-neutral-500"> / month</span>
                </div>
                <ul className="space-y-3 text-sm text-neutral-400 mb-8">
                  <li>✨ 1.5% transaction fee</li>
                  <li>✨ Everything in Starter</li>
                  <li>✨ Gemini AI Copilot Integration</li>
                  <li>✨ Custom Webhook Endpoints</li>
                </ul>
              </div>
              <Link to="/register" className="w-full btn-primary text-center py-2.5 rounded-lg text-sm font-bold transition">
                Start Growth
              </Link>
            </div>

            {/* Enterprise */}
            <div className="card border-neutral-800 bg-[#0d0e12] flex flex-col justify-between hover:border-neutral-700 transition">
              <div>
                <h3 className="text-lg font-bold text-white">Enterprise</h3>
                <p className="text-sm text-neutral-500 mt-1">High-volume merchants</p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-white">₦75,000</span>
                  <span className="text-sm text-neutral-500"> / month</span>
                </div>
                <ul className="space-y-3 text-sm text-neutral-400 mb-8">
                  <li>✨ 0.75% transaction fee</li>
                  <li>✨ Everything in Growth</li>
                  <li>✨ Custom webhook setups</li>
                  <li>✨ Dedicated integration assistance</li>
                </ul>
              </div>
              <Link to="/register" className="w-full btn-ghost border-neutral-800 hover:bg-neutral-800 text-center py-2.5 rounded-lg text-sm font-bold transition">
                Contact Enterprise
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Developer CTA Section */}
      <section id="developers" className="py-20 border-t border-neutral-900 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-nomba-yellow/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
          <h2 className="text-3xl font-extrabold text-white mb-6">Designed by Developers, for Developers</h2>
          <p className="text-neutral-400 text-base max-w-2xl mx-auto mb-10 leading-relaxed">
            FluxBill implements a robust REST API with standard HTTP statuses, auto-generated Scramble OpenAPI specs, and developer-friendly error formatting. Integrating recurring payments takes just minutes.
          </p>
          <div className="inline-flex flex-wrap gap-4 justify-center">
            <a href="https://api.nomba.com" target="_blank" rel="noopener noreferrer" className="btn-ghost border-neutral-700 hover:bg-neutral-800 text-neutral-200 px-6 py-3 rounded-lg text-sm font-semibold transition">
              Nomba API Docs
            </a>
            <Link to="/register" className="btn-primary px-6 py-3 rounded-lg text-sm font-bold shadow-lg shadow-nomba-yellow/10">
              Create Developer Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#07080a] border-t border-neutral-900 py-12 text-neutral-500 text-sm">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded bg-nomba-yellow text-[10px] font-black text-nomba-black">
              F
            </span>
            <span className="font-semibold text-neutral-300">FluxBill</span>
          </div>
          <p className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} FluxBill. Built for the Nomba × DevCareer Hackathon 2026.
          </p>
          <div className="flex gap-4">
            <a href="#features" className="hover:text-neutral-300 transition">Features</a>
            <a href="#pricing" className="hover:text-neutral-300 transition">Pricing</a>
            <a href="#developers" className="hover:text-neutral-300 transition">Developers</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, desc, icon }) {
  return (
    <div className="card border-neutral-800 bg-[#0d0e12] hover:border-neutral-700 transition">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-neutral-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function DunningListItem({ title, desc }) {
  return (
    <div className="flex gap-3">
      <span className="text-nomba-yellow text-base font-bold">✓</span>
      <div>
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="text-xs text-neutral-400 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

function SimulatorRow({ code, action, badge, color }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80">
      <div>
        <code className="text-xs font-mono text-neutral-300 font-bold">{code}</code>
        <p className="text-xs text-neutral-400 mt-0.5">{action}</p>
      </div>
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${color}`}>
        {badge}
      </span>
    </div>
  )
}
