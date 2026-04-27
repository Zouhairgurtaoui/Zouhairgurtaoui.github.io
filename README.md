# 🛡️ Zouhair Guertaoui — Portfolio

A professional portfolio website for a cybersecurity engineer and developer, built with **pure HTML + CSS + vanilla JavaScript** and optimized for **GitHub Pages** hosting.

![Dark Theme](https://img.shields.io/badge/theme-dark%20%2F%20light-0a0e17?style=flat-square)
![No Build Step](https://img.shields.io/badge/build-none%20required-22c55e?style=flat-square)
![Responsive](https://img.shields.io/badge/responsive-mobile%20first-00e5ff?style=flat-square)

---

## 📁 File Structure

```
portfolio/
├── index.html    ← Main page (edit CONFIG section for personal info)
├── style.css     ← Design system (edit :root for theming)
├── data.js       ← Projects & writeups data (edit this to add content)
├── main.js       ← Interactivity (no edits needed)
└── README.md     ← You are here
```

---

## 🚀 Quick Start

### 1. Local Preview

Just open `index.html` in your browser — no build tools, no server needed.

Or use a simple HTTP server for proper path resolution:

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .
```

### 2. Customize Your Info

#### Personal Details (index.html)

Open `index.html` and look for lines marked with `✏️`. Update:

- **Name, title, bio** — in the Hero section
- **About paragraphs** — in the About section
- **Skill tags** — in the Skills section
- **Email & social links** — in the Contact section
- **SEO meta tags** — in the `<head>`

#### Colors & Theme (style.css)

Open `style.css` and edit the `:root` block (first ~15 lines):

```css
:root {
  --accent:       #00e5ff;   /* Change to any hex color */
  --accent-rgb:   0, 229, 255; /* Same color as RGB values */
  --bg-primary:   #0a0e17;   /* Main background */
  --bg-card:      #151c2c;   /* Card background */
  --radius:       12px;      /* Border radius */
}
```

> 💡 **Tip:** Change `--accent` and `--accent-rgb` to completely reskin the site.

#### Projects & Writeups (data.js)

Edit `data.js` to add or modify content. Each project is a simple object:

```javascript
{
  title: "My Project",
  description: "What it does in 1–2 sentences.",
  tech: ["Python", "Django", "PostgreSQL"],
  github: "https://github.com/you/repo",  // "" to hide
  demo: "https://demo.example.com",       // "" to hide
  featured: true,  // adds accent glow
}
```

Each writeup:

```javascript
{
  title: "My Writeup",
  category: "CTF",           // shown as badge
  date: "2025-01-15",        // YYYY-MM-DD
  description: "Quick summary.",
  link: "https://blog.example.com/writeup",
}
```

---

## 🌐 Deploy to GitHub Pages

### Step 1: Create Repository

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial portfolio commit"

# Create a new repo on GitHub, then push
git remote add origin https://github.com/YOUR_USERNAME/YOUR_USERNAME.github.io.git
git branch -M main
git push -u origin main
```

> 💡 **Tip:** Name the repo `YOUR_USERNAME.github.io` for a clean URL.

### Step 2: Enable GitHub Pages

1. Go to your repo on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select:
   - **Branch:** `main`
   - **Folder:** `/ (root)`
4. Click **Save**
5. Your site will be live at `https://YOUR_USERNAME.github.io` within a few minutes

### Step 3: Custom Domain (Optional)

1. In **Settings → Pages**, enter your custom domain (e.g., `zouhair.dev`)
2. Create a `CNAME` file in your repo root:

```bash
echo "zouhair.dev" > CNAME
git add CNAME && git commit -m "Add custom domain" && git push
```

3. Configure DNS with your registrar:
   - **A Records** (for apex domain):
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - **CNAME Record** (for `www`):
     ```
     www → YOUR_USERNAME.github.io
     ```
4. Check **Enforce HTTPS** in GitHub Pages settings

---

## ✨ Features

| Feature | Implementation |
|---------|---------------|
| Dark / Light theme | CSS custom properties + localStorage |
| Smooth scroll | Native `scroll-behavior: smooth` |
| Scroll-spy nav | IntersectionObserver API |
| Fade-in animations | IntersectionObserver + CSS transitions |
| Back-to-top button | Appears after 500px scroll |
| Mobile hamburger menu | Pure CSS + JS toggle |
| SEO optimized | Meta tags, Open Graph, semantic HTML |
| Dynamic content | Projects & writeups render from `data.js` |
| Zero dependencies | No frameworks, no build step |

---

## 📄 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).

---

Built with ☕ and 🛡️ by **Zouhair Guertaoui**
