import React from 'react';

const navItems = [
  {
    title: "DEVELOPERS",
    links: [
      { name: "Builder for Developers", href: "#" },
      { name: "Developer Docs", href: "#" },
      { name: "Open Source Projects", href: "#" },
      { name: "Performance Insights", href: "#" },
    ],
  },
  {
    title: "INTEGRATIONS",
    links: [
      { name: "All Integrations", href: "#" },
      { name: "Shopify", href: "#" },
      { name: "React", href: "#" },
      { name: "Angular", href: "#" },
      { name: "Next.js", href: "#" },
      { name: "Gatsby", href: "#" },
    ],
  },
  {
    title: "RESOURCES",
    links: [
      { name: "User Guides", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Community Forum", href: "#" },
      { name: "Templates", href: "#" },
      { name: "Partners", href: "#" },
      { name: "Submit an Idea", href: "#" },
    ],
  },
  {
    title: "USE CASES",
    links: [
      { name: "Landing Pages", href: "#" },
      { name: "Shopify Storefront", href: "#" },
      { name: "Headless CMS", href: "#" },
      { name: "Headless Storefront", href: "#" },
      { name: "Customer Showcase", href: "#" },
      { name: "Customer Success Stories", href: "#" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { name: "About", href: "#" },
      { name: "Careers", href: "#" },
    ],
  },
  {
    title: "PRODUCT",
    links: [
      { name: "Features", href: "#" },
      { name: "Pricing", href: "#" },
    ],
  },
];

const Home: React.FC = () => {
  return (
    <main className="bg-white flex flex-col items-center min-h-screen py-12 font-sans">
      <div className="text-left flex flex-col items-center mb-8">
        <img src="https://placehold.co/150x50" alt="logo" className="mb-4" />
        <p className="text-black mb-6 max-w-lg text-center">
          Visually build and optimize digital experiences on any tech stack. No coding required, and developer approved.
        </p>
        <div className="flex space-x-4">
          <button className="bg-orange-500 text-white px-6 py-2 rounded-md">Get Started</button>
          <button className="text-orange-600 flex items-center">Log in <span className="ml-1">→</span></button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 w-full max-w-screen-xl text-left mb-8">
        {navItems.map((section) => (
          <div key={section.title}>
            <h2 className="text-sm font-semibold text-black">{section.title}</h2>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-700 hover:text-orange-600 text-sm">{link.name}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <footer className="w-full max-w-screen-xl border-t pt-8">
        <div className="text-center pb-4">
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="text-gray-700 hover:text-gray-900">Security</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Terms of Service</a>
          </div>
          <p className="text-xs text-gray-500 mt-4">&copy; 2022 Builder.io, Inc.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <a href="#" className="text-gray-700 hover:text-gray-900"><i className="fab fa-github"></i></a>
            <a href="#" className="text-gray-700 hover:text-gray-900"><i className="fab fa-twitter"></i></a>
            <a href="#" className="text-gray-700 hover:text-gray-900"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;