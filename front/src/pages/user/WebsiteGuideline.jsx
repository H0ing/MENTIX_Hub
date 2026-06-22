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
    <div className="bg-[#fcfcfc] min-h-screen py-10 px-8 font-[Inter,sans-serif]">
      <div className="max-w-[900px] mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#630ed4] text-[14px] font-medium mb-6 hover:underline">
          <FiArrowLeft size={16} /> Back
        </button>

        <div className="mb-10">
          <h1 className="text-[40px] font-bold text-[#191c1d] tracking-tight">Community Guidelines</h1>
          <p className="text-[#4a4455] text-[18px] mt-2">Standards for a respectful and productive collaboration space.</p>
        </div>

        <div className="flex flex-col gap-6">
          {SECTIONS.map((section, i) => (
            <div key={i} className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-7">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[rgba(204,195,216,0.3)]">
                <span className="text-[#630ed4]">{section.icon}</span>
                <h2 className="text-[#630ed4] font-semibold text-[18px]">{section.title}</h2>
              </div>

              {section.content && (
                <p className="text-[#4a4455] text-[16px] leading-relaxed">{section.content}</p>
              )}

              {section.rules && (
                <div className="flex flex-col gap-3">
                  {section.rules.map((rule, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <span className="bg-[#eaddff] text-[#5a00c6] font-semibold text-[12px] px-3 py-1 rounded-full shrink-0 mt-0.5">{rule.label}</span>
                      <p className="text-[#4a4455] text-[15px] leading-relaxed">{rule.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {section.items && (
                <ul className="flex flex-col gap-3">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-[#4a4455] text-[15px] leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#630ed4] shrink-0 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-[#eaddff] border border-[#ccc3d8] rounded-[16px] p-7">
          <p className="text-[#4a4455] text-[15px] leading-relaxed text-center mb-2">
            Have questions about the guidelines? Contact the moderation team.
          </p>
          <p className="text-[#7b7487] text-[13px] text-center mb-6">Our team typically responds within 24-48 hours.</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-[10px] px-4 py-3">
              <p className="text-[#7b7487] text-[10px] uppercase tracking-wider font-medium">General Inquiries</p>
              <a href="mailto:contact@mentixhub.com" className="text-[#630ed4] text-[14px] font-medium hover:underline">contact@mentixhub.com</a>
            </div>
            <div className="bg-white rounded-[10px] px-4 py-3">
              <p className="text-[#7b7487] text-[10px] uppercase tracking-wider font-medium">Support</p>
              <a href="mailto:support@mentixhub.com" className="text-[#630ed4] text-[14px] font-medium hover:underline">support@mentixhub.com</a>
            </div>
            <div className="bg-white rounded-[10px] px-4 py-3">
              <p className="text-[#7b7487] text-[10px] uppercase tracking-wider font-medium">Privacy</p>
              <a href="mailto:privacy@mentixhub.com" className="text-[#630ed4] text-[14px] font-medium hover:underline">privacy@mentixhub.com</a>
            </div>
            <div className="bg-white rounded-[10px] px-4 py-3">
              <p className="text-[#7b7487] text-[10px] uppercase tracking-wider font-medium">Abuse / Reports</p>
              <a href="mailto:abuse@mentixhub.com" className="text-[#630ed4] text-[14px] font-medium hover:underline">abuse@mentixhub.com</a>
            </div>
          </div>

          <div className="border-t border-[rgba(204,195,216,0.3)] pt-4">
            <p className="text-[#630ed4] font-semibold text-[11px] uppercase tracking-wider text-center mb-3">Social Links</p>
            <div className="flex justify-center gap-6">
              <a href="https://github.com/mentix-hub" target="_blank" rel="noopener noreferrer" className="text-[#4a4455] text-[14px] hover:text-[#630ed4] hover:underline transition-colors">GitHub: github.com/mentix-hub</a>
              <a href="https://twitter.com/mentixhub" target="_blank" rel="noopener noreferrer" className="text-[#4a4455] text-[14px] hover:text-[#630ed4] hover:underline transition-colors">Twitter: @mentixhub</a>
              <a href="https://discord.gg/mentixhub" target="_blank" rel="noopener noreferrer" className="text-[#4a4455] text-[14px] hover:text-[#630ed4] hover:underline transition-colors">Discord: discord.gg/mentixhub</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
