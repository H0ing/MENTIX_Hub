import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FiAtSign, FiCalendar, FiSend, FiCheck } from 'react-icons/fi';

const CONTACT_PLATFORMS = ['Line', 'Instagram', 'Discord', 'Facebook', 'Email', 'Other'];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

export default function AcceptCollaboration() {
  const navigate = useNavigate();

  const [replyMessage, setReplyMessage] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('Discord');
  const [contactInfo, setContactInfo] = useState('');
  const [firstStep, setFirstStep] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  function validate() {
    const newErrors = {};
    if (!replyMessage.trim()) newErrors.replyMessage = 'Please write your reply message.';
    if (!contactInfo.trim()) newErrors.contactInfo = 'Please enter your contact username or email.';
    if (!firstStep.trim()) newErrors.firstStep = 'Please suggest a first step to get started.';
    return newErrors;
  }

  function handleSubmit() {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsSubmitted(true);
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="bg-[#fcfcfc] min-h-screen py-10 font-[Inter,sans-serif]">
        <div className="max-w-[680px] mx-auto">
          <div className="bg-white border border-[rgba(204,195,216,0.3)] rounded-[16px] shadow-sm p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-[rgba(124,58,237,0.1)] flex items-center justify-center">
                <FiCheck size={40} className="text-[#630ed4]" strokeWidth={2.5} />
              </div>
            </div>
            <h2 className="font-bold text-[28px] text-[#191c1d] tracking-tight leading-tight mb-2">
              Collaboration Accepted!
            </h2>
            <p className="text-[#4a4455] text-[18px] leading-relaxed mb-8">
              Your reply has been sent to <span className="font-semibold">Alex Chen</span>. They'll be notified immediately.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setReplyMessage('');
                  setContactInfo('');
                  setFirstStep('');
                  setSelectedPlatform('Discord');
                }}
                className="px-8 py-3 bg-[#630ed4] text-white font-semibold rounded-[12px] hover:bg-[#500088] transition-colors"
              >
                Accept Another Request
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-white text-[#630ed4] font-semibold rounded-[12px] border border-[#630ed4] hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-10 font-[Inter,sans-serif]">
      {/* Page header */}
      <div className="text-center mb-8">
        <h1 className="font-bold text-[36px] text-[#191c1d] tracking-tight leading-tight">
          Accept Collaboration
        </h1>
        <p className="text-[#4a4455] text-[18px] mt-1">
          Yes, let's do it — here's how to reach me.
        </p>
      </div>

      <div className="max-w-[680px] mx-auto flex flex-col gap-5">
        {/* Original request summary */}
        <div className="bg-[#f3f4f5] border border-[#ccc3d8] rounded-[16px] p-6">
          <p className="text-[#630ed4] font-semibold text-[13px] uppercase tracking-wider mb-3">
            ● Original Request
          </p>
          <div className="border-b border-[#ccc3d8] pb-3 mb-3 flex justify-between items-end">
            <div>
              <p className="text-[#4a4455] text-[11px] font-medium uppercase tracking-wide mb-0.5">Sender</p>
              <p className="text-[#191c1d] font-semibold text-[16px]">Alex Chen • Graduate Student</p>
            </div>
            <div className="text-right">
              <p className="text-[#4a4455] text-[11px] font-medium uppercase tracking-wide mb-0.5">Project</p>
              <p className="text-[#0058be] font-semibold text-[16px]">Neural Nexus Research</p>
            </div>
          </div>
          <div>
            <p className="text-[#4a4455] text-[11px] font-medium uppercase tracking-wide mb-1">Message</p>
            <p className="text-[#191c1d] text-[16px] italic leading-relaxed">
              &quot;Hi! I saw your recent work and think your expertise would perfectly fill the gaps...&quot;
            </p>
          </div>
        </div>

        {/* Reply form */}
        <div className="bg-white border border-[#ccc3d8] rounded-[16px] shadow-sm p-6 flex flex-col gap-6">
          {/* Reply message */}
          <div>
            <label className="text-[#4a4455] font-medium text-[12px] block mb-1">
              Your Reply Message
            </label>
            <p className="text-[#4a4455] text-[11px] mb-2 opacity-75">
              Tell them you're in and what you're excited to build together.
            </p>
            <textarea
              value={replyMessage}
              onChange={(e) => {
                setReplyMessage(e.target.value);
                setErrors((prev) => ({ ...prev, replyMessage: '' }));
              }}
              placeholder="Sounds great, I think our projects complement each other!"
              rows={4}
              className="w-full bg-white border border-[#ccc3d8] rounded-[12px] px-4 py-3 text-[#6b7280] text-[16px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all"
            />
            <FieldError message={errors.replyMessage} />
          </div>

          {/* Preferred contact platform */}
          <div>
            <label className="text-[#4a4455] font-medium text-[12px] block mb-2">
              Preferred Contact Platform
            </label>
            <div className="flex flex-wrap gap-2">
              {CONTACT_PLATFORMS.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => setSelectedPlatform(platform)}
                  className={`px-4 py-2 rounded-full text-[16px] font-normal border transition-colors ${
                    selectedPlatform === platform
                      ? 'bg-[#7c3aed] text-[#ede0ff] border-[#630ed4]'
                      : 'bg-[#f3f4f5] text-[#4a4455] border-[#ccc3d8] hover:border-[#630ed4]'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Contact username / email */}
          <div>
            <label className="text-[#4a4455] font-medium text-[12px] block mb-2">
              Contact Username / Email
            </label>
            <div className="relative">
              <FiAtSign
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a4455]"
              />
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => {
                  setContactInfo(e.target.value);
                  setErrors((prev) => ({ ...prev, contactInfo: '' }));
                }}
                placeholder="e.g. creative_mind#1234"
                className="w-full bg-white border border-[#ccc3d8] rounded-[12px] pl-10 pr-4 py-3 text-[#6b7280] text-[16px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
              />
            </div>
            <FieldError message={errors.contactInfo} />
          </div>

          {/* Suggested first step */}
          <div>
            <label className="text-[#4a4455] font-medium text-[12px] block mb-2">
              Suggested First Step
            </label>
            <div className="relative">
              <FiCalendar
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a4455]"
              />
              <input
                type="text"
                value={firstStep}
                onChange={(e) => {
                  setFirstStep(e.target.value);
                  setErrors((prev) => ({ ...prev, firstStep: '' }));
                }}
                placeholder="e.g. DM me this week and we can meet at the library"
                className="w-full bg-white border border-[#ccc3d8] rounded-[12px] pl-10 pr-4 py-3 text-[#6b7280] text-[16px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
              />
            </div>
            <FieldError message={errors.firstStep} />
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-[#7c3aed] text-[#ede0ff] font-normal text-[18px] py-4 rounded-[16px] hover:bg-[#6d28d9] transition-colors flex items-center justify-center gap-2"
          >
            Send Reply &amp; Connect
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}