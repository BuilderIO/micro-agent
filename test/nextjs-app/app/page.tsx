import React from 'react';

export default function Home() {
return (
  <main className="bg-white min-h-screen py-12 px-4 sm:px-8">
    <div className="max-w-screen-xl w-full mx-auto">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center space-x-4">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F2f3409f4c3e4445d8c394e22f0e60d8d"
            alt="builder.io logo"
            className="h-8 w-auto"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">builder.io</h1>
            <p className="text-gray-500 text-sm">
              Visually build and optimize digital experiences on any tech stack. No coding required, and developer approved.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-[#ff6a00] text-white py-2 px-6 rounded-md text-sm whitespace-nowrap">
            Get Started
          </button>
          <a href="#" className="text-[#ff6a00] text-sm flex items-center">
            Log in <span className="ml-1">→</span>
          </a>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div>
          <h3 className="text-[#ff6a00] uppercase font-bold mb-4">Developers</h3>
          <ul className="text-sm space-y-2">
            <li>Builder for Developers</li>
            <li>Developer Docs</li>
            <li>Open Source Projects</li> 
            <li>Performance Insights</li>
          </ul>
        </div>
        <div>
          <h3 className="text-[#ff6a00] uppercase font-bold mb-4">Integrations</h3>
          <ul className="text-sm space-y-2">
            <li>All integrations</li>
            <li>Shopify</li>
            <li>React</li>
            <li>Angular</li>
            <li>Next.js</li>
            <li>Gatsby</li>
          </ul>
        </div>
        <div>
          <h3 className="text-[#ff6a00] uppercase font-bold mb-4">Resources</h3>
          <ul className="text-sm space-y-2">
            <li>User Guides</li>
            <li>Blog</li>
            <li>Community Forum</li>
            <li>Templates</li>
            <li>Partners</li>
            <li>Submit an Idea</li>
          </ul>
        </div>
        <div>
          <h3 className="text-[#ff6a00] uppercase font-bold mb-4">Product</h3>
          <ul className="text-sm space-y-2">
            <li>Features</li>
            <li>Pricing</li>
          </ul>
        </div>
        <div>
          <h3 className="text-[#ff6a00] uppercase font-bold mb-4">Use Cases</h3>  
          <ul className="text-sm space-y-2">
            <li>Landing Pages</li>
            <li>Shopify Storefront</li>
            <li>Headless CMS</li>
            <li>Headless Storefront</li>
            <li>Customer Showcase</li>
            <li>Customer Success Stories</li>
          </ul>
        </div>
        <div>  
          <h3 className="text-[#ff6a00] uppercase font-bold mb-4">Company</h3>
          <ul className="text-sm space-y-2">
            <li>About</li>
            <li>Careers</li>
          </ul>
        </div>
      </div>

      <footer className="text-xs text-gray-600 border-t border-gray-300 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-wrap space-x-6">
            <span>© 2022 Builder.io, Inc.</span>
            <a href="#" className="hover:text-gray-800">Security</a>
            <a href="#" className="hover:text-gray-800">Privacy Policy</a>  
            <a href="#" className="hover:text-gray-800">Terms of Service</a>
          </div>
          <div className="flex space-x-4">
            <a href="#">
              <img src="https://placehold.co/20x20" alt="GitHub" className="h-5 w-5" />
            </a>
            <a href="#">
              <img src="https://placehold.co/20x20" alt="Twitter" className="h-5 w-5" />
            </a>
            <a href="#">  
              <img src="https://placehold.co/20x20" alt="LinkedIn" className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  </main>
);
}