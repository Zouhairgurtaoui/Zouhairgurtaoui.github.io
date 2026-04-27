// ============================================================
// DATA.JS — Your content lives here
// ============================================================
// To add a new project or writeup, just copy an existing object
// in the array below and update the fields. The site rebuilds
// the cards automatically — no HTML changes needed.
// ============================================================

/**
 * PROJECTS ARRAY
 * Each object represents one project card.
 *
 * Fields:
 *   title       — Project name
 *   description — Short summary (1-2 sentences)
 *   tech        — Array of technology badges
 *   github      — URL to the GitHub repo (set "" to hide button)
 *   demo        — URL to a live demo   (set "" to hide button)
 *   featured    — true to give the card an accent glow
 */
const projects = [
  {
    title: "Secure DMVPN Architecture",
    description:
      "Designed and deployed a VPN-IPSec DMVPN architecture interconnecting 6 geographically distributed sites for Groupe OCP, with GRE tunnels secured by AES-256 encryption.",
    tech: ["VPN-IPSec", "DMVPN", "FortiGate", "EIGRP", "OSPF", "GNS3"],
    github: "",
    demo: "",
    featured: true,
  },
  {
    title: "Adaptive Learning Assessment Platform",
    description:
      "Intelligent web-based evaluation platform that adapts difficulty level based on student performance, with secure user data management and result analytics.",
    tech: ["Python", "Django", "HTML5/CSS3", "Bootstrap", "SQL Server"],
    github: "https://github.com/zouhair-guertaoui",
    demo: "",
    featured: true,
  },
  {
    title: "Enrollment Management System",
    description:
      "Desktop application automating the computer engineering enrollment process with intuitive GUI, report generation, and full lifecycle management.",
    tech: ["Java", "JavaFX", "MySQL", "SceneBuilder"],
    github: "https://github.com/zouhair-guertaoui",
    demo: "",
    featured: false,
  },
  {
    title: "FortiGate Firewall Segmentation Lab",
    description:
      "Implemented granular firewall policies across LAN, DMZ, and WAN segments with 6 security tiers on FortiGate, validated via Wireshark traffic analysis.",
    tech: ["FortiGate", "Wireshark", "IPSec", "Network Security"],
    github: "",
    demo: "",
    featured: false,
  },
  // ──────────────────────────────────────────────
  // PLACEHOLDER — Copy this block to add more projects
  // ──────────────────────────────────────────────
  // {
  //   title: "New Project Title",
  //   description: "A short description of what the project does.",
  //   tech: ["Tech1", "Tech2", "Tech3"],
  //   github: "https://github.com/you/repo",
  //   demo: "https://demo-link.com",
  //   featured: false,
  // },
];

/**
 * WRITEUPS ARRAY
 * Each object represents one writeup / article card.
 *
 * Fields:
 *   title       — Writeup headline
 *   category    — Tag label (e.g. "CTF", "Vulnerability Research", "Blue Team")
 *   date        — Publication date string
 *   description — One-liner summary
 *   link        — URL to the full writeup
 */
const writeups = [
  {
    title: "DMVPN Spoke-to-Spoke Tunnel Analysis",
    category: "Network Security",
    date: "2025-08-15",
    description:
      "Deep dive into NHRP-based dynamic tunnel creation in DMVPN Phase 3, with Wireshark packet capture analysis and security implications.",
    link: "#",
  },
  {
    title: "FortiGate Policy Hardening Checklist",
    category: "Vulnerability Research",
    date: "2025-07-20",
    description:
      "Comprehensive security audit checklist for FortiGate firewall configurations, covering LAN/DMZ/WAN segmentation best practices.",
    link: "#",
  },
  {
    title: "ISO 27001:2022 Implementation Roadmap",
    category: "Governance",
    date: "2025-06-10",
    description:
      "Step-by-step guide to implementing ISO 27001 information security management system in mid-size organizations.",
    link: "#",
  },
  // ──────────────────────────────────────────────
  // PLACEHOLDER — Copy this block to add more writeups
  // ──────────────────────────────────────────────
  // {
  //   title: "New Writeup Title",
  //   category: "CTF",
  //   date: "2025-01-01",
  //   description: "Short description of the writeup.",
  //   link: "https://blog.example.com/writeup",
  // },
];
