# Security Policy

At **Examinator**, the security and integrity of the examination process are our highest priorities. We take vulnerabilities seriously and are committed to resolving them responsibly and swiftly.

## Supported Versions

Only the current major version is actively supported with security patches.

| Version | Supported          |
| ------- | ------------------ |
| v1.0.x  | :white_check_mark: |
| < v1.0  | :x:                |

## Reporting a Vulnerability

**DO NOT REPORT SECURITY VULNERABILITIES IN PUBLIC ISSUES OR DISCUSSIONS.**

If you discover a security vulnerability within Examinator, please report it immediately by sending an email to our core security response team at **[security@examinator.dev]** (replace with your actual security contact).

Please include the following details in your report:

- The type of vulnerability (e.g., XSS, SQLi, RCE, Authentication Bypass).
- Full steps to reproduce the vulnerability (including required configuration or payloads).
- The potential impact of the vulnerability.
- Any relevant logs, screenshots, or proof-of-concept (PoC) code.

### Security Response Process

1. **Acknowledgement**: You should receive a confirmation of your report within 48 hours.
2. **Investigation**: Our engineering team will review the disclosure, trace the vulnerability, and assess the threat level (CVSS scoring).
3. **Patching**: We will develop, test, and prepare a patch in a private repository mirror.
4. **Disclosure**: Once the patch is merged and a new release is cut, we will publish a security advisory. We firmly believe in responsible disclosure and will credit you for your finding (unless you prefer to remain anonymous).

## Prohibited Security Research

While we encourage independent security research, the following activities are strictly prohibited during your testing against our public demo infrastructure (acting as malicious intent):

- Volumetric/Denial of Service (DoS/DDoS) attacks.
- Social engineering (e.g., phishing) of Examinator staff or users.
- Physical attacks against our infrastructure.
- Exfiltration, deletion, or modification of any data that does not belong to you outside of an isolated local research environment.

_Note: For all security research, we strongly advise you to spin up a local instance of the application and test against `localhost`._

## Known Security Boundaries

### Anti-Cheat Evasion

Examinator utilizes browser-level heuristics (Page Visibility, Fullscreen events, MediaRecorder) to determine cheating. Because we operate purely within the browser sandbox, **we acknowledge that highly sophisticated, kernel-level tampering, Virtual Machine guest escape, or hardware-based capturing (e.g., external HDMI splitters) cannot be completely mitigated by standard web technologies.**
Reports detailing bypasses of browser-level anti-cheat mechanisms are welcomed, but may be classified as "Accepted Risks" if the mitigation requires invasive OS-level privileges.

### Dependency Auditing

We rely on the Bun ecosystem and NPM packages. Dependency vulnerabilities (reported via `npm audit` or similar tools) that cannot be exploited in our specific runtime context will be queued for regular maintenance updates rather than treated as critical zero-day security events.

Thank you for helping keep Examinator and the educational community secure!
