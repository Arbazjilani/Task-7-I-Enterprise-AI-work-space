import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-indigo-600">
            RothDesk Employee Portal
          </h1>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#home"
              className="text-slate-700 hover:text-indigo-600 transition-colors"
            >
              Home
            </a>
            <a
              href="#features"
              className="text-slate-700 hover:text-indigo-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-slate-700 hover:text-indigo-600 transition-colors"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-slate-700 hover:text-indigo-600 transition-colors"
            >
              Contact
            </a>
          </div>

          <Link
  to="/login"
  className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-indigo-700 transition"
>
  Login
</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="min-h-[85vh] flex items-center justify-center px-6"
      >
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              Employee Management Made Simple
            </span>

            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
              Welcome to
              <span className="block text-indigo-600 mt-2">
                RothDesk Employee Portal
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 leading-8">
              A centralized platform for managing employee records,
              departments, workforce information, and organizational
              operations efficiently and securely.
            </p>

            <Link to="/dashboard" className="inline-block mt-8 bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-indigo-700 hover:-translate-y-1 transition-all duration-300"> Explore Portal
            </Link>
          </div>

          <div className="flex justify-center">
            <div className="w-80 h-80 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-2xl animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white px-6">
       <div className="grid md:grid-cols-3 gap-8">
  <div className="bg-slate-50 p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
    <h3 className="text-xl font-semibold text-slate-800 mb-3">
      Frontend Development
    </h3>
    <p className="text-slate-600">
      Build responsive and interactive user interfaces using modern web technologies.
    </p>
  </div>

  <div className="bg-slate-50 p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
    <h3 className="text-xl font-semibold text-slate-800 mb-3">
      Backend Development
    </h3>
    <p className="text-slate-600">
      Develop secure APIs, databases, and server-side applications.
    </p>
  </div>

  <div className="bg-slate-50 p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
    <h3 className="text-xl font-semibold text-slate-800 mb-3">
      Human Resources
    </h3>
    <p className="text-slate-600">
      Manage recruitment, employee engagement, and workforce planning.
    </p>
  </div>

  <div className="bg-slate-50 p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
    <h3 className="text-xl font-semibold text-slate-800 mb-3">
      DevOps Engineering
    </h3>
    <p className="text-slate-600">
      Automate deployments, monitoring, and infrastructure management.
    </p>
  </div>

  <div className="bg-slate-50 p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
    <h3 className="text-xl font-semibold text-slate-800 mb-3">
      UI/UX Design
    </h3>
    <p className="text-slate-600">
      Create intuitive user experiences and visually appealing interfaces.
    </p>
  </div>

  <div className="bg-slate-50 p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
    <h3 className="text-xl font-semibold text-slate-800 mb-3">
      Business Analysis
    </h3>
    <p className="text-slate-600">
      Analyze business requirements and bridge the gap between stakeholders and development teams.
    </p>
  </div>
</div>
      </section>

      {/* About */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="h-80 rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-xl hover:scale-105 transition duration-500"></div>
          </div>

          <div>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              About RothDesk
            </h2>

            <p className="text-slate-600 leading-8">
              RothDesk Employee Portal is designed to simplify workforce
              management by providing a secure and centralized platform for
              employee records, department management, and organizational
              operations.
            </p>

            <p className="text-slate-600 leading-8 mt-4">
              Our goal is to help businesses streamline employee management
              processes while delivering a clean and intuitive user
              experience.
            </p>

           
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 bg-slate-900 text-white px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Contact Us</h2>

          <p className="text-slate-300 mb-12">
            We'd love to hear from you. Reach out to us anytime.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800 p-8 rounded-2xl hover:bg-slate-700 transition">
              <h3 className="font-semibold text-lg mb-2">Email</h3>
              <p>support@rothdesk.com</p>
            </div>

            <div className="bg-slate-800 p-8 rounded-2xl hover:bg-slate-700 transition">
              <h3 className="font-semibold text-lg mb-2">Phone</h3>
              <p>+91 98765 43210</p>
            </div>

            <div className="bg-slate-800 p-8 rounded-2xl hover:bg-slate-700 transition">
              <h3 className="font-semibold text-lg mb-2">Location</h3>
              <p>Hyderabad, Telangana, India</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-6 text-center">
        <p>
          © 2026 RothDesk Employee Portal. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}