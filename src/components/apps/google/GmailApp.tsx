import React, { useState } from 'react';
import { GmailIcon } from './GoogleIcons';
import { GOOGLE_SERVICES_CONFIG } from '../../../config/googleServices';
import { soundEngine } from '../../../utils/sound';

interface EmailItem {
  id: string;
  sender: string;
  senderEmail: string;
  senderAvatar: string;
  subject: string;
  snippet: string;
  body: string[];
  time: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  folder: 'inbox' | 'starred' | 'sent' | 'drafts' | 'trash';
  tag?: string;
}

const INITIAL_EMAILS: EmailItem[] = [
  {
    id: 'm-1',
    sender: 'Google Cloud Platform',
    senderEmail: 'no-reply@cloud.google.com',
    senderAvatar: 'G',
    subject: `Firebase Project "${GOOGLE_SERVICES_CONFIG.projectId}" provisioned`,
    snippet: `Your Google Services project number ${GOOGLE_SERVICES_CONFIG.projectNumber} and storage bucket are active.`,
    body: [
      `Hello Windows 10 Developer,`,
      `Your Firebase & Google Services integration for project "${GOOGLE_SERVICES_CONFIG.projectId}" has been configured successfully.`,
      `Project Details:`,
      `• Project Number: ${GOOGLE_SERVICES_CONFIG.projectNumber}`,
      `• Storage Bucket: ${GOOGLE_SERVICES_CONFIG.storageBucket}`,
      `• Android Client Package: ${GOOGLE_SERVICES_CONFIG.packageName}`,
      `• API Key: ${GOOGLE_SERVICES_CONFIG.apiKey.slice(0, 10)}... (Verified)`,
      `You can now access Firebase storage, authentication, and Google Cloud services seamlessly through Microsoft Edge.`,
      `Best regards,`,
      `The Google Cloud & Firebase Team`,
    ],
    time: '10:42 AM',
    date: 'Today at 10:42 AM',
    isRead: false,
    isStarred: true,
    folder: 'inbox',
    tag: 'Firebase',
  },
  {
    id: 'm-2',
    sender: 'Windows Insider Team',
    senderEmail: 'insider@microsoft.com',
    senderAvatar: 'W',
    subject: 'Microsoft Edge + DirectX 12 Graphics Acceleration update',
    snippet: 'Learn how Edge leverages D3D12 hardware rasterization for high FPS WebGL rendering.',
    body: [
      `Welcome to the latest Windows 10 Simulator build.`,
      `DirectX 12 feature levels (FL 12_0, 12_1, 12_2) and DirectX 11 fallbacks are active in this browser environment. DevTools and WebGL 2.0 now route draw calls with minimal CPU overhead.`,
      `Feel free to try the retro Edge Surf game or YouTube video playback for smooth frame rates.`,
      `Enjoy computing,`,
      `Windows Engineering Team`,
    ],
    time: '09:15 AM',
    date: 'Today at 09:15 AM',
    isRead: false,
    isStarred: false,
    folder: 'inbox',
    tag: 'Windows',
  },
  {
    id: 'm-3',
    sender: 'Google Developers',
    senderEmail: 'notifications@developer.google.com',
    senderAvatar: 'D',
    subject: 'Google Services & Waffle Menu enabled in Edge Browser',
    snippet: 'Instant access to YouTube, Google Drive, Gmail, Maps, and Gemini AI inside your simulator.',
    body: [
      `Greetings,`,
      `We're thrilled to introduce Google Services access right inside Microsoft Edge for Windows 10.`,
      `From the 9-dot Google App Launcher in the browser toolbar, you can quickly jump into YouTube, check Gmail, explore Google Drive files, search Google Maps, and prompt Gemini AI.`,
      `Happy coding!`,
    ],
    time: 'Yesterday',
    date: 'Yesterday at 3:30 PM',
    isRead: true,
    isStarred: true,
    folder: 'inbox',
    tag: 'Services',
  },
  {
    id: 'm-4',
    sender: 'Google Drive System',
    senderEmail: 'drive-noreply@google.com',
    senderAvatar: '📁',
    subject: '1.42 GB of 15 GB Google Cloud Storage in use',
    snippet: 'Project assets, documents, and backups are synced to Firebase Storage.',
    body: [
      `Your Google Drive storage status report:`,
      `• Used: 1.42 GB`,
      `• Limit: 15.00 GB (Free tier)`,
      `• Primary Bucket: ${GOOGLE_SERVICES_CONFIG.storageBucket}`,
      `All files are accessible directly through Edge Browser's Google Drive view.`,
    ],
    time: 'Nov 1',
    date: 'Nov 1, 2026',
    isRead: true,
    isStarred: false,
    folder: 'inbox',
  },
];

interface GmailAppProps {
  onNavigate: (view: any, url: string, title: string) => void;
  onOpenAppsWaffle: () => void;
}

