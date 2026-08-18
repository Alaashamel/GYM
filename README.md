# 🏋️ Iron Forge — Gym & Fitness Platform

A modern, fully responsive **frontend-only gym and fitness platform** built with **HTML, CSS, and Vanilla JavaScript**.

Iron Forge provides users with an interactive fitness experience including workout programs, exercise tracking, fitness calculators, nutrition analysis, recipes, challenges, progress tracking, and more — all without requiring a backend.

> **Founder:** Abdelrahman Ibrahim Sofyan

---

## ✨ Features

### 🏋️ Workout & Exercise Library

* Comprehensive exercise library
* Exercise-specific animated motion visuals
* Workout programs and training plans
* Trainer and program information
* Responsive exercise cards
* Arabic and English support

### 🧮 Fitness Calculators

Built-in calculators for:

* **BMI** — Body Mass Index
* **TDEE** — Total Daily Energy Expenditure
* **1RM** — One Rep Max
* **Calories Burned** — Estimated calories burned during exercise

### 🍎 Nutrition & Food Analysis

* Food image analysis
* Nutrition-related information
* Recipe collection
* External API integration using **LogMeal**

### 📈 Progress Tracking

* Personal progress tracking
* Local progress persistence using `localStorage`
* Progress visualization and charts
* Workout and fitness history

### 🔥 Challenges & Streaks

* Fitness challenges
* Daily activity tracking
* Streak system
* Challenge progress tracking

### ⏱️ Workout Timer

* Rest timer between sets
* Simple and responsive interface
* Designed for use during workouts

### 👤 Authentication Demo

* Frontend authentication simulation
* Login functionality using `localStorage`
* No backend or database required

### 🎨 UI & Experience

* Fully responsive design
* Mobile-first approach
* Dark / Light mode
* Arabic **RTL** support
* English **LTR** support
* Interactive navigation
* Modern fitness-focused UI

---

## 🛠️ Tech Stack

| Technology            | Usage                                  |
| --------------------- | -------------------------------------- |
| **HTML5**             | Page structure and semantic markup     |
| **CSS3**              | Styling, responsive design, animations |
| **JavaScript (ES6+)** | Application logic and interactions     |
| **SVG**               | Exercise motion visualizations         |
| **LocalStorage**      | Client-side data persistence           |
| **LogMeal API**       | Food image analysis                    |

---

## 📂 Project Structure

```text
gym-site/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── main.js
│   ├── data.js
│   ├── calculators.js
│   ├── progress.js
│   ├── food-analyzer.js
│   ├── auth.js
│   ├── timer.js
│   └── challenges.js
│
├── pages/
│   ├── exercises.html
│   ├── programs.html
│   ├── trainers.html
│   ├── recipes.html
│   ├── challenges.html
│   └── ...
│
└── README.md
```

### Main JavaScript Modules

* `main.js` — Navigation, footer, language switching, theme management
* `data.js` — Exercises, programs, trainers, plans, recipes, schedules, and FAQ data
* `calculators.js` — BMI, TDEE, 1RM, and calorie calculations
* `progress.js` — Progress tracking, `localStorage`, and charts
* `food-analyzer.js` — Food image analysis and API integration
* `auth.js` — Demo authentication using `localStorage`
* `timer.js` — Workout rest timer
* `challenges.js` — Challenges and streak management

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Alaashamel/GYM.git
cd GYM
```

### 2. Run the Project

Since this is a static frontend project, you can open:

```text
index.html
```

directly in your browser.

However, using a local development server is recommended.

### Using Python

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

---

## 🍽️ Food Image Analyzer Setup

Iron Forge includes a food image analysis feature powered by the **LogMeal API**.

To enable it:

### 1. Create a LogMeal account

Visit:

https://logmeal.com/api/

### 2. Get your API token

After creating your account, obtain your API token from the LogMeal dashboard.

### 3. Configure the project

Open:

```text
js/food-analyzer.js
```

Locate:

```javascript
const FOOD_API_KEY = "YOUR_API_KEY";
```

Replace it with your actual API token.

### ⚠️ Security Notice

Because Iron Forge is currently a **frontend-only application**, the API key is exposed to the browser and can potentially be viewed through Developer Tools.

This approach is acceptable for:

* Personal projects
* Learning
* Prototypes
* Demonstrations

It is **not recommended for production applications**.

For a production deployment, the API request should be handled through a backend or serverless function where the API key can be securely stored as an environment variable.

---

## 🔐 Data & Authentication

Iron Forge currently operates without a backend or database.

User-related data such as:

* Login information
* Workout progress
* Challenges
* Streaks
* Preferences

is stored locally using:

```javascript
localStorage
```

The authentication system is therefore a **frontend demonstration only** and should not be considered production-ready authentication.

For a production version, the application should use:

* Secure backend authentication
* Password hashing
* Database storage
* HTTP-only cookies or secure token handling
* Proper authorization and session management

---

## 🎬 Exercise Motion Visuals

The exercise library includes a lightweight **Motion Lab** visual system designed to replace unreliable external GIFs and video embeds.

### Highlights

* **17** exercise-specific animated SVG scenes
* Fully offline-friendly
* No YouTube embeds
* No external video hosting required
* Responsive **16:9** media cards
* Reduced-motion accessibility support
* Arabic and English exercise labels
* Integrated with the existing language system

To preview the exercise library:

```text
pages/exercises.html
```

---

## 🌍 Internationalization

Iron Forge supports both:

### 🇬🇧 English

* LTR layout
* English interface
* English exercise and fitness terminology

### 🇪🇬 Arabic

* RTL layout
* Arabic interface
* Arabic exercise and fitness terminology

Users can switch between languages directly through the website interface.

---

## 📱 Responsive Design

The platform is designed to work across different screen sizes:

* 📱 Mobile
* 📱 Tablets
* 💻 Laptops
* 🖥️ Desktop displays

The UI follows a mobile-first responsive approach to provide a consistent experience across devices.

---

## 🚧 Current Limitations

Iron Forge is currently a **frontend-only project**, so it does not include:

* ❌ Backend server
* ❌ Database
* ❌ Real user accounts
* ❌ Secure authentication
* ❌ Cloud data synchronization
* ❌ Server-side API key protection

These limitations are intentional for the current version of the project.

---

## 🔮 Future Improvements

Potential future development includes:

* [ ] Backend API
* [ ] User accounts and secure authentication
* [ ] Database integration
* [ ] Cloud-based progress synchronization
* [ ] Personalized workout generation
* [ ] AI-powered fitness recommendations
* [ ] Secure server-side food analysis
* [ ] Workout history and analytics dashboard
* [ ] Trainer management system
* [ ] Subscription and membership system
* [ ] Admin dashboard
* [ ] Real-time notifications

---

## 🎯 Project Goals

Iron Forge was designed to demonstrate how a modern fitness platform can be built using **core web technologies without relying on a frontend framework**.

The project focuses on:

* Clean frontend architecture
* Reusable JavaScript modules
* Responsive UI development
* Client-side state management
* Interactive fitness tools
* API integration
* Accessibility considerations
* Internationalization
* Modern web development practices

---

## 📌 Project Status

**Status:** 🟢 Active Development

Iron Forge is currently a frontend-focused project and may receive additional features, improvements, and backend integration in future versions.

---

## 👨‍💻 Author

**Abdelrahman Ibrahim Sofyan**

Frontend Developer & Computer Science Student

---

## 📄 License

This project is currently intended for **educational and portfolio purposes**.
