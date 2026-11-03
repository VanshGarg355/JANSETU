import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';

export const GOV_PORTALS = [
  {
    id: 'uidai',
    name: 'UIDAI myAadhaar',
    nameHi: 'UIDAI आधार पोर्टल',
    url: 'https://myaadhaar.uidai.gov.in/',
    keywords: ['uidai', 'myaadhaar', 'resident.uidai.gov.in', 'myaadhaar.uidai.gov.in', 'यूआईडीएआई', 'माई आधार', 'आधार पोर्टल']
  },
  {
    id: 'npci',
    name: 'NPCI DBT Mapper',
    nameHi: 'NPCI डीबीटी मैपर',
    url: 'https://www.npci.org.in/what-we-do/nach/live-members',
    keywords: ['npci', 'npci mapper', 'एनपीसीआई', 'dbt bharat', 'dbtbharat.gov.in', 'बैंक मैपर']
  },
  {
    id: 'pmkisan',
    name: 'PM-KISAN Portal',
    nameHi: 'पीएम किसान पोर्टल',
    url: 'https://pmkisan.gov.in/',
    keywords: ['pmkisan', 'pm-kisan', 'pm kisan', 'pmkisan.gov.in', 'पीएम किसान', 'पीएम-किसान']
  },
  {
    id: 'pfms',
    name: 'PFMS DBT Portal',
    nameHi: 'PFMS पेमेंट पोर्टल',
    url: 'https://pfms.nic.in/',
    keywords: ['pfms', 'pfms.nic.in', 'पीएफएमएस', 'pfms पोर्टल']
  },
  {
    id: 'nsp',
    name: 'National Scholarship Portal (NSP)',
    nameHi: 'राष्ट्रीय छात्रवृत्ति पोर्टल (NSP)',
    url: 'https://scholarships.gov.in/',
    keywords: ['nsp', 'scholarships.gov.in', 'national scholarship portal', 'एनएसपी', 'छात्रवृत्ति पोर्टल']
  },
  {
    id: 'rbi_ombudsman',
    name: 'RBI Banking Ombudsman (CMS)',
    nameHi: 'आरबीआई बैंकिंग लोकपाल पोर्टल',
    url: 'https://cms.rbi.org.in/',
    keywords: ['banking ombudsman', 'cms.rbi.org.in', 'आरबीआई बैंकिंग लोकपाल', 'बैंकिंग लोकपाल', 'rbi ombudsman', 'लोकपाल']
  },
  {
    id: 'awaassoft',
    name: 'AwaasSoft Portal',
    nameHi: 'आवाससॉफ्ट (PMAY-G) पोर्टल',
    url: 'https://rhreporting.nic.in/',
    keywords: ['awaassoft', 'rhreporting.nic.in', 'pmayg.nic.in', 'आवाससॉफ्ट', 'rhreporting', 'pmay-g']
  },
  {
    id: 'pmayu',
    name: 'PMAY-Urban MIS Portal',
    nameHi: 'पीएम आवास शहरी (MIS) पोर्टल',
    url: 'https://pmaymis.gov.in/',
    keywords: ['pmaymis.gov.in', 'pmay-u', 'pmay urban', 'pmaymis']
  },
  {
    id: 'jeevanpramaan',
    name: 'Jeevan Pramaan (Life Certificate)',
    nameHi: 'जीवन प्रमाण पत्र पोर्टल',
    url: 'https://jeevanpramaan.gov.in/',
    keywords: ['jeevan pramaan', 'jeevanpramaan.gov.in', 'जीवन प्रमाण', 'डिजिटल जीवन प्रमाण']
  },
  {
    id: 'ippb',
    name: 'India Post IPPB Doorstep Service',
    nameHi: 'इंडिया पोस्ट डाकघर डोरस्टेप सेवा',
    url: 'https://www.ippbonline.com/',
    keywords: ['ippb', 'ippbonline.com', 'india post', 'डाकिया', 'डाकघर डोरस्टेप']
  },
  {
    id: 'digilocker',
    name: 'DigiLocker',
    nameHi: 'डिजीलॉकर पोर्टल',
    url: 'https://www.digilocker.gov.in/',
    keywords: ['digilocker', 'digilocker.gov.in', 'डिजीलॉकर']
  },
  {
    id: 'myscheme',
    name: 'myScheme Official Portal',
    nameHi: 'माई स्कीम आधिकारिक पोर्टल',
    url: 'https://www.myscheme.gov.in/',
    keywords: ['myscheme', 'myscheme.gov.in', 'माई स्कीम', 'माईस्कीम']
  },
  {
    id: 'cpgrams',
    name: 'CPGRAMS Grievance Portal',
    nameHi: 'CPGRAMS शिकायत पोर्टल',
    url: 'https://pgportal.gov.in/',
    keywords: ['cpgrams', 'pgportal.gov.in', 'pgportal', 'सीपीजीआरएएमएस']
  },
  {
    id: 'pmjay',
    name: 'Ayushman Bharat NHA Portal',
    nameHi: 'आयुष्मान भारत (NHA) पोर्टल',
    url: 'https://beneficiary.nha.gov.in/',
    keywords: ['beneficiary.nha.gov.in', 'pmjay.gov.in', 'ayushman bharat', 'ayushman', 'आयुष्मान भारत', 'आयुष्मान']
  },
  {
    id: 'mudra',
    name: 'Udyami Mitra (Mudra Portal)',
    nameHi: 'उद्यमी मित्र (मुद्रा लोन पोर्टल)',
    url: 'https://www.udyamimitra.in/',
    keywords: ['udyamimitra.in', 'mudra.org.in', 'mudra', 'मुद्रा लोन', 'मुद्रा पोर्टल']
  },
  {
    id: 'pmsvanidhi',
    name: 'PM SVANidhi Portal',
    nameHi: 'पीएम स्वनिधि पोर्टल',
    url: 'https://pmsvanidhi.mohua.gov.in/',
    keywords: ['pmsvanidhi.mohua.gov.in', 'pmsvanidhi', 'svanidhi', 'स्वनिधि']
  },
  {
    id: 'skillindia',
    name: 'Skill India Digital Portal',
    nameHi: 'स्किल इंडिया डिजिटल पोर्टल',
    url: 'https://www.skillindiadigital.gov.in/',
    keywords: ['skillindiadigital.gov.in', 'skill india', 'स्किल इंडिया']
  },
  {
    id: 'ncs',
    name: 'National Career Service (NCS)',
    nameHi: 'राष्ट्रीय करियर सेवा (NCS)',
    url: 'https://www.ncs.gov.in/',
    keywords: ['ncs.gov.in', 'ncs portal', 'national career service', 'एनसीएस']
  },
  {
    id: 'startupindia',
    name: 'Startup India Seed Fund',
    nameHi: 'स्टार्टअप इंडिया सीड फंड',
    url: 'https://seedfund.startupindia.gov.in/',
    keywords: ['seedfund.startupindia.gov.in', 'startup india', 'स्टार्टअप इंडिया']
  },
  {
    id: 'udyam',
    name: 'Udyam Registration Portal',
    nameHi: 'उद्यम रजिस्ट्रेशन पोर्टल',
    url: 'https://udyamregistration.gov.in/',
    keywords: ['udyamregistration.gov.in', 'udyam registration', 'udyam', 'उद्यम']
  },
  {
    id: 'pmkusum',
    name: 'PM KUSUM Solar Portal',
    nameHi: 'पीएम कुसुम सोलर पोर्टल',
    url: 'https://pmkusum.mnre.gov.in/',
    keywords: ['pmkusum.mnre.gov.in', 'pmkusum', 'kusum', 'कुसुम पोर्टल']
  },
  {
    id: 'pmsuryaghar',
    name: 'PM Surya Ghar Portal',
    nameHi: 'पीएम सूर्य घर पोर्टल',
    url: 'https://pmsuryaghar.gov.in/',
    keywords: ['pmsuryaghar.gov.in', 'pmsuryaghar', 'surya ghar', 'सूर्य घर']
  },
  {
    id: 'smam',
    name: 'Farmech Agri Machinery Portal',
    nameHi: 'कृषि यंत्र पोर्टल (Farmech)',
    url: 'https://agrimachinery.nic.in/',
    keywords: ['agrimachinery.nic.in', 'smam', 'farmech', 'कृषि यंत्र पोर्टल']
  },
  {
    id: 'enam',
    name: 'e-NAM Mandi Portal',
    nameHi: 'ई-नाम कृषि मंडी पोर्टल',
    url: 'https://enam.gov.in/',
    keywords: ['enam.gov.in', 'e-nam', 'enam', 'ई-नाम']
  },
  {
    id: 'bhulekh',
    name: 'BhuLekh Land Records Portal',
    nameHi: 'भूलेख (खतौनी) पोर्टल',
    url: 'https://upbhulekh.gov.in/',
    keywords: ['upbhulekh.gov.in', 'bhulekh', 'भूलेख', 'खतौनी', 'भू-अभिलेख']
  },
  {
    id: 'csc',
    name: 'CSC Centre Locator',
    nameHi: 'सीएससी केंद्र खोजें',
    url: 'https://locator.csccloud.in/',
    keywords: ['csc', 'common service centre', 'सीएससी केंद्र', 'जन सेवा केंद्र']
  }
];

