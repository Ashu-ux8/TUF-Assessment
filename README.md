
# DeskPad — Premium Interactive Calendar Component

DeskPad is a high-fidelity React/Next.js calendar component designed to bridge the gap between physical stationery aesthetics and digital functionality. This project was developed as part of a Frontend Engineering Challenge to demonstrate proficiency in UI/UX translation, state management, and responsive design.

## 🚀 Features

* **Skeuomorphic Design**: Emulates a physical wall calendar with a spiral binder and paper-texture overlays.
* **Dynamic Theming**: Monthly hero images and quotes rotate based on the viewed month to provide a refreshing user experience.
* **Intelligent Range Selection**: Supports explicit start and end date/time selection for both single-day and multi-day events.
* **Integrated Journaling**: A persistent notes section (using localStorage) allows for daily logging and monthly reminders.
* **Category Filtering**: Quick-toggle filters for Holiday, Work, and Personal events with dynamic grid highlighting.
* **Full Responsiveness**: Adapts from a side-by-side desktop view to a vertically stacked mobile layout.

## 🛠️ Technical Decisions

* **Architecture**: Built using a modular component structure to separate the Calendar Engine from the Hero Sidebar and Note Manager.
* **State Management**: Utilized a centralized state object to synchronize the calendar grid, event modal, and persistent storage.
* **Styling**: Pure CSS/Tailwind (as applicable) for the "DeskPad" aesthetic, using CSS variables for robust dark/light mode support.
* **Persistence**: Implemented `localStorage` to ensure user data (events/notes) remains intact across browser refreshes without requiring a backend.

## 💻 Getting Started

### Prerequisites
* A modern web browser (Chrome, Firefox, or Edge).
* (Optional) Node.js if running via a local dev server.

### Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/Ashu-ux8/TUF-Assessment.git
