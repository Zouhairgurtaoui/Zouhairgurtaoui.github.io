export interface Writeup {
  title: string;
  category: string;
  date: string;
  description: string;
  link: string;
}

export const writeups: Writeup[] = [
  {
    title: "AD Pentest — RBCD to Domain Admin",
    category: "Active Directory",
    date: "2026-04-27",
    description:
      "Full attack chain from zero credentials to Domain Admin via Resource-Based Constrained Delegation abuse. Demonstrates how a single GenericWrite misconfiguration can compromise an entire domain.",
    link: "/writeups/rbcd",
  },
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
];
