import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  Bot,
  User,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

function AIChat() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isHindi = i18n.language === 'hi';

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: isHindi
        ? 'नमस्ते! मैं जनसेतु AI सहायक हूँ। मैं आपको सरकारी योजनाओं, पात्रता मानदंडों और डीबीटी (DBT) भुगतान समस्याओं का समाधान खोजने में मदद कर सकता हूँ। आप मुझसे हिंदी या अंग्रेज़ी में कोई भी सवाल पूछ सकते हैं।'
        : 'Hello! I am JanSetu AI Sahayak. I can help you discover verified government welfare schemes, understand eligibility criteria, and troubleshoot DBT payment issues in Hindi or English.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    {
      en: 'How to fix Aadhaar-bank account seeding for DBT?',
      hi: 'डीबीटी के लिए आधार-बैंक सीडिंग कैसे ठीक करें?'
    },
    {
      en: 'Eligibility criteria for PM-KISAN Rs 6,000 subsidy',
      hi: 'पीएम किसान ₹6,000 सब्सिडी के लिए पात्रता नियम'
    },
    {
      en: 'What to do if Post-Matric Scholarship is delayed?',
      hi: 'पोस्ट-मैट्रिक छात्रवृत्ति लेट होने पर क्या करें?'
    },
    {
      en: 'How to apply for Mudra Loan without collateral?',
      hi: 'बिना गारंटी मुद्रा लोन के लिए कैसे आवेदन करें?'
    }
  ];

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          language: isHindi ? 'hi' : 'en',
          profile_id: user?.id
        })
      });
      const data = await res.json();

      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: data.reply || 'Apologies, I could not process your query at this moment. Please check the official portal.',
        source: data.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: isHindi
            ? 'क्षमा करें, नेटवर्क सेवा अस्थायी रूप से अनुपलब्ध है। कृपया आधिकारिक पोर्टल https://www.myscheme.gov.in/ पर जांचें।'
            : 'Apologies, the connection is temporarily disrupted. Please refer directly to official sources at https://www.myscheme.gov.in/.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'assistant',
        text: isHindi
          ? 'चैट रीसेट हो गई है। मैं आपकी क्या सहायता कर सकता हूँ?'
          : 'Conversation cleared. How can I assist you with government schemes today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12 px-4 sm:px-6">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white border border-taupe-300 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-taupe-850 text-taupe-50 flex items-center justify-center shadow-sm">
            <Bot size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-taupe-950">
                {t('appName')} AI Sahayak
              </h1>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <ShieldCheck size={11} /> Grounded RAG
              </span>
            </div>
            <p className="text-[11px] text-taupe-600">
              Bilingual Government Civic Assistant • Zero Fabrications
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 text-taupe-600 hover:text-taupe-950 hover:bg-taupe-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          title="Clear Conversation"
        >
          <RotateCcw size={14} />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-white border border-taupe-300 rounded-3xl p-4 sm:p-6 h-[520px] flex flex-col shadow-sm">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs sm:text-sm ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-taupe-200 text-taupe-900 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={16} />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-1.5 ${
                  isUser
                    ? 'bg-taupe-850 text-taupe-50 rounded-tr-none'
                    : 'bg-taupe-50 border border-taupe-200 text-taupe-950 rounded-tl-none shadow-sm'
                }`}>
                  <div className="whitespace-pre-line leading-relaxed">
                    {msg.text}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] opacity-70 border-t border-taupe-200/30">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => copyToClipboard(msg.id, msg.text)}
                        className="hover:opacity-100 flex items-center gap-0.5 text-[10px]"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-taupe-700 text-taupe-50 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    {user?.name ? user.name.charAt(0) : 'U'}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 text-xs justify-start">
              <div className="w-8 h-8 rounded-lg bg-taupe-200 text-taupe-900 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-taupe-50 border border-taupe-200 rounded-2xl p-4 text-taupe-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-taupe-700 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-taupe-700 animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-taupe-700 animate-bounce delay-200" />
                <span className="text-xs">Consulting verified knowledge base...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="pt-3 border-t border-taupe-200 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <span className="text-[11px] font-bold text-taupe-500 whitespace-nowrap flex items-center gap-1">
            <Sparkles size={12} /> Suggestions:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(isHindi ? p.hi : p.en)}
              className="px-3 py-1 bg-taupe-100 hover:bg-taupe-200 text-taupe-850 rounded-full text-xs font-semibold whitespace-nowrap transition-colors"
            >
              {isHindi ? p.hi : p.en}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="pt-2 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t('chatPlaceholder')}
            className="flex-1 px-4 py-3 bg-taupe-50 border border-taupe-300 rounded-2xl text-xs sm:text-sm text-taupe-950 placeholder:text-taupe-400 focus:outline-none focus:ring-2 focus:ring-taupe-700"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="px-5 py-3 bg-taupe-850 hover:bg-taupe-950 text-taupe-50 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md disabled:opacity-40"
          >
            <span>{t('send')}</span>
            <Send size={14} />
          </button>
        </form>
      </div>

      {/* Safety Notice */}
      <div className="flex items-center justify-center gap-2 text-center text-[11px] text-taupe-500">
        <AlertCircle size={13} />
        <span>JanSetu AI Sahayak never asks for OTP, Bank PIN, or 12-digit Aadhaar. All replies are for educational guidance.</span>
      </div>
    </div>
  );
}

export default AIChat;
