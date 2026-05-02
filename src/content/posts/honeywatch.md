---
title: "Implementation of a DMZ Honeypot Architecture for Cyber Threat Monitoring and Log Analysis"
published: 2026-05-02
description: "Design and deployment of a honeypot-based security monitoring system in a virtualized network environment using GNS3, FortiGate, OpenCanary, and Grafana."
image: "/writeups/honypot/cover.jpeg"
tags: [FortiGate, "Network Security", Honeypot, Log Analysis]
category: Projects
draft: false
---

## Abstract

This project presents the design and implementation of a honeypot-based network security monitoring system deployed within a virtualized environment. The architecture simulates a real-world enterprise network consisting of three distinct zones, a WAN interface exposed to simulated external threats, a LAN segment representing internal infrastructure, and a DMZ hosting a honeypot system designed to attract and log malicious activity.

The solution leverages FortiGate Next-Generation Firewall as the central security enforcement point, responsible for traffic segmentation, policy enforcement, and inter-zone routing.OpenCanary is deployed as a lightweight multi-service honeypot within the DMZ, emulating vulnerable services including FTP, SSH and HTTP to lure potential attackers. All network components are virtualized using GNS3, with  Docker providing the underlying compute layer for the firewall and endpoint nodes respectively.

Attack scenarios were conducted from a simulated external attacker node running Kali Linux, executing brute-force attacks, service enumeration, and exploit attempts against the honeypot. Generated logs were collected and forwarded to a centralized monitoring stack composed of Grafana, Loki, and Promtail, enabling real-time visualization and analysis of threat activity including attacker IP attribution, targeted services, and attack frequency.

The results demonstrate the effectiveness of honeypot-based deception as a complementary layer to traditional firewall controls, providing actionable threat intelligence with minimal resource overhead. This work contributes a practical reference architecture for network deception and intrusion monitoring applicable to academic and professional security environments.


## Theoretical Background
### 1. What is a Honeypot

In the field of cybersecurity, `Honeypots` are defined as fake servers or systems deployed alongside the systems your organisation actually uses in production. Honeypots are designed to appear as attractive targets and are deployed to enable IT teams to monitor the security system’s responses and divert the attacker away from the intended target.

there are two major types of honeypots, High interaction and low interaction honeypots. **High Interaction Honeypots** are fully functional systems that simulate real operating environments, allowing attackers to interact extensively with services, files and processes. They generate detailed logs and reveal sophisticated attack techniques, but this comes at the cost of increased complexity, resource consumption and risk, given that the actual system is compromised.

**Low Interaction Honeypots** simulate only the surface behavior of services accepting connections, responding with fake banners, and logging attempts without exposing a real OS or application stack. They are lightweight, safe, and easy to deploy at scale, making them ideal for threat detection and early warning systems.

**OpenCanary** used in this project, falls into the low interaction category. It emulates multiple network services simultaneously  including FTP, SSH, HTTP, and Telnet recording every connection attempt in structured JSON logs without ever granting real access to an attacker.


### 2. DMZ architecture

A `DMZ` or  demilitarised Zone  is a perimeter network that protects the organisation’s internal network and adds an extra layer of security against untrusted traffic.

A `DMZ` sits between the external network and the internal LAN, acting as a controlled buffer zone. Services placed there are intentionally reachable from the outside, web servers, mail servers, or in this case a honeypot, while staying isolated from the rest of the infrastructure. Even if something in the DMZ gets compromised, the attacker hits a wall before reaching anything critical.

In this project, FortiGate enforces that boundary through explicit firewall policies. Inbound traffic from the WAN can reach the DMZ, but any attempt to move laterally toward the LAN is blocked. The honeypot lives entirely within that zone, visible to the attacker, invisible to the internal network.

### 3. NGFW Role (FortiGate)

A Next-Generation Firewall goes beyond traditional packet filtering by inspecting traffic at the application layer, enforcing identity-based policies, and generating detailed logs for every flow passing through it. FortiGate, developed by Fortinet, is one of the most widely deployed NGFW solutions in enterprise environments and serves as the backbone of this lab.

