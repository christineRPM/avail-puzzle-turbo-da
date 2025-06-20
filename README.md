# 🧩 Avail Puzzle: Turbo DA Showcase

Welcome to the Avail Puzzle! This project is an interactive sliding puzzle game built with Next.js and Tailwind CSS. It serves as a hands-on demonstration of Avail's Turbo DA API, showcasing how quickly data can be submitted and finalized on the data availability layer.

As you play, game events like starting a new puzzle are submitted to Turbo DA, and you can watch the submission status in real-time right in the game's dashboard.

## ✨ Features

-   **Interactive Sliding Puzzle:** A classic sliding tile game featuring the Avail logo.
-   **Multiple Difficulties:** Choose from puzzle sizes ranging from 3x3 (Easy) to 6x6 (Expert).
-   **Responsive Design:** A seamless experience on both desktop and mobile devices.
-   **Turbo DA Integration:** Real-time submission of game data to the Avail Turbo DA network.
-   **Live Status Dashboard:** A slide-out (desktop) and slide-up (mobile) panel showing your game stats, progress, and live logs from the Turbo DA API.
-   **Modern UI:** Built with Next.js and styled with Tailwind CSS for a clean and engaging user experience.

## 🚀 Getting Started

Follow these steps to get the Avail Puzzle running on your local machine.

1.  **Clone the repository:**
    ```bash
    # Make sure to use the correct URL for your repository
    git clone https://github.com/christineRPM/avail-puzzle-turbo-da.git
    cd avail-puzzle-turbo-da
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a file named `.env.local` in the root of your project and add your Turbo DA API key:

    ```env
    TURBODA_API_KEY="YOUR_TURBO_DA_API_KEY"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open your browser:**
    Visit [http://localhost:3000](http://localhost:3000) to start playing!

## 🛠️ Technology Stack

-   **Framework:** [Next.js](https://nextjs.org/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Data Availability:** [Avail Turbo DA API](https://docs.availproject.org/api-reference/avail-turbo-da-api)

## ⚖️ License

This project is licensed under the MIT License.
