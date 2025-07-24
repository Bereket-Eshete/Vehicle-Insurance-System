import React from "react";
import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative bg-white overflow-hidden">
      <div className="container px-4 py-16 md:py-24 mx-auto md:px-6">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-insurance-teal bg-teal-50 rounded-full">
              <Shield className="w-4 h-4" />
              <span>Trusted by 10,000+ customers</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-insurance-blue">
              Protect your vehicle with confidence
            </h1>
            <p className="text-lg text-gray-500 md:text-xl">
              Comprehensive insurance solutions designed to keep you covered on
              every journey. Get a quote in minutes.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/get-quote">
                <button size="lg">Get a Quote</button>
              </Link>
              <Link to="/plans">
                <button variant="outline" size="lg">
                  View Plans
                </button>
              </Link>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium"
                  >
                    {["JD", "SM", "RK", "AL"][i - 1]}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <strong className="text-insurance-blue">4.9/5</strong>
                <span className="text-gray-500"> based on 2,000+ reviews</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000"
                alt="Car Insurance"
                className="w-full h-auto object-cover aspect-video"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-insurance-blue/30 to-transparent"></div>

              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 bg-insurance-teal rounded-full flex items-center justify-center text-white">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-insurance-blue">
                      Premium Coverage
                    </h3>
                    <p className="text-sm text-gray-500">
                      Full protection for your vehicle with comprehensive
                      coverage options
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-insurance-teal/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-insurance-blue/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