In this project, FortiGate sits at the intersection of all three network zones, WAN, LAN, and DMZ, making every routing and security decision. It enforces strict segmentation through firewall policies that define exactly what traffic is permitted between zones, applies NAT for outbound connections, and logs all forward traffic including application signatures, source and destination IPs, ports, and actions taken. These logs are forwarded via syslog to the monitoring stack, giving full visibility into attacker behavior at the network level.

### 4. Log Analysis (Loki/Grafana)

ollecting logs is only useful if you can make sense of them quickly. In a real SOC environment, analysts deal with thousands of log entries per hour across multiple sources, making a centralized log management system essential.

In this project, two log sources feed into the monitoring stack. FortiGate generates forward traffic logs for every connection passing through the firewall, while OpenCanary produces structured JSON logs capturing every interaction with the honeypot services. Both are collected by Promtail, shipped to Loki for storage and indexing, and visualized through Grafana dashboards.

Loki was chosen over heavier alternatives like Elasticsearch because it indexes only log metadata rather than full content, keeping resource consumption minimal while still allowing powerful label-based queries. Grafana sits on top as the visualization layer, turning raw log streams into readable charts, tables, and timelines that make attacker behavior immediately visible.

## Evironment Setup

### 1. GNS3 Topology Design


![Network Topology](/writeups/honypot/topology.png)

The lab consists of three distinct network zones enforced by a FortiGate Next-Generation Firewall as the central security boundary.

**LAN (172.16.0.0/24) :** the internal network, represented in green, contains three workstations (PC-1, PC-2, PC-3) connected through Switch1 to FortiGate port1. This zone simulates a protected corporate network.

**DMZ (10.20.0.0/18) :** represented in red, hosts the OpenCanary honeypot connected directly to FortiGate port3. This zone is intentionally exposed to simulate a vulnerable service accessible from the outside.

**WAN (Internet) :** the external side, connected to FortiGate port2 via a GNS3 Cloud node bound to tap0. A second Cloud node bound to tap1 connects the Kali Linux attacker, simulating an external threat actor attempting to compromise the exposed DMZ services.

### 2. TAP Interface Configuration

We will start by configuring TAP interfaces, since Wi-Fi adapters do not support promiscuous mode, direct bridging between GNS3 and the wireless interface is not possible. Virtual TAP interfaces are used instead, acting as software-defined network endpoints that the host kernel treats as regular Ethernet interfaces.

Two TAP interfaces are created on the host. The first, tap0, bridges the FortiGate WAN port to the host network, with NAT rules forwarding traffic out through the wireless interface. The second, tap1, connects the Kali attacker container to the same external segment, with routing rules between the two TAPs ensuring the attacker can reach the FortiGate WAN and, through it, the DMZ honeypot.

Both interfaces are made persistent using systemd-networkd unit files, ensuring the lab environment survives reboots without manual reconfiguration.

We start by creating the systemd network unit file that defines tap0 and tp1 as a persistent TAP interface. This replaces the manual `ip tuntap` command and ensures the interface is created automatically on every boot.

![Creating TAP Interface Unit](/writeups/honypot/creating-tap-interface-unit.png)
![Creating TAP Interface Unit](/writeups/honypot/creating-tap1-interface-unit.png)

After defining the interface, we assign it a static IP address through a matching network configuration file. This IP, `192.168.10.254/24`, will act as the gateway for FortiGate's WAN port.

![Assigning IP to TAP](/writeups/honypot/assihn-ip-tap.png)
![Assigning IP to TAP](/writeups/honypot/assihn-ip-tap1.png)
With both unit files in place, we enable and start the systemd-networkd service so it picks up the new configuration and brings both interfaces up immediately without requiring a reboot.

![Enable systemd-networkd](/writeups/honypot/enable-systemd-networkd.png)

We set up tp0, and same applies for tap1. We enable IP forwarding at the kernel level, allowing the host to route packets between tap0 and the wireless interface instead of dropping them.

