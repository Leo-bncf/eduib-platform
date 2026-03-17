import React from 'react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl('Landing')} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-sm max-w-none text-slate-600 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Introduction</h2>
              <p>
                Scholr ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our Learning Management System (LMS) platform.
              </p>
              <p>
                Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Information We Collect</h2>
              <p>We collect information in various ways, including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Direct Collection:</strong> Information you voluntarily provide, such as account registration details, profile information, and communication preferences.</li>
                <li><strong>Automatic Collection:</strong> Information collected automatically through cookies, analytics tools, and server logs (IP address, browser type, pages visited, etc.).</li>
                <li><strong>Educational Data:</strong> Academic records, grades, assignments, attendance, and other school-related information necessary to operate our platform.</li>
                <li><strong>Third-party Information:</strong> Information from external services, such as timetable synchronization systems.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. How We Use Your Information</h2>
              <p>We use the information we collect for purposes including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Providing and improving our LMS platform services</li>
                <li>Authenticating users and managing user accounts</li>
                <li>Processing transactions and sending billing information</li>
                <li>Sending administrative notifications and updates</li>
                <li>Responding to inquiries and providing customer support</li>
                <li>Conducting analytics and research to improve our services</li>
                <li>Complying with legal obligations</li>
                <li>Protecting against fraud and ensuring security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Data Sharing and Disclosure</h2>
              <p>
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Service Providers:</strong> Third parties who assist us in operating our website and conducting our business (hosting providers, payment processors, analytics services).</li>
                <li><strong>School Administrators:</strong> When you are part of a school organization, relevant administrators may access information necessary to manage the school.</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our legal rights.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Data Security</h2>
              <p>
                We implement comprehensive security measures to protect your information, including encryption, firewalls, and access controls. However, no security system is impenetrable. We cannot guarantee absolute security, but we maintain industry-standard safeguards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Your Rights and Choices</h2>
              <p>
                Depending on your location, you may have rights including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate data</li>
                <li>Deletion of your data (subject to legal obligations)</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability (receiving your data in a standard format)</li>
              </ul>
              <p>
                To exercise these rights, please contact us at support@scholr.pro.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. GDPR Compliance (EU Users)</h2>
              <p>
                For users in the European Union, we comply with the General Data Protection Regulation (GDPR). We process personal data only with a valid legal basis, such as consent or contractual necessity.
              </p>
              <p>
                EU users have the right to lodge a complaint with their supervisory authority if they believe we have violated their rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Children's Privacy</h2>
              <p>
                Our platform may be used by minors in an educational context. Parents and guardians have rights over their child's data. Schools using our platform are responsible for obtaining appropriate consent and managing parental access. We do not knowingly collect information from children under 13 outside of a school context.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Data Retention</h2>
              <p>
                We retain your information for as long as necessary to provide our services and comply with legal obligations. When data is no longer needed, we securely delete or anonymize it. Schools may maintain data longer in compliance with educational regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Third-party Links</h2>
              <p>
                Our platform may contain links to third-party websites. We are not responsible for the privacy practices of external sites. Please review their privacy policies before sharing information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">11. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy periodically. We will notify you of significant changes via email or prominent notice on our website. Continued use of our services indicates acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">12. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p><strong>Email:</strong> support@scholr.pro</p>
                <p className="mt-2"><strong>Website:</strong> scholr.pro</p>
              </div>
            </section>

            <section>
              <p className="text-slate-500 text-sm mt-8">
                Last updated: March 2026
              </p>
            </section>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}