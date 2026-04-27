export interface Project {
  title: string;
  description: string;
  tech: string[];
  github: string;
  demo: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    title: "Secure DMVPN Architecture",
    description:
      "Designed and deployed a VPN-IPSec DMVPN architecture interconnecting 6 geographically distributed sites for Groupe OCP, with GRE tunnels secured by AES-256 encryption. Implemented granular firewall policies across LAN, DMZ, and WAN segments with 6 security tiers on FortiGate, validated via Wireshark traffic analysis.",
    tech: ["VPN-IPSec", "DMVPN", "FortiGate", "EIGRP", "OSPF", "GNS3", "Wireshark", "Network Security"],
    github: "",
    demo: "",
    featured: true,
  },
  {
    title: "Adaptive Learning Assessment Platform",
    description:
      "Intelligent web-based evaluation platform that adapts difficulty level based on student performance, with secure user data management and result analytics.",
    tech: ["Python", "Django", "HTML5/CSS3", "Bootstrap", "SQL Server"],
    github: "https://github.com/Zouhairgurtaoui/ajyal",
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
];