![Setting TAP Up and Port Forwarding](/writeups/honypot/setting-tap-up-port-forwarding.png)

We add the iptables NAT and FORWARD rules that masquerade tap0 and tap1 traffic as coming from the host wireless interface, giving GNS3 nodes access to the external network through wlp2s0 in case we need to download tools or update packages from the internet.

![NAT TAP0 Traffic Out Through WiFi](/writeups/honypot/nat-tp0-traffic-out-through-wifi.png)

We then add the bidirectional FORWARD rules between tap0 and tap1, allowing traffic to flow between the attacker segment and the WAN side of FortiGate, effectively connecting the two virtual network segments through the host kernel.

![TAP1 Forward Rules](/writeups/honypot/forward-traffic-taps.png)

### 3. FortiGate deployment and configuration

After resolving the connectivity issues related to Wi-Fi bridging limitations, FortiGate is now ready to be configured as the central security enforcement point of the lab.

We start by configuring port2 as the WAN interface, connecting it to the internet through tap0. This interface receives the IP address that will serve as the gateway for all outbound traffic leaving the lab.

![FortiGate WAN Port2 Configuration](/writeups/honypot/firewall-conf-port2(wan).png)

A static default route is configured pointing to tap0 as the gateway, allowing FortiGate to reach the host network and making the web management interface accessible from the browser.

![FortiGate Static Route](/writeups/honypot/firewall-conf-static-route.png)

With routing in place, we access the FortiGate web interface through the browser. The login page prompts for the credentials set during appliance initialization.

![FortiGate Login](/writeups/honypot/firewall-login.png)

After authenticating, we land on the dashboard which provides a real-time overview of appliance performance, interface status, and system information.

![FortiGate Dashboard](/writeups/honypot/firewall-dashboard.png)

Port1 is assigned the role of LAN interface with a static IP address of 172.16.0.1/24, serving as the default gateway for all internal workstations.

![FortiGate LAN Port1 IP](/writeups/honypot/firewall-setting-ip-port1(lan).png)

Since this simulates an enterprise environment, administrative access on the LAN interface is restricted to SSH and SNMP only. DHCP is enabled to automatically assign IP addresses to connected workstations, and device detection is activated to identify hosts on the segment.

![FortiGate DHCP and Admin Access Port1](/writeups/honypot/firewall-dhcp-administrative-access-port1.png)

Port3 is configured as the DMZ interface with a static IP address of 10.20.0.1/18, acting as the gateway for the honeypot and isolating the DMZ from both the LAN and WAN segments.

![FortiGate DMZ Port3](/writeups/honypot/firewall-conf-port3.png)

DNS is configured using the default FortiGuard servers, providing name resolution for FortiGate itself and for outbound traffic passing through the firewall.

![FortiGate DNS](/writeups/honypot/firewall-conf-dns.png)

The first firewall policy permits specific inbound services from the WAN to the DMZ, including ICMP, HTTP, HTTPS, FTP, POP3, and SSH. This gives the simulated attacker controlled access to interact with the honeypot services.

![FortiGate WAN to DMZ Policy](/writeups/honypot/firewall-wan-dmz-policy-1.png)

To strengthen inspection on this policy, AntiVirus, Web Filter, and DNS Filter security profiles are applied. All sessions are fully logged to capture every interaction between the attacker and the honeypot.

![FortiGate WAN to DMZ Security Profiles](/writeups/honypot/firewall-wan-dmz-policy-2.png)

The second policy permits outbound connections from the LAN to the internet, giving internal workstations access to external resources.

![FortiGate LAN to WAN Policy](/writeups/honypot/firewall-lan-wan-policy-1.png)

NAT is enabled on this policy to prevent internal IP addresses from being exposed to the outside, ensuring only the FortiGate WAN IP is visible externally.

![FortiGate LAN to WAN NAT](/writeups/honypot/firewall-lan-wan-policy-2.png)

A deny policy is placed to block any inbound traffic from the WAN directly reaching the LAN, protecting internal workstations from external threats.

