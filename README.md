[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://personalfinancemanagerapp.netlify.app)
<br />
<div align="center">
  <a href="https://personalfinancemanagerapp.netlify.app">
    <img src="https://cdn-icons-png.flaticon.com/512/2344/2344132.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Personal Finance Manager</h3>

  <p align="center">
    A lightweight, real-time web application to track your income and expenses effortlessly.
    <br />
    <a href="https://personalfinancemanagerapp.netlify.app"><strong>View Live Demo »</strong></a>
    <br />
    <br />
    <a href="https://github.com/subhankarsahoopersonal/personalfinancemanager/issues">Report Bug</a>
    ·
    <a href="https://github.com/subhankarsahoopersonal/personalfinancemanager/issues">Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## 🚀 About The Project

**Personal Finance Manager** is a web-based tool designed to help users take control of their financial life. Built with simplicity in mind, it allows for quick entry of transactions and provides an immediate overview of your financial health.

Whether you are saving for a goal or just trying to track where your money goes, this application provides the essential tools you need without the bloat of complex accounting software.

**Key Features:**
* **Real-time Tracking:** Instant updates to your balance using Firebase.
* **Income & Expense Management:** Easily categorize and log your transactions.
* **Responsive Design:** Works seamlessly on desktop and mobile devices.
* **Data Persistence:** Your data is stored securely in the cloud.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### 🛠️ Built With

This project is built using pure vanilla web technologies for maximum performance, coupled with Firebase for a robust backend.

* ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
* ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
* ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
* ![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## ⚡ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You simply need a modern web browser and a code editor (like VS Code).

### Installation

1.  **Clone the repo**
    ```sh
    git clone [https://github.com/subhankarsahoopersonal/personalfinancemanager.git](https://github.com/subhankarsahoopersonal/personalfinancemanager.git)
    ```
2.  **Navigate to the project folder**
    ```sh
    cd personalfinancemanager
    ```
3.  **Setup Firebase**
    * Create a project at [Firebase Console](https://console.firebase.google.com/).
    * Create a "Web App" to get your configuration keys.
    * Open `firebase-data.js` (or create a `config.js` if you prefer safer practices) and add your API keys:
    ```javascript
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT_ID.appspot.com",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
    ```
4.  **Run the App**
    * Simply open `index.html` in your browser or use a Live Server extension.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 💻 Usage

1.  **Add Transaction:** Enter the description and amount. Select "Income" or "Expense".
2.  **View History:** Scroll through the list of recent transactions.
3.  **Check Balance:** Your total balance updates automatically at the top of the dashboard.

_Note: If you are forking this repo, remember to update the Firebase configuration to point to your own database instance._

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## 📧 Contact

Subhankar Sahoo - [GitHub Profile](https://github.com/subhankarsahoopersonal)

Project Link: [https://github.com/subhankarsahoopersonal/personalfinancemanager](https://github.com/subhankarsahoopersonal/personalfinancemanager)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[issues-shield]: https://img.shields.io/github/issues/subhankarsahoopersonal/personalfinancemanager.svg?style=for-the-badge
[issues-url]: https://github.com/subhankarsahoopersonal/personalfinancemanager/issues
[license-shield]: https://img.shields.io/github/license/subhankarsahoopersonal/personalfinancemanager.svg?style=for-the-badge
[license-url]: https://github.com/subhankarsahoopersonal/personalfinancemanager/blob/main/LICENSE
