---
title: "Secure DMVPN Architecture"
published: 2025-09-01
description: "Designed and deployed a VPN-IPSec DMVPN architecture interconnecting 6 geographically distributed sites for Groupe OCP, with GRE tunnels secured by AES-256 encryption."
tags: [VPN-IPSec, DMVPN, FortiGate, Network Security]
category: Internship
---

## Overview

Designed and deployed a VPN-IPSec DMVPN architecture interconnecting 6 geographically distributed sites for Groupe OCP, with GRE tunnels secured by AES-256 encryption.

## Key Achievements

- **Multi-site connectivity**: Connected 6 geographically distributed locations into a unified, secure network using DMVPN hub-and-spoke topology
- **AES-256 encryption**: All GRE tunnels secured with military-grade AES-256 encryption via IPSec
- **Granular firewall policies**: Implemented firewall rules across LAN, DMZ, and WAN segments with 6 security tiers on FortiGate appliances
- **Traffic validation**: Verified all encrypted traffic flows using Wireshark packet analysis

## Technologies Used

| Technology | Purpose |
|-----------|---------|
| VPN-IPSec | Secure tunnel encryption |
| DMVPN | Dynamic multipoint overlay network |
| FortiGate | Next-gen firewall appliance |
| EIGRP / OSPF | Dynamic routing protocols |
| GNS3 | Network simulation and testing |
| Wireshark | Traffic capture and analysis |

## Architecture

The architecture follows the **DMVPN Phase 3** model, enabling direct spoke-to-spoke communication without routing traffic through the hub. This reduces latency and improves bandwidth utilization across all 6 sites.

Each site enforces:
1. **LAN zone** — Internal user traffic
2. **DMZ zone** — Publicly accessible services
3. **WAN zone** — Internet-facing interfaces
4. **VPN zone** — Encrypted inter-site traffic
5. **Management zone** — Administrative access
6. **Monitoring zone** — SNMP and syslog collection