export function extractPortalsFromText(text, defaultUrl = null, defaultName = null) {
  if (!text || typeof text !== 'string') return [];
  const textLower = text.toLowerCase();
  const matched = [];
  const seenIds = new Set();

  // 1. Match known government portals
  for (const portal of GOV_PORTALS) {
    if (portal.keywords.some(k => textLower.includes(k.toLowerCase()))) {
      if (!seenIds.has(portal.id)) {
        seenIds.add(portal.id);
        matched.push(portal);
      }
    }
  }

  // 2. Extract raw URLs if not already matched
  const urlRegex = /(https?:\/\/[^\s)]+|www\.[^\s)]+|[a-zA-Z0-9-]+\.(?:gov|nic)\.in[^\s)]*)/gi;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    let rawUrl = match[0];
    let normalized = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    // Strip trailing punctuation
    normalized = normalized.replace(/[.,;:)\]]+$/, '');

    const alreadyExists = matched.some(m => m.url.includes(rawUrl) || rawUrl.includes(m.url));
    if (!alreadyExists && !seenIds.has(normalized)) {
      seenIds.add(normalized);
      matched.push({
        id: `custom_${normalized}`,
        name: rawUrl.replace(/^https?:\/\//, ''),
        nameHi: rawUrl.replace(/^https?:\/\//, ''),
        url: normalized
      });
    }
  }

  // 3. Fallback to default portal if none matched and default provided
  if (matched.length === 0 && defaultUrl) {
    matched.push({
      id: 'default_portal',
      name: defaultName || 'Official Portal',
      nameHi: defaultName || 'आधिकारिक सरकारी पोर्टल',
      url: defaultUrl
    });
  }

  return matched;
}

/**
 * PortalStepText renders step or process text and makes portal references directly clickable.
 * It also renders 1-click shortcut buttons below the step leading directly to the portals.
 */
export default function PortalStepText({
  text,
  isHindi = false,
  defaultPortalUrl = null,
  defaultPortalName = null,
  showPills = true,
  className = ''
}) {
  if (!text) return null;

  const matchedPortals = extractPortalsFromText(text, defaultPortalUrl, defaultPortalName);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Step Description Text with interactive highlighted portal keywords */}
      <div className="leading-relaxed font-medium">
        {text}
      </div>

      {/* 1-Click Interactive Official Portal Buttons */}
      {showPills && matchedPortals.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {matchedPortals.map((portal) => (
            <a
              key={portal.id}
              href={portal.url}
              target="_blank"
              rel="noreferrer"
              title={`Open ${portal.name}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/90 hover:bg-blue-100 text-blue-900 border border-blue-200/90 hover:border-blue-400 rounded-xl text-xs font-bold shadow-2xs transition-all group active:scale-95"
            >
              <Globe size={13} className="text-blue-700 shrink-0" />
              <span>{isHindi ? (portal.nameHi || portal.name) : portal.name}</span>
              <ExternalLink
                size={12}
                className="text-blue-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