![FortiGate WAN to LAN Deny](/writeups/honypot/firewall-wan-lan-policy.png)

Traffic from the DMZ toward the LAN is explicitly denied, preventing any lateral movement from a potentially compromised honeypot into the internal network.

![FortiGate DMZ to LAN Deny](/writeups/honypot/firewall-dmz-lan-policy.png)

The DMZ is permitted to initiate outbound connections to the internet, allowing the honeypot to reach external resources when needed such as package updates.

![FortiGate DMZ to WAN Policy](/writeups/honypot/firewall-dmz-wan-policy-1.png)

NAT is enabled on the DMZ to WAN policy as well, masking the honeypot's private IP address from the external network.

![FortiGate DMZ to WAN NAT](/writeups/honypot/firewall-dmz-wan-policy-2.png)

Finally, FortiGate is configured to forward all traffic logs to the Loki instance running on the host via syslog, feeding the centralized monitoring stack with firewall-level visibility into all network flows.

![FortiGate Syslog to Loki](/writeups/honypot/firewall-sending-logs-loki.png)


### 4. OpenCanary deployment

With the firewall configured and the DMZ zone ready, we now deploy the honeypot inside a lightweight Docker container running on GNS3.

We start by writing a Dockerfile based on debian:bookworm-slim, installing the required Python dependencies and OpenCanary, then setting it as the default process on container startup. Keeping the base image minimal ensures the honeypot consumes as little resources as possible.

```DockerFile
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip python3-dev iproute2 gcc libffi-dev libssl-dev && rm -rf /var/lib/apt/lists/*
RUN pip3 install opencanary --break-system-packages
RUN opencanaryd --copyconfig
CMD ["opencanaryd", "--start", "--foreground"]
```

![OpenCanary Dockerfile](/writeups/honypot/honypot-dockerfile.png)

The image is built locally using the Dockerfile. Once built, it becomes available to GNS3 which will use it to instantiate the honeypot container and connect it to the DMZ segment through port3.

![OpenCanary Docker Build](/writeups/honypot/honypot-build-docker.png)

After the container starts, we assign it a static IP address of 10.20.0.10/18 on eth0 and set the default gateway to 10.20.0.1, pointing to FortiGate port3. This makes the honeypot reachable from the WAN side through the firewall policies we defined earlier.

![OpenCanary Set IP](/writeups/honypot/honypot-set-ip.png)

The IP configuration is made persistent through GNS3's built-in network configuration editor, so the address survives container restarts without requiring manual reassignment each time.

![OpenCanary Persistent IP](/writeups/honypot/honypot-set-ip-persistent.png)

The OpenCanary configuration file is prepared on the host and then copied directly into the running container using:

```YAML
{
    "device.node_id": "honeypot-01",
    "git.enabled": false,
    "ftp.enabled": true,
    "ftp.port": 21,
    "http.enabled": true,
    "http.port": 80,
    "http.banner": "Apache/2.4.41",
    "ssh.enabled": true,
    "ssh.port": 22,
    "telnet.enabled": true,
    "telnet.port": 23,
    "logger": {
        "class": "PyLogger",
        "kwargs": {
            "formatters": {
                "plain": {"format": "%(message)s"}
            },
            "handlers": {
                "file": {
                    "class": "logging.FileHandler",
                    "filename": "/var/log/opencanary.log"
                },
                "console": {
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout"
                }
            }
        }
    }
}
```

This defines which services the honeypot will emulate, including FTP on port 21, SSH on port 22, HTTP on port 80, and Telnet on port 23, along with the log file path where all interactions will be recorded.
Copy it to the container :

```bash
sudo docker cp ./opencanary-temp.conf image_name:/etc/opencanaryd/opencanary.conf
```

![OpenCanary Config](/writeups/honypot/honeypot-opencanary-conf.png)

We verify the configuration inside the container to confirm all services are correctly enabled and the logger is set to write structured JSON output to /var/log/opencanary.log.

![OpenCanary Running](/writeups/honypot/honypot-running.png)

