import React from 'react';
import PublicNavbar from '@/components/public/PublicNavbar';
import PublicFooter from '@/components/public/PublicFooter';
import { ArrowLeft, CheckCircle, Shield, Lock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SecurityAndCompliance() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      
      <section className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={createPageUrl('Landing')} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-8">Security & Compliance</h1>
          
          <div className="prose prose-sm max-w-none text-slate-600 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Our Security Commitment</h2>
              <p>
                At Scholr, protecting your data and ensuring compliance with global standards is our highest priority. We implement industry-leading security measures and maintain rigorous compliance frameworks to safeguard educational data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Data Security</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Encryption in Transit</h3>
                    <p className="text-sm text-slate-600 mt-1">All data is encrypted using TLS 1.3 during transmission between clients and servers.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Encryption at Rest</h3>
                    <p className="text-sm text-slate-600 mt-1">All sensitive data is encrypted at rest using AES-256 encryption standard.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Multi-Tenant Isolation</h3>
                    <p className="text-sm text-slate-600 mt-1">Each school's data is completely isolated; no cross-school data access is possible.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Audit Logging</h3>
                    <p className="text-sm text-slate-600 mt-1">All sensitive actions are logged for compliance and investigative purposes.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">GDPR Compliance</h2>
              <p>
                Scholr is fully compliant with the General Data Protection Regulation (GDPR). We provide:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 my-4">
                <li>Lawful basis documentation for all data processing activities</li>
                <li>Data Processing Agreements (DPA) for all schools using our platform</li>
                <li>Transparent privacy notices and consent management</li>
                <li>Data subject rights fulfillment (access, correction, deletion, portability)</li>
                <li>Privacy impact assessments for major features</li>
                <li>Breach notification procedures compliant with GDPR Article 33</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">FERPA Compliance (USA)</h2>
              <p>
                For schools in the United States, Scholr complies with the Family Educational Rights and Privacy Act (FERPA):
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 my-4">
                <li>Student records are accessible only to authorized school personnel</li>
                <li>Parents have the right to access their child's educational records</li>
                <li>Third-party access requires explicit consent from parents/students</li>
                <li>Detailed logs track all access to student records</li>
                <li>Secure deletion procedures comply with FERPA requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">COPPA Compliance (USA)</h2>
              <p>
                Scholr complies with the Children's Online Privacy Protection Act (COPPA) by:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 my-4">
                <li>Obtaining parental consent for users under 13 years old</li>
                <li>Restricting collection of personal information from children</li>
                <li>Providing transparent privacy practices</li>
                <li>Implementing age-appropriate safeguards</li>
                <li>Allowing parents to review and delete their child's information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">ISO/IEC 27001 Certification</h2>
              <p>
                Scholr maintains ISO/IEC 27001 certification, demonstrating our commitment to information security management. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 my-4">
                <li>Regular security assessments and audits</li>
                <li>Risk management and mitigation procedures</li>
                <li>Incident response and business continuity plans</li>
                <li>Employee security training and awareness programs</li>
                <li>Vendor and third-party security evaluation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Penetration Testing & Vulnerability Management</h2>
              <p>
                We conduct regular third-party penetration tests and maintain a comprehensive vulnerability management program:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 my-4">
                <li>Annual penetration testing by independent security firms</li>
                <li>Continuous vulnerability scanning</li>
                <li>Responsible disclosure policy for security researchers</li>
                <li>Rapid patch management for identified vulnerabilities</li>
                <li>Security incident response team on-call 24/7</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Access Controls & Authentication</h2>
              <p>
                Scholr implements strong access controls and authentication mechanisms:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 my-4">
                <li>Role-based access control (RBAC) with granular permissions</li>
                <li>Multi-factor authentication (MFA) availability</li>
                <li>Single Sign-On (SSO) integration for enterprise customers</li>
                <li>Password policies enforcing strong complexity</li>
                <li>Session management with automatic timeouts</li>
                <li>Account lockout procedures after failed login attempts</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Backup & Disaster Recovery</h2>
              <p>
                Your data is protected by comprehensive backup and recovery procedures:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 my-4">
                <li>Automated daily backups with multiple geographic redundancy</li>
                <li>Recovery Point Objective (RPO) of less than 1 hour</li>
                <li>Recovery Time Objective (RTO) of less than 4 hours</li>
                <li>Regular backup restoration testing</li>
                <li>Encrypted backup storage in compliance with data protection standards</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Data Retention & Deletion</h2>
              <p>
                Scholr maintains transparent data retention policies:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 my-4">
                <li>School-configurable data retention periods</li>
                <li>Secure deletion using cryptographic erase methods</li>
                <li>Compliance with regional educational data retention requirements</li>
                <li>Bulk data export and deletion capabilities</li>
                <li>Audit trail of all data deletion activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Vendor Management & Third-Party Security</h2>
              <p>
                We maintain rigorous security standards for all vendors and third-party partners:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 my-4">
                <li>Security assessment of all third-party vendors</li>
                <li>Data Processing Agreements with all subprocessors</li>
                <li>Regular vendor security audits</li>
                <li>Restricted data access for third parties</li>
                <li>Vendor liability and insurance requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Incident Response</h2>
              <p>
                In the event of a security incident, we follow a comprehensive response plan:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 my-4">
                <li>24/7 incident detection and response monitoring</li>
                <li>Immediate notification to affected schools and individuals</li>
                <li>Compliance with GDPR Article 33/34 breach notification requirements</li>
                <li>Forensic investigation and documentation</li>
                <li>Post-incident review and remediation planning</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Security Training & Awareness</h2>
              <p>
                We invest in the security awareness of our team and our users:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 my-4">
                <li>Mandatory annual security training for all employees</li>
                <li>Phishing awareness and simulation programs</li>
                <li>Security training materials for school administrators and staff</li>
                <li>Regular security updates and advisories</li>
                <li>Best practices guides for data protection in schools</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Compliance Certifications & Standards</h2>
              <div className="space-y-2 my-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-700">ISO/IEC 27001 - Information Security Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-700">GDPR - General Data Protection Regulation (EU)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-700">FERPA - Family Educational Rights and Privacy Act (USA)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-700">COPPA - Children's Online Privacy Protection Act (USA)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-slate-700">SOC 2 Type II - Security & Availability</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Questions or Concerns?</h2>
              <p>
                For security or compliance questions, please contact our security team:
              </p>
              <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                <p><strong>Email:</strong> security@scholr.pro</p>
                <p className="mt-2"><strong>Response Time:</strong> 24 hours for all security inquiries</p>
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