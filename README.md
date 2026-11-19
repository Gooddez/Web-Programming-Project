# Cafe Order Management System

## 💻 Getting Started

### Installation

Follow these steps to set up and run the application:

1.  **Initialize the Project and Install Dependencies:**
    Open your command prompt (CMD) or terminal in the project's root directory and run the following commands:

    ```bash
    npm init -y
    npm install cookie-parser ejs express-session express sqlite3
    ```

2.  **Start the Server:**
    Run the main application file:
    ```bash
    node index.js
    ```
    The application will now be running on `http://localhost:3000`.

---

## ⚙️ Device Setup and Usage

Before accessing the main pages, you must assign a unique ID to each device (Cashier and Customer stations). The Barista station does not require this step.

### Step 1: Set Device Table ID

Navigate to the setup page for **each** device you intend to use:

**URL:** `http://localhost:3000/setup.html`

| Device Type | Required Table ID | Purpose |
| :--- | :--- | :--- |
| **Cashier Device** | `0` | Used for processing payments and managing orders. |
| **Customer Device** | `1` or greater | Used by customers to place new orders. **Must be a unique number for each customer device.** |

***
🚨 **IMPORTANT:** **ONE DEVICE CAN HAVE ONLY 1 ID.** Changing the ID will reset the device's role.
***

### Step 2: Access Application Views

Once the device ID is set, you can access the appropriate interface:

| Role | Access URL | Description |
| :--- | :--- | :--- |
| **Customer** | `http://localhost:3000/` | View the menu and place orders. |
| **Cashier** | `http://localhost:3000/cashier` | Manage active orders and table status. |
| **Barista** | `http://localhost:3000/barista` | View the queue of orders to be prepared (no setup needed). |

---