OpenCanary is started in foreground mode. The output confirms each emulated service has been successfully registered and the honeypot is actively listening, ready to capture any attacker interaction.


### 5. Kali attacker node setup

The attacker node simulates an external threat actor positioned on the WAN side of the firewall, connected through tap1. It runs as a Docker container inside GNS3, built from the official Kali Linux rolling image with the necessary offensive tools pre-installed.

The Dockerfile extends the base Kali Linux rolling image and installs a minimal set of attack tools including nmap for reconnaissance, hydra for brute force attacks, netcat for raw connections, curl and ftp for service interaction, and the rockyou wordlist for password attacks. This keeps the image focused and avoids the overhead of a full Kali installation.

```Dockerfile
FROM kalilinux/kali-rolling
RUN apt-get update && apt-get install -y nmap hydra wordlists metasploit-framework nano netcat-traditional curl ftp iproute2 && gunzip /usr/share/wordlists/rockyou.txt.gz  && rm -rf /var/lib/apt/lists/*
CMD ["/bin/bash"]
```

![Attacker Dockerfile](/writeups/honypot/attacker-dockerfile.png)

The attacker's network configuration is set through GNS3's built-in network editor, assigning it a static IP address of 192.168.11.57/24 with the default gateway pointing to 192.168.11.254, which is the tap1 interface on the host. This places the attacker on the external segment, routed toward FortiGate's WAN through the host forwarding rules.

![Attacker IP Gateway GNS3](/writeups/honypot/attacker-set-ip-gateway-gns3.png)

We verify the IP configuration inside the container to confirm the address is correctly assigned and the interface is up, ensuring the attacker node is ready to initiate traffic toward the honeypot through the firewall.

![Attacker IP Verification](/writeups/honypot/attacker-ip-verification.png)

### 6. Grafana + Loki + Promtail stack

With the network and honeypot in place, we now set up the centralized log analysis stack on the host machine. 
The stack consists of three components: 
- Loki for log storage
- Promtail for log collection and shipping
- Grafana for visualization
All three run as Docker containers managed through a single Compose file.

The Compose file defines all three services. Loki listens on port 3100, Promtail mounts the host log directory and the Docker socket to access both system logs and container stdout, and Grafana exposes the dashboard on port 3000 with persistent volume storage.

```yaml
version: "3"
services:

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - loki_data:/loki

  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log
      - ./promtail-config.yml:/etc/promtail/config.yml
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock
      - /var/log/opencanary.log:/var/log/opencanary.log
    command: -config.file=/etc/promtail/config.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana

volumes:
  loki_data:
  grafana_data:
```

![Docker Compose](/writeups/honypot/docker-compose.png)

Promtail is configured with two scrape jobs. The first uses Docker service discovery to automatically find and tail the OpenCanary container logs by matching on the image name, making it resilient to container ID changes across restarts. The second job watches the FortiGate syslog file written to the host by syslog-ng.
```yaml
server:
  http_listen_port: 9080

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: opencanary
    static_configs:
      - targets: [localhost]
        labels:
          job: opencanary
          __path__: /var/lib/docker/containers/bfb42b319f280c878f61f89e85058f724703241697922f18d10f69d25d3ac797/*-json.log
    pipeline_stages:
      - json:
          expressions:
            container_name: attrs.name
      - match:
          selector: '{job="opencanary"}'
          stages:
            - json:
                expressions:
                  log: log
            - output:
                source: log
            - json:
                expressions:
                  src_host: src_host
                  dst_port: dst_port
                  logdata: logdata

  - job_name: fortigate
    static_configs:
      - targets: [localhost]
        labels:
          job: fortigate
          __path__: /var/log/fortigate.log
```

![Promtail Config](/writeups/honypot/promtail-conf.png)

The stack is brought up with a single command. All three containers start successfully and Promtail immediately begins discovering log targets and shipping entries to Loki.

![Docker Compose Run](/writeups/honypot/docker-compose-run.png)

