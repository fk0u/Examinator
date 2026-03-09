<p align="center">
  <img src="https://placehold.co/1200x250/0f172a/ef4444?text=Examinator\nSecurity+Policy&font=Montserrat" alt="Security Banner" />
</p>

# Security Policy 🛡️

At **Examinator**, the security and integrity of the exam process are our absolute highest priorities. We take potential vulnerabilities very seriously and are committed to resolving bugs rapidly and responsibly.

## Supported Versions ✅

Security patches are actively applied to our current major release lifecycle.

| Version | Supported          |
| ------- | ------------------ |
| v1.0.x  | :white_check_mark: |
| < v1.0  | :x:                |

## Reporting a Vulnerability 🚨

**DO NOT REPORT SECURITY VULNERABILITIES ON PUBLIC GITHUB ISSUES OR DISCUSSIONS.**

If you discover a potential vulnerability within Examinator's architecture, please notify us immediately by emailing our core security response team at **[security@examinator.dev]** (replace this with your actual email if you fork the project).

Please provide the following details in your report:

- Type of vulnerability (e.g., XSS, SQLi, RCE, Authentication Bypass).
- Full steps to reproduce the issue (including any payloads or configurations).
- The potential impact or severity of the exploit.
- Any supporting materials, such as server logs, screenshots, or Proof-of-Concept (PoC) code.

### Security Response Process

1. **Acknowledgement**: You will receive an acknowledgment of your report within 48 hours.
2. **Investigation**: Our team will investigate the issue and determine its severity using the CVSS scoring system.
3. **Patching**: A fix will be developed, tested, and prepared in a private repository mirror to prevent premature disclosure.
4. **Disclosure & Advisory**: Once the patch is merged and a new release is cut, a public Security Advisory will be published. Following Responsible Disclosure, we will gladly credit you (or keep you anonymous if preferred) for your discovery.

## Prohibited Security Research 🚫

While we welcome independent security research, conducting the following activities against our public demo infrastructure is strictly prohibited (and will be treated as malice):

- Volumetric/ Denial of Service (DoS/DDoS) attacks.
- Social engineering or phishing attempts against Examinator maintainers or users.
- Physical attacks against infrastructure.
- Exfiltration, deletion, or modification of any database data that you do not have authorized ownership of. (Please conduct these tests on your local `localhost` clone).

## Known Security Boundaries ⚠️

### Anti-Cheat Evasion

Our platform relies on Browser-level heuristics (Page Visibility, Fullscreen events, MediaRecorder streams) to infer cheating. Given the constraints of the Web Standard Sandbox, we explicitly acknowledge that **kernel-level OS tampering, Virtual Machine guest escapes, or the use of external hardware video capture/splitters fall outside our immediate detection radius.**

Reports highlighting bypasses using standard browser mechanisms are highly welcomed, but solutions requiring OS-level or Administrator rights injections may be marked as "Accepted Risks".

### Dependency Auditing

We rely heavily on the Bun ecosystem and NPM packages. Vulnerability reports regarding dependencies that are flagged by automated tools (e.g., `npm audit`) but **cannot be actively exploited** within the highly restricted context of the Examinator runtime will be handled during regular maintenance windows, rather than as Critical Zero-Day events.

Thank you for helping keep Examinator secure.
