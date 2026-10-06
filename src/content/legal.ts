/** Default legal copy. Editable in Admin → Content → Legal. Have a lawyer review before launch. */

export const legalPages = {
  privacy: {
    title: "Privacy Policy",
    updated: "2026-01-01",
    html: `<p>This Privacy Policy explains how ThetaX Tech SMC Private Limited ("Theta X Tech", "we", "us") collects, uses and protects personal information when you visit our website or contact us.</p>
<h2>Information we collect</h2>
<ul><li><strong>Information you provide:</strong> name, email, phone number, company and message details submitted through our contact, quote, career or newsletter forms.</li><li><strong>Usage data:</strong> with your consent, anonymous analytics such as pages visited, device type and approximate location, collected through Google Analytics.</li><li><strong>Technical data:</strong> IP address and browser information used for security and spam prevention.</li></ul>
<h2>How we use your information</h2>
<ul><li>To respond to enquiries and provide quotes and services</li><li>To send newsletters you have subscribed to (you can unsubscribe at any time)</li><li>To improve our website and services</li><li>To protect our website against fraud and abuse</li></ul>
<h2>Cookies</h2>
<p>We use essential cookies required for the website to function. Analytics cookies are only set if you choose "Accept all" in our cookie banner. You can change your choice by clearing your browser storage.</p>
<h2>Sharing your information</h2>
<p>We do not sell your personal information. We share data only with trusted service providers who help us operate our business (for example hosting, email and analytics providers), under appropriate confidentiality obligations, or where required by law.</p>
<h2>Data retention and security</h2>
<p>We keep enquiry data only as long as needed for the purposes above and apply reasonable technical and organisational measures — including encrypted connections and access controls — to protect it.</p>
<h2>Your rights</h2>
<p>You may request access to, correction of, or deletion of your personal information by emailing <a href="mailto:info@thetaxtech.com.pk">info@thetaxtech.com.pk</a>.</p>
<h2>Contact</h2>
<p>ThetaX Tech SMC Private Limited, R-402, 2nd Floor, Inchauli Cooperative Housing Society, Karachi, Pakistan. Email: info@thetaxtech.com.pk. Phone: +92 312 2535770.</p>`,
  },
  terms: {
    title: "Terms of Service",
    updated: "2026-01-01",
    html: `<p>These Terms govern your use of the Theta X Tech website operated by ThetaX Tech SMC Private Limited. By using this website you agree to these Terms.</p>
<h2>Use of the website</h2>
<p>You may use this website for lawful purposes only. You must not attempt to gain unauthorised access to the website, its server or any connected database, or interfere with its operation.</p>
<h2>Intellectual property</h2>
<p>All content on this website — including text, graphics, logos and code — is owned by or licensed to Theta X Tech and protected by intellectual property laws. You may not reproduce it without written permission.</p>
<h2>Services and quotes</h2>
<p>Information on this website is provided for general guidance. Any project, service or price is subject to a separate written proposal or agreement, which will take precedence over these Terms.</p>
<h2>Third-party links</h2>
<p>Our website may link to third-party websites. We are not responsible for their content or privacy practices.</p>
<h2>Limitation of liability</h2>
<p>To the fullest extent permitted by law, Theta X Tech is not liable for any indirect or consequential loss arising from use of this website.</p>
<h2>Governing law</h2>
<p>These Terms are governed by the laws of Pakistan, and disputes are subject to the jurisdiction of the courts of Karachi.</p>
<h2>Contact</h2>
<p>Questions about these Terms? Email <a href="mailto:info@thetaxtech.com.pk">info@thetaxtech.com.pk</a>.</p>`,
  },
};

export type LegalKey = keyof typeof legalPages;
