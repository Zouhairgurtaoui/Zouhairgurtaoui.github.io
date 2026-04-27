export interface SkillGroup {
  icon: string;
  title: string;
  skills: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    icon: "🛡️",
    title: "Security & Networks",
    skills: [
      "VPN-IPSec", "FortiGate", "Wireshark", "GNS3", "Splunk",
      "Wazuh", "Snort", "Active Directory", "DMVPN", "EIGRP / OSPF",
    ],
  },
  {
    icon: "📋",
    title: "Governance & Standards",
    skills: ["ISO 27001", "ISO 27002", "ISO 27005", "Risk Management", "Security Audit"],
  },
  {
    icon: "💻",
    title: "Programming Languages",
    skills: ["Python", "Java", "C / C++", "C#", "JavaScript", "PHP", "SQL"],
  },
  {
    icon: "🌐",
    title: "Web Technologies",
    skills: ["HTML5 / CSS3", "Django", "ASP.NET", "Spring Boot", "Bootstrap"],
  },
  {
    icon: "🔧",
    title: "Tools & Methodologies",
    skills: ["Git", "UML", "Merise", "SCRUM", "MySQL", "SQL Server"],
  },
];
