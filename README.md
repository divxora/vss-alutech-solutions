# VSS Alutech Solutions - Business Website

A complete, responsive, and professional B2B industrial website for **VSS Alutech Solutions**, an engineering solutions partner specializing in aluminium extrusion plant setup, machinery consultancy, billet heating and ageing furnaces, operational troubleshooting, precision die sourcing, and industrial technical manpower supply.

---

## 🏭 Design & Aesthetic Highlights

- **Visual Theme:** Premium Industrial B2B aesthetic utilizing deep navy (`#0A192F`), crisp pure white (`#FFFFFF`), and high-energy industrial orange (`#FF6B00`).
- **Factory Photography:** High-resolution, authentic photography of heavy aluminium extrusion presses, glowing billet heating furnaces, precision CNC tool rooms, and factory operational personnel.
- **Header Architecture:** Two-level header with top industrial utility bar (contact placeholders, location badge, brochure link) and clean white main navigation with custom geometric extrusion die SVG logo mark.
- **Hero Section:** Full-width high-impact extrusion press line visual with dark navy contrast overlay, 5 compact service highlights, and dual call-to-action buttons.
- **Responsive Layout:** Adaptive multi-breakpoint design thoroughly styled for desktop (>1200px), tablet (768px - 1024px), and mobile (375px - 640px) with touch-friendly drawer navigation.

---

## 🗂 Project File Structure

```
├── index.html            # Main semantic HTML5 webpage
├── style.css             # Vanilla CSS3 styling, variables, layout, and responsive media queries
├── script.js             # Vanilla JavaScript for navigation, modal management, and form validation
├── README.md             # Documentation, setup guidelines, and backend integration instructions
├── .gitignore            # Git exclusion rules for IDE, OS, and temporary files
└── assets/
    └── images/           # High-resolution industrial photography assets
        ├── hero-extrusion-press.jpg    # Custom photorealistic 8k extrusion press machinery
        ├── furnace-solutions.jpg       # Billet heating furnace and ageing ovens
        ├── toolroom-dies.jpg           # Precision extrusion dies and EDM tool room
        ├── plant-troubleshooting.jpg   # Plant audit and quality troubleshooting engineers
        ├── manpower-team.jpg           # Factory managers, press operators, and technicians
        ├── profiles-billets.jpg        # Stacked aluminium profiles and raw billets
        ├── electrical-automation.jpg   # Industrial PLC automation cabinets
        ├── factory-dark-bg.jpg         # Industrial depth background for consultation section
        ├── industry-architectural.jpg  # Architectural profiles application
        ├── industry-automotive.jpg     # Automotive chassis / lightweight profiles
        ├── industry-industrial.jpg     # Modular T-slot framing profiles
        ├── industry-solar.jpg          # Solar mounting structures
        ├── industry-consumer.jpg       # Heat sinks & consumer electronics
        ├── industry-custom.jpg         # Custom profile geometries
        ├── project-press.jpg           # Extrusion press installation benchmark
        └── project-furnace.jpg         # Furnace setup benchmark
```

---

## ⚙️ Core Service Categories

1. **Press Solutions (`#press-solutions`):**
   - New plant planning & existing line upgrades.
   - Sizing & tonnage consultation (550 UST up to 4,500+ UST).
   - Machinery sourcing, quotation comparison, and commissioning supervision.
2. **Furnace Solutions (`#furnace-solutions`):**
   - Single-log & multi-log gas billet heaters with hot shears.
   - Induction rapid taper billet heaters.
   - High-convection artificial ageing ovens (T4, T5, T6 tempers).
   - Energy efficiency auditing and fuel consumption reduction.
3. **Plant Troubleshooting & Consultancy (`#plant-troubleshooting`):**
   - Production bottleneck audits & dead-cycle minimization.
   - Root-cause resolution for defects (die lines, blisters, grain growth, dimensional variances).
   - Hydraulic, electrical, and alignment diagnostics.
   - Expert on-site audits and retainer-based advisory.
4. **Tool Room & Die Solutions (`#toolroom-dies`):**
   - Transparent 4-step sourcing workflow linking customer drawings to certified independent tool rooms.
   - Solid flat dies, hollow porthole bridge dies, and multi-cavity dies.
   - *Ethical Transparency Note:* VSS acts as an engineering bridge to specialized independent tool rooms and does not claim in-house manufacturing.
5. **Industrial Manpower Supplier (`#manpower-supplier`):**
   - Categorized staffing: Senior Management (Plant Heads, Production Managers), Supervisory/Technical (Shift In-Charges, Maintenance/Electrical Technicians), Machine Operators (Extrusion Press, Furnace, Puller, Ageing Oven), and Support Staff (Stretcher, Helpers, Material Handlers).
   - Flexible models: Contract-based, project commissioning, shift-based, and bulk greenfield staffing.
   - Dedicated manpower requisition form with shift, skill, and location filters.

---

## 🚀 How to Open and Test Locally

### Option 1: Direct Browser Launch
Double click on `index.html` in your file explorer, or right-click and choose **Open with > Google Chrome** (or Edge/Firefox).

### Option 2: Using Node.js (Built-in)
Run the following in PowerShell within this directory:
```powershell
npx serve -l 3000
```
Then open `http://localhost:3000` in your web browser.

### Option 3: Using VS Code Live Server
1. Open this folder in VS Code.
2. Click **Go Live** in the bottom status bar, or right-click `index.html` and click **Open with Live Server**.

---

## 🔌 How to Connect a Real Backend / Form Service

The consultation and manpower forms include robust client-side validation for emails, phone numbers, and required parameters. To connect them to a production backend, choose one of the following methods:

### Method A: Formspree (No Backend Required)
1. Register at [formspree.io](https://formspree.io).
2. Create a new form endpoint (e.g., `https://formspree.io/f/xvssalutech`).
3. In `script.js`, replace the `consultationForm.addEventListener('submit', ...)` handler or simply add standard form action:
   ```html
   <form id="consultationForm" action="https://formspree.io/f/YOUR_ENDPOINT_ID" method="POST">
   ```

### Method B: EmailJS
1. Sign up at [emailjs.com](https://www.emailjs.com/).
2. Include the EmailJS SDK script in `index.html`.
3. In `script.js`, replace the `console.info(...)` line with:
   ```javascript
   emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", formData)
     .then(() => { /* show success message */ })
     .catch((error) => { /* show error */ });
   ```

### Method C: Custom REST API (Node.js / Express / Python / PHP)
Send a standard `fetch` POST request in `script.js`:
```javascript
fetch('/api/v1/inquiries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
})
.then(res => res.json())
.then(data => {
  // Show confirmation alert
});
```

---

## 🛡️ Business Integrity & Compliance

- **No Fabricated Credentials:** Contact details, phone numbers, email addresses, completed project clients, and registration figures are explicitly designated as placeholders.
- **Transparent Sourcing:** Clear disclaimers communicate that extrusion dies and machinery are sourced through vetted independent partner tool rooms and manufacturers.
- **Dynamic Year:** Footer copyright updates automatically to the current calendar year.
- **Intended Domain:** `vsslutechsolutions.in` (architectural prototype).
