# DJS05 – React Podcast App with Routing, Detail Pages, and Context State

This project is a **React-based podcast explorer** that builds upon DJS04 by adding **multi-page routing**, **podcast detail views**, and further improving the use of shared context state and component organization.

## Key Features

- **Routing (React Router DOM)**  
  Uses `react-router-dom` for navigation between pages:

  - `/` – Home page with search, filters, sorting, and pagination
  - `/show/:id` – Detailed view of a selected podcast, including episode listing

- **Podcast Context (Global State)**  
  Provides shared state using `PodcastContext`:

  - Manages full podcast dataset, filters, search, sort, pagination
  - Makes data accessible across pages

- **Search**

  - Case-insensitive search by podcast title
  - Updates results dynamically

- **Sort Options**

  - Default
  - Newest
  - Oldest
  - Title A → Z
  - Title Z → A

- **Genre Filter**

  - Filters podcasts by genre
  - Genre data loaded from static source

- **Pagination**

  - Dynamic per-page item calculation based on screen size
  - Defaults to 10 per page on smaller screens

- **Detail View**
  - Fetches full podcast data when visiting `/show/:id`
  - Displays title, image, description, genre tags, and seasons

## Project Structure

```
/src
│
├── /api
│ └── fetchPata.js # Fetch podcasts and single podcast
│
├── /components
│ ├── Filters/ # SearchBar, SortSelect, GenreFilter
│ ├── Podcasts/ # PodcastCard, PodcastGrid, PodcastDetail
│ └── UI/ # Header, Pagination, Loading, Error, GenreTags
│
├── /context
│ └── PodcastContext.jsx # Context provider for global state
|
├── /pages
│ ├── Home.jsx # Home page with all podcasts and controls
│ └── ShowDetail.jsx # Detail view for a selected podcast
│
├── /styles
│ └── \*.module.css # CSS Modules used throughout
│
├── App.jsx # Main app with routing
└── main.jsx # React entry point
└── data.js # Static genre ID to label mapping
```

## How It Works

- On initial load, all podcast data is fetched once via `PodcastProvider`.
- Components like `SearchBar`, `GenreFilter`, and `SortSelect` update shared context state.
- Filtered and sorted results are paginated and displayed in `PodcastGrid`.
- When a podcast card is clicked, the app navigates to `/show/:id`, fetching full podcast details.

## How to Run

1. Clone the repo or download the project files.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```
    npm run dev
   ```
4. Visit http://localhost:5173 in your browser.