On the host side, syslog-ng is configured to listen on UDP port 514 and write all received messages to /var/log/fortigate.log. FortiGate is then pointed to the tap0 IP address as the syslog destination, so every forward traffic log entry the firewall generates is captured on the host and picked up by Promtail for shipping to Loki.

```conf
source s_fortigate {
    udp(ip("0.0.0.0") port(514));
};

destination d_fortigate {
    file("/var/log/fortigate.log");
};

log { source(s_fortigate); destination(d_fortigate); };

```

![Syslog Config FortiGate](/writeups/honypot/syslog-conf-fortigate.png)

We access the Grafana interface through the browser on port 3000. The login page prompts for credentials set during the Compose configuration.

![Grafana Login](/writeups/honypot/grafana-login.png)

After logging in we land on the Grafana home page, confirming the instance is running and ready to be configured with data sources and dashboards.

![Grafana Home](/writeups/honypot/grafana-home.png)

Loki is added as a data source by pointing Grafana to the Loki container on port 3100. Once connected, Grafana can query all collected logs using LogQL.

![Grafana Adding Data Source](/writeups/honypot/grafana-adding-data-source.png)

Using the Explore view we verify that both log streams are flowing correctly, querying by job label to confirm FortiGate and OpenCanary logs are both present and properly labeled.

![Grafana Explore](/writeups/honypot/grafana-explore.png)

A dedicated dashboard is created for FortiGate logs, visualizing forward traffic data including source and destination IPs, ports, actions taken, and traffic volume over time. This gives a network-level view of all flows passing through the firewall during attack scenarios.

![Grafana FortiGate Dashboard](/writeups/honypot/grafana-firewall-dashboard.png)

A second dashboard is built specifically for OpenCanary logs, displaying attacker IP attribution, most targeted services, brute force attempts by username, hit counts per destination port, and a full alert table with timestamps and session details. This provides the honeypot-level view of attacker behavior inside the DMZ.

![Grafana OpenCanary Dashboard](/writeups/honypot/grafana-opencanary-dashboard.png)

## Attack Scenarios and Analysis

With the full lab operational, we simulate a series of attacks from the Kali attacker node targeting the OpenCanary honeypot through the FortiGate firewall. Each attack is designed to trigger specific honeypot services and generate observable log entries in both the firewall and the monitoring stack.
### 1. Attack Scenarios

The first step any attacker takes is reconnaissance. We run an nmap service version scan against the honeypot to discover open ports and identify the services it is running. The scan reveals FTP, SSH, HTTP and Telnet among others, each presenting itself with a convincing banner designed to attract further interaction.

![Attacker Nmap](/writeups/honypot/attacker-nmap.png)

Based on the nmap results, the FTP banner identifies the service as vsftpd, a version known for a critical backdoor vulnerability tracked as CVE-2011-2523. We launch Metasploit to attempt exploitation of this vulnerability.

We launch Metasploit and search for vsftpd. Two modules come up a denial of service auxiliary and the vsftpd 2.3.4 backdoor exploit rated excellent. We select module 1, the backdoor command execution exploit.

![Metasploit Search vsftpd](/writeups/honypot/attacker-msfconsole-1.png)

Running `show options` reveals the module requires two parameters: RHOSTS for the target IP and RPORT which defaults to 21. No payload configuration is needed as the backdoor opens a direct command shell.

![Metasploit Show Options](/writeups/honypot/attacker-msfconsole-2.png)

We set RHOSTS to the honeypot IP address 10.20.0.10, pointing the exploit directly at the DMZ target.

![Metasploit Set RHOSTS](/writeups/honypot/attacker-msfconsole-3.png)

We also set LHOST to the attacker's own IP address 192.168.11.57, which will be used as the reverse TCP handler endpoint waiting for the incoming shell connection.

![Metasploit Set LHOST](/writeups/honypot/attacker-msfconsole-4.png)

The exploit is launched. Metasploit starts a reverse TCP handler and attempts to trigger the backdoor on port 21. The server does not respond as expected and no session is created. The honeypot absorbed the entire attack attempt without giving the attacker any foothold.