export const GmailApp: React.FC<GmailAppProps> = ({
  onNavigate,
  onOpenAppsWaffle,
}) => {
  const [emails, setEmails] = useState<EmailItem[]>(INITIAL_EMAILS);
  const [activeFolder, setActiveFolder] = useState<
    'inbox' | 'starred' | 'sent' | 'drafts' | 'trash'
  >('inbox');
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  // Unread count
  const unreadCount = emails.filter(
    (e) => e.folder === 'inbox' && !e.isRead
  ).length;

  // Filtered emails
  const filteredEmails = emails.filter((e) => {
    const matchesFolder =
      activeFolder === 'starred' ? e.isStarred : e.folder === activeFolder;
    const matchesSearch =
      !searchQuery ||
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    soundEngine.playClick();
    setEmails((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isStarred: !item.isStarred } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    soundEngine.playClick();
    setEmails((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, folder: 'trash' } : item
      )
    );
    if (selectedEmail?.id === id) setSelectedEmail(null);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim()) return;
    soundEngine.playDing();

    const newSentEmail: EmailItem = {
      id: `m-${Date.now()}`,
      sender: 'Windows 10 Developer',
      senderEmail: GOOGLE_SERVICES_CONFIG.connectedAccount.email,
      senderAvatar: 'W',
      subject: composeSubject.trim(),
      snippet: composeBody.slice(0, 90) + '...',
      body: composeBody.split('\n'),
      time: 'Just now',
      date: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      isStarred: false,
      folder: 'sent',
    };

    setEmails([newSentEmail, ...emails]);
    setIsComposeOpen(false);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
  };

  return (
    <div className="min-h-full flex flex-col bg-white dark:bg-[#1f1f1f] text-zinc-800 dark:text-zinc-200 font-sans select-none">
      {/* 1. Gmail Top Bar */}
      <header className="px-4 py-2.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-white dark:bg-[#202124]">
        <div className="flex items-center gap-3">
          <div
            onClick={() => {
              setSelectedEmail(null);
              soundEngine.playClick();
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <GmailIcon className="w-6 h-6" />
            <span className="font-semibold text-lg tracking-tight text-zinc-700 dark:text-zinc-200">
              Gmail
            </span>
          </div>
        </div>

        {/* Search in mail */}
        <div className="flex-1 max-w-xl mx-2">
          <div className="flex items-center bg-[#f1f3f4] dark:bg-[#303134] rounded-full px-4 py-2 text-xs">
            <svg
              className="w-4 h-4 text-zinc-500 mr-2 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mail"
              className="w-full bg-transparent outline-none text-xs text-inherit placeholder-zinc-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-zinc-400 hover:text-zinc-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAppsWaffle}
            title="Google apps"
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-300"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="5" cy="5" r="2" />
              <circle cx="12" cy="5" r="2" />
              <circle cx="19" cy="5" r="2" />
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
              <circle cx="5" cy="19" r="2" />
              <circle cx="12" cy="19" r="2" />
              <circle cx="19" cy="19" r="2" />
            </svg>
          </button>

          <div
            title={`Account: ${GOOGLE_SERVICES_CONFIG.connectedAccount.email}`}
            className="w-8 h-8 rounded-full bg-blue-600 text-white font-medium flex items-center justify-center text-xs cursor-pointer shadow-xs"
          >
            W
          </div>
        </div>
      </header>

      {/* 2. Main Gmail Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-56 p-3 flex flex-col gap-1 border-r border-zinc-200 dark:border-zinc-800 shrink-0 bg-[#f6f8fc] dark:bg-[#1a1a1a]">
          {/* Compose Button */}
          <button
            onClick={() => {
              setIsComposeOpen(true);
              soundEngine.playClick();
            }}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#c2e7ff] dark:bg-[#004a77] text-[#001d35] dark:text-[#c2e7ff] hover:shadow-md transition-all font-semibold text-xs mb-3 w-fit"
          >
            <span className="text-base">✏️</span>
            <span>Compose</span>
          </button>

          {/* Navigation Items */}
          {[
            { id: 'inbox', label: 'Inbox', icon: '📥', count: unreadCount },
            { id: 'starred', label: 'Starred', icon: '⭐' },
            { id: 'sent', label: 'Sent', icon: '📤' },
            { id: 'drafts', label: 'Drafts', icon: '📝', count: 1 },
            { id: 'trash', label: 'Trash', icon: '🗑️' },
          ].map((nav) => (
            <button
              key={nav.id}
              onClick={() => {
                setActiveFolder(nav.id as any);
                setSelectedEmail(null);
                soundEngine.playClick();
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                activeFolder === nav.id
                  ? 'bg-[#d3e3fd] dark:bg-[#004a77] text-[#041e49] dark:text-white font-bold'
                  : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span>{nav.icon}</span>
                <span>{nav.label}</span>
              </div>
              {nav.count !== undefined && nav.count > 0 && (
                <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-blue-600 text-white">
                  {nav.count}
                </span>
              )}
            </button>
          ))}

          {/* Project Tag Banner in Sidebar */}
          <div className="mt-auto p-3 bg-white dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 text-[11px]">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-200 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Project Connected</span>
            </div>
            <div className="font-mono text-zinc-500 dark:text-zinc-400 text-[10px] truncate">
              {GOOGLE_SERVICES_CONFIG.projectId}
            </div>
          </div>
        </aside>

        {/* Content Pane: Email List OR Message Viewer */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-[#1f1f1f]">
          {selectedEmail ? (
            /* EMAIL DETAIL READER */
            <div className="p-6 max-w-4xl">
              {/* Back & Actions Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-5">
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium text-blue-600 dark:text-blue-400"
                >
                  ← Back to {activeFolder}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleStar(e, selectedEmail.id)}
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-amber-500"
                  >
                    {selectedEmail.isStarred ? '★' : '☆'}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedEmail.id)}
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-red-500 text-xs"
                    title="Delete message"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {/* Subject */}
              <h1 className="text-xl font-bold mb-4 text-zinc-900 dark:text-white">
                {selectedEmail.subject}
              </h1>

              {/* Sender Details */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  {selectedEmail.senderAvatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-zinc-900 dark:text-white">
                      {selectedEmail.sender}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      &lt;{selectedEmail.senderEmail}&gt;
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    to {GOOGLE_SERVICES_CONFIG.connectedAccount.email} •{' '}
                    {selectedEmail.date}
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-3 bg-[#fafafa] dark:bg-[#252525] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                {selectedEmail.body.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>

              {/* Reply / Forward Actions */}
              <div className="flex gap-2.5 mt-6">
                <button
                  onClick={() => {
                    setComposeTo(selectedEmail.senderEmail);
                    setComposeSubject(`Re: ${selectedEmail.subject}`);
                    setIsComposeOpen(true);
                  }}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>↩</span> Reply
                </button>
                <button
                  onClick={() => {
                    setComposeSubject(`Fwd: ${selectedEmail.subject}`);
                    setComposeBody(selectedEmail.body.join('\n'));
                    setIsComposeOpen(true);
                  }}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>↪</span> Forward
                </button>
              </div>
            </div>
          ) : (
            /* EMAIL LIST */
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredEmails.length === 0 ? (
                <div className="p-16 text-center text-zinc-400 text-xs">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="font-medium">No messages in {activeFolder}</p>
                </div>
              ) : (
                filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => {
                      setSelectedEmail(email);
                      setEmails((prev) =>
                        prev.map((e) =>
                          e.id === email.id ? { ...e, isRead: true } : e
                        )
                      );
                      soundEngine.playClick();
                    }}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors text-xs ${
                      !email.isRead
                        ? 'bg-[#f2f6fc] dark:bg-[#242b35] font-semibold text-zinc-900 dark:text-white'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    {/* Star button */}
                    <button
                      onClick={(e) => toggleStar(e, email.id)}
                      className={`text-sm ${
                        email.isStarred ? 'text-amber-500' : 'text-zinc-300 dark:text-zinc-600'
                      }`}
                    >
                      ★
                    </button>

                    {/* Sender */}
                    <div className="w-40 truncate shrink-0">
                      {email.sender}
                    </div>

                    {/* Subject & Snippet */}
                    <div className="flex-1 flex items-center gap-2 truncate">
                      {email.tag && (
                        <span className="text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded shrink-0">
                          {email.tag}
                        </span>
                      )}
                      <span className="truncate">{email.subject}</span>
                      <span className="text-zinc-400 font-normal truncate hidden sm:inline">
                        — {email.snippet}
                      </span>
                    </div>

                    {/* Time */}
                    <div className="text-[11px] text-zinc-400 font-mono shrink-0 ml-2">
                      {email.time}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* 3. Compose Email Modal */}
      {isComposeOpen && (
        <div className="fixed bottom-0 right-8 z-50 w-full max-w-lg bg-white dark:bg-[#2a2a2a] border border-zinc-300 dark:border-zinc-700 rounded-t-2xl shadow-2xl overflow-hidden animate-slideUp">
          <div className="bg-[#f2f6fc] dark:bg-[#1f1f1f] px-4 py-2.5 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700">
            <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">
              New Message
            </span>
            <button
              onClick={() => setIsComposeOpen(false)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSendEmail} className="p-4 flex flex-col gap-2.5">
            <input
              type="email"
              value={composeTo}
              onChange={(e) => setComposeTo(e.target.value)}
              placeholder="Recipients (e.g. team@example.com)"
              className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-700 pb-1.5 text-xs outline-none text-inherit placeholder-zinc-400"
              required
            />
            <input
              type="text"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              placeholder="Subject"
              className="w-full bg-transparent border-b border-zinc-200 dark:border-zinc-700 pb-1.5 text-xs outline-none text-inherit placeholder-zinc-400 font-medium"
              required
            />
            <textarea
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              placeholder="Write your email here..."
              rows={8}
              className="w-full bg-transparent outline-none text-xs text-inherit placeholder-zinc-400 resize-none pt-2"
              required
            />

            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="submit"
                className="px-5 py-2 bg-[#0b57d0] hover:bg-[#0842a0] text-white rounded-full font-semibold text-xs shadow-md transition-colors"
              >
                Send Message
              </button>
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="text-zinc-400 hover:text-red-500 text-xs p-1"
                title="Discard draft"
              >
                🗑️
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
