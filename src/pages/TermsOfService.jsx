import React from 'react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl('Landing')} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-sm max-w-none text-slate-600 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Scholr ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on Scholr for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer any software contained on Scholr</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                <li>Disclose passwords or access credentials to other users</li>
                <li>Use automated tools to access or extract data from the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Disclaimer</h2>
              <p>
                The materials on Scholr are provided on an 'as is' basis. Scholr makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
              <p>
                Further, Scholr does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its Internet web site or otherwise relating to such materials or on any sites linked to this site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Limitations</h2>
              <p>
                In no event shall Scholr or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Scholr, even if Scholr or a Scholr authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Accuracy of Materials</h2>
              <p>
                The materials appearing on Scholr could include technical, typographical, or photographic errors. Scholr does not warrant that any of the materials on its website are accurate, complete, or current. Scholr may make changes to the materials contained on its website at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Links</h2>
              <p>
                Scholr has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Scholr of the site. Use of any such linked website is at the user's own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Modifications</h2>
              <p>
                Scholr may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of Switzerland, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. User Accounts</h2>
              <p>
                If the Service requires an account, you are responsible for maintaining the confidentiality of your account information and password and for restricting access to your account. You agree to accept responsibility for all activities that occur under your account or password.
              </p>
              <p>
                You represent and warrant that the information you provide during registration is accurate, complete, and current. You agree to update your information as necessary to maintain its accuracy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Prohibited Conduct</h2>
              <p>
                You agree not to use the Service to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on any intellectual property rights</li>
                <li>Harass, abuse, or threaten other users</li>
                <li>Transmit any harmful, malicious, or disruptive code</li>
                <li>Impersonate any person or entity</li>
                <li>Engage in unauthorized data collection or mining</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">11. Intellectual Property</h2>
              <p>
                The Service and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio) are owned by Scholr, its licensors, or other providers of such material and are protected by copyright and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">12. Termination</h2>
              <p>
                Scholr may terminate or suspend your account or access to the Service immediately, without prior notice or liability, for any reason whatsoever, including if you breach the Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">13. Contact Us</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
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