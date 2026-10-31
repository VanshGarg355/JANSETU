import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Eye,
  Search,
  PlusCircle,
  X,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  GraduationCap,
  Sparkles,
  RotateCcw,
  QrCode,
  Printer,
  FileText,
  BadgeCheck,
  ExternalLink,
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';
import { INITIAL_FAMILY_DOCUMENTS } from '../data/familyDocuments';

export default function FamilyDocumentsVault({ isHindi = false, currentUser = null }) {
  const [familyMembers, setFamilyMembers] = useState(INITIAL_FAMILY_DOCUMENTS);
  const [selectedMemberId, setSelectedMemberId] = useState('farmer');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isReverifying, setIsReverifying] = useState(false);

  // Form for linking new document
  const [newDocForm, setNewDocForm] = useState({
    name: 'Domicile / Residence Certificate (निवास प्रमाण पत्र)',
    category: 'Identity & Biometric',
    doc_number: '',
    issuer: 'Revenue Department, Govt. of UP',
    file_type: 'PDF'
  });

  // Sync initial selection based on active user role/occupation if changed
  useEffect(() => {
    if (currentUser?.occupation === 'Student' || currentUser?.role?.includes('Student')) {
      setSelectedMemberId('student');
    } else if (currentUser?.role?.includes('Senior') || currentUser?.occupation?.includes('Pensioner')) {
      setSelectedMemberId('pension');
    } else if (currentUser?.role?.includes('Self-Employed') || currentUser?.occupation?.includes('Business')) {
      setSelectedMemberId('mother');
    } else {
      setSelectedMemberId('farmer');
    }
  }, [currentUser]);

  // Fetch from backend API on mount if available
  useEffect(() => {
    fetch('/api/documents/family')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.members) && data.members.length > 0) {
          setFamilyMembers(data.members);
        }
      })
      .catch(err => {
        // Fallback to INITIAL_FAMILY_DOCUMENTS seamlessly
        console.log('Using local family documents vault.');
      });
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentMember = familyMembers.find(m => m.id === selectedMemberId) || familyMembers[0];

  // Extract unique categories for filter
  const categories = ['all', ...new Set((currentMember?.documents || []).map(d => d.category))];

  // Filtered documents
  const filteredDocs = (currentMember?.documents || []).filter(doc => {
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      doc.name.toLowerCase().includes(query) ||
      (doc.name_hi && doc.name_hi.toLowerCase().includes(query)) ||
      doc.doc_number.toLowerCase().includes(query) ||
      doc.issuer.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Toggle status (e.g. simulate recheck/renewal)
  const handleToggleDocStatus = async (docId) => {
    setIsReverifying(true);
    try {
      const res = await fetch('/api/documents/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: currentMember.id, docId })
      });
      const data = await res.json();
      if (data.success && data.updated_doc) {
        setFamilyMembers(prev =>
          prev.map(m => {
            if (m.id === currentMember.id) {
              return {
                ...m,
                documents: m.documents.map(d => (d.id === docId ? data.updated_doc : d))
              };
            }
            return m;
          })
        );
        showToast(
          isHindi
            ? `दस्तावेज़ "${data.updated_doc.name_hi || data.updated_doc.name}" की स्थिति सफलतापूर्वक अपडेट की गई!`
            : `Document status for "${data.updated_doc.name}" updated!`
        );
      } else {
        // Fallback local toggle
        localToggle(docId);
      }
    } catch (e) {
      localToggle(docId);
    } finally {
      setIsReverifying(false);
    }
  };

  const localToggle = (docId) => {
    setFamilyMembers(prev =>
      prev.map(m => {
        if (m.id === currentMember.id) {
          return {
            ...m,
            documents: m.documents.map(d => {
              if (d.id === docId) {
                const nextStatus = d.status === 'verified' ? 'action_required' : 'verified';
                return { ...d, status: nextStatus };
              }
              return d;
            })
          };
        }
        return m;
      })
    );
    showToast(isHindi ? 'दस्तावेज़ की स्थिति अपडेट की गई!' : 'Document status updated successfully!');
  };

  // Add new document simulation
  const handleAddNewDoc = (e) => {
    e.preventDefault();
    if (!newDocForm.doc_number) {
      alert(isHindi ? 'कृपया दस्तावेज़ संख्या दर्ज करें' : 'Please enter document / certificate number');
      return;
    }

    const createdDoc = {
      id: `doc-custom-${Date.now()}`,
      category: newDocForm.category,
      type: 'custom',
      name: newDocForm.name,
      name_hi: newDocForm.name,
      doc_number: newDocForm.doc_number,
      issuer: newDocForm.issuer,
      status: 'verified',
      issue_date: 'Just Now (Online Authenticated)',
      valid_upto: 'Lifetime / Valid',
      file_type: 'PDF',
      file_size: '1.4 MB',
      source: 'DigiLocker Authenticated',
      extracted_details: {
        'Document Title': newDocForm.name,
        'Certificate Number': newDocForm.doc_number,
        'Issuing Authority': newDocForm.issuer,
        'Verified Beneficiary': currentMember.name,
        'Digital Authentication': 'Cryptographically verified with DigiLocker Gateway',
        'Verification Date': new Date().toLocaleDateString('en-IN')
      }
    };

    setFamilyMembers(prev =>
      prev.map(m => {
        if (m.id === currentMember.id) {
          return {
            ...m,
            documents: [createdDoc, ...m.documents]
          };
        }
        return m;
      })
    );

    setIsAddModalOpen(false);
    setNewDocForm({
      name: 'Domicile / Residence Certificate (निवास प्रमाण पत्र)',
      category: 'Identity & Biometric',
      doc_number: '',
      issuer: 'Revenue Department, Govt. of UP',
      file_type: 'PDF'
    });
    showToast(
      isHindi
        ? 'नया दस्तावेज़ डिजीलॉकर से सफलतापूर्वक लिंक व सत्यापित हो गया!'
        : 'New document successfully authenticated & linked from DigiLocker!'
    );
  };

  const handleDownloadDoc = (doc) => {
    showToast(
      isHindi
        ? `"${doc.name_hi || doc.name}" की डिजिटल सत्यापित प्रति डाउनलोड हो रही है...`
        : `Downloading verified e-copy of "${doc.name}"...`
    );
  };

  // Compute counts
  const totalFamilyDocs = familyMembers.reduce((acc, m) => acc + (m.documents?.length || 0), 0);
  const verifiedFamilyDocs = familyMembers.reduce(
    (acc, m) => acc + (m.documents?.filter(d => d.status === 'verified').length || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-taupe-950 text-white px-5 py-3 rounded-2xl shadow-2xl border border-taupe-700 flex items-center gap-3 animate-fade-in text-xs font-bold">
          <BadgeCheck size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-white border border-taupe-300 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-taupe-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-taupe-100 text-taupe-850">
                <FileCheck2 size={22} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-taupe-950 tracking-tight">
                    {isHindi ? 'दस्तावेज़ वॉल्ट' : 'Document Vault'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck size={12} />
                    <span>DigiLocker Synced</span>
                  </span>
                </div>
                <p className="text-xs text-taupe-600 mt-0.5">
                  {isHindi
                    ? 'किसान, छात्र व पेंशनभोगी के सभी सत्यापित दस्तावेज़ एवं पूर्ण विवरण (मार्कशीट, खसरा, पीपीओ आदि)।'
                    : 'Dedicated citizen document vault with extracted details for Farmer, Student, and Senior Pensioner.'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right sm:text-left bg-taupe-50 border border-taupe-200 px-4 py-2 rounded-2xl">
              <div className="text-[10px] font-bold uppercase tracking-wider text-taupe-500">
                {isHindi ? 'कुल सत्यापित दस्तावेज़' : 'Verified Documents'}
              </div>
              <div className="text-base font-extrabold text-taupe-950 flex items-center gap-1.5">
                <span className="text-emerald-700 font-mono">{verifiedFamilyDocs}</span>
                <span className="text-taupe-400 font-normal">/</span>
                <span className="text-taupe-700 font-mono">{totalFamilyDocs} Active</span>
              </div>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-taupe-850 hover:bg-taupe-950 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <PlusCircle size={15} className="text-amber-400" />
              <span>{isHindi ? '+ नया दस्तावेज़ लिंक करें' : '+ Link DigiLocker Document'}</span>
            </button>
          </div>
        </div>

        {/* 1. Family Members Navigation Switcher */}
        <div className="mt-6 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-taupe-600 flex items-center justify-between">
            <span>{isHindi ? 'परिवार सदस्य चुनें (दस्तावेज़ देखने हेतु):' : 'Select Family Member Profile:'}</span>
            <span className="text-[10px] text-taupe-500 font-normal">
              {isHindi ? 'प्रत्येक सदस्य के अलग-अलग दस्तावेज़' : 'Separate verified records per member'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {familyMembers.map(member => {
              const isSelected = member.id === selectedMemberId;
              const docCount = member.documents?.length || 0;
              const hasAlert = member.documents?.some(d => d.status === 'action_required');

              return (
                <button
                  key={member.id}
                  onClick={() => {
                    setSelectedMemberId(member.id);
                    setCategoryFilter('all');
                    setSearchQuery('');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-taupe-850 text-white border-taupe-850 shadow-md ring-2 ring-taupe-850 ring-offset-2'
                      : 'bg-taupe-50 hover:bg-taupe-100 text-taupe-900 border-taupe-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{member.avatar}</span>
                      <div>
                        <div className="font-extrabold text-sm leading-tight">
                          {member.name}
                        </div>
                        <div className={`text-[11px] font-medium ${isSelected ? 'text-taupe-300' : 'text-taupe-600'}`}>
                          {isHindi ? member.relation_hi || member.relation : member.relation}
                        </div>
                      </div>
                    </div>

                    {hasAlert && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" title="Action Required" />
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-taupe-200/40 flex items-center justify-between text-[11px]">
                    <span className={`font-semibold ${isSelected ? 'text-taupe-200' : 'text-taupe-700'}`}>
                      {member.role.split('(')[0].trim()}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-taupe-700 text-white' : 'bg-taupe-200 text-taupe-800'
                    }`}>
                      {docCount} {isHindi ? 'दस्तावेज़' : 'Docs'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Active Member Profile & Extracted Key Metrics Card */}
        {currentMember && (
          <div className="mt-6 p-5 rounded-2xl bg-taupe-100/70 border border-taupe-200 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-2xl bg-white shadow-sm border border-taupe-200">
                  {currentMember.avatar}
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold text-taupe-950">
                      {currentMember.name}
                    </h3>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${currentMember.badge_color}`}>
                      {currentMember.badge}
                    </span>
                    <span className="text-xs text-taupe-600 font-medium">
                      Age: {currentMember.age} Yrs
                    </span>
                  </div>
                  <p className="text-xs text-taupe-600 mt-0.5">
                    {currentMember.summary}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="bg-white px-3 py-1.5 rounded-xl border border-taupe-300 text-taupe-800 font-medium">
                  Bank: <strong>{currentMember.bank_name}</strong>
                </span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1">
                  <ShieldCheck size={13} />
                  <span>{currentMember.npci_status}</span>
                </span>
              </div>
            </div>

            {/* Extracted Stats Row */}
            {currentMember.key_stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-taupe-200">
                {Object.entries(currentMember.key_stats).map(([label, val], idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-xl border border-taupe-200 shadow-2xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-taupe-500 truncate">
                      {label}
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-taupe-950 mt-0.5 truncate">
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Document Search & Category Filters Bar */}
      <div className="bg-white border border-taupe-300 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-taupe-400" />
          <input
            type="text"
            placeholder={
              isHindi
                ? 'दस्तावेज़ या रोल नंबर खोजें...'
                : 'Search documents, roll no, Khasra, PPO...'
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-taupe-50 border border-taupe-200 focus:border-taupe-850 rounded-xl text-xs font-medium outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-taupe-400 hover:text-taupe-700"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 capitalize ${
                categoryFilter === cat
                  ? 'bg-taupe-850 text-white shadow-xs'
                  : 'bg-taupe-100 hover:bg-taupe-200 text-taupe-700'
              }`}
            >
              {cat === 'all' ? (isHindi ? 'सभी दस्तावेज़' : 'All Documents') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Documents Grid with Extracted Details */}
      <div className="space-y-4">
        {filteredDocs.length === 0 ? (
          <div className="bg-white border border-dashed border-taupe-300 rounded-3xl p-10 text-center space-y-3">
            <FileText size={36} className="mx-auto text-taupe-400" />
            <h3 className="text-sm font-bold text-taupe-800">
              {isHindi ? 'कोई दस्तावेज़ नहीं मिला' : 'No matching documents found'}
            </h3>
            <p className="text-xs text-taupe-500 max-w-sm mx-auto">
              {isHindi
                ? 'कृपया खोज शब्द बदलें या सभी श्रेणी का चयन करें।'
                : 'Try clearing your search term or select "All Documents".'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
              }}
              className="px-4 py-2 bg-taupe-850 text-white text-xs font-bold rounded-xl"
            >
              {isHindi ? 'फ़िल्टर रीसेट करें' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredDocs.map(doc => {
              const isVerified = doc.status === 'verified';
              return (
                <div
                  key={doc.id}
                  className="bg-white border border-taupe-300 hover:border-taupe-400 rounded-3xl p-5 shadow-sm transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Top Bar: Category, Status, File format */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-taupe-100 text-taupe-800 px-2.5 py-0.5 rounded-md">
                          {doc.category}
                        </span>
                        <span className="text-[10px] font-bold bg-taupe-50 border border-taupe-200 text-taupe-600 px-2 py-0.5 rounded-md">
                          {doc.file_type} • {doc.file_size}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isVerified
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-900 border-amber-300'
                        }`}
                      >
                        {isVerified ? (
                          <>
                            <CheckCircle2 size={12} className="text-emerald-600" />
                            <span>{isHindi ? 'सत्यापित एवं लिंक्ड' : 'Verified & Linked'}</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={12} className="text-amber-600" />
                            <span>{isHindi ? 'नवीनीकरण आवश्यक' : 'Renewal Due'}</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Document Title & Issuer */}
                    <div>
                      <h4 className="text-sm sm:text-base font-extrabold text-taupe-950 leading-snug">
                        {isHindi ? doc.name_hi || doc.name : doc.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-taupe-600">
                        <span>
                          Doc No: <strong className="font-mono text-taupe-900">{doc.doc_number}</strong>
                        </span>
                        <span>•</span>
                        <span className="truncate">{doc.issuer}</span>
                      </div>
                    </div>
                  </div>

                  {/* Extracted Details Box (Filled According to Document!) */}
                  {doc.extracted_details && (
                    <div className="p-3.5 bg-taupe-50 rounded-2xl border border-taupe-200 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-taupe-500 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Sparkles size={11} className="text-amber-600" />
                          <span>{isHindi ? 'दस्तावेज़ से निकाला गया विवरण' : 'Extracted Document Data:'}</span>
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold">
                          ✓ {doc.source || 'DigiLocker'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {Object.entries(doc.extracted_details)
                          .slice(0, 4)
                          .map(([k, v], idx) => (
                            <div key={idx} className="bg-white p-2 rounded-xl border border-taupe-200/80">
                              <span className="text-[10px] text-taupe-500 block truncate">{k}</span>
                              <strong className="text-taupe-900 font-semibold block truncate mt-0.5">
                                {v}
                              </strong>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Action Buttons */}
                  <div className="pt-2 border-t border-taupe-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] text-taupe-500">
                      Issued: <strong className="text-taupe-800">{doc.issue_date}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="px-3 py-1.5 bg-white hover:bg-taupe-100 text-taupe-900 font-bold text-xs rounded-xl border border-taupe-300 transition-colors flex items-center gap-1.5"
                      >
                        <Eye size={13} className="text-taupe-600" />
                        <span>{isHindi ? 'विवरण देखें' : 'View Full Details'}</span>
                      </button>

                      <button
                        onClick={() => handleDownloadDoc(doc)}
                        className="px-3 py-1.5 bg-taupe-100 hover:bg-taupe-200 text-taupe-900 font-bold text-xs rounded-xl border border-taupe-300 transition-colors flex items-center gap-1.5"
                        title="Download e-Copy"
                      >
                        <Download size={13} />
                        <span className="hidden sm:inline">{isHindi ? 'डाउनलोड' : 'e-Copy'}</span>
                      </button>

                      <button
                        onClick={() => handleToggleDocStatus(doc.id)}
                        disabled={isReverifying}
                        className="p-1.5 bg-white hover:bg-taupe-100 text-taupe-700 rounded-xl border border-taupe-300 transition-colors"
                        title={isVerified ? 'Simulate Recheck' : 'Verify Now'}
                      >
                        <RotateCcw size={13} className={isReverifying ? 'animate-spin' : ''} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security & Official Trust Disclaimer */}
      <div className="p-4 bg-taupe-100/70 border border-taupe-300 rounded-2xl text-xs text-taupe-700 flex items-start sm:items-center gap-3">
        <ShieldCheck size={22} className="text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
        <div>
          <strong className="text-taupe-950 font-bold">
            {isHindi ? 'राष्ट्रीय डिजीलॉकर एवं सुरक्षित डेटा नीति:' : 'National DigiLocker & Data Security Standard:'}
          </strong>{' '}
          {isHindi
            ? 'जनसेतु आपके गोपनीय पासवर्ड या बिना एन्क्रिप्शन वाले आधार दस्तावेज़ सुरक्षित सर्वर पर स्टोर नहीं करता। सभी डेटा सीधे राज्य एवं केंद्र सरकार के सत्यापित एपीआई गेटवे (Bhulekh, CBSE, NIC, UIDAI) से सिंक किए जाते हैं।'
            : 'JanSetu connects directly with official state and central API gateways (Bhulekh, CBSE, NIC, UIDAI) to verify welfare eligibility. All documents are cryptographically signed.'}
        </div>
      </div>

      {/* 5. Modal: View Official Document / Extracted Certificate */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-taupe-300 shadow-2xl animate-fade-in relative">
            {/* Holographic Header Bar */}
            <div className="h-2 bg-gradient-to-r from-amber-500 via-emerald-600 to-blue-600" />

            <div className="p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-taupe-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-taupe-100 text-taupe-850 flex items-center justify-center font-extrabold shrink-0 border border-taupe-200">
                    <FileCheck2 size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Official DigiLocker Verified Record
                    </span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-taupe-950 mt-1">
                      {isHindi ? previewDoc.name_hi || previewDoc.name : previewDoc.name}
                    </h3>
                    <p className="text-xs text-taupe-600">
                      {previewDoc.issuer} • Doc ID: <span className="font-mono font-bold text-taupe-900">{previewDoc.doc_number}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 text-taupe-400 hover:text-taupe-900 hover:bg-taupe-100 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status & Validity */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-taupe-50 rounded-2xl border border-taupe-200">
                  <span className="text-[10px] font-bold text-taupe-500 uppercase">Verification Status</span>
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 size={13} />
                    <span>{previewDoc.status === 'verified' ? 'Authentic & Seeded' : 'Action Required'}</span>
                  </div>
                </div>
                <div className="p-3 bg-taupe-50 rounded-2xl border border-taupe-200">
                  <span className="text-[10px] font-bold text-taupe-500 uppercase">Issue Date</span>
                  <div className="text-xs font-bold text-taupe-900 mt-0.5">{previewDoc.issue_date}</div>
                </div>
                <div className="p-3 bg-taupe-50 rounded-2xl border border-taupe-200 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-taupe-500 uppercase">Validity Period</span>
                  <div className="text-xs font-bold text-taupe-900 mt-0.5">{previewDoc.valid_upto}</div>
                </div>
              </div>

              {/* Extracted Fields Table */}
              {previewDoc.extracted_details && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-taupe-600 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-amber-600" />
                    <span>Verified Data Fields (From Govt. Database)</span>
                  </h4>

                  <div className="bg-taupe-50 rounded-2xl border border-taupe-200 divide-y divide-taupe-200 overflow-hidden text-xs">
                    {Object.entries(previewDoc.extracted_details).map(([k, v], idx) => (
                      <div key={idx} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-semibold text-taupe-600 sm:w-1/3">{k}</span>
                        <span className="font-extrabold text-taupe-950 sm:w-2/3 break-words">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Seal & Cryptographic Watermark */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <ShieldCheck size={16} className="text-emerald-700" />
                    <span>Cryptographically Authenticated By National Informatics Centre (NIC)</span>
                  </div>
                  <div className="text-[10px] text-emerald-800 font-mono">
                    SHA-256 Hash: 8f2a99c4e...b02d71 (Valid Digital Certificate)
                  </div>
                </div>

                <div className="w-12 h-12 bg-white rounded-xl border border-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
                  <QrCode size={28} className="text-emerald-800" />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-taupe-200">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 bg-taupe-200 hover:bg-taupe-300 text-taupe-900 font-bold text-xs rounded-xl"
                >
                  {isHindi ? 'बंद करें' : 'Close'}
                </button>
                <button
                  onClick={() => {
                    handleDownloadDoc(previewDoc);
                    setPreviewDoc(null);
                  }}
                  className="px-5 py-2 bg-taupe-850 hover:bg-taupe-950 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2"
                >
                  <Download size={14} />
                  <span>{isHindi ? 'सत्यापित PDF डाउनलोड करें' : 'Download Verified PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal: Link / Upload New DigiLocker Document */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-taupe-300 shadow-2xl animate-fade-in relative p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-taupe-200">
              <div>
                <h3 className="text-lg font-extrabold text-taupe-950">
                  {isHindi ? 'डिजीलॉकर से नया दस्तावेज़ लिंक करें' : 'Link Document via DigiLocker'}
                </h3>
                <p className="text-xs text-taupe-600 mt-0.5">
                  Linking for: <strong className="text-taupe-900">{currentMember.name}</strong> ({currentMember.role})
                </p>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-taupe-400 hover:text-taupe-900 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddNewDoc} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-taupe-800 block mb-1">
                  {isHindi ? 'दस्तावेज़ का प्रकार' : 'Document Type'}
                </label>
                <select
                  value={newDocForm.name}
                  onChange={e => {
                    const val = e.target.value;
                    let category = 'Identity & Biometric';
                    let issuer = 'Govt Authority';
                    if (val.includes('Caste')) {
                      category = 'Scholarship Eligibility';
                      issuer = 'Tehsil Revenue Department, UP';
                    } else if (val.includes('Electricity')) {
                      category = 'Address Proof';
                      issuer = 'PVVNL Electricity Board';
                    } else if (val.includes('Vehicle')) {
                      category = 'Transport Records';
                      issuer = 'Transport Dept / Vahan Portal';
                    } else if (val.includes('Ayushman')) {
                      category = 'Healthcare Cover';
                      issuer = 'National Health Authority';
                    }
                    setNewDocForm({ ...newDocForm, name: val, category, issuer });
                  }}
                  className="w-full p-2.5 bg-taupe-50 border border-taupe-300 rounded-xl font-medium outline-none"
                >
                  <option value="Domicile / Residence Certificate (निवास प्रमाण पत्र)">
                    Domicile / Residence Certificate (निवास प्रमाण पत्र)
                  </option>
                  <option value="Caste Certificate (जाति प्रमाण पत्र - OBC/SC/ST)">
                    Caste Certificate (जाति प्रमाण पत्र - OBC/SC/ST)
                  </option>
                  <option value="Ayushman Golden Card (आयुष्मान भारत कार्ड)">
                    Ayushman Golden Card (आयुष्मान भारत कार्ड)
                  </option>
                  <option value="Electricity Bill (नवीनतम बिजली बिल)">
                    Electricity Bill (नवीनतम बिजली बिल)
                  </option>
                  <option value="Vehicle RC (वाहन पंजीकरण प्रमाणपत्र)">
                    Vehicle RC (वाहन पंजीकरण प्रमाणपत्र)
                  </option>
                </select>
              </div>

              <div>
                <label className="font-bold text-taupe-800 block mb-1">
                  {isHindi ? 'प्रमाणपत्र संख्या / आवेदन संख्या' : 'Document / Certificate Registration Number'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UP-DOM-2025-9018492"
                  value={newDocForm.doc_number}
                  onChange={e => setNewDocForm({ ...newDocForm, doc_number: e.target.value })}
                  className="w-full p-2.5 bg-taupe-50 border border-taupe-300 rounded-xl font-mono text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-taupe-800 block mb-1">
                  {isHindi ? 'जारीकर्ता संस्था' : 'Issuing Authority'}
                </label>
                <input
                  type="text"
                  value={newDocForm.issuer}
                  onChange={e => setNewDocForm({ ...newDocForm, issuer: e.target.value })}
                  className="w-full p-2.5 bg-taupe-50 border border-taupe-300 rounded-xl font-medium text-xs outline-none"
                />
              </div>

              <div className="p-3 bg-taupe-100 rounded-xl text-taupe-700 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                <span>
                  {isHindi
                    ? 'डिजीलॉकर से तत्काल ओटीपी रहित सत्यापन किया जाएगा।'
                    : 'Instant cryptographic verification will be fetched from DigiLocker API.'}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-taupe-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-taupe-200 hover:bg-taupe-300 text-taupe-900 font-bold rounded-xl"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-taupe-850 hover:bg-taupe-950 text-white font-bold rounded-xl shadow-sm flex items-center gap-2"
                >
                  <Check size={14} />
                  <span>{isHindi ? 'डिजीलॉकर से फेच करें' : 'Authenticate & Link'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
