# Real-Time Crypto & Market Pulse

A functional, responsive, and beautiful single-page dashboard that fetches and displays live crypto market data. Built entirely with React in the browser without any complex Node.js build processes.

## 💻 Tech Stack
* **React 18 & ReactDOM**: Chosen for robust and predictable state-driven UI updates, making it easy to create rich interfaces like the modal and watchlist filtering mechanisms.
* **Babel Standalone**: Compiles modern JavaScript JSX syntax straight in the browser. Selected because it bypasses the need to have a complex, fragile local npm environment like Webpack/Vite.
* **Vanilla CSS**: Used custom CSS variables (for seamless dark/light mode toggling), CSS Grid, and Flexbox for modern, flexible responsive aesthetics. No bulky framework was used to keep the footprint as tiny as possible.
* **CoinGecko API**: A robust, free public API for fetching live top cryptocurrency data. 

## 🚀 Setup Instructions
There are zero external install dependencies (no `npm install` needed).

1. Clone or download this repository to your local machine:
   ```bash
   git clone https://github.com/shehan28/88GB.git
   cd 88GB
   ```
2. Start a simple built-in HTTP server using Python (or any alternative basic HTTP server like `Live Server` in VS Code or `npx serve`):
   ```bash
   python -m http.server 8000
   ```
3. Open your web browser and navigate to exactly:
   **http://localhost:8000** 
*(Note: If the application shows a white screen, verify that you are accessing via `http://` instead of opening the local `file:///` path directly. This ensures Babel resolves the compiler properly).*

## ⚖️ Trade-offs & Future Improvements
* **Standalone Architecture vs Build Systems**: I opted to embed all the React logic as inline Babel compiled code rather than building a standard Vite bundle flow. 
  * *Trade-off*: By making the experience universally runnable by anyone out-of-the-box, it significantly slows down parsing speed and developer ergonomics since you can't logically modularize `src` files into separate ES `import` hierarchies without a bundler.
  * *Improvement*: If this were a scalable project, rewriting this stack atop `Vite`, TypeScript, and integrating a bundler like `Rollup` would heavily optimize the payload. 
* **Mocked Data Architecture**: The CoinGecko API heavily rate limits public tier calls. 
  * *Trade-off*: Instead of caching via a custom NodeJS backend proxy or serverless edge function, I hardcoded a mock fallback dataset directly onto the client if they hit HTTP `429`. 
  * *Improvement*: For production, we should spin up an intermediate backend abstraction layer caching real-time requests with Redis so the client never touches the CoinGecko rate limits directly.
* **State Management**: For a tiny, single-page dashboard, using simple React Context wrapped around local state is completely sufficient. If we started building distinct dashboard pages, charts, or multiple APIs, migrating to a predictable central store like Redux Toolkit would be crucial for complex state synchronization.
