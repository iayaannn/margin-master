<div align="center">

# Margin Master

### Offline-first Product Cost & Profit Margin Calculator for Creators, Makers & Small Businesses

<p>
<img src="https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react" />
<img src="https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo" />
<img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript" />
<img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-success" />
<img src="https://img.shields.io/badge/Storage-Offline%20First-brightgreen" />
</p>

*A modern mobile application that accurately calculates manufacturing costs, profit margins, and recommended selling prices—all while working completely offline.*

</div>

---

# Overview

Pricing products manually often leads to incorrect profit calculations because hidden costs like electricity, labor, packaging, and overhead are ignored.

**Margin Master** solves this problem by providing an intuitive mobile application that calculates the true production cost of every product before recommending a profitable selling price.

Designed primarily for:

-  Small Businesses
-  Handmade Product Sellers
-  Candle Makers
-  Craft Businesses
-  Home Bakers
-  Soap Makers
-  Independent Creators

---

#  Features

##  Material Management

- Store raw materials
- Track bulk quantities
- Automatic per-unit cost calculation
- Edit & delete materials

---

##  Electricity Cost Calculation

- Store appliances
- Configure wattage
- Calculate electricity usage
- Supports custom electricity rates

---

##  Labor & Packaging

Include:

- Labor hours
- Hourly labor rate
- Packaging costs
- Additional production expenses

---

##  Smart Cost Engine

Automatically calculates:

- Material Cost
- Electricity Cost
- Labor Cost
- Packaging Cost
- Overhead Cost
- Total Manufacturing Cost
- Profit Amount
- Recommended Selling Price

---

##  Offline First

No internet required.

Everything works locally using AsyncStorage.

No backend.
No cloud dependency.
Fast and private.

---

##  Secure Storage

Sensitive profile information is stored securely using:

- Expo Secure Store
- Cryptographic hashing

---


#  Architecture

```
                React Native
                     │
                 Expo Router
                     │
              Local Application
                     │
        AsyncStorage + SecureStore
                     │
              Cost Calculation Engine
                     │
               Product Pricing
                     │
                    UI
```

---

#  Tech Stack

| Category | Technology |
|-----------|------------|
| Framework | React Native |
| Platform | Expo SDK 54 |
| Language | TypeScript |
| Navigation | Expo Router |
| Storage | AsyncStorage |
| Secure Storage | Expo Secure Store |
| Styling | React Native StyleSheet |

---

#  Project Structure

```
.
├── app/
│   ├── (tabs)/
│   ├── appliances/
│   ├── material/
│   └── product/
│
├── assets/
│
├── constants/
│
├── scripts/
│
├── src/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   ├── store.ts
│   └── theme.ts
│
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

---

#  Installation

Clone the repository

```bash
git clone https://github.com/iayaannn/margin-master.git
```

Move into the project

```bash
cd margin-master
```

Install dependencies

```bash
npm install
```

Start the Expo development server

```bash
npx expo start
```

---

#  Running the App

Run using:

-  Expo Go
-  iOS Simulator
-  Android Emulator

After starting Expo:

```
i → Open iOS Simulator

a → Open Android Emulator

Scan QR → Open on physical device
```

---

#  Cost Calculation Engine

### Material Cost

```
(Bulk Cost ÷ Bulk Quantity) × Quantity Used
```

### Electricity Cost

```
((Wattage × Hours Used) ÷ 1000) × Cost per kWh
```

### Labor Cost

```
Labor Hours × Hourly Rate
```

### Manufacturing Cost

```
Material
+ Electricity
+ Labor
+ Packaging
+ Overhead
```

### Selling Price

```
Manufacturing Cost
+
Desired Profit Margin
```

---

#  Why I Built Margin Master

Many creators and small businesses still rely on notebooks, spreadsheets, or rough estimates to price their products. This often results in inconsistent pricing and overlooked production costs.

Margin Master was built to simplify this process through an offline-first mobile application that accurately calculates manufacturing expenses and recommends profitable selling prices.

---

#  Roadmap

Planned features include:

- Cloud Synchronization
- Multi-device Support
- PDF Export
- Inventory Management
- Barcode Scanner
- Sales Analytics
- Backup & Restore
- Dark Mode
- Currency Support
- GST/Tax Calculation

---

#  Contributing

Contributions, ideas, and feature requests are always welcome.

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Open a Pull Request


---

#  Author

**Mohd Ayan**

GitHub: https://github.com/iayaannn

---

<div align="center">

### ⭐ If you found this project useful, consider giving it a star!

</div>
