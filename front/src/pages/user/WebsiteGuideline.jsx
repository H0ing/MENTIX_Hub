import { useNavigate } from 'react-router';
import { FiArrowLeft, FiHeart, FiMessageCircle, FiUserCheck, FiUsers, FiFlag, FiShield, FiAward } from 'react-icons/fi';

const SECTIONS = [
  {
    icon: <FiHeart size={20} />,
    title: 'Welcome to MENTIX-Hub',
    content:
      'We are dedicated to maintaining a professional, friendly, and constructive environment for all collaborators. By using MENTIX-Hub, you agree to uphold these standards.',
  },
  {
    icon: <FiShield size={20} />,
    title: 'Project Upload Rules',
    content: null,
    rules: [
      { label: 'Format', desc: 'Exactly 1 ZIP file per project.' },
      { label: 'Size', desc: 'Maximum 50MB per upload.' },
      { label: 'Allowed Content', desc: 'Source code, documentation, assets, and relevant project binaries.' },
      { label: 'Prohibited Content', desc: 'Malware, illegal material, plagiarized code without attribution, or non-technical files.' },
    ],
  },
  {
    icon: <FiHeart size={20} />,
    title: 'Hearts & Comments',
    content: null,
    items: [
      'Use hearts to show genuine appreciation for quality work.',
      'Keep comments constructive. Nested replies (up to 3 levels) should stay on-topic.',
      'You may edit your comments within 24 hours of posting.',
    ],
  },
  {
    icon: <FiUserCheck size={20} />,
    title: 'Mentorship Guidelines',
    content: null,
    items: [
      'Students: Be clear in your project context. Respect a mentor\'s time and avoid duplicate requests.',
      'Mentors: Provide constructive, timely responses. Use the structured JSON response format to provide clear feedback.',
    ],
  },
  {
    icon: <FiUsers size={20} />,
    title: 'Collaboration Guidelines',
    content: null,
    items: [
      'Explain your skills clearly in your join request.',
      'Respect the project owner\'s decision on collaborators.',
      'If accepted, deliver on your commitments to maintain your reputation.',
    ],
  },
  {
    icon: <FiFlag size={20} />,
    title: 'Reporting & Moderation',
    content: null,
    items: [
      'If you encounter content that violates our rules, click the Report button.',
      'Select a reason and provide a brief description.',
      'A moderator will review the report within 24-48 hours.',
    ],
  },
  {
    icon: <FiAward size={20} />,
    title: 'Becoming a Mentor',
    content:
      'Users who meet the platform requirements can apply to become mentors. You need a minimum number of published projects, hearts received, account age, and comments made. Once eligible, your application will be reviewed and you can start guiding fellow students.',
  },
  {
    icon: <FiShield size={20} />,
    title: 'Consequences of Violation',
    content:
      'Repeated or severe violations may result in content removal, temporary suspension, or permanent account termination. All moderation decisions are documented and final.',
  },
];

export default function WebsiteGuideline() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-8 px-6 font-[Inter,sans-serif]">
      <div className="max-w-[800px] mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#630ed4] text-[13px] font-medium mb-4 hover:underline">
          <FiArrowLeft size={14} /> Back
        </button>

        <div className="mb-8">
          <h1 className="text-[28px] font-bold text-[#191c1d] tracking-tight">Community Guidelines</h1>
          <p className="text-[#4a4455] text-[15px] mt-1">Standards for a respectful and productive collaboration space.</p>
        </div>

        <div className="flex flex-col gap-4">
          {SECTIONS.map((section, i) => (
            <div key={i} className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-5">
              <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-[rgba(204,195,216,0.3)]">
                <span className="text-[#630ed4]">{section.icon}</span>
                <h2 className="text-[#630ed4] font-semibold text-[15px]">{section.title}</h2>
              </div>

              {section.content && (
                <p className="text-[#4a4455] text-[14px] leading-relaxed">{section.content}</p>
              )}

              {section.rules && (
                <div className="flex flex-col gap-2">
                  {section.rules.map((rule, j) => (
                    <div key={j} className="flex items-start gap-2.5">
                      <span className="bg-[#eaddff] text-[#5a00c6] font-semibold text-[11px] px-2.5 py-0.5 rounded-full shrink-0 mt-0.5">{rule.label}</span>
                      <p className="text-[#4a4455] text-[13px] leading-relaxed">{rule.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {section.items && (
                <ul className="flex flex-col gap-2">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-[#4a4455] text-[13px] leading-relaxed">
                      <span className="w-1 h-1 rounded-full bg-[#630ed4] shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 bg-[#eaddff] border border-[#ccc3d8] rounded-[12px] p-5">
          <p className="text-[#4a4455] text-[13px] leading-relaxed text-center mb-1.5">
            Have questions about the guidelines? Contact the moderation team.
          </p>
          <p className="text-[#7b7487] text-[12px] text-center mb-5">Our team typically responds within 24-48 hours.</p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white rounded-[8px] px-3 py-2.5">
              <p className="text-[#7b7487] text-[9px] uppercase tracking-wider font-medium">General Inquiries</p>
              <a href="mailto:contact@mentixhub.com" className="text-[#630ed4] text-[12px] font-medium hover:underline">contact@mentixhub.com</a>
            </div>
            <div className="bg-white rounded-[8px] px-3 py-2.5">
              <p className="text-[#7b7487] text-[9px] uppercase tracking-wider font-medium">Support</p>
              <a href="mailto:support@mentixhub.com" className="text-[#630ed4] text-[12px] font-medium hover:underline">support@mentixhub.com</a>
            </div>
            <div className="bg-white rounded-[8px] px-3 py-2.5">
              <p className="text-[#7b7487] text-[9px] uppercase tracking-wider font-medium">Privacy</p>
              <a href="mailto:privacy@mentixhub.com" className="text-[#630ed4] text-[12px] font-medium hover:underline">privacy@mentixhub.com</a>
            </div>
            <div className="bg-white rounded-[8px] px-3 py-2.5">
              <p className="text-[#7b7487] text-[9px] uppercase tracking-wider font-medium">Abuse / Reports</p>
              <a href="mailto:abuse@mentixhub.com" className="text-[#630ed4] text-[12px] font-medium hover:underline">abuse@mentixhub.com</a>
            </div>
          </div>

          <div className="border-t border-[rgba(204,195,216,0.3)] pt-3">
            <p className="text-[#630ed4] font-semibold text-[10px] uppercase tracking-wider text-center mb-2">Social Links</p>
            <div className="flex justify-center gap-4">
              <a href="https://github.com/mentix-hub" target="_blank" rel="noopener noreferrer" className="text-[#4a4455] text-[12px] hover:text-[#630ed4] hover:underline transition-colors">GitHub: github.com/mentix-hub</a>
              <a href="https://twitter.com/mentixhub" target="_blank" rel="noopener noreferrer" className="text-[#4a4455] text-[12px] hover:text-[#630ed4] hover:underline transition-colors">Twitter: @mentixhub</a>
              <a href="https://discord.gg/mentixhub" target="_blank" rel="noopener noreferrer" className="text-[#4a4455] text-[12px] hover:text-[#630ed4] hover:underline transition-colors">Discord: discord.gg/mentixhub</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
