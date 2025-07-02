import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <>
      <footer className="bg-gray-900 text-gray-300">
        <div className="container px-4 py-12 mx-auto md:px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-insurance-teal flex items-center justify-center text-white font-bold">
                  IV
                </div>
                <span className="font-bold text-lg text-white">InsuraView</span>
              </div>
              <p className="text-sm">
                Providing comprehensive vehicle insurance solutions with
                exceptional customer service.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/about"
                    className="text-sm hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/careers"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/blog"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/partners"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Partners
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-4">
                Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/help"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/faq"
                    className="text-sm hover:text-white transition-colors"
                  >
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link
                    to="/claims"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Claims Process
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/privacy"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cookies"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/licenses"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Licenses
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm">
            <p>
              &copy; {new Date().getFullYear()} InsuraView. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};
export default Footer;
