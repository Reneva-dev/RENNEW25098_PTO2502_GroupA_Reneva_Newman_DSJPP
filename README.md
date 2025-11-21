# RetroTune Radio

A modern React-based podcast exploration app featuring favourites, a global audio player, a theme toggle, recommended show carousel, and full Vercel deployment.

## 🚀 Features

* Browse a catalogue of podcasts with search, genre filtering, and sorting.
* View detailed information for each show, including seasons and episodes.
* Play any episode using a persistent global audio player.
* Mark episodes as favourites and view them in a dedicated page.
* Fully responsive light/dark theme toggle with `localStorage` persistence.
* Recommended show carousel powered by randomized selections.
* Deployed on Vercel with custom metadata, favicons, and route handling.

---

## 🛠️ Technologies Used

* **React 18** (functional components + hooks)
* **React Router** for routing
* **Vite** for fast development and builds
* **CSS Modules** for scoped component styling
* **Context API** (Podcast, Audio Player, Favourites, Theme)
* **LocalStorage** for persistence (theme + favourites)
* **Vercel** for hosting and deployment

---

## 📦 Installation & Setup

Follow these steps to run the project locally:

### 1. Clone the repository

```bash
https://github.com/your-repo-link-here.git
cd your-project-folder
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
```

Your app will be available at:

```
http://localhost:5173/
```

### 4. Build for production

```bash
npm run build
```

### 5. Preview production build

```bash
npm run preview
```

---

## 🌈 Theme Toggle

RetroTune Radio includes a fully persistent light/dark theme system:

* Theme value saved in **localStorage**
* Applied globally via `data-theme="dark"` or `data-theme="light"`
* Smooth transitions across all UI elements
* Toggle located in the app header

---

## ⭐ Favourites System

Users can:

* Mark/unmark episodes as favourites
* View all favourites grouped by show
* Sort favourites by title or date added
* Favourite data is stored in **localStorage** so it persists

---

## 🎧 Global Audio Player

* Persists across navigation
* Play/pause/seek functionality
* Updates episode metadata automatically
* Works on mobile and desktop

---

## 🎠 Recommended Carousel

* Displays 10 random shows on the homepage
* Fully swipeable / horizontally scrollable
* Clicking a show navigates to its detail page

---

## 🌐 Deployment (Vercel)

* Project deployed via Vercel CLI
* Custom metadata added (title, description, preview image)
* Custom favicons included in `/public` folder
* `vercel.json` ensures proper React Router route handling for deep links

---

## 🧭 Project Structure

```
src/
 ├── api/
 ├── components/
 ├── context/
 ├── pages/
 ├── assets/
 ├── styles/
 ├── main.jsx
 └── App.jsx
public/
 ├── favicon.ico
 ├── site.webmanifest
 └── icons/
```

---

## 📝 Meta Tags

This project includes:

* Custom title: **RetroTune Radio**
* Description: *Discover your next binge.*
* Social preview: *Listen while living.*
* Open Graph + Twitter meta tags

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit PRs.

---

## 📄 License

MIT License.

---

## 🙌 Acknowledgements

* Podcast API (if applicable)
* Icon sources / favicon design
* Vercel for deployment and hosting

---

If you need additional sections—screenshots, badges, feature GIFs, or an expanded walkthrough—just let me know!
