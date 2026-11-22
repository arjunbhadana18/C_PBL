# Skip List Lab (Next.js)

Interactive skip list visualizer: Basic operations, Leaderboard and a measured Skip list vs AVL graph.

## Deploy on Vercel
Push this folder to GitHub, then on vercel.com choose **Add New, Project**, import the repo and click **Deploy**.
Vercel detects Next.js automatically, so no settings are needed.

## Structure
- `app/` : layout, the page and global styles
- `components/` : Viz (diagram + C++ panel + player), Stats, BasicLab, LeaderboardLab, ComplexityLab
- `lib/engine.js` : the skip list logic and step recording (mirrors skip_list_module.h), drawing and benchmark