![Metasploit Exploit](/writeups/honypot/attacker-msfconsole-5.png)

We follow up with an SSH brute force attack using hydra against port 22, attempting to authenticate with the root account against the rockyou wordlist. OpenCanary accepts each connection attempt, logs the credentials tried, then drops the session.

![SSH Brute Force](/writeups/honypot/attacker-ssh.png)

The same brute force approach is applied to the FTP service on port 21, cycling through common usernames and passwords. Every login attempt is captured with the exact credentials used.

![FTP Brute Force](/writeups/honypot/attacker-ftp.png)

Finally we probe the HTTP service with curl, requesting common sensitive paths including /admin, /wp-login.php and /.env. The honeypot responds with realistic Apache error pages while logging each request with its source IP and requested path.

![HTTP Probe](/writeups/honypot/attacker-http.png)

### 2. Log Analysis

After running the brute force attacks the OpenCanary dashboard shows a clear picture of the attacker's behavior. The total IP events panel identifies 192.168.11.57 as the primary source. The hits by destination port panel shows FTP and SSH as the most targeted services. The most attacked usernames panel reveals the credentials the attacker attempted, and the total alerts table provides a timestamped record of every interaction with logtype 2000 for FTP and 4000 for SSH sessions.

![Grafana Dashboard After Brute Force](/writeups/honypot/grafana-dashboard-after-brute-force.png)

In Grafana's Explore view, we query the FortiGate log stream filtering by the attacker's IP address 192.168.11.57. The query `{job="fortigate"} |= "192.168.11.57"` returns all firewall log entries where this IP was involved, giving us a targeted view of everything the attacker triggered at the network level.

![Grafana FortiGate Logs After HTTP Query](/writeups/honypot/grafana-fortigate-logs-after-http.png)

The results show 86 log lines processed, all tagged with the fortigate job label. Each entry reveals the full session lifecycle, a start event, a forward traffic notice, and a close event all originating from 192.168.11.57 through port2 toward the honeypot on port 80 via the WAN to DMZ policy. The application control signature identifies the traffic as HTTP.BROWSER with a medium risk score, and one entry specifically captures the request to /.env with the url field visible in the log, confirming FortiGate saw and inspected every HTTP probe the attacker made.

![Grafana FortiGate Logs After HTTP Results](/writeups/honypot/grafana-fortigate-logs-after-http-1.png)

## Conclusion

This project demonstrated the design and deployment of a honeypot-based security monitoring system within a fully virtualized network environment. By combining FortiGate as the central enforcement point with OpenCanary as the deception layer and a lightweight Grafana stack for log analysis, the lab successfully simulated a realistic enterprise security architecture at minimal resource cost.

Throughout the attack scenarios, every interaction the attacker had with the honeypot was captured and correlated across two independent log sources. The firewall logs provided network-level context source and destination IPs, ports, policies matched, and application signatures while the OpenCanary logs captured the attacker's behavior at the service level, including credentials attempted, paths requested, and exploit payloads sent. Neither source alone told the full story, but together they gave complete visibility into the attack chain from the first reconnaissance scan to the failed exploitation attempt.

The vsftpd backdoor attempt was particularly illustrative. From the attacker's perspective the exploit failed and left no trace. From the defender's perspective the entire sequence was recorded the FTP connection, the backdoor trigger, the reverse TCP handler waiting on port 4444, and the session timeout. This is exactly the value a honeypot brings to a security monitoring strategy: it turns attacker attempts into intelligence without exposing any real asset.

The architecture also confirmed the importance of strict zone segmentation. The firewall policies ensured the attacker could only reach the DMZ, the honeypot had no path into the LAN, and every cross-zone flow was logged. Even in a simulated environment, the design held under active attack conditions.

As a next step, this architecture could be extended with automated alerting triggered by specific OpenCanary logtypes, threat intelligence feed integration to enrich attacker IP data, and additional honeypot services to broaden the attack surface and capture a wider range of techniques.