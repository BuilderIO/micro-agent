--- test/nextjs-app/app/page.tsx
+++ test/nextjs-app/app/page.tsx
@@ -15,7 +15,7 @@
         <div>
           <h1 className="text-3xl font-bold text-gray-900">builder.io</h1>
           <p className="text-base text-gray-700 mt-1 max-w-md">
-            Visually build and optimize digital experiences on any tech stack. No coding required, and developer approved.
+            Visually build and optimize digital experiences on any tech stack. No coding required and developer approved.
           </p>
         </div>
       </div>
@@ -39,7 +39,7 @@
           <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Performance Insights</a></li>
         </ul>
       </div>
-
       <div>
         <h2 className="font-bold text-gray-800 mb-4">INTEGRATIONS</h2>
         <ul className="list-none p-0">
@@ -77,7 +77,10 @@
           <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Customer Showcase</a></li>
           <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Customer Success Stories</a></li>
         </ul>
-      </div>
+      </div> 
+     <div>
+        <h2 className="font-bold text-gray-800 mb-4">COMPANY</h2>
+        <ul className="list-none p-0">
         <li><a href="#" className="text-gray-700 block mb-2 hover:underline">About</a></li>
         <li><a href="#" className="text-gray-700 block mb-2 hover:underline">Careers <span className="ml-2">✍️</span></a></li>
         </ul>
@@ -86,13 +89,9 @@
     </div>
 
     <footer className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-gray-300 text-xs">
-      <div className="text-gray-600 text-center md:text-left mb-4 md:mb-0">
+      <div className="text-gray-600 text-center mb-4 md:mb-0">
         <small>© 2022 Builder.io, Inc.</small> |
         <a href="#" className="text-gray-600 hover:underline mx-2">Security</a> |
         <a href="#" className="text-gray-600 hover:underline mx-2">Privacy Policy</a> |
         <a href="#" className="text-gray-600 hover:underline mx-2">Terms of Service</a>
-      </div>
-      <div className="flex space-x-4">
-        <a href="#" className="text-gray-600 hover:text-gray-800">
-          <i className="fab fa-github text-xl"></i>
-        </a>
-        <a href="#" className="text-gray-600 hover:text-gray-800">
-          <i className="fab fa-twitter text-xl"></i>
-        </a>
-        <a href="#" className="text-gray-600 hover:text-gray-800">
-          <i className="fab fa-linkedin text-xl"></i>
+      </div>
+      <div className="flex space-x-4 text-gray-600">
+        <a href="#" className="hover:text-gray-800"><i className="fab fa-github text-xl"></i></a>
+        <a href="#" className="hover:text-gray-800"><i className="fab fa-twitter text-xl"></i></a>
+        <a href="#" className="hover:text-gray-800"><i className="fab fa-linkedin text-xl"></i></a>
       </div>
     </footer>
   </div>