import React from 'react';

export default function Home() {
  return (
    <main className="bg-white min-h-screen py-12 px-8">
      <div className="max-w-screen-xl w-full mx-auto">
        <header className="flex justify-between items-start mb-12">
          <div className="flex items-start space-x-4">
            <img
              src="https://placehold.co/40x40"
              alt="builder.io logo"
              className="h-10 w-10"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">builder.io</h1>
              <p className="text-sm text-gray-700 max-w-xs">
                Visually build and optimize digital experiences on any tech stack. No coding required, and developer approved.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-2">
            <button className="bg-orange-500 text-white py-2 px-4 rounded-full text-sm">
              Get Started
            </button>
            <a href="#" className="text-orange-500 flex items-center text-sm">
              Log in <span className="ml-1 text-lg">→</span>
            </a>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-sm leading-6 mb-16">
          <div>
            <h2 className="text-xs font-bold mb-4 text-gray-900">DEVELOPERS</h2>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-700 hover:underline">Builder for Developers</a></li>
              <li><a href="#" className="text-gray-700 hover:underline">Developer Docs</a></li>
              <li><a href="#" className="text-gray-700 hover:underline">Open Source Projects</a></li>
              <li><a href="#" className="text-gray-700 hover:underline">Performance Insights</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-bold mb-4 text-gray-900">INTEGRATIONS</h2>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-700 hover:underline">All Integrations</a></li>
              <li><a href="#" className="text-gray-700 hover:underline">Shopify</a></li>
              <li><a href="#" className="text-gray-700 hover:underline">React</a></li>
              <li><a href="#" className="text-gray-700 hover:underline">Angular</a></li>
              <li><a href="#" className="text-gray-700 hover:underline">Next.js</a></li>
              <li><a href="#" className="text-gray-700 hover:underline">Gatsby</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-bold mb-4 text-gray-900">RESOURCES</h2>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-700 hover:underline">User Guides</a></li>
              <li><a href="#" className="text-gray-700 hover:underline">Blog</a></li>
              <li><a href="#" className="text-gray-700 hover:underline">Community Forum</a></li>
              <li><a href="#" className="text-gray-700 hover:underline">Templates</a></li>
              <li><a href="#" className="text-gray-700 hover:underline">Partners</a></li>
              <li><a href="#" className="text-gray-700 hover:underline">Submit an Idea</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-bold mb-4 text-gray-900">USE CASES</h2>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-700 hover:underline">Landing Pages</a></li>
              <li><a href="#" className="text-gray-700 hover:underline">Shopify Storefront</a></li>
              <li><a href="#" className="text-gray-700 hover:underline">Headless CMS</a></li>
              <li><a href="#" className="text-gray-700 hover:underline">Headless Storefront</a></li>
              <li><a href="#" className="text-gray-700 hover:underline">Customer Showcase</a></li>
              <li><a href="#" className="text-gray-700 hover:underline">Customer Success Stories</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-bold mb-4 text-gray-900">COMPANY</h2>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-700 hover:underline">About</a></li>
              <li><a href="#" className="text-gray-700 hover:underline">Careers <span className="ml-1">✍️</span></a></li>
            </ul>
          </div>
        </div>

        <footer className="text-xs text-gray-600">
          <div className="flex flex-col md:flex-row justify-between items-center py-4 border-t border-gray-300">
            <div className="flex items-center space-x-1 mb-2 md:mb-0">
              <small>© 2022 Builder.io, Inc.</small>
              <span>|</span>
              <a href="#" className="hover:underline">Security</a>
              <span>|</span>
              <a href="#" className="hover:underline">Privacy Policy</a>
              <span>|</span>
              <a href="#" className="hover:underline">Terms of Service</a>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-gray-800"><i className="fab fa-github text-xl"></i></a>
              <a href="#" className="hover:text-gray-800"><i className="fab fa-twitter text-xl"></i></a>
              <a href="#" className="hover:text-gray-800"><i className="fab fa-linkedin text-xl"></i></a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}