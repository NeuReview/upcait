import React, { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

const tiers = [
  {
    name: 'Free',
    id: 'tier-free',
    href: '#',
    price: { monthly: '₱0', yearly: '₱0' },
    description: 'Perfect for getting started with UPCAT preparation.',
    features: [
      'Basic study materials',
      'Limited practice questions',
      'Basic progress tracking',
      'Community forum access',
      'Email support'
    ],
    mostPopular: false,
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '#',
    price: { monthly: '₱1,500', yearly: '₱15,000' },
    description: 'Ideal for serious UPCAT aspirants.',
    features: [
      'Everything in Free tier',
      'Unlimited practice questions',
      'Advanced progress tracking',
      'Personalized study plans',
      'Priority email support',
      'Mock exam simulations',
      'Performance analytics',
      'One-on-one tutoring sessions',
      'Live webinar access'
    ],
    mostPopular: true,
  },
];

const PricingSection = () => {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-neural-purple">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose your success path
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Invest in your future with our comprehensive UPCAT preparation packages
        </p>

        {/* Billing toggle */}
        <div className="mt-16 flex justify-center">
          <div className="flex items-center gap-x-4">
            <span className={`text-sm ${!annual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly billing
            </span>
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                annual ? 'bg-neural-purple' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={annual}
              onClick={() => setAnnual(!annual)}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  annual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm ${annual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual billing
            </span>
            <span className="ml-3 rounded-full bg-growth-green/10 px-3 py-1 text-sm font-semibold text-growth-green">
              Save 20%
            </span>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 ring-1 ring-gray-200 hover-card-effect ${
                tier.mostPopular
                  ? 'bg-gray-900 text-white ring-gray-900'
                  : 'bg-white text-gray-900'
              }`}
            >
              <h3 className="text-2xl font-bold tracking-tight">{tier.name}</h3>
              {tier.mostPopular && (
                <p className="mt-4 text-sm font-semibold text-white">
                  Most popular
                </p>
              )}
              <p className="mt-4 text-sm leading-6 text-gray-600">
                {tier.description}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight">
                  {annual ? tier.price.yearly : tier.price.monthly}
                </span>
                <span className={tier.mostPopular ? 'text-gray-300' : 'text-gray-500'}>
                  /{annual ? 'year' : 'month'}
                </span>
              </p>
              <a
                href={tier.href}
                className={`mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.mostPopular
                    ? 'bg-neural-purple text-white hover:bg-tech-lavender focus-visible:outline-neural-purple'
                    : 'bg-neural-purple text-white hover:bg-tech-lavender focus-visible:outline-neural-purple'
                }`}
              >
                Get started today
              </a>
              <ul
                role="list"
                className={`mt-8 space-y-3 text-sm leading-6 ${
                  tier.mostPopular ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      className={`h-6 w-5 flex-none ${
                        tier.mostPopular ? 'text-neural-purple' : 'text-neural-purple'
                      }`}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingSection;