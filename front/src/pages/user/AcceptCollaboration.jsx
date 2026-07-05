import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { FiAtSign, FiCalendar, FiSend, FiCheck } from 'react-icons/fi';
import { respondToCollaboration, getCollaborationRequestById } from '../../api/collaborationApi';

const CONTACT_PLATFORMS = ['Line', 'Instagram', 'Discord', 'Facebook', 'Email', 'Other'];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-red-500 text-xs mt-1">{message}</p>;
}

export default function AcceptCollaboration() {
  const navigate = useNavigate();
  const location = useLocation();
  const collabId = location.state?.id;

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  const [replyMessage, setReplyMessage] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('Discord');
  const [contactInfo, setContactInfo] = useState('');
  const [firstStep, setFirstStep] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!collabId) {
      setLoading(false);
      return;
    }
    getCollaborationRequestById(collabId)
      .then(({ data }) => setRequest(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [collabId]);

  function validate() {
    const newErrors = {};
    if (!replyMessage.trim()) newErrors.replyMessage = 'Please write your reply message.';
    if (!contactInfo.trim()) newErrors.contactInfo = 'Please enter your contact username or email.';
    if (!firstStep.trim()) newErrors.firstStep = 'Please suggest a first step to get started.';
    return newErrors;
  }

  async function handleSubmit() {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSending(true);
    try {
      await respondToCollaboration(collabId, {
        status: 'accepted',
        response_message: {
          reply_message: replyMessage,
          contact_platform: selectedPlatform,
          contact_info: contactInfo,
          first_step: firstStep,
        },
      });
      setIsSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reply. Please try again.';
      setErrors({ replyMessage: msg });
    } finally {
      setSending(false);
    }
  }

  const senderName = request?.sender_name || 'the requester';

  if (isSubmitted) {
    return (
      <div className="bg-[#fcfcfc] min-h-screen py-8 font-[Inter,sans-serif] flex flex-col  justify-center ">
        <div className="max-w-[560px] mx-auto ">
          <div className="bg-white border border-[rgba(204,195,216,0.3)] rounded-[12px] shadow-sm p-8 text-center">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-[rgba(124,58,237,0.1)] flex items-center justify-center">
                <FiCheck size={32} className="text-[#630ed4]" strokeWidth={2.5} />
              </div>
            </div>
            <h2 className="font-bold text-[22px] text-[#191c1d] tracking-tight leading-tight mb-1.5">
              Collaboration Accepted!
            </h2>
            <p className="text-[#4a4455] text-[15px] leading-relaxed mb-6">
              Your reply has been sent to <span className="font-semibold">{senderName}</span>. They&apos;ll be notified immediately.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate('/inbox')}
                className="px-6 py-2.5 bg-[#630ed4] text-white font-semibold rounded-[10px] hover:bg-[#500088] transition-colors text-sm"
              >
                Back to Inbox
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 bg-white text-[#630ed4] font-semibold rounded-[10px] border border-[#630ed4] hover:bg-gray-50 transition-colors text-sm"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !collabId) {
    return (
      <div className="bg-[#fcfcfc] min-h-screen py-8 font-[Inter,sans-serif]">
        <div className="max-w-[560px] mx-auto text-center py-16">
          <p className="text-[#4a4455]">No collaboration request selected.</p>
          <button onClick={() => navigate('/inbox')} className="mt-4 text-[#630ed4] font-semibold hover:underline">
            Go to Inbox
          </button>
        </div>
      </div>
    );
  }

  const projectTitle = request?.project_interest || 'the project';
  const senderMessage = request?.benefit || '';

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-8 font-[Inter,sans-serif]">
      <div className="text-center mb-6">
        <h1 className="font-bold text-[24px] text-[#191c1d] tracking-tight leading-tight">
          Accept Collaboration
        </h1>
        <p className="text-[#4a4455] text-[15px] mt-0.5">
          Yes, let&apos;s do it &mdash; here&apos;s how to reach me.
        </p>
      </div>

      <div className="max-w-[560px] mx-auto flex flex-col gap-4">
        <div className="bg-[#f3f4f5] border border-[#ccc3d8] rounded-[12px] p-5">
          <p className="text-[#630ed4] font-semibold text-[11px] uppercase tracking-wider mb-2.5">
            &bull; Original Request
          </p>
          <div className="border-b border-[#ccc3d8] pb-2.5 mb-2.5 flex justify-between items-end">
            <div>
              <p className="text-[#4a4455] text-[10px] font-medium uppercase tracking-wide mb-0.5">Sender</p>
              <p className="text-[#191c1d] font-semibold text-[14px]">{request?.sender_name || 'Unknown'}</p>
            </div>
            <div className="text-right">
              <p className="text-[#4a4455] text-[10px] font-medium uppercase tracking-wide mb-0.5">Project</p>
              <p className="text-[#0058be] font-semibold text-[14px]">{projectTitle}</p>
            </div>
          </div>
          <div>
            <p className="text-[#4a4455] text-[10px] font-medium uppercase tracking-wide mb-0.5">Message</p>
            <p className="text-[#191c1d] text-[14px] italic leading-relaxed">
              &quot;{senderMessage}&quot;
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#ccc3d8] rounded-[12px] shadow-sm p-5 flex flex-col gap-5">
          <div>
            <label className="text-[#4a4455] font-medium text-[11px] block mb-1">
              Your Reply Message
            </label>
            <p className="text-[#4a4455] text-[10px] mb-1.5 opacity-75">
              Tell them you&apos;re in and what you&apos;re excited to build together.
            </p>
            <textarea
              value={replyMessage}
              onChange={(e) => {
                setReplyMessage(e.target.value);
                setErrors((prev) => ({ ...prev, replyMessage: '' }));
              }}
              placeholder="Sounds great, I think our projects complement each other!"
              rows={3}
              className="w-full bg-white border border-[#ccc3d8] rounded-[10px] px-3 py-2.5 text-[#6b7280] text-[14px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] resize-none transition-all"
            />
            <FieldError message={errors.replyMessage} />
          </div>

          <div>
            <label className="text-[#4a4455] font-medium text-[11px] block mb-1.5">
              Preferred Contact Platform
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CONTACT_PLATFORMS.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => setSelectedPlatform(platform)}
                  className={'px-3.5 py-1.5 rounded-full text-[13px] font-normal border transition-colors ' + (
                    selectedPlatform === platform
                      ? 'bg-[#7c3aed] text-[#ede0ff] border-[#630ed4]'
                      : 'bg-[#f3f4f5] text-[#4a4455] border-[#ccc3d8] hover:border-[#630ed4]'
                  )}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[#4a4455] font-medium text-[11px] block mb-1.5">
              Contact Username / Email
            </label>
            <div className="relative">
              <FiAtSign
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4455]"
              />
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => {
                  setContactInfo(e.target.value);
                  setErrors((prev) => ({ ...prev, contactInfo: '' }));
                }}
                placeholder="e.g. creative_mind#1234"
                className="w-full bg-white border border-[#ccc3d8] rounded-[10px] pl-8 pr-3 py-2.5 text-[#6b7280] text-[14px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
              />
            </div>
            <FieldError message={errors.contactInfo} />
          </div>

          <div>
            <label className="text-[#4a4455] font-medium text-[11px] block mb-1.5">
              Suggested First Step
            </label>
            <div className="relative">
              <FiCalendar
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4455]"
              />
              <input
                type="text"
                value={firstStep}
                onChange={(e) => {
                  setFirstStep(e.target.value);
                  setErrors((prev) => ({ ...prev, firstStep: '' }));
                }}
                placeholder="e.g. DM me this week and we can meet at the library"
                className="w-full bg-white border border-[#ccc3d8] rounded-[10px] pl-8 pr-3 py-2.5 text-[#6b7280] text-[14px] outline-none focus:border-[#630ed4] focus:ring-1 focus:ring-[#630ed4] transition-all"
              />
            </div>
            <FieldError message={errors.firstStep} />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={sending}
            className="w-full bg-[#7c3aed] text-[#ede0ff] font-normal text-[15px] py-3 rounded-[12px] hover:bg-[#6d28d9] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send Reply & Connect'}
            <FiSend size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
