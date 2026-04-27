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
  
];
