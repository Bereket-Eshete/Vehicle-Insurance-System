import React from "react";

import {
  Shield,
  Car,
  FileCheck,
  Headset,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
// import { Button } from "@/components/ui/button";
import FeatureCard from "./FeatureCard";
import HeroSection from "./HeroSection";
import TestimonialCard from "./TestimonialCard";
import InsurancePlanCard from "./InsurancePlanCard";
// import { Input } from "@/components/ui/input";
const Main = () => {
  return (
    <>
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}

        <HeroSection />
        {/* Features Section */}
        <section className="py-16 bg-gray-50" id="features">
          <div className="container px-4 mx-auto md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-insurance-blue md:text-3xl lg:text-4xl">
                Why Choose InsuraView
              </h2>
              <p className="mt-3 text-gray-500 md:text-lg">
                We provide comprehensive insurance services tailored to your
                needs
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Shield}
                title="Comprehensive Coverage"
                description="Get full protection for your vehicle with our comprehensive insurance plans"
              />
              <FeatureCard
                icon={FileCheck}
                title="Easy Claims Process"
                description="File and track claims in minutes with our simple online system"
              />
              <FeatureCard
                icon={Car}
                title="Multi-vehicle Discounts"
                description="Save more when you insure multiple vehicles with our special discounts"
              />
              <FeatureCard
                icon={Headset}
                title="24/7 Customer Support"
                description="Our support team is always available to assist you with any questions"
              />
              <FeatureCard
                icon={CheckCircle}
                title="Fast Approval"
                description="Get your insurance approved quickly and start driving with peace of mind"
              />
              <FeatureCard
                icon={Shield}
                title="Customized Plans"
                description="Choose from a variety of options to create a plan that fits your needs"
              />
            </div>
          </div>
        </section>

        {/* Insurance Plans */}
        <section className="py-16" id="plans">
          <div className="container px-4 mx-auto md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-insurance-blue md:text-3xl lg:text-4xl">
                Our Insurance Plans
              </h2>
              <p className="mt-3 text-gray-500 md:text-lg">
                Choose the right coverage for your vehicle
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <InsurancePlanCard
                title="Basic"
                price="$59"
                period="monthly"
                description="Essential coverage for budget-conscious drivers"
                features={[
                  "Third-party liability",
                  "Basic roadside assistance",
                  "Accident coverage",
                  "24/7 customer support",
                ]}
                buttonText="Get Started"
              />
              <InsurancePlanCard
                title="Standard"
                price="$89"
                period="monthly"
                popular={true}
                description="Ideal coverage for most drivers"
                features={[
                  "Everything in Basic",
                  "Comprehensive coverage",
                  "Theft protection",
                  "Advanced roadside assistance",
                  "Personal accident cover",
                ]}
                buttonText="Get Started"
              />
              <InsurancePlanCard
                title="Premium"
                price="$129"
                period="monthly"
                description="Complete protection for your vehicle"
                features={[
                  "Everything in Standard",
                  "Zero depreciation cover",
                  "Engine protection",
                  "No claim bonus protection",
                  "Return to invoice cover",
                  "Consumables cover",
                ]}
                buttonText="Get Started"
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-gray-50" id="testimonials">
          <div className="container px-4 mx-auto md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-insurance-blue md:text-3xl lg:text-4xl">
                What Our Customers Say
              </h2>
              <p className="mt-3 text-gray-500 md:text-lg">
                Don't just take our word for it
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <TestimonialCard
                name="Sarah Johnson"
                title="Honda Civic Owner"
                testimonial="Filing a claim was incredibly simple. Their online system made the entire process smooth and transparent."
                rating={5}
              />
              <TestimonialCard
                name="Michael Chen"
                title="Toyota RAV4 Owner"
                testimonial="The customer service at InsuraView is exceptional. They helped me find the perfect coverage for my needs."
                rating={4}
              />
              <TestimonialCard
                name="Jessica Williams"
                title="Ford F-150 Owner"
                testimonial="After comparing multiple insurance providers, InsuraView offered the best coverage at the most competitive price."
                rating={5}
              />
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-insurance-blue text-white" id="cta">
          <div className="container px-4 mx-auto md:px-6">
            <div className="md:flex md:items-center md:justify-between">
              <div className="md:w-1/2 mb-6 md:mb-0">
                <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl">
                  Ready to get insured?
                </h2>
                <p className="mt-3 text-gray-300 md:text-lg">
                  Get a quote in minutes and start protecting your vehicle today
                </p>
              </div>
              <div className="md:w-1/2 lg:w-2/5">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-bold text-insurance-blue mb-4">
                    Get a Quick Quote
                  </h3>
                  <form className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Vehicle Make & Model"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Your Email"
                        className="w-full"
                      />
                    </div>
                    <button className="w-full">
                      Get Quote <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};
export default Main;
